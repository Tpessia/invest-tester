import clsx from 'clsx';
import React, { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import './InputAddon.scss';

interface Props extends PropsWithChildren {
  addonBefore?: ReactNode;
  addWrapper?: boolean;
  forceUnround?: boolean;
}

const InputAddon: React.FC<Props> = (props) => {
  const wrapperStyle = props.addonBefore ? undefined : { borderRadius: '6px' } as CSSProperties;
  return (
    <>
      <span className={clsx('ant-input-group-wrapper ant-input-group-wrapper-outlined', { 'force-unround': props.forceUnround })}>
        <span className='ant-input-wrapper ant-input-group'>
          {props.addonBefore && <div className='ant-input-group-addon'>{props.addonBefore}</div>}
          {props.addWrapper === true ? <div className='ant-input ant-input-outlined' style={wrapperStyle}>{props.children}</div> : props.children}
        </span>
      </span>
    </>
  );
};

export default InputAddon;
