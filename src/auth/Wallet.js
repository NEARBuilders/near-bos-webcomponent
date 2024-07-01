import { useNear } from "near-social-vm";
import { useCallback } from "react";

function Wallet({ provides }) {
  const near = useNear();
  const logOut = useCallback(async () => {
    const wallet = await (await near.selector).wallet();
    wallet.signOut();
  }, [near]);

  return provides({ logOut });
}

export default Wallet;
