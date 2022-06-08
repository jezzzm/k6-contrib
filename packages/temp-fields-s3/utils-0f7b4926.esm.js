const IMAGEREGEX = /^s3:image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
const FILEREGEX = /^s3:file:([^\\\/:\n]+)/;
const getFileRef = name => `s3:file:${name}`;
const parseFileRef = ref => {
  const match = ref.match(FILEREGEX);

  if (match) {
    const [, filename] = match;
    return {
      type: 'file',
      filename: filename
    };
  }

  return undefined;
};
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];
const getImageRef = (id, extension) => `s3:image:${id}.${extension}`;
const parseImageRef = ref => {
  const match = ref.match(IMAGEREGEX);

  if (match) {
    const [, id, ext] = match;
    return {
      type: 'image',
      id,
      extension: ext
    };
  }

  return undefined;
};
const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);
const isValidImageExtension = extension => {
  return extensionsSet.has(extension);
};

export { SUPPORTED_IMAGE_EXTENSIONS as S, parseFileRef as a, getFileRef as b, getImageRef as g, isValidImageExtension as i, parseImageRef as p };
