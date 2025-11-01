import { Alert } from 'antd';

export default function ApiErrorAlert({ error }: { error?: any }) {
  if (!error) return null;
  const msg = error?.response?.data?.message || error?.message || 'Something went wrong';
  return <Alert type="error" message={msg} showIcon />;
}

