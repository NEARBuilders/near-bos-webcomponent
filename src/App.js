import "App.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle";
import React, { useEffect, useMemo, useState } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { isValidAttribute } from "dompurify";
import {
  useAccount,
  useInitNear,
  Widget,
} from "near-social-vm";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Wallet from "./auth/Wallet";

import { EthersProvider } from "./utils/web3/ethersProvider"

const SESSION_STORAGE_REDIRECT_MAP_KEY = "nearSocialVMredirectMap";

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

  const [redirectMap, setRedirectMap] = useState(null);
  useEffect(() => {
    (async () => {
      const localStorageFlags = JSON.parse(localStorage.getItem("flags"));

      if (localStorageFlags?.bosLoaderUrl) {
        setRedirectMap(
          (await fetch(localStorageFlags.bosLoaderUrl).then((r) => r.json()))
            .components
        );
      } else {
        setRedirectMap(
          JSON.parse(sessionStorage.getItem(SESSION_STORAGE_REDIRECT_MAP_KEY))
        );
      }
    })();
  }, []);

  return (
    <>
      <Widget
        src={!code && src}
        code={code} // prioritize code
        props={{ ...initialProps, ...passProps }}
        config={{ redirectMap }}
      />
    </>
  );
}

function App(props) {
  const { src, code, initialProps, rpc, network, selectorPromise } = props;
  const { initNear } = useInitNear();

  useAccount();
  useEffect(() => {
    const config = {
      networkId: network || "mainnet",
      selector: selectorPromise,
      customElements: {
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
      },
      features: {
        enableComponentSrcDataKey: true,
      },
      config: {
        defaultFinality: undefined,
      },
    };

    if (rpc) {
      config.config.nodeUrl = rpc;
    }

    initNear && initNear(config);
  }, [initNear, rpc]);

  const router = createBrowserRouter([
    {
      path: "/*",
      element: (
        <EthersProvider>
          <Viewer
            widgetSrc={src}
            code={code}
            initialProps={initialProps}
          />
        </EthersProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
