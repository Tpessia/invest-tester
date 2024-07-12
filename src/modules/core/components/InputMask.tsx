import { Input, InputProps } from 'antd';
import React, { useCallback } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

export type InputMaskProps = {
    maskProps: NumericFormatProps;
} & InputProps;

const InputMask: React.FC<InputMaskProps> = (props) => {
    const { maskProps, addonBefore, ...inputProps } = props;

    const component = useCallback((props: any) => <Input addonBefore={addonBefore} {...inputProps as any} {...props as any} />, [...Object.values(inputProps)]);

    return (
        <NumericFormat
            {...maskProps}
            customInput={component}
        />
    )
};

export default InputMask;
