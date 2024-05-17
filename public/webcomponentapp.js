import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupSender } from "@near-wallet-selector/sender";

// Function to initialize wallet selector and modal
async function initializeWalletSelector(network) {
  const contractId = network === "mainnet" ? "social.near" : "v1.social08.testnet";

  const selector = await setupWalletSelector({
    network: network,
    modules: [setupMyNearWallet(), setupHereWallet(), setupMeteorWallet(), setupSender()],
  });

  const modal = setupModal(selector, {
    contractId: contractId,
  });

  document.getElementById('open-walletselector-button').addEventListener('click', () => modal.show());

  viewer.selector = selector;
}

const viewer = document.querySelector('near-social-viewer');
let network = viewer.getAttribute('network') || "mainnet";

initializeWalletSelector(network);

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'network') {
      console.log('network attribute changed');
      network = mutation.target.getAttribute('network') || "mainnet";
      initializeWalletSelector(network);
    }
  }
});

// Observe changes to the 'network' attribute of the 'near-social-viewer' element
observer.observe(viewer, { attributes: true });