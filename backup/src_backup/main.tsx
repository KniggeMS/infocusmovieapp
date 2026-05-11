import './index.css';
import "./lib/i18n";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MovieConductor } from './core/conductor/MovieConductor';
import { SupabaseMovieService } from './services/SupabaseMovieService';
import { ToastProvider } from './components/Toast';

window.addEventListener('error', (event) => {
  console.error('Global runtime error:', event.error || event.message);
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const adapter = new SupabaseMovieService();
  const conductor = new MovieConductor(adapter);

  root.render(
    <React.StrictMode>
      <ToastProvider>
        <App conductor={conductor} />
      </ToastProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('App initialization failed:', error);
  root.render(
    <React.StrictMode>
      <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center p-6 text-center">
        Die App konnte nicht gestartet werden. Bitte prüfe die Konfiguration und lade die Seite neu.
      </div>
    </React.StrictMode>
  );
}