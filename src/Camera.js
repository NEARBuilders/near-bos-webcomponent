import React from "react";
import Webcam from "react-webcam";
import styled from "styled-components";

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas:
    "top-left top-center top-right"
    "center-left center center-right"
    "bottom-left bottom-center bottom-right";
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
`;

const OverlayZone = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  grid-area: ${(props) => props.area};
`;

class Camera extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.webcamRef = React.createRef();
    this.state = {
      facingMode: this.props.videoConstraints.facingMode,
      videoConstraints: this.props.videoConstraints,
    };
  }

  componentDidMount() {
    this.updateVideoConstraints();
  }

  updateVideoConstraints = () => {
    if (this.containerRef.current) {
      const { width, height } = this.containerRef.current.getBoundingClientRect();
      this.setState((prevState) => ({
        videoConstraints: {
          ...prevState.videoConstraints,
          width,
          height,
        },
      }));
    }
  };

  getScreenshot = () => {
    if (this.webcamRef.current) {
      return this.webcamRef.current.getScreenshot();
    }
    return null;
  };

  toggleFacingMode = () => {
    this.setState((prevState) => ({
      facingMode: prevState.facingMode === "user" ? "environment" : "user",
    }));
  };

  render() {
    const { audio, mirrored, screenshotFormat, overlayComponents } = this.props;
    const { facingMode, videoConstraints } = this.state;

    const webcamAPI = {
      getScreenshot: this.getScreenshot,
      toggleFacingMode: this.toggleFacingMode,
      facingMode,
    };

    return (
      <div ref={this.containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Webcam
          audio={audio}
          mirrored={mirrored}
          screenshotFormat={screenshotFormat}
          videoConstraints={{ ...videoConstraints, facingMode }}
          ref={this.webcamRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <StyledOverlay>
          {Object.entries(overlayComponents).map(([zone, Component]) => (
            <OverlayZone key={zone} area={zone}>
              <Component {...webcamAPI} />
            </OverlayZone>
          ))}
        </StyledOverlay>
      </div>
    );
  }
}

Camera.defaultProps = {
  audio: false,
  mirrored: false,
  screenshotFormat: "image/jpeg",
  videoConstraints: {
    facingMode: "user",
    width: 1280,
    height: 720,
  },
  overlayComponents: {},
};

export default Camera;
