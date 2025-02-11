/** @jsxRuntime classic */
/** @jsx jsx */
import { ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
export declare function Field({ autoFocus, field, value, forceValidation, onChange, }: FieldProps<typeof import('.').controller>): jsx.JSX.Element;
export declare function validateRef({ ref }: {
    ref: string;
}): "Invalid ref" | undefined;
export declare function validateImage({ file, validity, }: {
    file: File;
    validity: ValidityState;
}): string | undefined;
export declare const ImageWrapper: ({ children }: {
    children: ReactNode;
}) => jsx.JSX.Element;
