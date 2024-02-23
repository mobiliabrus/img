import through from 'through2';

function getBase64Data(mime = 'text/plain') {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isBuffer()) {
      const data = file.contents.toString('base64').split(mime + 'base64')[1];
      const buffer = new Buffer(data);
      file.contents = buffer;
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

export default getBase64Data;
