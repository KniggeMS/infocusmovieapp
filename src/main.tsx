import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MovieConductor } from './core/conductor/MovieConductor';
import { SupabaseMovieService } from './services/SupabaseMovieService';

// Composition Root
const adapter = new SupabaseMovieService();
const conductor = new MovieConductor(adapter);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App conductor={conductor} />
  </React.StrictMode>
);
