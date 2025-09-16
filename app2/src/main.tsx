import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './AppNew.tsx'
import { setupDependencies } from './infrastructure/di/ServiceRegistry'

// Initialize dependency injection
setupDependencies()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
