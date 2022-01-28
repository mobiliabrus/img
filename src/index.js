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

const assertDir = "assert";
const publicDir = "public";
const assertSourcePath = path.resolve(`src/${assertDir}/`);
const assertBackupPath = path.resolve(`src/${assertDir}-bak/`);
const targetDirPath = path.resolve(`docs/${assertDir}/`);

// convert public
(async () => {
  await imagemin([`src/${publicDir}/*.{jpg,jpeg,png}`], {
    destination: `docs/${publicDir}`,
    plugins: [imageminWebp({ metadata: "all" })],
  });
})();

console.log("public converted.");

// backup assert
fs.readdirSync(assertSourcePath).forEach(function (filename) {
  const filePath = path.join(assertSourcePath, filename);
  const backupPath = path.join(assertBackupPath, `${filename}.json`);
  const filePathStat = fs.statSync(filePath);
  if (filePathStat.isFile() && !filename.startsWith(".")) {
    const binary = fs.readFileSync(filePath, "binary");
    const buffer = Buffer.from(binary, "binary");
    const base64 = buffer.toString("base64");
    const encodedBase64 = CryptoJS.AES.encrypt(base64, password).toString();
    fs.writeFileSync(backupPath, JSON.stringify(encodedBase64), "utf-8");
  }
});

console.log("assert backuped.");

// convert assert
(async () => {
  await imagemin([`src/${assertDir}/*.{jpg,jpeg,png}`], {
    destination: `src/${assertDir}-tmp`,
    plugins: [imageminWebp({ metadata: "all" })],
  });
})();

console.log("assert converted.");

// encode assert
const tmpPath = path.resolve(`src/${assertDir}-tmp`);
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

console.log("assert encoded.");

// decode and revert assert
fs.readdirSync(assertBackupPath).forEach(function (filename) {
  const filePath = path.join(assertBackupPath, filename);
  const targetPath = path.join(assertSourcePath, filename.replace(".json", ""));
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

console.log("assert reverted.");
