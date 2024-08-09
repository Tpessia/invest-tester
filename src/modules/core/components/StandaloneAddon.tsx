import variables from '@/styles/variables';
import React, { ReactNode } from 'react';

interface Props {
  addon?: ReactNode;
  wrapperStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const StandaloneAddon: React.FC<Props> = (props) => {
  return (
    <>
      <span className='ant-input-group-wrapper ant-input-group-wrapper-outlined' style={{ width: 'auto', ...props.wrapperStyle }}>
        <span className='ant-input-wrapper ant-input-group'>
          <div className='ant-input-group-addon' style={{ borderRadius: '6px', borderInlineEnd: `1px solid ${variables.borderColorBase}`, height: '32px', ...props.style }}>{props.addon}</div>
          <div></div>
        </span>
      </span>
    </>
  );
};

export default StandaloneAddon;
