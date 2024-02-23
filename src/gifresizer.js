import through from "through2";
import gifResize from "gif-resizer";

export default function (opts) {
  opts = opts || {};

  return through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      gifResize(file.contents, opts).then((f) => {
        file.contents = Buffer.from(f);
        this.push(file);
        cb();
      });
      return;
    }

    cb();
  });
}
