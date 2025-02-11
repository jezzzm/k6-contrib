import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
export declare function validateRef({ ref }: {
    ref: string;
}): "Invalid ref" | undefined;
export declare function Field({ autoFocus, field, value, forceValidation, onChange, }: FieldProps<typeof import('.').controller>): jsx.JSX.Element;
export declare function validateFile({ validity }: {
    validity: ValidityState;
}): string | undefined;
