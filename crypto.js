import through from "through2";
import CryptoJS from "crypto-js";
import password from "./password.js";

const defaultConfig = {
  key: password,
  algorithm: "AES",
  action: "encrypt",
  options: {
    // mode: CryptoJS.mode.ECB,
    // padding: CryptoJS.pad.Pkcs7,
  },
};

function gulpCryptoJS(config) {
  const { key, algorithm, action, options } = { ...defaultConfig, ...config };

  const stream = through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      const encryptRaw = CryptoJS[algorithm][action](
        file.contents.toString() + "",
        key,
        // options
      );
      file.contents = new Buffer(
        encryptRaw.toString(action === "decrypt" ? CryptoJS.enc.Utf8 : void 0)
      );
    }

    if (file.isStream()) {
      return cb();
    }

    this.push(file);
    cb();
  });

  return stream;
}

export default gulpCryptoJS;
