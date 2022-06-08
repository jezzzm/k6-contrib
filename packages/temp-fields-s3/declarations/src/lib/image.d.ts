import { BaseListTypeInfo, FieldTypeFunc } from '@keystone-6/core/types';
import { S3FieldConfig } from './types';
export declare const s3Image: <TGeneratedListTypes extends BaseListTypeInfo>({ s3Config, ...config }: S3FieldConfig<TGeneratedListTypes>) => FieldTypeFunc<TGeneratedListTypes>;
