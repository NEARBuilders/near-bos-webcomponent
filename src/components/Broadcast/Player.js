import React from "react";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";

import { useStore } from "./state";

const Player = (props) => {
	const { streamKey } = useStore();

	if (!streamKey) return <div>stream key not found</div>;

	return (
		<div>
			{streamKey}
			<Broadcast.Root ingestUrl={getIngest(streamKey)}>
				<Broadcast.Container>
					<Broadcast.Video
						title="Livestream"
						style={{
							height: "100%",
							width: "100%",
							objectFit: "contain",
						}}
					/>

					<Broadcast.Controls className="flex items-center justify-center">
						<Broadcast.EnabledTrigger className="w-10 h-10 hover:scale-105 flex-shrink-0">
							<Broadcast.EnabledIndicator asChild matcher={false}>
								<EnableVideoIcon className="w-full h-full" />
							</Broadcast.EnabledIndicator>
							<Broadcast.EnabledIndicator asChild>
								<StopIcon className="w-full h-full" />
							</Broadcast.EnabledIndicator>
						</Broadcast.EnabledTrigger>
					</Broadcast.Controls>

					<Broadcast.LoadingIndicator asChild matcher={false}>
						<div className="absolute overflow-hidden py-1 px-2 rounded-full top-1 left-1 bg-black/50 flex items-center backdrop-blur">
							<Broadcast.StatusIndicator
								matcher="live"
								className="flex gap-2 items-center"
							>
								<div className="bg-red-500 animate-pulse h-1.5 w-1.5 rounded-full" />
								<span className="text-xs select-none">LIVE</span>
							</Broadcast.StatusIndicator>

							<Broadcast.StatusIndicator
								className="flex gap-2 items-center"
								matcher="pending"
							>
								<div className="bg-white/80 h-1.5 w-1.5 rounded-full animate-pulse" />
								<span className="text-xs select-none">LOADING</span>
							</Broadcast.StatusIndicator>

							<Broadcast.StatusIndicator
								className="flex gap-2 items-center"
								matcher="idle"
							>
								<div className="bg-white/80 h-1.5 w-1.5 rounded-full" />
								<span className="text-xs select-none">IDLE</span>
							</Broadcast.StatusIndicator>
						</div>
					</Broadcast.LoadingIndicator>
				</Broadcast.Container>
			</Broadcast.Root>
		</div>
	);
};

export default Player;
