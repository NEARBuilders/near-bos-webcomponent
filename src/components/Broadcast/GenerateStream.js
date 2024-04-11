import React, { useState } from "react";
import { useStore } from "./state";

const GenerateStream = () => {
  const { setStreamKey } = useStore();

  const [name, setName] = useState("");

  const createStream = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("https://livepeer.studio/api/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Stream created:", data);
      setStreamKey(data.streamKey);
    } catch (error) {
      console.error("Error creating stream:", error);
    }
  };

  return (
    <>
      <form onSubmit={createStream}>
        <label>
          Stream name:
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button type="submit">Start stream</button>
      </form>
    </>
  );
};

export default GenerateStream;
