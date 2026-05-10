import { useMemo } from 'react';
import { Movie } from '../types/domain';

interface StatisticsDashboardProps {
  movies: Movie[];
}

const roundHours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

const getRuntimeMinutes = (movie: Movie): number => {
  const raw = movie.runtime ?? movie.duration ?? 0;
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export function StatisticsDashboard({ movies }: StatisticsDashboardProps) {
  const stats = useMemo(() => {
    const watchedMovies = movies.filter(movie => movie.watched || movie.status === 'watched');
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
    <section className="statistics-dashboard">
      <h2>Statistiken</h2>
      <div className="statistics-grid">
        <article className="stat-card">
          <span>Gesehene Filme</span>
          <strong>{stats.watchedCount}</strong>
        </article>
        <article className="stat-card">
          <span>Gesamtlaufzeit</span>
          <strong>{stats.totalHours} Std.</strong>
          <small>{stats.totalMinutes} Min.</small>
        </article>
        <article className="stat-card">
          <span>Ø Laufzeit</span>
          <strong>{stats.averageRuntimeMinutes} Min.</strong>
        </article>
      </div>
    </section>
  );
}
