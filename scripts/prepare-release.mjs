import { exec as execCallback, spawn } from "child_process";
import { Command } from "commander";
import fs from "fs/promises";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let currentChildProcess = null;

const program = new Command();

program
  .name("release")
  .description("Prepare a release for near-bos-webcomponent")
  .option("-a, --account <account>", "NEAR account to sign for the release")
  .option(
    "--signer-public-key <signerPublicKey>",
    "Public key for signing transactions in the format: ed25519:<public_key>"
  )
  .option(
    "--signer-private-key <signerPrivateKey>",
    "Private key for signing transactions in the format: ed25519:<private_key>"
  )
  .option(
    "-n, --network <network>",
    "Network to use (mainnet or testnet)",
    "mainnet"
  )
  .option("-p, --post", "Post the release to socialdb", false)
  .parse(process.argv);

const options = program.opts();

function validateArgs() {
  if (!options.account) {
    throw new Error(
      "Missing argument: signer account. Use -a or --account to specify."
    );
  }
  if (!options.key) {
    console.warn(
      "Missing argument: signer key. Will attempt to sign from keychain..."
    );
  }
  if (options.network !== "mainnet" && options.network !== "testnet") {
    throw new Error(`Invalid network: ${options.network}`);
  }
  console.log(`Using network: ${options.network}\n`);
}

async function exec(command, env = {}) {
  return new Promise((resolve, reject) => {
    const options = { env: { ...process.env, ...env } };
    let output = "";
    currentChildProcess = execCallback(
      command,
      options,
      (error, stdout, stderr) => {
        currentChildProcess = null;
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      }
    );
    currentChildProcess.stdout.on("data", (data) => {
      output += data.toString();
    });
    currentChildProcess.stderr.on("data", (data) => {
      output += data.toString();
    });
  });
}

async function updatePackageJson(cid) {
  const packageJsonPath = path.join(rootDir, "package.json");
  let packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  packageJson.nearfs = { ...packageJson.nearfs, cid };
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function postRelease(cid) {
  const releaseData = {
    tagName: "near-social-viewer",
    bundleUrl: `https://ipfs.web4.near.page/ipfs/${cid}`,
  };

  const SOCIAL_CONTRACT = {
    mainnet: "social.near",
    testnet: "v1.social08.testnet",
  };

  const txData = {
    data: {
      [options.account]: {
        post: {
          main: JSON.stringify({
            type: "md",
            text: `{ "tagName": "${releaseData.tagName}", "bundleUrl": "${releaseData.bundleUrl}" }`,
          }),
        },
        index: {
          post: '{"key":"main","value":{"type":"md"}}', // type is release
        },
      },
    },
  };

  // Prepare the command and arguments
  const args = [
    "near-cli-rs",
    "contract",
    "call-function",
    "as-transaction",
    SOCIAL_CONTRACT[options.network],
    "set",
    "json-args",
    JSON.stringify(txData), // need json args
    "prepaid-gas",
    "100.0 Tgas",
    "attached-deposit",
    "0 NEAR",
    "sign-as",
    options.account,
    "network-config",
    options.network,
  ];

  if (options.signerPublicKey && options.signerPrivateKey) {
    args.push(
      "sign-with-plaintext-private-key",
      "--signer-public-key",
      `${options.signerPublicKey}`,
      "--signer-private-key",
      `${options.signerPrivateKey}`,
      "send"
    );
  }

  const deployProcess = spawn("npx", args, {
    stdio: "inherit",
  });

  deployProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        `Successfully posted release to account ${options.account}`
      );
    } else {
      console.error(`Failed to post release from account ${options.account}`);
    }
  });

  deployProcess.on("error", (err) => {
    console.error(`Deployment failed with error: ${err.message}`);
  });
}

async function runWithSpinner(message, func) {
  const spinner = ora(message).start();
  try {
    const result = await func();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

async function main() {
  try {
    validateArgs();

    console.log("Preparing a release...");

    // await runWithSpinner("Building production version", () =>
    //   exec("yarn prod")
    // );
    const output = await runWithSpinner("Creating CAR file", () =>
      exec("yarn nearfs:publish-library:create:car")
    );

    const lines = output.trim().split("\n");
    const cid = lines[lines.length - 1].trim();

    if (!cid) throw new Error("Failed to extract CID from output");

    console.log(`CID: ${cid}`);

    await runWithSpinner("Uploading CAR file", () =>
      exec("yarn nearfs:publish-library:upload:car", {
        NODE_ENV: options.network,
        NEAR_SIGNER_KEY: options.signerPrivateKey,
        NEAR_SIGNER_ACCOUNT: options.account,
      })
    );

    await runWithSpinner("Updating package.json", () => updatePackageJson(cid));

    if (options.post) {
      await runWithSpinner("Posting release", () => postRelease(cid));
    } else {
      console.log(
        "Release preparation complete. Use --post flag to post the release."
      );
    }

    console.log("Release prepared successfully!");
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

async function cleanup() {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGINT");
  }
  try {
    await exec("yarn clean");
    console.log("\nCleanup completed.");
  } catch (error) {
    console.error("\nError during cleanup:", error);
  }
}

process.on("SIGINT", async () => {
  console.log("\nInterrupt received. Starting cleanup process...\n");

  await cleanup();

  process.exit(1);
});

main();
