import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupSender } from "@near-wallet-selector/sender";

const selector = await setupWalletSelector({
  network: "mainnet",
  modules: [setupMyNearWallet(), setupHereWallet(), setupMeteorWallet(), setupSender()],
});

const modal = setupModal(selector, {
  contractId: "social.near",
});

document.getElementById('open-walletselector-button').addEventListener('click', () => modal.show());

const viewer = document.querySelector('near-social-viewer');
viewer.selector = selector;