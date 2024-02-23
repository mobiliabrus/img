const CryptoJS = require("crypto-js");

const key = "55a51621a6648525";
const content = "Hello, World!";
const keyutf = CryptoJS.enc.Utf8.parse(key);
const iv = CryptoJS.enc.Base64.parse(key);

test("aes", () => {
  const a = CryptoJS.AES.encrypt(content, keyutf, { iv: iv }).toString();
  const b = CryptoJS.AES.encrypt(content, keyutf, { iv: iv }).toString();

  const _c = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(a) },
    keyutf,
    {
      iv: iv,
    }
  );
  const c = CryptoJS.enc.Utf8.stringify(_c);

  expect(a).toBe(b);
  expect(c).toBe(content);
});
