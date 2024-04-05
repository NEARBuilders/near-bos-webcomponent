import React from "react";
import { Tldraw, track, useEditor } from "tldraw";
import { Widget } from "near-social-vm";
import { useYjsStore } from "../useYjsStore";

function TldrawCanvas(props) {
  let store;
  try {
    store = useYjsStore({
      roomId: props.roomId ?? "example17",
      hostUrl: props.hostUrl ?? "ws://localhost:1234",
    });
  } catch (error) {
    console.error("Failed to connect to Yjs store:", error);
    store = undefined; // Set store to undefined in case of failure
  }
  // this still isn't working when web socket connect fails

  function loadComponents(c) {
    return Object.keys(c).reduce((acc, key) => {
      if (!c[key]) {
        acc[key] = null;
      } else {
        const { src, props } = c[key];
        acc[key] = () =>  (
        <div style={{ pointerEvents: "all", display: "flex" }}>
          <Widget src={plugin.src} props={{ ...plugin.props, color, name, id }} />
          </div>);
      }

      return acc;
    }, {});
  }

  return (
    <div style={props.style}>
      <Tldraw
        persistanceKey={props.persistanceKey ?? "tldraw"}
        autoFocus={props.autoFocus ?? true}
        store={store}
        forceMobile={props.forceMobile ?? false}
        inferDarkMode={props.inferDarkMode ?? false}
        components={loadComponents(props.components ?? {})}
        onMount={(editor) => {
          editor.user.updateUserPreferences({
            id: props.context.accountId,
          });
          editor.updateInstanceState({ isReadonly: props.isReadonly ?? false });
        }}
      />
    </div>
  );
}

const Editor = track(({ plugin }) => {
  const editor = useEditor();

  const { color, name, id } = editor.user.getUserPreferences();

  // expose all of the apis and saturate the plugin's props according to schema (required)

  return (
    <div style={{ pointerEvents: "all", display: "flex" }}>
      <Widget src={plugin.src} props={{ ...plugin.props, color, name, id }} />
      {/* <Widget src="efiz.near/widget/print" props={{ color, name }} /> */}
      {/* <input
        type="color"
        value={color}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            color: e.currentTarget.value,
          });
        }}
      />
      <input
        value={name}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            name: e.currentTarget.value,
          });
        }}
      /> */}
    </div>
  );
});

export default TldrawCanvas;
