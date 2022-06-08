import { FileUpload } from 'graphql-upload';
import { AssetType, FileData, ImageData, S3Config, S3DataType } from './types';
export declare function getUrl(config: S3Config, fileData: S3DataType): Promise<string>;
export declare const getDataFromStream: (config: S3Config, type: AssetType, upload: FileUpload) => Promise<Omit<ImageData, 'type'> | Omit<FileData, 'type'>>;
export declare const getDataFromRef: (config: S3Config, type: AssetType, ref: string) => Promise<Partial<ImageData | FileData>>;
