import through from 'through2';

function gulpBase64ToBuffer() {
  const stream = through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      const base64 = file.contents.toString();
      const data = base64.split(',')[1];
      const buffer = Buffer.from(data, 'base64');
      file.contents = buffer;
    }

    if (file.isStream()) {
      return cb();
    }

    this.push(file);
    cb();
  });

  return stream;
}

export default gulpBase64ToBuffer;
