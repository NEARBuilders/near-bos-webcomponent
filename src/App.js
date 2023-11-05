import React, { useEffect, useState } from "react";
import { Widget } from "near-social-vm";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "App.scss";

import { BrowserRouter as Router, Link, Route, useLocation } from "react-router-dom";
import { sanitizeUrl } from "@braintree/sanitize-url";
import {
  useInitNear,
} from "near-social-vm";

function Viewer() {
  const [widgetProps, setWidgetProps] = useState({});
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setWidgetProps(
      Array.from(searchParams.entries()).reduce((props, [key, value]) => {
        props[key] = value;
        return props;
      }, {})
    );
  }, [location]);

  const src = location.pathname?.substring(1);
  return <Widget key={src} src={src} props={widgetProps} />;
}

function App(props) {
  const { initNear } = useInitNear();

  useEffect(() => {
    initNear &&
      initNear({
        networkId: 'mainnet',
        customElements: {
          Link: (props) => {
            if (!props.to && props.href) {
              props.to = props.href;
              delete props.href;
            }
            if (props.to) {
              props.to = sanitizeUrl(props.to);
            }
            return <Link {...props} />;
          },
        },
        config: {
          defaultFinality: undefined,
        },
      });
  }, [initNear]);

  return (
    <Router>
      <Route>
        <Viewer></Viewer>
      </Route>
    </Router>
  );
}

export default App;
