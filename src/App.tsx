import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/navigation/router';

function AppContent() {
  const { session } = useAuth();

  if (!session) {
    return <AuthScreen />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
