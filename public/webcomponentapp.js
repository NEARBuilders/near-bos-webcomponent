import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";

const selector = await setupWalletSelector({
  network: "mainnet",
  modules: [
    setupMyNearWallet(),
    setupHereWallet(),
    setupMeteorWallet(),
    setupSender(),
    setupMathWallet(),
    setupNightly(),
    setupNarwallets(),
    setupWelldoneWallet(),
    setupCoin98Wallet(),
    setupXDEFI(),
    setupBitgetWallet(),
    setupNearFi(),
    setupMintbaseWallet()
  ],
});

const modal = setupModal(selector, {
  contractId: "social.near",
});

document
  .getElementById("open-walletselector-button")
  .addEventListener("click", () => modal.show());

const viewer = document.querySelector("near-social-viewer");
viewer.selector = selector;
