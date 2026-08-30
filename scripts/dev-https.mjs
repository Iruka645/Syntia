import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const PORT = process.env.PORT || "3500";
const args = new Set(process.argv.slice(2));
const isLanMode = args.has("--lan");
const isDryRun = args.has("--dry-run");

function isPrivateIPv4(address) {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) return false;

  return (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

function addressPriority(name, address) {
  const virtualAdapter = /docker|vethernet|virtual|vmware|wsl|loopback/i.test(name);
  const privateRange = address.startsWith("192.168.") ? 0 : address.startsWith("10.") ? 1 : 2;
  return (virtualAdapter ? 10 : 0) + privateRange;
}

function findLanAddress() {
  const configuredHost = process.env.SYNTIA_LAN_HOST?.trim();
  if (configuredHost) return configuredHost;

  const candidates = Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
    (addresses || [])
      .filter((entry) => entry.family === "IPv4" && !entry.internal && isPrivateIPv4(entry.address))
      .map((entry) => ({ name, address: entry.address }))
  );

  candidates.sort(
    (left, right) =>
      addressPriority(left.name, left.address) - addressPriority(right.name, right.address)
  );

  return candidates[0]?.address;
}

function getMkcertRootPath() {
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, "mkcert", "rootCA.pem");
  }

  if (process.platform === "darwin") {
    return path.join(
      process.env.HOME || "",
      "Library",
      "Application Support",
      "mkcert",
      "rootCA.pem"
    );
  }

  const dataHome =
    process.env.XDG_DATA_HOME || path.join(process.env.HOME || "", ".local", "share");
  return path.join(dataHome, "mkcert", "rootCA.pem");
}

async function copyPublicCaForMobile() {
  const rootCaPath = getMkcertRootPath();
  const destination = path.resolve("certificates", "syntia-local-ca.crt");

  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (existsSync(rootCaPath)) {
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(rootCaPath, destination);
      console.log(`\nMobile CA certificate: ${destination}`);
      console.log("Install this public certificate on the phone, then trust it as a CA.");
      console.log("Never copy or share rootCA-key.pem.\n");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn("Could not locate the public mkcert root certificate for mobile installation.");
}

const host = isLanMode ? findLanAddress() : "localhost";

if (!host) {
  console.error(
    "No private LAN IPv4 address was found. Set SYNTIA_LAN_HOST to the host IP and try again."
  );
  process.exit(1);
}

const appUrl = `https://${host}:${PORT}`;
const nextBin = path.resolve("node_modules", "next", "dist", "bin", "next");
const nextArgs = [nextBin, "dev", "-p", PORT, "-H", host, "--experimental-https"];
const nodeOptions = [process.env.NODE_OPTIONS, "--use-system-ca"].filter(Boolean).join(" ");

console.log(`Syntia HTTPS URL: ${appUrl}`);
if (isLanMode) {
  console.log("Use this same URL on the host computer and mobile devices on the same network.");
  console.log("If Windows Firewall asks, allow access only on Private networks.");
}

if (isDryRun) {
  console.log(`NEXTAUTH_URL=${appUrl}`);
  console.log(`${process.execPath} ${nextArgs.join(" ")}`);
  process.exit(0);
}

const child = spawn(process.execPath, nextArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXTAUTH_URL: appUrl,
    NODE_OPTIONS: nodeOptions,
  },
  stdio: "inherit",
});

if (isLanMode) {
  void copyPublicCaForMobile();
}

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});

child.on("error", (error) => {
  console.error("Failed to start the Next.js HTTPS development server:", error);
  process.exitCode = 1;
});
