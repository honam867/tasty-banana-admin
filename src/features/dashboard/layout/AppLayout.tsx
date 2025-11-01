import { Layout, Menu, Dropdown, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, KeyOutlined, FileTextOutlined, AppstoreOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/providers/AuthProvider';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p === '/' || p.startsWith('/welcome')) return 'welcome';
    if (p.startsWith('/operations')) return 'operations';
    if (p.startsWith('/prompt-templates')) return 'prompt-templates';
    if (p.startsWith('/style-libraries')) return 'style-libraries';
    if (p.startsWith('/hints')) return 'hints';
    if (p.startsWith('/users')) return 'users';
    return '';
  }, [location.pathname]);

  const menuItems = [
    {
      key: 'welcome',
      label: 'Welcome',
      icon: <HomeOutlined />,
      onClick: () => navigate('/welcome'),
    },
    {
      key: 'operations',
      label: 'Quản lý Token',
      icon: <KeyOutlined />,
      onClick: () => navigate('/operations'),
    },
    {
      key: 'prompt-templates',
      label: 'Prompt Templates',
      icon: <FileTextOutlined />,
      onClick: () => navigate('/prompt-templates'),
    },
    {
      key: 'users',
      label: 'Users',
      icon: <TeamOutlined />,
      onClick: () => navigate('/users'),
    },
    {
      key: 'style-libraries',
      label: 'Style Libraries',
      icon: <AppstoreOutlined />,
      onClick: () => navigate('/style-libraries'),
    },
    {
      key: 'hints',
      label: 'Hints',
      icon: <BulbOutlined />,
      onClick: () => navigate('/hints'),
    },
  ];

  const userMenu = (
    <Menu
      items={[
        { key: 'change-password', label: 'Change Password', onClick: () => navigate('/change-password') },
        { type: 'divider' as const },
        { key: 'logout', label: 'Logout', onClick: () => logout() },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ color: '#fff', padding: 16, fontWeight: 600, textAlign: 'center' }}>
          {collapsed ? 'TB' : 'Tasty Banana Admin'}
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} selectedKeys={[selectedKey]}></Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text strong>Tasty Banana Admin</Typography.Text>
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              {user?.username || user?.email || 'User'}
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
