import through from 'through2';
import CryptoJS from 'crypto-js';
import password from '../../../../password.js';

const keylength = 16;
const defaultConfig = {
  key: password,
  action: 'encrypt',
};

function gulpCryptoJS(config) {
  const { key, action } = { ...defaultConfig, ...config };

  const stream = through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      const keyorigin = key.split('');
      const key16 =
        keyorigin.length < 16
          ? [
              ...keyorigin,
              ...Array.from(new Array(keylength - keyorigin.length)).map(() => '0'),
            ].join('')
          : key16;
      const keyutf = CryptoJS.enc.Utf8.parse(key16);
      const iv = { iv: CryptoJS.enc.Base64.parse(key16) };

      const content = file.contents.toString();

      if (action === 'decrypt') {
        const raw = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Base64.parse(content) },
          keyutf,
          iv
        );
        const result = CryptoJS.enc.Utf8.stringify(raw);
        file.contents = new Buffer(result);
      } else {
        const result = CryptoJS.AES.encrypt(content, keyutf, iv).toString();
        file.contents = new Buffer(result);
      }
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
