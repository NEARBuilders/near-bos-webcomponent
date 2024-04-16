import React, { useState } from "react";
import { Livepeer } from "livepeer";

import { useStore } from "./state";

const livepeerInstance = new Livepeer({
  apiKey: process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY,
});

const GetUploadUrl = () => {
  const { setAssetName, setPlaybackId, setResumableUploadUrl, setUploadUrl } =
    useStore();

  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    generateUploadLink();
    setAssetName(name);
  };

  const generateUploadLink = async () => {
    const result = await livepeerInstance.asset.create({
      name,
    });

    setUploadUrl(result.object.url);
    setResumableUploadUrl(result.object.tusEndpoint);
    setPlaybackId(result.object.asset.playbackId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Asset name:
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <button type="submit">Generate link</button>
    </form>
  );
};

export default GetUploadUrl;
