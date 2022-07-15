import gulp from "gulp";
import webp from "gulp-webp";
import rename from "gulp-rename";
import resizer from "gulp-images-resizer";
import gifResizer from "./gifresizer.js";
import crypto from "./crypto.js";
import base64 from "./base64.js";
import base64tobinary from "./base64tobinary.js";
import rimraf from "rimraf";

const width = 768;
const webpOption = { metadata: "all", quality: 100, preset: "photo" };
const renameOption = { suffix: ".min" };

const paths = {
  privacy: {
    src: ["src/privacy/*.jpg", "src/privacy/*.jpeg", "src/privacy/*.png"],
    dest: "docs/privacy/",
  },
  privacy_revert: {
    src: ["docs/privacy/*.jpg", "docs/privacy/*.jpeg", "docs/privacy/*.png"],
    dest: "src/privacy/",
  },
  public: {
    src: ["src/public/*.jpg", "src/public/*.jpeg", "src/public/*.png"],
    dest: "docs/public/",
  },
  animation: {
    src: ["src/animation/*.gif"],
    dest: "docs/animation/",
  },
};

function clean(done) {
  rimraf.sync(paths.privacy.dest);
  rimraf.sync(paths.public.dest);
  rimraf.sync(paths.animation.dest);
  done();
}

function toWebp(src, dest) {
  return function toWebp() {
    return gulp.src(src).pipe(webp(webpOption)).pipe(gulp.dest(dest));
  };
}

function toWebpMin(src, dest) {
  return function toWebpMin() {
    return gulp
      .src(src)
      .pipe(resizer({ width }))
      .pipe(webp(webpOption))
      .pipe(rename(renameOption))
      .pipe(gulp.dest(dest));
  };
}

function toEncrypt(src, dest) {
  return function toEncrypt() {
    return gulp.src(src).pipe(base64()).pipe(crypto()).pipe(gulp.dest(dest));
  };
}

function toEncryptMin(src, dest) {
  return function toEncryptMin() {
    return gulp
      .src(src)
      .pipe(resizer({ width }))
      .pipe(webp(webpOption))
      .pipe(base64())
      .pipe(crypto())
      .pipe(rename(renameOption))
      .pipe(gulp.dest(dest));
  };
}

function toDecrypt(src, dest) {
  return function toDecrypt() {
    return gulp
      .src(src)
      .pipe(crypto({ action: "decrypt" }))
      .pipe(base64tobinary())
      .pipe(gulp.dest(dest));
  };
}

function toAnimationMin(src, dest) {
  return function toAnimationMin() {
    return gulp
      .src(src)
      .pipe(gifResizer({ width }))
      .pipe(webp(webpOption))
      .pipe(rename(renameOption))
      .pipe(gulp.dest(dest));
  };
}

const build = gulp.series(
  clean,
  gulp.parallel(
    toWebp(paths.public.src, paths.public.dest),
    toWebpMin(paths.public.src, paths.public.dest),
    toWebp(paths.animation.src, paths.animation.dest),
    toAnimationMin(paths.animation.src, paths.animation.dest),
    toEncrypt(paths.privacy.src, paths.privacy.dest),
    toEncryptMin(paths.privacy.src, paths.privacy.dest)
  )
);

const revert = gulp.series(
  toDecrypt(paths.privacy_revert.src, paths.privacy_revert.dest)
);

export { build, revert };
export default build;
