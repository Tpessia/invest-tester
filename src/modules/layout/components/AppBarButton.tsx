import Icon from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';

interface Props {
    onClick?: () => void,
}

const AppBarButton: React.FC<Props> = (props) => {
    return (
        <Menu
            theme='dark'
            mode='horizontal'
            selectedKeys={['button']}
        >
            <Menu.Item
                key='button'
                style={{ lineHeight: '64px', float: 'right' }}
                onClick={props.onClick}
            >
                <Icon type='menu' style={{ margin: 0 }} />
            </Menu.Item>
        </Menu>
    );
};

export default AppBarButton;