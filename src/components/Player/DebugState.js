import React from "react";
import { useStore } from "./state";
import styled from "styled-components";

const DebugContainer = styled.div`
  padding: 1rem;
  margin-top: 1rem;
`;

const DebugItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
`;

const Label = styled.span`
  font-weight: normal;
`;

const Value = styled.span`
  font-weight: bold;
`;

const Error = styled.textarea`
  background-color: orange;
  color: black;
  font-family: monospace;
  font-size: 1rem;
  border: none;
  padding: 1rem;
  width: 100%;
  height: auto;
  resize: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.5);
  }
`;

function DebugState() {
  const { src, playbackId, assetName, uploadUrl, resumableUploadUrl, error } =
    useStore();

  return (
    <DebugContainer>
      <h3>Player state debugger</h3>
      <DebugItem>
        <Label>Asset name:</Label>
        <Value>{assetName}</Value>
      </DebugItem>
      <DebugItem>
        <Label>Playback Id:</Label>
        <Value>{playbackId}</Value>
      </DebugItem>
      <div>
        <label>1. Get source from livepeer studio</label>
        <div>{src}</div>
      </div>
      <label>2. Create upload link</label>
      <DebugItem>
        <Label>Direct upload:</Label>
        <Value>{uploadUrl.substring(7, 17)}...</Value>
      </DebugItem>
      <DebugItem>
        <Label>Resumable upload:</Label>
        <Value>{resumableUploadUrl.substring(7, 17)}...</Value>
      </DebugItem>
      <Error value={error}></Error>
    </DebugContainer>
  );
}

export default DebugState;
