import through from "through2";
import base64img from "base64-img";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";

const tmp_path = path.resolve("./node_modules/.gulpBase64ToBinary");

function gulpBase64ToBinary() {
  const stream = through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      rimraf.sync(tmp_path);
      base64img.imgSync(file.contents.toString(), tmp_path, "tmp");
      const [filename] = fs.readdirSync(tmp_path);
      const content = fs.readFileSync(path.join(tmp_path, filename));
      file.contents = content;
    }

    if (file.isStream()) {
      return cb();
    }

    this.push(file);
    cb();
  });

  return stream;
}

export default gulpBase64ToBinary;
