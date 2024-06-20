import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";

import { SESSION_STORAGE_REDIRECT_MAP_KEY } from "../App.js";
import { HotReloadContext } from "../contexts/hotReloadContext.js";

function useRedirectMap() {
  const enableHotReload = useContext(HotReloadContext);

  const [hotReload, setHotReload] = useState(enableHotReload);
  const [devJson, setDevJson] = useState({
    components: {},
    data: {},
  });

  useEffect(() => {
    if (hotReload) {
      const socket = io(process.env.BOS_LOADER_WS || "ws://127.0.0.1:8080", {
        reconnectionAttempts: 1, // Limit reconnection attempts
      });

      socket.on("fileChange", (d) => {
        console.log("File change detected via WebSocket", d);
        console.log(JSON.stringify(d));
        setDevJson(d);
      });

      socket.on("connect_error", () => {
        console.warn("WebSocket connection error. Switching to HTTP.");
        setHotReload(false);
        socket.disconnect();
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setDevJson(
        JSON.parse(sessionStorage.getItem(SESSION_STORAGE_REDIRECT_MAP_KEY))
      );
    }
  }, [enableHotReload]);

  return devJson;
}

export default useRedirectMap;
