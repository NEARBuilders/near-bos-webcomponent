import React, { useState } from "react";
import { useStore } from "./state";

function DirectUploadAsset() {
  const { uploadLink } = useStore();

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
      const response = await fetch(uploadLink, {
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

export default DirectUploadAsset;
