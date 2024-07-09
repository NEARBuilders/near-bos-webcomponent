import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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
    return ["src", "code", "initialprops", "rpc", "network", "config"];
  }

  renderRoot() {
    const src = this.getAttribute("src");
    const code = this.getAttribute("code");
    const initialProps = this.getAttribute("initialprops");
    const rpc = this.getAttribute("rpc");
    const network = this.getAttribute("network");
    const config = this.getAttribute("config");

    this.reactRoot.render(
      <App
        src={src}
        code={code}
        initialProps={JSON.parse(initialProps)}
        rpc={rpc}
        network={network}
        selectorPromise={this.selectorPromise}
        config={JSON.parse(config)}
      />
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.renderRoot();
    }
  }
}

customElements.define("near-social-viewer", NearSocialViewerElement);
