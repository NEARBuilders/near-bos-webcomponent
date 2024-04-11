import React, { useState } from "react";
import { Livepeer } from "livepeer";

import { useStore } from "./state";

const livepeerInstance = new Livepeer({
  apiKey: process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY,
});

const UploadVideo = () => {
  const [name, setName] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const { setPlaybackId } = useStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    generateUploadLink();
  };

  const generateUploadLink = async () => {
    const result = await livepeerInstance.asset.create({
      name,
    });

    console.log(result);

    setUploadUrl(result.object.url);
    setPlaybackId(result.object.asset.playbackId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <>
        <label>
          Asset name:
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button type="submit">Generate link</button>
      </>
      {uploadUrl && <DirectUploadForm uploadUrl={uploadUrl} />}
    </form>
  );
};

function DirectUploadForm({ uploadUrl }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    // event.preventDefault();

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "video/mp4",
        },
      });

      if (response.ok) {
        alert("Upload successful");
        console.log("-- response upload");
        console.log(response);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed with an error");
    }
  };

  return (
    <>
      <label>
        Upload file:
        <input type="file" onChange={handleFileChange} />
      </label>
      <button type="submit" onClick={handleSubmit}>
        Upload
      </button>
    </>
  );
}

export default UploadVideo;
