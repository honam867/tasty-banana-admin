import { Spin } from 'antd';

export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Spin />
    </div>
  );
}

