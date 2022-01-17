import Cryptor from "cryptorjs";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import password from "./password.js";
import fs from "fs";
import path from "path";
import { getImgType } from "./util.js";

if (typeof password !== "string") {
  process.stderr("Password not found.");
  process.exit(1);
}

const assertDir = "assert";
const assertSourcePath = path.resolve(`src/${assertDir}/`);
const targetDirPath = path.resolve(`docs/${assertDir}/`);

// encode assert
fs.readdirSync(assertSourcePath).forEach(function (filename) {
  const filePath = path.join(assertSourcePath, filename);
  const targetPath = path.join(targetDirPath, `${filename}.json`);
  const filePathStat = fs.statSync(filePath);
  const fileType = getImgType(filename);
  if (filePathStat.isFile() && fileType) {
    const binary = fs.readFileSync(filePath, "binary");
    const buffer = Buffer.from(binary, "binary");
    const base64 = buffer.toString("base64");
    const url = `data:image/${fileType};base64,${base64}`;
    const code = new Cryptor(password).encode(url);
    fs.writeFileSync(targetPath, JSON.stringify(code), "utf-8");
  }
});

// // convert public
(async () => {
  await imagemin(["src/public/*.{jpg,jpeg,png}"], {
    destination: "docs/public",
    plugins: [imageminWebp({ metadata: "all" })],
  });
})();


// decode assert
fs.readdirSync(targetDirPath).forEach(function (filename) {
  const filePath = path.join(targetDirPath, filename);
  const targetPath = path.join(assertSourcePath, filename.replace(".json", ""));
  const filePathStat = fs.statSync(filePath);
  const targetPathExists = fs.existsSync(targetPath);
  if (filePathStat.isFile() && !targetPathExists && /.json$/.test(filename)) {
    const code = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const url = new Cryptor(password).decode(code);
    const base64 = url.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(targetPath, buffer, "binary");
  }
});
