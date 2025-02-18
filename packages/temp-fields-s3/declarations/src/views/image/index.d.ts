/** @jsxRuntime classic */
/** @jsx jsx */
import { CardValueComponent, CellComponent, FieldController, FieldControllerConfig } from '@keystone-6/core/types';
export { Field } from './Field';
export declare const Cell: CellComponent;
export declare const CardValue: CardValueComponent;
declare type ImageData = {
    url: string;
    ref: string;
    height: number;
    width: number;
    filesize: number;
    extension: string;
    id: string;
};
export declare type ImageValue = {
    kind: 'empty';
} | {
    kind: 'ref';
    data: {
        ref: string;
    };
    previous: ImageValue;
} | {
    kind: 'from-server';
    data: ImageData;
} | {
    kind: 'upload';
    data: {
        file: File;
        validity: ValidityState;
    };
    previous: ImageValue;
} | {
    kind: 'remove';
    previous?: Exclude<ImageValue, {
        kind: 'remove';
    }>;
};
declare type ImageController = FieldController<ImageValue>;
export declare const controller: (config: FieldControllerConfig) => ImageController;
