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

        const src = this.getAttribute('src');
        const code = this.getAttribute('code');

        const root = createRoot(container);
        root.render(<App widgetSrc={src} code={code} />);
    }

    static get observedAttributes() {
        return ['src', 'code'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Re-render the component with new props when attributes change
        if (oldValue !== newValue) {
            const container = this.shadowRoot.querySelector('div');
            const root = createRoot(container);
            root.render(<App {...{[name]: newValue}} />);
        }
    }
}

customElements.define('near-social-viewer', NearSocialViewerElement);
