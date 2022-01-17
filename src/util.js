function getImgType(filename) {
  const matcher = filename.match(/\.(png|jpg|gif|jpeg|webp)$/);
  return matcher && matcher[1];
}

export { getImgType };
