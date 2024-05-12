import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupSender } from "@near-wallet-selector/sender";

const getNetworkPreset = (networkId) => {
  switch (networkId) {
    case "mainnet":
      return {
        networkId,
        nodeUrl: "https://rpc.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://nearblocks.io",
        indexerUrl: "https://api.kitwallet.app",
      };
    case "testnet":
      return {
        networkId,
        nodeUrl: "https://rpc.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io",
        indexerUrl: "https://testnet-api.kitwallet.app",
      };
    default:
      throw Error(`Failed to find config for: '${networkId}'`);
  }
};

const viewer = document.querySelector("near-social-viewer");

const rpc = viewer.getAttribute("rpc");
const networkConfig = getNetworkPreset("mainnet");

if (rpc) {
  networkConfig.nodeUrl = rpc;
}

const selector = await setupWalletSelector({
  network: networkConfig,
  modules: [
    setupMyNearWallet(),
    setupHereWallet(),
    setupMeteorWallet(),
    setupSender(),
  ],
});

const modal = setupModal(selector, {
  contractId: "social.near",
});
document
  .getElementById("open-walletselector-button")
  .addEventListener("click", () => modal.show());

viewer.selector = selector;
