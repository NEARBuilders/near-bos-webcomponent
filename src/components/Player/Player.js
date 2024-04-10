import GetPlaybackId from "./GetPlaybackId";
import Display from "./Display";

import React, { useState, useEffect } from "react";
import * as Player from "@livepeer/react/player";
import { PlayIcon, PauseIcon } from "@livepeer/react/assets";
import { getSrc } from "@livepeer/react/external";
import { Livepeer } from "livepeer";

export const VideoPlayer = ({ children }) => {};

VideoPlayer.Display = Display;
VideoPlayer.GetPlaybackId = GetPlaybackId;
