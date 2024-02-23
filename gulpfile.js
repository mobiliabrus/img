import gulp from 'gulp';
import webp from 'gulp-webp';
import rename from 'gulp-rename';
import changed from 'gulp-changed';
import gifResizer from './src/gifresizer.js';
import crypto from './src/crypto.js';
import base64 from './src/base64.js';
import getBase64Data from './src/getBase64Data.js';
import base64toBuffer from './src/base64toBuffer.js';
import stringtoBuffer from './src/stringtoBuffer.js';
import hasChanged from './src/hasChanged.js';

const width = 640;
const webpOptions = { metadata: 'all' };
const resizeOptions = { resize: { width, height: 0 } };
const renameOptions = { suffix: '.min' };

const paths = {
  privacy: {
    src: ['src/privacy/*.jpg', 'src/privacy/*.jpeg', 'src/privacy/*.png'],
    dest: 'docs/assets/privacy/',
  },
  privacy_revert: {
    src: ['docs/assets/privacy/*.jpg', 'docs/assets/privacy/*.jpeg', 'docs/assets/privacy/*.png'],
    dest: 'src/privacy/',
  },
  public: {
    src: ['src/public/*.jpg', 'src/public/*.jpeg', 'src/public/*.png'],
    dest: 'docs/assets/public/',
  },
  animation: {
    src: ['src/animation/*.gif'],
    dest: 'docs/assets/animation/',
  },
  privacy_animation: {
    src: ['src/privacy/*.gif'],
    dest: 'docs/assets/privacy/',
  },
  privacy_animation_revert: {
    src: ['docs/assets/privacy/*.gif'],
    dest: 'src/privacy/',
  },
};

// public

function toWebp(src, dest) {
  return function toWebp() {
    return gulp
      .src(src)
      .pipe(changed(dest, { extension: '.webp', hasChanged }))
      .pipe(webp(webpOptions))
      .pipe(gulp.dest(dest));
  };
}

function toWebpMin(src, dest) {
  return function toWebpMin() {
    return gulp
      .src(src)
      .pipe(changed(dest, { extension: '.min.webp', hasChanged }))
      .pipe(webp({ ...webpOptions, ...resizeOptions }))
      .pipe(rename(renameOptions))
      .pipe(gulp.dest(dest));
  };
}

function toAnimation(src, dest) {
  return function toAnimation() {
    return gulp.src(src).pipe(changed(dest, { hasChanged })).pipe(gulp.dest(dest));
  };
}

function toAnimationMin(src, dest) {
  return function toAnimationMin() {
    return gulp
      .src(src)
      .pipe(changed(dest, { extension: '.min.gif', hasChanged }))
      .pipe(gifResizer({ width }))
      .pipe(rename(renameOptions))
      .pipe(gulp.dest(dest));
  };
}

// privacy

function toEncrypt(src, dest) {
  return function toEncrypt() {
    return gulp
      .src(src)
      .pipe(changed(dest, { hasChanged }))
      .pipe(base64('image/webp'))
      .pipe(crypto())
      .pipe(stringtoBuffer())
      .pipe(gulp.dest(dest));
  };
}

function toEncryptMin(src, dest) {
  return function toEncryptMin() {
    return gulp
      .src(src)
      .pipe(changed(dest, { extension: '.min.webp', hasChanged }))
      .pipe(webp({ ...webpOptions, ...resizeOptions }))
      .pipe(base64('image/webp'))
      .pipe(crypto())
      .pipe(stringtoBuffer())
      .pipe(rename(renameOptions))
      .pipe(gulp.dest(dest));
  };
}

function toEncryptAnimation(src, dest) {
  return function toEncryptAnimation() {
    return gulp
      .src(src)
      .pipe(changed(dest, { hasChanged }))
      .pipe(base64('image/gif'))
      .pipe(crypto())
      .pipe(stringtoBuffer())
      .pipe(rename({}))
      .pipe(gulp.dest(dest));
  };
}

function toEncryptAnimationMin(src, dest) {
  return function toEncryptAnimationMin() {
    return gulp
      .src(src)
      .pipe(changed(dest, { extension: '.min.g1f', hasChanged }))
      .pipe(gifResizer({ width }))
      .pipe(base64('image/gif'))
      .pipe(crypto())
      .pipe(stringtoBuffer())
      .pipe(rename({ ...renameOptions, extname: '.g1f' }))
      .pipe(gulp.dest(dest));
  };
}

// revert

function toDecrypt(src, dest) {
  return function toDecrypt() {
    return gulp
      .src(src)
      .pipe(changed(dest, { hasChanged }))
      .pipe(getBase64Data('text/plain'))
      .pipe(crypto({ action: 'decrypt' }))
      .pipe(base64toBuffer())
      .pipe(gulp.dest(dest));
  };
}

function toDecryptAnimation(src, dest) {
  return function toDecryptAnimation() {
    return gulp
      .src(src)
      .pipe(changed(dest, { hasChanged }))
      .pipe(getBase64Data('text/plain'))
      .pipe(crypto({ action: 'decrypt' }))
      .pipe(base64toBuffer())
      .pipe(rename({ extname: '.gif' }))
      .pipe(gulp.dest(dest));
  };
}

const buildPublic = gulp.series(
  toWebp(paths.public.src, paths.public.dest),
  toWebpMin(paths.public.src, paths.public.dest)
);

const buildGif = gulp.series(
  toAnimation(paths.animation.src, paths.animation.dest),
  toAnimationMin(paths.animation.src, paths.animation.dest)
);

const buildPrivacy = gulp.series(
  toEncrypt(paths.privacy.src, paths.privacy.dest),
  toEncryptMin(paths.privacy.src, paths.privacy.dest),
  toEncryptAnimation(paths.privacy_animation.src, paths.privacy.dest),
  toEncryptAnimationMin(paths.privacy_animation.src, paths.privacy.dest)
);

const build = gulp.series(buildPublic, buildGif, buildPrivacy);

const revert = gulp.series(
  toDecrypt(paths.privacy_revert.src, paths.privacy_revert.dest),
  toDecryptAnimation(paths.privacy_animation_revert.src, paths.privacy_animation_revert.dest)
);

export { buildPublic, buildGif, buildPrivacy, build, revert };
export default build;
