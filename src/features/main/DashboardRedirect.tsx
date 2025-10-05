import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <Navigate to={`/user/${user.id}/profile`} replace />;
};

export default DashboardRedirect;
