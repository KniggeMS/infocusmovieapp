import { Movie, CustomList } from '../types/domain';

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'failed';
  message?: string;
}

export async function shareMovie(movie: Movie): Promise<ShareResult> {
  const title = movie.title;
  const rating = movie.voteAverage ? `⭐️ ${movie.voteAverage.toFixed(1)}/10` : '';
  const text = `Hey, check out '${title}' on InFocus Family CineLog! ${rating}\n\n${movie.overview ? movie.overview.substring(0, 120) + '...' : ''}`;
  const tmdbId = movie.tmdbId || movie.id;
  const url = `https://www.themoviedb.org/${movie.mediaType || 'movie'}/${tmdbId}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: `InFocus: ${title}`, text, url });
      return { success: true, method: 'native' };
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        return { success: false, method: 'failed', message: 'Share cancelled' };
      }
      console.warn('Native share failed, attempting clipboard fallback...', error);
    }
  }

  try {
    const content = `${text}\n${url}`;
    await navigator.clipboard.writeText(content);
    return { success: true, method: 'clipboard', message: 'Link copied to clipboard!' };
  } catch (error) {
    console.error('Clipboard write failed', error);
    return { success: false, method: 'failed', message: 'Could not share or copy link.' };
  }
}

export async function shareList(list: CustomList, movies: Movie[]): Promise<ShareResult> {
  const movieLines = movies.map((m, i) =>
    `${i + 1}. ${m.title}${m.releaseDate ? ` (${m.releaseDate.split('-')[0]})` : ''}${typeof m.userRating === 'number' && m.userRating > 0 ? ` ★${m.userRating}/10` : ''}`
  ).join('\n');

  const text = `📋 *${list.name}* — InFocus Family CineLog\n${list.description ? `_${list.description}_\n` : ''}\n${movieLines}`;
  const waText = encodeURIComponent(`${text}\n\nGet it on InFocus!`);
  const waUrl = `https://wa.me/?text=${waText}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: `InFocus List: ${list.name}`, text, url: waUrl });
      return { success: true, method: 'native' };
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        return { success: false, method: 'failed', message: 'Share cancelled' };
      }
    }
  }

  window.open(waUrl, '_blank');
  return { success: true, method: 'native', message: 'WhatsApp geöffnet' };
}
