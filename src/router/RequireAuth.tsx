import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { isLoggedIn } from '../utils/auth';

type Props = { children: ReactNode };

const RequireAuth = ({ children }: Props) => {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

export default RequireAuth;
