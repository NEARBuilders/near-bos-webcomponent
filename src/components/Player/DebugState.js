import React from "react";
import { useStore } from "./state";

function DebugState() {
  const { src, uploadUrl, resumableUploadUrl } = useStore();

  return (
    <div>
      <h3>Player state debugger</h3>
      <h4>Step 1</h4>
      <div>
        <label>1. Get source from livepeer studio</label>
        <div>{src}</div>
      </div>
      <div>
        <label>2. Create upload link</label>
        <div>Direct upload: {uploadUrl}</div>
        <div>Resumable upload: {resumableUploadUrl}</div>
      </div>
    </div>
  );
}

export default DebugState;
