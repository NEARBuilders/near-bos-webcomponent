import React from "react";
import { getSrc } from "@livepeer/react/external";
import { Livepeer } from "livepeer";

import { useStore } from "./state";

const livepeerInstance = new Livepeer({
  apiKey: process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY,
});

const GetPlaybackId = () => {
  const { setSrc, setError, playbackId } = useStore();

  const getPlaybackSource = async (playbackId, livepeer = livepeerInstance) => {
    if (!livepeer) throw new Error("Livepeer instance not found");

    try {
      const playbackInfo = await livepeer.playback.get(playbackId);
      // const a = "9bc9jzmv6rdt1gqr";
      // const playbackInfo = await livepeer.playback.get(a);

      const src = getSrc(playbackInfo.playbackInfo);

      return src;
    } catch (error) {
      console.log("-- in error");
      console.log(error);
      setError(error.message);
    }
  };

  const fetchSrc = async () => {
    // const fetchedSrc = await getPlaybackSource(_, livepeer);
    try {
      const fetchedSrc = await getPlaybackSource(playbackId);
      setSrc(fetchedSrc);
    } catch (error) {
      console.log("-- in error");
      console.log(error);
      setError(erorr.message);
    }
  };

  return (
    <button type="button" onClick={fetchSrc}>
      get src
    </button>
  );
};

export default GetPlaybackId;
