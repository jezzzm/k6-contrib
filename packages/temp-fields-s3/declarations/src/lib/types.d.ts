import { BaseListTypeInfo, CommonFieldConfig, ImageMetadata } from '@keystone-6/core/types';
import { FileUpload } from 'graphql-upload';
export declare type AssetMode = 's3';
export declare type AssetType = 'file' | 'image';
export declare type ImageData = {
    type: 'image';
    id: string;
    filesize: number;
} & ImageMetadata;
export declare type FileData = {
    type: 'file';
    filename: string;
    filesize: number;
};
export declare type S3DataType = FileData | ImageData;
export declare type GetFileNameFunc = {
    id: string;
    originalFilename: string;
};
export declare type GetUploadParams = {
    id: string;
    originalFilename: string;
};
export declare type S3Config = {
    bucket: string;
    folder?: string;
    baseUrl?: string;
    transformFilename?: (str: string) => string;
    getFilename?: (args: GetFileNameFunc) => string;
    getUrl?: (config: S3Config, fileData: S3DataType) => Promise<string>;
    uploadParams?: (args: S3DataType) => Partial<AWS.S3.Types.PutObjectRequest>;
    s3Options: AWS.S3.ClientConfiguration;
};
export declare type S3FieldInputType = undefined | null | {
    upload?: Promise<FileUpload> | null;
    ref?: string | null;
};
export declare type S3FieldConfig<TGeneratedListTypes extends BaseListTypeInfo> = CommonFieldConfig<TGeneratedListTypes> & {
    s3Config: S3Config;
};
