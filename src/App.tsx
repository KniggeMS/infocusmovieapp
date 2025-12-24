import { useState, useEffect } from 'react';
import { MovieConductor } from './core/conductor/MovieConductor';
import { WatchlistState } from './types/domain';

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());

  useEffect(() => {
    // Subscribe to conductor updates
    const unsubscribe = conductor.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [conductor]);

  const handleLoadMovies = () => {
    conductor.dispatch({ type: 'LOAD_MOVIES' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff', backgroundColor: '#0B0E14', minHeight: '100vh' }}>
      <h1>InFocus CineLog V2</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleLoadMovies}
          disabled={state.status === 'loading'}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: state.status === 'loading' ? 'not-allowed' : 'pointer',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {state.status === 'loading' ? '⏳ Lade Daten...' : 'Load Movies'}
        </button>
      </div>

      {state.error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {state.error}
        </div>
      )}

      {state.items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {state.items.map((movie) => (
            <li key={movie.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #333', borderRadius: '4px' }}>
              <strong>{movie.title}</strong>
              <span style={{ marginLeft: '10px', color: '#888' }}>
                ({movie.releaseDate?.split('-')[0]})
              </span>
            </li>
          ))}
        </ul>
      )}
      
      {state.status === 'idle' && state.items.length === 0 && !state.error && (
        <p style={{ color: '#666' }}>No movies loaded yet. Click the button above.</p>
      )}
    </div>
  );
}

export default App;
