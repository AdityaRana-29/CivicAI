import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0c1e33',
                color: '#e8f4fd',
                border: '1px solid rgba(56,189,248,0.18)',
                borderRadius: '14px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.08)',
                backdropFilter: 'blur(20px)',
              },
              success: {
                iconTheme: { primary: '#34d399', secondary: '#0c1e33' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#0c1e33' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
