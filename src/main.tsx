
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { usePWA } from './hooks/usePWA';

function Root() {
  usePWA(); // Register service worker
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
