import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

class NearSocialViewerElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `<slot></slot>`;
    }
    connectedCallback() {
        const container = document.createElement('div');
        this.appendChild(container);

        const root = createRoot(container);
        root.render(<App />);
    }
}

customElements.define('near-social-viewer', NearSocialViewerElement);
