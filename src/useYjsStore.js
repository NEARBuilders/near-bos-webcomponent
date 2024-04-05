import {
  compareSchemas,
  computed,
  createPresenceStateDerivation,
  createTLStore,
  defaultShapeUtils,
  defaultUserPreferences,
  getUserPreferences,
  InstancePresenceRecordType,
  react,
  setUserPreferences
} from 'tldraw';
import { useEffect, useMemo, useState } from 'react';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export function useYjsStore({
	roomId = 'example',
	hostUrl = import.meta.env.MODE === 'development'
		? 'ws://localhost:1234'
		: 'wss://demos.yjs.dev',
	shapeUtils = [],
}) {
	const [store] = useState(() => {
		const store = createTLStore({
			shapeUtils: [...defaultShapeUtils, ...shapeUtils],
		});

		return store;
	});

	const [storeWithStatus, setStoreWithStatus] = useState({
		status: 'loading',
	});

	const { yDoc, yStore, meta, room } = useMemo(() => {
		const yDoc = new Y.Doc({ gc: true });
		const yArr = yDoc.getArray(`tl_${roomId}`);
		const yStore = new YKeyValue(yArr);
		const meta = yDoc.getMap('meta');

		return {
			yDoc,
			yStore,
			meta,
			room: new WebsocketProvider(hostUrl, roomId, yDoc, { connect: true }),
		};
	}, [hostUrl, roomId]);

	useEffect(() => {
		setStoreWithStatus({ status: 'loading' });

		const unsubs = [];

		function handleSync() {
			// Connect store to yjs store and vice versa, for both the document and awareness

			/* -------------------- Document -------------------- */

			// Sync store changes to the yjs doc
			unsubs.push(
				store.listen(
					function syncStoreChangesToYjsDoc({ changes }) {
						yDoc.transact(() => {
							Object.values(changes.added).forEach((record) => {
								yStore.set(record.id, record);
							});

							Object.values(changes.updated).forEach(([_, record]) => {
								yStore.set(record.id, record);
							});

							Object.values(changes.removed).forEach((record) => {
								yStore.delete(record.id);
							});
						});
					},
					{ source: 'user', scope: 'document' }, // only sync user's document changes
				),
			);

			// Sync the yjs doc changes to the store
			const handleChange = (
				changes,
				transaction,
			) => {
				if (transaction.local) return;

				const toRemove = [];
				const toPut = [];

				changes.forEach((change, id) => {
					switch (change.action) {
						case 'add':
						case 'update': {
							const record = yStore.get(id);
							toPut.push(record);
							break;
						}
						case 'delete': {
							toRemove.push(id);
							break;
						}
					}
				});

				// put / remove the records in the store
				store.mergeRemoteChanges(() => {
					if (toRemove.length) store.remove(toRemove);
					if (toPut.length) store.put(toPut);
				});
			};

			yStore.on('change', handleChange);
			unsubs.push(() => yStore.off('change', handleChange));

			/* -------------------- Awareness ------------------- */

			const yClientId = room.awareness.clientID.toString();
			setUserPreferences({ id: yClientId });

			const userPreferences = computed('userPreferences', () => {
				const user = getUserPreferences();
				return {
					id: user.id,
					color: user.color ?? defaultUserPreferences.color,
					name: user.name ?? defaultUserPreferences.name,
				};
			});

			// Create the instance presence derivation
			const presenceId = InstancePresenceRecordType.createId(yClientId);
			const presenceDerivation = createPresenceStateDerivation(
				userPreferences,
				presenceId,
			)(store);

			// Set our initial presence from the derivation's current value
			room.awareness.setLocalStateField('presence', presenceDerivation.get());

			// When the derivation changes, sync presence to yjs awareness
			unsubs.push(
				react('when presence changes', () => {
					const presence = presenceDerivation.get();
					requestAnimationFrame(() => {
						room.awareness.setLocalStateField('presence', presence);
					});
				}),
			);

			// Sync yjs awareness changes to the store
			const handleUpdate = (update) => {
				const states = room.awareness.getStates();

				const toRemove = [];
				const toPut = [];

				// Connect records to put / remove
				for (const clientId of update.added) {
					const state = states.get(clientId);
					if (state?.presence && state.presence.id !== presenceId) {
						toPut.push(state.presence);
					}
				}

				for (const clientId of update.updated) {
					const state = states.get(clientId);
					if (state?.presence && state.presence.id !== presenceId) {
						toPut.push(state.presence);
					}
				}

				for (const clientId of update.removed) {
					toRemove.push(
						InstancePresenceRecordType.createId(clientId.toString()),
					);
				}

				// put / remove the records in the store
				store.mergeRemoteChanges(() => {
					if (toRemove.length) store.remove(toRemove);
					if (toPut.length) store.put(toPut);
				});
			};

			const handleMetaUpdate = () => {
				const theirSchema = meta.get('schema');
				if (!theirSchema) {
					throw new Error('No schema found in the yjs doc');
				}
				// If the shared schema is newer than ours, the user must refresh
				if (compareSchemas(theirSchema, store.schema.serialize()) === 1) {
					window.alert('The schema has been updated. Please refresh the page.');
					yDoc.destroy();
				}
			};
			meta.observe(handleMetaUpdate);
			unsubs.push(() => meta.unobserve(handleMetaUpdate));

			room.awareness.on('update', handleUpdate);
			unsubs.push(() => room.awareness.off('update', handleUpdate));

			// Initialize the store with the yjs doc records or initialize the yjs doc with the default store records.
			if (yStore.yarray.length) {
				// Replace the store records with the yjs doc records
				const ourSchema = store.schema.serialize();
				const theirSchema = meta.get('schema');
				if (!theirSchema) {
					throw new Error('No schema found in the yjs doc');
				}

				const records = yStore.yarray.toJSON().map(({ val }) => val);

				const migrationResult = store.schema.migrateStoreSnapshot({
					schema: theirSchema,
					store: Object.fromEntries(
						records.map((record) => [record.id, record]),
					),
				});
				if (migrationResult.type === 'error') {
					// If the schema is newer than ours, the user must refresh
					console.error(migrationResult.reason);
					window.alert('The schema has been updated. Please refresh the page.');
					return;
				}

				yDoc.transact(() => {
					// Delete any deleted records from the yjs doc
					for (const r of records) {
						if (!migrationResult.value[r.id]) {
							yStore.delete(r.id);
						}
					}
					for (const r of Object.values(migrationResult.value)) {
						yStore.set(r.id, r);
					}
					meta.set('schema', ourSchema);
				});

				store.loadSnapshot({
					store: migrationResult.value,
					schema: ourSchema,
				});
			} else {
				// Create the initial store records
				// Sync the store records to the yjs doc
				yDoc.transact(() => {
					for (const record of store.allRecords()) {
						yStore.set(record.id, record);
					}
					meta.set('schema', store.schema.serialize());
				});
			}

			setStoreWithStatus({
				store,
				status: 'synced-remote',
				connectionStatus: 'online',
			});
		}

		let hasConnectedBefore = false;

		function handleStatusChange({
			status,
		}) {
			// If we're disconnected, set the store status to 'synced-remote' and the connection status to 'offline'
			if (status === 'disconnected') {
				setStoreWithStatus({
					store,
					status: 'synced-remote',
					connectionStatus: 'offline',
				});
				return;
			}

			room.off('synced', handleSync);

			if (status === 'connected') {
				if (hasConnectedBefore) return;
				hasConnectedBefore = true;
				room.on('synced', handleSync);
				unsubs.push(() => room.off('synced', handleSync));
			}
		}

		room.on('status', handleStatusChange);
		unsubs.push(() => room.off('status', handleStatusChange));

		return () => {
			unsubs.forEach((fn) => fn());
			unsubs.length = 0;
		};
	}, [room, yDoc, store, yStore, meta]);

	return storeWithStatus;
}


