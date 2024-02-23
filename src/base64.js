import through from 'through2';

function base64(mime = 'image/webp') {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isBuffer()) {
      file.contents = new Buffer('data:' + mime + ';base64,' + file.contents.toString('base64'));
      this.push(file);
      cb();
      return;
    }

    if (file.isStream()) {
      cb();
      return;
    }

    cb();
  });
}

export default base64;
