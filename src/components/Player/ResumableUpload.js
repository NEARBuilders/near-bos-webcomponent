import React, { useState } from "react";
import tus from "tus-js-client";

const ResumableUpload = ({ tusEndpoint }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadUrl, setUploadUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFilesChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("-- here");
    console.log(tus);

    const upload = new tus.Upload(file, {
      endpoint: tusEndpoint,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      uploadSize: file.size,
      onError: (err) => {
        console.error("Error uploading file:", err);
        setErrorMessage("Error uploading file: " + err);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log("Uploaded", percentage + "%");
        setUploadProgress(percentage);
      },
      onSuccess: () => {
        console.log("Upload finished:", upload.url);
        console.log(upload);
        setUploadUrl(upload.url);
      },
    });

    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length > 0) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    upload.start();
  };

  return (
    <div>
      <input type="file" onChange={handleFilesChange} accept="video/*" />
      <div>
        {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
        {uploadUrl && <p>Upload finished! URL: {uploadUrl}</p>}
        {errorMessage && <p>Error: {errorMessage}</p>}
      </div>
    </div>
  );
};

export default ResumableUpload;
