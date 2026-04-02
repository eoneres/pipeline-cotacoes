import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60000,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    // Comente o StrictMode temporariamente para testar
    // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
    </QueryClientProvider>
    // </React.StrictMode>
)