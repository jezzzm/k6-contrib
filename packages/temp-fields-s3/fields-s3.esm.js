import _objectWithoutProperties from '@babel/runtime/helpers/esm/objectWithoutProperties';
import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import { graphql } from '@keystone-6/core';
import { fieldType } from '@keystone-6/core/types';
import path from 'path';
import slugify from '@sindresorhus/slugify';
import AWS from 'aws-sdk';
import cuid from 'cuid';
import filenamify from 'filenamify';
import imageSize from 'image-size';
import fromBuffer from 'image-type';
import urlJoin from 'url-join';
import { p as parseImageRef, a as parseFileRef, S as SUPPORTED_IMAGE_EXTENSIONS, g as getImageRef, i as isValidImageExtension, b as getFileRef } from './utils-0f7b4926.esm.js';

const _excluded$2 = ["type"];

const defaultTransformer = str => slugify(str);

const generateSafeFilename = function (filename) {
  let transformFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultTransformer;
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphabetical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z0-9]+)?$/);
  const id = cuid();
  const urlSafeName = filenamify(transformFilename(name), {
    maxLength: 100 - id.length,
    replacement: '-'
  });

  if (ext) {
    return `${urlSafeName}-${id}${ext}`;
  }

  return `${urlSafeName}-${id}`;
};

const getFilename = fileData => fileData.type === 'file' ? fileData.filename : `${fileData.id}.${fileData.extension}`;

const defaultGetUrl = (_ref, fileData) => {
  let {
    bucket,
    folder
  } = _ref;
  const filename = getFilename(fileData);
  return urlJoin(`https://${bucket}.s3.amazonaws.com`, folder || '', filename);
};

async function getUrl(config, fileData) {
  var _config$getUrl;

  if (config.baseUrl) {
    return urlJoin(config.baseUrl, getFilename(fileData));
  }

  return ((_config$getUrl = config.getUrl) === null || _config$getUrl === void 0 ? void 0 : _config$getUrl.call(config, config, fileData)) || defaultGetUrl(config, fileData);
}

const getImageMetadataFromStream = async stream => {
  const chunks = [];

  for await (let chunk of stream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const filesize = buffer.length;
  const fileType = fromBuffer(buffer);

  if (!fileType) {
    throw new Error('File type not found');
  }

  if (fileType.ext !== 'jpg' && fileType.ext !== 'png' && fileType.ext !== 'webp' && fileType.ext !== 'gif') {
    throw new Error(`${fileType.ext} is not a supported image type`);
  }

  const extension = fileType.ext;
  const {
    height,
    width
  } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }

  return {
    width,
    height,
    filesize,
    extension
  };
};

const getDataFromStream = async (config, type, upload) => {
  const {
    createReadStream,
    filename: originalFilename,
    mimetype
  } = upload;
  const filename = generateSafeFilename(originalFilename, config.transformFilename);
  const s3 = new AWS.S3(config.s3Options);
  let stream = createReadStream();
  let filesize = 0;
  let metadata = {};

  if (type === 'image') {
    metadata = await getImageMetadataFromStream(stream); // recreate stream so that we can send it to s3

    stream = createReadStream();
  }

  const id = cuid();

  const fileData = _objectSpread({
    type,
    id,
    filename
  }, metadata);

  try {
    var _config$uploadParams;

    const uploadParams = ((_config$uploadParams = config.uploadParams) === null || _config$uploadParams === void 0 ? void 0 : _config$uploadParams.call(config, fileData)) || {};
    const result = await s3.upload(_objectSpread({
      Body: createReadStream(),
      ContentType: mimetype,
      Bucket: config.bucket,
      Key: `${config.folder}/${getFilename(fileData)}`,
      Metadata: _objectSpread({
        'x-amz-meta-original-filename': originalFilename
      }, type === 'image' ? {
        'x-amz-meta-image-height': `${metadata.height}`,
        'x-amz-meta-image-width': `${metadata.width}`
      } : {})
    }, uploadParams)).promise();

    if (type === 'file') {
      const head = await s3.headObject({
        Bucket: config.bucket,
        Key: result.Key
      }).promise();
      filesize = head.ContentLength || 0;
      return {
        filename,
        filesize
      };
    }

    return _objectSpread({
      id
    }, metadata);
  } catch (error) {
    stream.destroy();
    throw error;
  }
};

const parseRef = (type, ref) => {
  if (type === 'image') return parseImageRef(ref);
  return parseFileRef(ref);
};

const getDataFromRef = async (config, type, ref) => {
  const fileRef = parseRef(type, ref);

  if (!fileRef) {
    throw new Error('Invalid image reference');
  }

  const fileData = _objectSpread({
    type
  }, fileRef.type === 'file' ? {
    filename: fileRef.filename
  } : {
    id: fileRef.id,
    extension: fileRef.extension
  });

  const s3 = new AWS.S3(config.s3Options);

  try {
    var _result$Metadata, _result$Metadata2;

    const result = await s3.headObject({
      Bucket: config.bucket,
      Key: urlJoin(config.folder || '', getFilename(fileData))
    }).promise();

    const {
      type
    } = fileRef,
          refData = _objectWithoutProperties(fileRef, _excluded$2);

    return _objectSpread(_objectSpread(_objectSpread({}, refData), type === 'image' ? {
      height: Number(((_result$Metadata = result.Metadata) === null || _result$Metadata === void 0 ? void 0 : _result$Metadata['x-amz-meta-image-height']) || 0),
      width: Number(((_result$Metadata2 = result.Metadata) === null || _result$Metadata2 === void 0 ? void 0 : _result$Metadata2['x-amz-meta-image-width']) || 0)
    } : {}), {}, {
      filesize: result.ContentLength || 0
    });
  } catch (error) {
    throw error;
  }
};

const _excluded$1 = ["s3Config"];
const views$1 = path.join(path.dirname(__dirname), 'views/image');
const ImageExtensionEnum = graphql.enum({
  name: 'S3ImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS)
});
const S3FieldInput = graphql.inputObject({
  name: 'S3ImageFieldInput',
  fields: {
    upload: graphql.arg({
      type: graphql.Upload
    }),
    ref: graphql.arg({
      type: graphql.String
    })
  }
});

function createInputResolver$1(config) {
  return async function inputResolver(data, context) {
    if (data === null || data === undefined) {
      return {
        extension: data,
        filesize: data,
        height: data,
        id: data,
        width: data
      };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
      }

      return getDataFromRef(config, 'image', data.ref);
    }

    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }

    return getDataFromStream(config, 'image', await data.upload);
  };
}

const _fieldConfigs$1 = {};
const imageOutputFields = graphql.fields()({
  id: graphql.field({
    type: graphql.nonNull(graphql.ID)
  }),
  filesize: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  width: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  height: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  extension: graphql.field({
    type: graphql.nonNull(ImageExtensionEnum)
  }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),

    resolve(data) {
      return getImageRef(data.id, data.extension);
    }

  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),

    async resolve(data, args, context, info) {
      const {
        key,
        typename
      } = info.path.prev;
      const config = _fieldConfigs$1[`${typename}-${key}`];
      return getUrl(config, _objectSpread({
        type: 'image'
      }, data));
    }

  })
});
const S3ImageFieldOutput = graphql.interface()({
  name: 'S3ImageFieldOutput',
  fields: imageOutputFields,
  resolveType: () => 'S3ImageFieldOutputType'
});
const S3ImageFieldOutputType = graphql.object()({
  name: 'S3ImageFieldOutputType',
  interfaces: [S3ImageFieldOutput],
  fields: imageOutputFields
});
const s3Image = _ref => {
  let {
    s3Config
  } = _ref,
      config = _objectWithoutProperties(_ref, _excluded$1);

  return meta => {
    if (config.isUnique) {
      throw Error('isUnique is not a supported option for field type image');
    }

    if (typeof s3Config === 'undefined') {
      throw new Error(`Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`);
    }

    _fieldConfigs$1[`${meta.listKey}-${meta.fieldKey}`] = s3Config;
    return fieldType({
      kind: 'multi',
      fields: {
        filesize: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        extension: {
          kind: 'scalar',
          scalar: 'String',
          mode: 'optional'
        },
        width: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        height: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        id: {
          kind: 'scalar',
          scalar: 'String',
          mode: 'optional'
        }
      }
    })(_objectSpread(_objectSpread({}, config), {}, {
      input: {
        create: {
          arg: graphql.arg({
            type: S3FieldInput
          }),
          resolve: createInputResolver$1(s3Config)
        },
        update: {
          arg: graphql.arg({
            type: S3FieldInput
          }),
          resolve: createInputResolver$1(s3Config)
        }
      },
      output: graphql.field({
        type: S3ImageFieldOutput,

        resolve(_ref2) {
          let {
            value: {
              extension,
              filesize,
              height,
              width,
              id
            }
          } = _ref2;

          if (extension === null || !isValidImageExtension(extension) || filesize === null || height === null || width === null || id === null) {
            return null;
          }

          return {
            extension,
            filesize,
            height,
            width,
            id
          };
        }

      }),
      unreferencedConcreteInterfaceImplementations: [S3ImageFieldOutputType],
      views: views$1
    }));
  };
};

const _excluded = ["s3Config"];
const views = path.join(path.dirname(__dirname), 'views/file');
const _fieldConfigs = {};
const S3FileFieldInput = graphql.inputObject({
  name: 'S3FileFieldInput',
  fields: {
    upload: graphql.arg({
      type: graphql.Upload
    }),
    ref: graphql.arg({
      type: graphql.String
    })
  }
});
const fileOutputFields = graphql.fields()({
  filename: graphql.field({
    type: graphql.nonNull(graphql.String)
  }),
  filesize: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),

    resolve(data) {
      return getFileRef(data.filename);
    }

  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),

    async resolve(data, args, context, info) {
      const {
        key,
        typename
      } = info.path.prev;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, _objectSpread({
        type: 'file'
      }, data));
    }

  })
});
const S3FileFieldOutput = graphql.interface()({
  name: 'S3FileFieldOutput',
  fields: fileOutputFields,
  resolveType: () => 'S3FileFieldOutputType'
});
const S3FileFieldOutputType = graphql.object()({
  name: 'S3FileFieldOutputType',
  interfaces: [S3FileFieldOutput],
  fields: fileOutputFields
});

function createInputResolver(config) {
  return async function inputResolver(data, context) {
    if (data === null || data === undefined) {
      return {
        filename: data,
        filesize: data
      };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to S3FileFieldInput');
      }

      return getDataFromRef(config, 'file', data.ref);
    }

    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to FileFieldInput');
    }

    return getDataFromStream(config, 'file', await data.upload);
  };
}

const s3File = _ref => {
  let {
    s3Config
  } = _ref,
      config = _objectWithoutProperties(_ref, _excluded);

  return meta => {
    if (config.isUnique) {
      throw Error('isUnique is not a supported option for field type file');
    }

    if (typeof s3Config === 'undefined') {
      throw new Error(`Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`);
    }

    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = s3Config;
    return fieldType({
      kind: 'multi',
      fields: {
        filename: {
          kind: 'scalar',
          scalar: 'String',
          mode: 'optional'
        },
        filesize: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        }
      }
    })(_objectSpread(_objectSpread({}, config), {}, {
      input: {
        create: {
          arg: graphql.arg({
            type: S3FileFieldInput
          }),
          resolve: createInputResolver(s3Config)
        },
        update: {
          arg: graphql.arg({
            type: S3FileFieldInput
          }),
          resolve: createInputResolver(s3Config)
        }
      },
      output: graphql.field({
        type: S3FileFieldOutput,

        resolve(_ref2) {
          let {
            value: {
              filename,
              filesize
            }
          } = _ref2;

          if (filename === null || filesize === null) {
            return null;
          }

          return {
            filename,
            filesize
          };
        }

      }),
      unreferencedConcreteInterfaceImplementations: [S3FileFieldOutputType],
      views
    }));
  };
};

export { s3File, s3Image };
