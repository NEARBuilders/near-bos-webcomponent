import GetPlaybackId from "./GetPlaybackId";
import Display from "./Display";
import GetUploadUrl from "./GetUploadUrl";
import ResumableUploadAsset from "./ResumableUploadAsset";
import DirectUploadAsset from "./DirectUploadAsset";
import DebugState from "./DebugState";

export const VideoPlayer = ({ children }) => {};

VideoPlayer.Display = Display;
VideoPlayer.GetPlaybackId = GetPlaybackId;
VideoPlayer.GetUploadUrl = GetUploadUrl;
VideoPlayer.DirectUploadAsset = DirectUploadAsset;
VideoPlayer.ResumableUploadAsset = ResumableUploadAsset;
VideoPlayer.Debug = DebugState;
