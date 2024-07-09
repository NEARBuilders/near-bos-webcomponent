import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { useNear } from "near-social-vm";
import { useCallback } from "react";

function Wallet({ provides, config }) {
  const near = useNear();

  const signOut = useCallback(async () => {
    const wallet = await (await near.selector).wallet();
    wallet.signOut();
  }, [near]);

  const signIn = useCallback(async () => {
    const modal = setupModal(await near.selector, config);
    modal.show();
  }, [near]);

  return provides({ signIn, signOut });
}

Wallet.defaultProps = {
  provides: {
    signIn: () => console.log("signIn"),
    signOut: () => console.log("signOut"),
  },
  config: {
    contractId: "social.near",
  },
};

export default Wallet;
