import React, { useMemo } from 'react';
import { Movie } from '../types/domain';

interface StatisticsDashboardProps {
  movies: Movie[];
}

const roundHours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

const getRuntimeMinutes = (movie: Movie): number => {
  const runtime = movie.runtime;
  const value = typeof runtime === 'string' ? Number(runtime) : runtime;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
};

export const StatisticsDashboard = React.memo(({ movies }: StatisticsDashboardProps) => {
  const stats = useMemo(() => {
    const watchedMovies = movies.filter(movie => movie.watched);
    const runtimeMinutes = watchedMovies.reduce((sum, movie) => sum + getRuntimeMinutes(movie), 0);
    const totalHours = roundHours(runtimeMinutes);

    return {
      watchedCount: watchedMovies.length,
      totalMinutes: runtimeMinutes,
      totalHours,
      averageRuntimeMinutes: watchedMovies.length > 0 ? Math.round(runtimeMinutes / watchedMovies.length) : 0,
    };
  }, [movies]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-app-text">Statistiken</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-app-card-bg border border-app-border p-5 rounded-2xl shadow-lg">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Gesehene Filme</span>
          <div className="text-3xl font-bold text-app-text mt-1">{stats.watchedCount}</div>
        </div>
        
        <div className="bg-app-card-bg border border-app-border p-5 rounded-2xl shadow-lg">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Gesamtlaufzeit</span>
          <div className="text-3xl font-bold text-app-text mt-1">{stats.totalHours} <span className="text-sm font-normal text-app-text-muted">Std.</span></div>
          <div className="text-xs text-app-text-muted mt-1">{stats.totalMinutes} Min. gesamt</div>
        </div>
        
        <div className="bg-app-card-bg border border-app-border p-5 rounded-2xl shadow-lg">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Ø Laufzeit</span>
          <div className="text-3xl font-bold text-app-text mt-1">{stats.averageRuntimeMinutes} <span className="text-sm font-normal text-app-text-muted">Min.</span></div>
        </div>
      </div>
    </div>
  );
});

StatisticsDashboard.displayName = 'StatisticsDashboard';

