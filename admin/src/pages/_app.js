import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-surface-100 !shadow-xl !rounded-2xl !border !border-surface-200 dark:!border-surface-700',
          duration: 3000,
        }}
      />
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
