import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";


const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

export function useRedirectMap() {
  const enableHotReload = useContext(HotReloadContext);

  const [hotReload, setHotReload] = useState(enableHotReload);
  const [devJson, setDevJson] = useState({
    components: {},
    data: {},
  });

  useEffect(() => {
    (async () => {
      if (hotReload) {
        const socket = io(`ws://${window.location.host}`, {
          reconnectionAttempts: 1, // Limit reconnection attempts
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

const HotReloadContext = createContext(false);

export const RedirectMapProvider = ({ enableHotReload, children }) => {
  return (
    <HotReloadContext.Provider value={enableHotReload}>
      {children}
    </HotReloadContext.Provider>
  );
};
