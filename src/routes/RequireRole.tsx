import { PropsWithChildren } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function RequireRole({ roles, children }: PropsWithChildren & { roles: string[] }) {
  const { user } = useAuth();
  const hasRole = !!user && roles.some((r) => user.roles.includes(r));
  if (!hasRole) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}

