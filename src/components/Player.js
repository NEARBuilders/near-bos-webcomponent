import React, { useState, useEffect } from "react";
import * as Player from "@livepeer/react/player";
import { PlayIcon, PauseIcon } from "@livepeer/react/assets";
import { getSrc } from "@livepeer/react/external";
import { Livepeer } from "livepeer";

const livepeer = new Livepeer({
	apiKey: process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY,
});

export const getPlaybackSource = async (playbackId) => {
	const playbackInfo = await livepeer.playback.get(playbackId);
	const src = getSrc(playbackInfo.playbackInfo);

	return src;
};

export const VideoPlayer = (props) => {
	const [src, setSrc] = useState(null);
	const [playbackId, setPlaybackId] = useState(0);

	useEffect(() => {
		const newPlaybackId = props.props?.playbackId;

		if (newPlaybackId) {
			const { playbackId } = props.props;

			setPlaybackId(playbackId);
		}
	}, [props?.props]);

	useEffect(() => {
		if (!playbackId) return;

		const fetchSrc = async () => {
			const fetchedSrc = await getPlaybackSource(playbackId);
			setSrc(fetchedSrc);
		};
		fetchSrc();
	}, [playbackId]);

	if (!src) {
		return <p>Loading</p>;
	}

	return (
		<Player.Root src={src}>
			<Player.Container>
				<Player.Video title="Live stream" />
				<Player.Controls className="flex items-center justify-center">
					<Player.PlayPauseTrigger className="w-10 h-10">
						<Player.PlayingIndicator asChild matcher={false}>
							<PlayIcon />
						</Player.PlayingIndicator>
						<Player.PlayingIndicator asChild>
							<PauseIcon />
						</Player.PlayingIndicator>
					</Player.PlayPauseTrigger>
				</Player.Controls>
			</Player.Container>
		</Player.Root>
	);
};
