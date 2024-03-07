import React, { useEffect, useMemo, useState } from "react";
import { Widget } from "near-social-vm";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "App.scss";

import {
  BrowserRouter as Router,
  Link,
  Route,
  useLocation,
} from "react-router-dom";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { useInitNear, useAccount } from "near-social-vm";

const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

function Viewer({ widgetSrc, code }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [redirectMap, setRedirectMap] = useState({});

  const defaultRoute = {
    path: "efiz.near/widget/Tree", // your path here
    blockHeight: "final",
    init: { // and any props you want to pass
      rootPath: "efiz.near"
    },
  };

  // create props from params
  const passProps = useMemo(() => {
    return Array.from(searchParams.entries()).reduce((props, [key, value]) => {
      props[key] = value;
      return props;
    }, {});
  }, [location]);

  const path = location.pathname.substring(1);

  const src = useMemo(() => {
    const defaultSrc = defaultRoute.path; // default widget to load
    const pathSrc = widgetSrc || (path !== "" && path) || defaultSrc; // if no path, load default widget
    return pathSrc;
  }, [widgetSrc]);

  useEffect(() => {
    const fetchRedirectMap = async () => {
      try {
        const localStorageFlags = JSON.parse(
          localStorage.getItem("flags") || "{}"
        );
        let redirectMapData;

        if (localStorageFlags.bosLoaderUrl) {
          const response = await fetch(localStorageFlags.bosLoaderUrl);
          const data = await response.json();
          redirectMapData = data.components;
        } else {
          redirectMapData = JSON.parse(
            sessionStorage.getItem(SESSION_STORAGE_REDIRECT_MAP_KEY) || "{}"
          );
        }
        setRedirectMap(redirectMapData);
      } catch (error) {
        console.error("Error fetching redirect map:", error);
      }
    };
    fetchRedirectMap();
  }, []);

  return (
    <Widget
      src={!code && src}
      code={code} // prioritize code
      props={{ ...(defaultRoute.init), ...passProps }}
      config={{ redirectMap }}
    />
  );
}

function App(props) {
  const { initNear } = useInitNear();

  useAccount();
  useEffect(() => {
    initNear &&
      initNear({
        networkId: "mainnet",
        selector: props.selectorPromise,
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
        <Viewer widgetSrc={props.widgetSrc} code={props.code}></Viewer>
      </Route>
    </Router>
  );
}

export default App;
