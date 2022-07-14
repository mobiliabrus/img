import through from "through2";
import base64img from "base64-img";

export default function (opts) {
  opts = opts || {};

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isBuffer()) {
      const extname = "webp";
      file.contents = new Buffer(
        "data:image/" + extname + ";base64," + file.contents.toString("base64")
      );
      this.push(file);
      cb();
      return;
    }

    if (file.isStream()) {
      cb();
      return;
    }

    file.contents = new Buffer(base64Img.base64Sync(file.path));
    this.push(file);
    cb();
  });
}
