import React, { useEffect, useState } from "react";
import { singletonHook } from "react-singleton-hook";
import { init, useConnectWallet } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import ledgerModule from "@web3-onboard/ledger";
import ls from "local-storage";
import { EthersProviderContext } from "near-social-vm";

import chains from "./chains.json";

const web3onboardKey = "web3-onboard:connectedWallets";

const wcV2InitOptions = {
  version: 2,
  projectId: "f5f4d212d26f7cf2a7546a5bc3afeb40",
  dappUrl: window.location.origin,
};

const walletConnect = walletConnectModule(wcV2InitOptions);
const ledger = ledgerModule(wcV2InitOptions);
const injected = injectedModule();

// initialize Onboard
const onboard = init({
  wallets: [injected, walletConnect, ledger],
  chains,
  appMetadata: {
    name: "NEAR Social",
    description: "NEAR Social",
  },
  theme: "dark",
  containerElements: {
    // connectModal: '#near-social-navigation-bar',
    // accountCenter: "#near-social-web3-account",
  },
});

const defaultEthersProviderContext = {
  useConnectWallet,
  setChain: onboard.setChain,
};

const useEthersProviderContext = singletonHook(
  defaultEthersProviderContext,
  () => {
    const [{ wallet }] = useConnectWallet();
    const [ethersProvider, setEthersProvider] = useState(
      defaultEthersProviderContext
    );

    useEffect(() => {
      (async () => {
        const walletsSub = onboard.state.select("wallets");
        const { unsubscribe } = walletsSub.subscribe((wallets) => {
          const connectedWallets = wallets.map(({ label }) => label);
          ls.set(web3onboardKey, connectedWallets);
        });

        const previouslyConnectedWallets = ls.get(web3onboardKey) || [];

        if (previouslyConnectedWallets) {
          // You can also auto connect "silently" and disable all onboard modals to avoid them flashing on page load
          await onboard.connectWallet({
            autoSelect: {
              label: previouslyConnectedWallets[0],
              disableModals: true,
            },
          });
        }
      })();
    }, []);

    useEffect(() => {
      setEthersProvider({
        provider: wallet?.provider,
        useConnectWallet,
        setChain: onboard.setChain,
      });
    }, [wallet]);

    return ethersProvider;
  }
);

export const EthersProvider = ({ children }) => {
  const ethersProviderContext = useEthersProviderContext();

  return (
    <EthersProviderContext.Provider value={ethersProviderContext}>
      {children}
    </EthersProviderContext.Provider>
  );
};
