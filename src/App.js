import "App.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle";
import React, { createContext, useEffect, useMemo, useState } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";

import { isValidAttribute } from "dompurify";
import { useAccount, useInitNear, Widget } from "near-social-vm";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Wallet from "./auth/Wallet";

import { BosWorkspaceProvider, useRedirectMap } from "./utils/bos-workspace";
import { EthersProvider } from "./utils/web3/ethers";

// Higher-order component to provide context and handle hydration
const withHydration = (WrappedComponent) => {
  return (props) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    if (!isHydrated) {
      return null; // Or a loading indicator
    }

    const commonFunctions = { sharedFunction: () => console.log(JSON.stringify(props)) }

    return (
      <WrappedComponent
        {...props}
        {...commonFunctions}
      />
    );
  };
};

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

  const redirectMap = useRedirectMap();

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
  const {
    src,
    code,
    initialProps,
    rpc,
    network,
    selectorPromise,
    config,
    customElements,
  } = props;

  const { initNear } = useInitNear();

  useAccount();

  useEffect(() => {
    const VM = {
      networkId: network || "mainnet",
      selector: selectorPromise,
      customElements: customElements,
      features: {
        enableComponentSrcDataKey:
          config?.vm?.features?.enableComponentSrcDataKey,
      },
      config: {
        defaultFinality: undefined,
      },
    };

    if (rpc) {
      VM.config.nodeUrl = rpc;
    }

    initNear && initNear(VM);
  }, [initNear, rpc]);

  const router = createBrowserRouter([
    {
      path: "/*",
      element: (
        <EthersProvider>
          <Viewer widgetSrc={src} code={code} initialProps={initialProps} />
        </EthersProvider>
      ),
    },
  ]);

  return (
    <BosWorkspaceProvider config={config?.dev}>
      <RouterProvider router={router} />
    </BosWorkspaceProvider>
  );
}

export default App;
