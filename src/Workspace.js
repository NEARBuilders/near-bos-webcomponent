
import { useEffect, useState } from "react";
import io from "socket.io-client";

const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

export const Workspace = (props) =>  {
  const { enableHotReload, provides } = props;

  const [hotReload, setHotReload] = useState(enableHotReload);
  const [redirectMap, setRedirectMap] = useState({});

  useEffect(() => {
    (async () => {
      if (hotReload) {
        const socket = io(`ws://${window.location.host}`, {
          reconnectionAttempts: 1, // Limit reconnection attempts
        });

        socket.on("fileChange", (d) => {
          console.log("File change detected via WebSocket", d);
          setRedirectMap(d);
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
          setRedirectMap(
            (await fetch(localStorageFlags.bosLoaderUrl).then((r) => r.json()))
              .components
          );
        } else {
          setRedirectMap(
            JSON.parse(sessionStorage.getItem(SESSION_STORAGE_REDIRECT_MAP_KEY))
          );
        }
      }
    })();
  }, [enableHotReload]);

  return provides({ redirectMap });
}