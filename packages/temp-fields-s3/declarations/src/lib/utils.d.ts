import { ImageExtension } from '@keystone-6/core/types';
import { AssetType } from './types';
export declare const getS3FileRef: (type: AssetType, nameOrId: string, extension?: ImageExtension) => string;
export declare const getFileRef: (name: string) => string;
export declare const parseFileRef: (ref: string) => {
    type: 'file';
    filename: string;
} | undefined;
export declare const SUPPORTED_IMAGE_EXTENSIONS: readonly ["jpg", "png", "webp", "gif"];
export declare const ALIAS_IMAGE_EXTENSIONS_MAP: Record<string, typeof SUPPORTED_IMAGE_EXTENSIONS[number]>;
export declare const getImageRef: (id: string, extension: ImageExtension) => string;
export declare const parseImageRef: (ref: string) => {
    type: 'image';
    id: string;
    extension: ImageExtension;
} | undefined;
export declare const isValidImageExtension: (extension: string) => extension is ImageExtension;
export declare const normalizeImageExtension: (extension: string) => ImageExtension;
