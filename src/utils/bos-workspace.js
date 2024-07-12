import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

const defaultContext = {
  hotreload: {
    enabled: false,
  },
};

const BosWorkspaceContext = createContext(defaultContext);

export const BosWorkspaceProvider = ({ config, children }) => {
  return (
    <BosWorkspaceContext.Provider value={config || defaultContext}>
      {children}
    </BosWorkspaceContext.Provider>
  );
};

export function useRedirectMap() {
  const { hotreload } = useContext(BosWorkspaceContext);

  const [hotReloadEnabled, setHotReloadEnabled] = useState(hotreload?.enabled);
  const [devJson, setDevJson] = useState({});

  useEffect(() => {
    setHotReloadEnabled(hotreload?.enabled);
  }, [hotreload]);

  useEffect(() => {
    (async () => {
      if (hotReloadEnabled) {
        const socket = io(hotreload?.wss || `ws://${window.location.host}`, {
          reconnectionAttempts: 1, // Limit reconnection attempts
        });

        socket.on("fileChange", (d) => {
          console.log("File change detected via WebSocket", d);
          setDevJson(d.components);
        });

        socket.on("connect_error", (error) => {
          console.warn("WebSocket connection error. Switching to HTTP.");
          console.warn(error);

          setHotReloadEnabled(false);
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
  }, [hotReloadEnabled]);

  return devJson;
}
