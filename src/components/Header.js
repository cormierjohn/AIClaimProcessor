// Header.js
import React from 'react';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { DownOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

const { Header } = Layout;

const userMenu = (
    <Menu>
        <Menu.Item key="1">Profile</Menu.Item>
        <Menu.Item key="2">Logout</Menu.Item>
    </Menu>
);

const CustomHeader = () => {
    const refreshPage = () => {
        window.location.reload();
    }

    return (
        <Header
            style={{
                background: '#0029F7',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px',
                minHeight: '64px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                    }}
                    className="mobile-menu"
                >
                    <MenuOutlined />
                </div>

                <img
                    src="/cigna-logo-dashboard.png"
                    alt="Logo"
                    style={{
                        width: '105px', // Fixed width for large screens
                        height: 'auto', // Maintain aspect ratio
                        maxHeight: '40px',
                        objectFit: 'contain', // Prevent stretching
                        flexShrink: 0,
                        cursor: 'pointer',
                    }}
                    className="logo"
                    onClick={refreshPage} // Refresh page on logo click
                />

                <div
                    style={{
                        fontSize: 'clamp(16px, 3vw, 20px)',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Agentic AI Claims Visualization
                </div>
            </div>

            <Dropdown overlay={userMenu} placement="bottomRight">
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <Avatar icon={<UserOutlined />} size="default" />
                    <span>Izzet, John</span>
                    <DownOutlined style={{ fontSize: '12px' }} />
                </div>
            </Dropdown>
        </Header>
    );
};

export default CustomHeader;
