import { ConfigProvider, Layout } from 'antd';
import AppRoutes from '@/routes';
import 'antd/dist/reset.css';

function App() {
  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <AppRoutes />
      </Layout>
    </ConfigProvider>
  );
}

export default App;

