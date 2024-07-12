import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React from 'react';

interface Props {
  popover: React.ReactNode;
  content?: React.ReactNode;
  style?: React.CSSProperties;
  width?: number | string;
}

const InfoPopover: React.FC<Props> = (props) => {
  return (
    <Popover overlayInnerStyle={{ padding: '5px 8px' }} content={props.popover} placement='bottom' overlayStyle={{ maxWidth: props.width, textAlign: 'justify' }}>
      <div style={{ cursor: 'pointer', ...props.style }}>
        <span style={{ marginRight: '5px' }}>{props.content}</span>
        <InfoCircleOutlined style={{ fontSize: '12px', marginBottom: '1px' }} />
      </div>
    </Popover>
  );
};

export default InfoPopover;
