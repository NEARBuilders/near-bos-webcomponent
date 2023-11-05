import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { StyleSheetManager } from 'styled-components';

class NearSocialViewerElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        document.querySelectorAll('style').forEach(styleElement => {
            this.shadowRoot.appendChild(styleElement.cloneNode(true));
        });
        const container = document.createElement('div');
        this.shadowRoot.appendChild(container);        

        const root = createRoot(container);
        root.render(<StyleSheetManager target={this.shadowRoot}><App /></StyleSheetManager>);
        
    }
}

customElements.define('near-social-viewer', NearSocialViewerElement);
