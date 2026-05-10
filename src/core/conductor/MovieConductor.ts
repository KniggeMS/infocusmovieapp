import { Movie } from '../../types/domain';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export class MovieConductor {
  static getRuntimeMinutes(movie: Movie): number {
    const runtime = toNumber((movie as Movie & { runtime?: unknown }).runtime);
    if (runtime > 0) return runtime;

    const duration = toNumber((movie as Movie & { duration?: unknown }).duration);
    if (duration > 0) return duration;

    const episodes = toNumber((movie as Movie & { episodes?: unknown }).episodes);
    const episodeRuntime = toNumber((movie as Movie & { episodeRuntime?: unknown }).episodeRuntime);
    if (episodes > 0 && episodeRuntime > 0) return episodes * episodeRuntime;

    return 0;
  }

  static getRuntimeHours(movie: Movie): number {
    return MovieConductor.getRuntimeMinutes(movie) / 60;
  }

  static getWatchedRuntimeMinutes(movies: Movie[]): number {
    return movies.reduce((sum, movie) => {
      const watched = movie.watched || movie.status === 'watched';
      return watched ? sum + MovieConductor.getRuntimeMinutes(movie) : sum;
    }, 0);
  }
}
