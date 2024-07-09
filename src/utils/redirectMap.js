import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

const HotReloadContext = createContext(false);

export const RedirectMapProvider = ({ enableHotReload, children }) => {
  return (
    <HotReloadContext.Provider value={enableHotReload}>
      {children}
    </HotReloadContext.Provider>
  );
};

export function useRedirectMap(wss) {
  const enableHotReload = useContext(HotReloadContext);

  const [hotReload, setHotReload] = useState(enableHotReload);
  const [devJson, setDevJson] = useState({});

  useEffect(() => {
    (async () => {
      if (hotReload) {
        const socket = io(wss || `ws://${window.location.host}`, {
          reconnectionAttempts: 1, // Limit reconnection attempts
					// transports: ['websocket'],
        });

        socket.on("fileChange", (d) => {
          console.log("File change detected via WebSocket", d);
          setDevJson(d);
        });

        socket.on("connect_error", (error) => {
          console.warn("WebSocket connection error. Switching to HTTP.");
					console.warn(error)

          setHotReload(false);
          socket.disconnect();
        });

        return () => {
          socket.disconnect();
        };
      } else {
        const localStorageFlags = JSON.parse(localStorage.getItem("flags"));

        if (localStorageFlags?.bosLoaderUrl) {
          setDevJson(
            (await fetch(localStorageFlags.bosLoaderUrl).then((r) => r.json()))
              .components
          );
        } else {
          setDevJson(
            JSON.parse(sessionStorage.getItem(SESSION_STORAGE_REDIRECT_MAP_KEY))
          );
        }
      }
    })();
  }, [enableHotReload]);

  return devJson;
}