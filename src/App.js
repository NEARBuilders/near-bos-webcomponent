import "App.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle";
import { Widget } from "near-social-vm";
import React, { useEffect, useMemo } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { sanitizeUrl } from "@braintree/sanitize-url";
import { useAccount, useInitNear } from "near-social-vm";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useLocation,
} from "react-router-dom";

function Viewer({ widgetSrc, code, initialProps }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // create props from params
  const passProps = useMemo(() => {
    return Array.from(searchParams.entries()).reduce((props, [key, value]) => {
      props[key] = value;
      return props;
    }, {});
  }, [location]);

  const path = location.pathname.substring(1);

  const src = useMemo(() => {
    const pathSrc = widgetSrc ?? path;
    return pathSrc;
  }, [widgetSrc, path]);

  return (
    <>
      <Widget
        src={!code && src}
        code={code} // prioritize code
        props={{ ...initialProps, ...passProps }}
      />
    </>
  );
}

function App(props) {
  const { src, code, initialProps, rpc, selectorPromise } = props;
  const { initNear } = useInitNear();

  useAccount();
  useEffect(() => {
    const networkId = "mainnet";
    const rpcUrl =
      rpc ??
      (networkId === "mainnet"
        ? "https://free.rpc.fastnear.com"
        : "https://rpc.testnet.near.org");

    initNear &&
      initNear({
        networkId: networkId,
        selector: selectorPromise,
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
        features: {
          enableComponentSrcDataKey: true,
        },
        config: {
          defaultFinality: undefined,
          nodeUrl: rpcUrl,
        },
      });
    console.log("using rpc: ", rpcUrl);
  }, [initNear]);

  const router = createBrowserRouter([
    {
      path: "/*",
      element: (
        <Viewer widgetSrc={src} code={code} initialProps={initialProps} />
      ),
    },
    //{ path: "/*", element: <Viewer /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
