import { exec as execCallback } from "child_process";
import fs from "fs/promises";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let currentChildProcess = null;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function parseArgs() {
  const [signerAccount, signerKey, network = "mainnet"] = process.argv.slice(2);

  if (!signerAccount) {
    throw new ValidationError("Missing argument: signer account\n" +
        "Usage: node release.js <signer account> <signer key> [network]\n\n" +
      "Please provide the NEAR account to sign for the release.");
  } 
  if (!signerKey) {
    console.warn(
      "Missing argument: signer key\n" +
        "Usage: node release.js <signer account> <signer key> [network]\n\n" +
        "Will attempt to sign from keychain..."
    );
  }

  if (network !== "mainnet" && network !== "testnet") {
    throw new ValidationError(`Invalid network: ${network}`);
  }

  console.log(`Using network: ${network}\n`);
  return { signerAccount, signerKey, network };
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
    const { signerAccount, signerKey, network } = parseArgs();

    console.log("Preparing a release...");

    await runWithSpinner("Building production version", () =>
      exec("yarn prod")
    );
    const output = await runWithSpinner("Creating CAR file", () =>
      exec("yarn nearfs:publish-library:create:car")
    );

    const lines = output.trim().split("\n");
    const cid = lines[lines.length - 1].trim();

    if (!cid) throw new Error("Failed to extract CID from output");

    console.log(`CID: ${cid}`);

    await runWithSpinner("Uploading CAR file", () =>
      exec("yarn nearfs:publish-library:upload:car", {
        NODE_ENV: network,
        NEAR_SIGNER_KEY: signerKey,
        NEAR_SIGNER_ACCOUNT: signerAccount,
      })
    );

    await runWithSpinner("Updating package.json", () => updatePackageJson(cid));

    console.log("Release prepared successfully!");
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
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
