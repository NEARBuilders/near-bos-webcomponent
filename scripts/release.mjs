import { exec as execCallback } from "child_process";
import fs from "fs/promises";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentChildProcess = null;

async function exec(command) {
  return new Promise((resolve, reject) => {
    currentChildProcess = execCallback(command, (error, stdout, stderr) => {
      currentChildProcess = null;
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(stderr);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function updatePackageJson(cid) {
  const packageJsonPath = path.join(__dirname, "package.json");
  let packageJson;
  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf8");
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    console.error("Error reading package.json:", error);
    throw error;
  }

  packageJson.nearfs = packageJson.nearfs || {};
  packageJson.nearfs.cid = cid;

  try {
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error("Error writing package.json:", error);
    throw error;
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
  console.log("Starting release process...");

  await runWithSpinner("Building production version", () => exec("yarn prod"));

  await runWithSpinner("Creating CAR file", () =>
    exec("yarn nearfs:publish-library:create:car")
  );

  const uploadOutput = await runWithSpinner("Uploading CAR file", () =>
    exec("yarn nearfs:publish-library:upload:car")
  );
  const cid = uploadOutput.match(/CID: (.+)/)?.[1];

  if (!cid) {
    console.error("Failed to extract CID from upload output");
    process.exit(1);
  }

  console.log(`Extracted CID: ${cid}`);

  await runWithSpinner("Updating package.json", () => updatePackageJson(cid));

  await runWithSpinner("Publishing to npm", () => exec("npm publish"));

  console.log("Release process completed successfully!");
}

// Handle interrupts
process.on("SIGINT", () => {
  console.log("\nInterrupt received, cleaning up...");
  if (currentChildProcess) {
    currentChildProcess.kill("SIGINT");
  }
  process.exit(1);
});

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
