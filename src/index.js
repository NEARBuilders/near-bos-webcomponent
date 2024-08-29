import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Link } from "react-router-dom";
import Wallet from "./auth/Wallet";
import { isValidAttribute } from "dompurify";
import { CustomElementWithHooks } from "./external/CustomElementWithHooks";
import Camera from "./external/Camera";

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

// Create a new class that extends NearSocialViewerElement
class ExtensibleNearSocialViewer extends NearSocialViewerElement {
  constructor() {
    super();
    this.customComponents = {};
  }

  // Method to set custom components
  setCustomComponents(components) {
    this.customComponents = components;
    if (this.reactRoot) {
      this.renderRoot();
    }
  }

  // Override the renderRoot method
  renderRoot() {
    const src = this.getAttribute("src");
    const code = this.getAttribute("code");
    const initialProps = this.getAttribute("initialprops");
    const rpc = this.getAttribute("rpc");
    const network = this.getAttribute("network");
    const config = this.getAttribute("config");

    const customElements = {
      Link: (props) => {
        if (!props.to && props.href) {
          props.to = props.href;
          delete props.href;
        }
        if (props.to) {
          props.to =
            typeof props.to === "string" &&
            isValidAttribute("a", "href", props.to)
              ? props.to
              : "about:blank";
        }
        return <Link {...props} />;
      },
      Wallet: (props) => {
        return <Wallet {...props} />;
      },
      CustomElementWithHooks: (props) => {
        const { message } = props;
        return <CustomElementWithHooks message={message} />;
      },
      Camera,
    };

    this.reactRoot.render(
      <App
        src={src}
        code={code}
        initialProps={JSON.parse(initialProps)}
        rpc={rpc}
        network={network}
        selectorPromise={this.selectorPromise}
        config={JSON.parse(config)}
        customElements={customElements}
      />
    );
  }
}

customElements.define(
  "extensible-near-social-viewer",
  ExtensibleNearSocialViewer
);
