import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App"; // what if this was bundled and published separately?
import Camera from "./Camera";

// should NearSocialViewerElement be a newly defined and extendable class? to maintain consistency?
// so this would could be "class NearWebcamViewerElement extends NearSocialViewerElement"
class NearSocialViewerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<slot></slot>`;
    this.selectorPromise = new Promise(
      (resolve) => (this.selectorPromiseResolve = resolve)
    );
    this.reactRoot = null;
  }

  set selector(selector) {
    this.selectorPromiseResolve(selector);
  }

  connectedCallback() {
    const container = document.createElement("div");
    this.appendChild(container);

    this.reactRoot = createRoot(container);
    this.renderRoot();
  }

  static get observedAttributes() {
    return ["src", "code", "initialprops", "rpc", "network"];
  }

  renderRoot() {
    const src = this.getAttribute("src");
    const code = this.getAttribute("code");
    const initialProps = this.getAttribute("initialprops");
    const rpc = this.getAttribute("rpc");
    const network = this.getAttribute("network");

    this.reactRoot.render(
      <App
        src={src}
        code={code}
        initialProps={JSON.parse(initialProps)}
        rpc={rpc}
        network={network}
        selectorPromise={this.selectorPromise}
        customElements={{ // defining and importing custom elements here
          Camera: (props) => <Camera {...props} />,
        }}
      />
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.renderRoot();
    }
  }
}

// other custom versions of near-bos-webcomponent should define their own element tag
// near-webcam-viewer
customElements.define("near-social-viewer", NearSocialViewerElement);
