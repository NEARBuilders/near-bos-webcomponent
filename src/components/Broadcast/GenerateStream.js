import React from "react";
import { useStore } from "./state";

const GenerateStream = () => {
	const { setStreamKey } = useStore();

	const createStream = async () => {
		try {
			const response = await fetch("https://livepeer.studio/api/stream", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.REACT_APP_LIVEPEER_STUDIO_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: "test_stream",
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
		<button type="button" onClick={createStream}>
			create stream
		</button>
	);
};

export default GenerateStream;
