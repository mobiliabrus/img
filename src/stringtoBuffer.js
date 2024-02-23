import through from 'through2';

function gulpStringToBuffer() {
  const stream = through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      const data = file.contents.toString();
      const base64 = 'data:text/plain;base64,' + data;
      const buffer = Buffer.from(base64, 'base64');
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

export default gulpStringToBuffer;
