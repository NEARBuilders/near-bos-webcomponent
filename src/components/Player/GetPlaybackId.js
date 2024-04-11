import React from "react";
import { getSrc } from "@livepeer/react/external";
import { Livepeer } from "livepeer";

import { useStore } from "./state";

const livepeerInstance = new Livepeer({
  apiKey: process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY,
});

const PLAYBACK_ID = "8b3bdqjtdj4jsjwa";

const getPlaybackSource = async (
  playbackId = PLAYBACK_ID,
  livepeer = livepeerInstance
) => {
  if (!livepeer) throw new Error("Livepeer instance not found");

  const playbackInfo = await livepeer.playback.get(playbackId);
  const src = getSrc(playbackInfo.playbackInfo);

  return src;
};

const GetPlaybackId = () => {
  const { setSrc } = useStore();
  const { livepeer } = useStore();

  const fetchSrc = async () => {
    // const fetchedSrc = await getPlaybackSource(_, livepeer);
    const fetchedSrc = await getPlaybackSource();
    setSrc(fetchedSrc);
  };

  return (
    <button type="button" onClick={fetchSrc}>
      get src
    </button>
  );
};

export default GetPlaybackId;
