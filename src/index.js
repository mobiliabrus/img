import CryptoJS from "crypto-js";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import password from "./password.js";
import fs from "fs";
import path from "path";

if (typeof password !== "string") {
  process.stderr("Password not found.");
  process.exit(1);
}

const privacyDir = "privacy";
const publicDir = "public";
const privacySourcePath = path.resolve(`src/${privacyDir}/`);
const privacyBackupPath = path.resolve(`src/${privacyDir}-bak/`);
const targetDirPath = path.resolve(`docs/${privacyDir}/`);

console.log("starting...");

// convert public
(async () => {
  console.log("start public...");
  await imagemin([`src/${publicDir}/*.{jpg,jpeg,png}`], {
    destination: `docs/${publicDir}`,
    plugins: [imageminWebp({ metadata: "all" })],
  });
  console.log("public converted.");
})();

// backup privacy
console.log("start backup privacy...");
fs.readdirSync(privacySourcePath).forEach(function (filename) {
  const filePath = path.join(privacySourcePath, filename);
  const backupPath = path.join(privacyBackupPath, `${filename}.json`);
  const filePathStat = fs.statSync(filePath);
  if (filePathStat.isFile() && !filename.startsWith(".")) {
    const binary = fs.readFileSync(filePath, "binary");
    const buffer = Buffer.from(binary, "binary");
    const base64 = buffer.toString("base64");
    const encodedBase64 = CryptoJS.AES.encrypt(base64, password).toString();
    fs.writeFileSync(backupPath, JSON.stringify(encodedBase64), "utf-8");
  }
});

console.log("privacy backuped.");

// convert privacy
(async () => {
  console.log("start privacy...");
  await imagemin([`src/${privacyDir}/*.{jpg,jpeg,png}`], {
    destination: `src/${privacyDir}-tmp`,
    plugins: [imageminWebp({ metadata: "all" })],
  });
})();

console.log("privacy converted.");

// encode privacy
const tmpPath = path.resolve(`src/${privacyDir}-tmp`);
fs.readdirSync(tmpPath).forEach(function (filename) {
  const filePath = path.join(tmpPath, filename);
  const targetPath = path.join(targetDirPath, filename);
  const filePathStat = fs.statSync(filePath);
  if (filePathStat.isFile() && !filename.startsWith(".")) {
    const binary = fs.readFileSync(filePath, "binary");
    const buffer = Buffer.from(binary, "binary");
    const base64 = buffer.toString("base64");
    const encodedBase64 = CryptoJS.AES.encrypt(base64, password).toString();
    const encodedBuffer = Buffer.from(encodedBase64, "base64");
    fs.writeFileSync(targetPath, encodedBuffer, "binary");
  }
});

console.log("privacy encoded.");

// decode and revert privacy
fs.readdirSync(privacyBackupPath).forEach(function (filename) {
  const filePath = path.join(privacyBackupPath, filename);
  const targetPath = path.join(
    privacySourcePath,
    filename.replace(".json", "")
  );
  const filePathStat = fs.statSync(filePath);
  const targetPathExists = fs.existsSync(targetPath);
  if (filePathStat.isFile() && !targetPathExists && /.json$/.test(filename)) {
    const encodedBase64 = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const bytes = CryptoJS.AES.decrypt(encodedBase64, password);
    const base64 = bytes.toString(CryptoJS.enc.Utf8);
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(targetPath, buffer, "binary");
  }
});

console.log("privacy reverted.");
