import { useState, useEffect } from 'react';
import { MovieConductor } from './core/conductor/MovieConductor';
import { WatchlistState, Movie } from './types/domain';

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [addedMovies, setAddedMovies] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Subscribe to conductor updates
    const unsubscribe = conductor.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [conductor]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 0) {
      conductor.dispatch({ type: 'LOAD_MOVIES' });
    } else if (value.length > 2) {
      conductor.dispatch({ type: 'SEARCH', payload: value });
    }
  };

  const handleAddMovie = (movie: Movie) => {
    conductor.dispatch({ type: 'ADD_MOVIE', payload: movie });
    // Visual feedback
    setAddedMovies(prev => new Set(prev).add(movie.title)); // Using title as pseudo-id for TMDB results that might not have stable IDs yet
    setTimeout(() => {
        setAddedMovies(prev => {
            const next = new Set(prev);
            next.delete(movie.title);
            return next;
        });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h1 className="text-4xl font-bold text-emerald-400 tracking-tight">
            🎬 InFocus V2
          </h1>
        </header>

        {/* Search Bar */}
        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input 
            type="text" 
            placeholder="Suche Filme (TMDB)..." 
            onChange={handleSearchChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-sm group-hover:border-gray-600"
          />
        </div>

        {/* Status Indicators */}
        {state.status === 'loading' && (
          <div className="text-center py-4 text-emerald-400 animate-pulse font-medium">
            ⏳ Lade Daten...
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
            <span>⚠️</span>
            <span>{state.error}</span>
          </div>
        )}

        {/* Movie Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.items.map((movie) => (
            <div 
              key={movie.id} 
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 hover:-translate-y-1 transition duration-300 relative group flex gap-4"
            >
              {/* Poster Image */}
              <div className="flex-shrink-0 w-24 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-md">
                {movie.posterPath ? (
                  <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white leading-tight">
                        {movie.title}
                        </h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{movie.releaseDate?.split('-')[0] || 'Unbekannt'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⭐</span>
                            <span className={movie.voteAverage && movie.voteAverage > 7 ? "text-emerald-400 font-bold" : ""}>
                                {movie.voteAverage ? movie.voteAverage.toFixed(1) : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    {/* Action Button: Add (TMDB) or Delete (DB) */}
                    {movie.source === 'tmdb' ? (
                        <button
                            onClick={() => handleAddMovie(movie)}
                            disabled={addedMovies.has(movie.title)}
                            className={`p-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                                addedMovies.has(movie.title) 
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title="Zur Sammlung hinzufügen"
                        >
                            {addedMovies.has(movie.title) ? (
                                <><span>✅</span> Saved</>
                            ) : (
                                <><span>➕</span> Add</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id })}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all flex items-center gap-1"
                            title="Film löschen"
                        >
                            <span>🗑️</span> Remove
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {state.status === 'idle' && state.items.length === 0 && !state.error && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🍿</div>
            <p className="text-xl">Keine Filme gefunden.</p>
            <p className="text-sm mt-2">Suche nach einem Titel, um zu starten.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;