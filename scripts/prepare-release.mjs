import { exec as execCallback } from "child_process";
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
  .option("-k, --key <key>", "Signer key")
  .option(
    "-n, --network <network>",
    "Network to use (mainnet or testnet)",
    "mainnet"
  )
  .option('-p, --post', 'Post the release to socialdb', false)
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
  const data = {
    tagName: "near-social-viewer",
    source: `https://ipfs.web4.near.page/ipfs/${cid}`
  }
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
        NODE_ENV: options.network,
        NEAR_SIGNER_KEY: options.key,
        NEAR_SIGNER_ACCOUNT: options.account,
      })
    );

    await runWithSpinner("Updating package.json", () => updatePackageJson(cid));

    if (options.post) {
      await runWithSpinner("Posting release", () => postRelease(cid));
      console.log("Release posted successfully!");
    } else {
      console.log("Release preparation complete. Use --post flag to post the release.");
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
