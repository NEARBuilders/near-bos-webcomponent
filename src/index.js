import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

class NearSocialViewerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<slot></slot>`;
    this.selectorPromise = new Promise((resolve) => (this.selectorPromiseResolve = resolve));
  }

  set selector(selector) {
    this.selectorPromiseResolve(selector);
  }

  connectedCallback() {
    const container = document.createElement("div");
    this.appendChild(container);

    const src = this.getAttribute("src");
    const code = this.getAttribute("code");
    const initialProps = this.getAttribute("initialProps");

    const root = createRoot(container);
    root.render(
      <App
        src={src}
        code={code}
        initialProps={JSON.parse(initialProps)}
        selectorPromise={this.selectorPromise}
      />
    );
  }

  static get observedAttributes() {
    return ["src", "code", "initialProps"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-render the component with new props when attributes change
    if (oldValue !== newValue) {
      const container = this.shadowRoot.querySelector("div");
      const root = createRoot(container);
      root.render(<App {...{ [name]: newValue }} />);
    }
  }
}

customElements.define("near-social-viewer", NearSocialViewerElement);
