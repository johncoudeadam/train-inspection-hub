
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker more directly
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New version available");
    if (confirm('New version available. Update now?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("App ready for offline use");
  },
})

createRoot(document.getElementById("root")!).render(<App />);
