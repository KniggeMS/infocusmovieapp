import { Movie } from '../types/domain';

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'failed';
  message?: string;
}

export async function shareMovie(movie: Movie): Promise<ShareResult> {
  const title = movie.title;
  const rating = movie.voteAverage ? `⭐️ ${movie.voteAverage.toFixed(1)}/10` : '';
  // Use a nice emoji based on genre or media type if possible, keeping it simple for now
  const text = `Hey, check out '${title}' on InFocus! ${rating}\n\n${movie.overview ? movie.overview.substring(0, 120) + '...' : ''}`;
  
  // Fallback URL: TMDB. Ideally this would be a deep link to our app like infocus://movie/123
  // But since we don't have deep linking hosted yet, TMDB is a safe fallback for the recipient to see what it is.
  const tmdbId = movie.tmdbId || movie.id;
  const url = `https://www.themoviedb.org/${movie.mediaType || 'movie'}/${tmdbId}`;

  // 1. Try Native Share (Mobile / Capacitor / Modern Browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `InFocus: ${title}`,
        text: text,
        url: url
      });
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled
      if ((error as any).name === 'AbortError') {
        return { success: false, method: 'failed', message: 'Share cancelled' };
      }
      console.warn('Native share failed, attempting clipboard fallback...', error);
      // Fallthrough to clipboard
    }
  }

  // 2. Fallback: Clipboard
  try {
    const content = `${text}\n${url}`;
    await navigator.clipboard.writeText(content);
    return { success: true, method: 'clipboard', message: 'Link copied to clipboard!' };
  } catch (error) {
    console.error('Clipboard write failed', error);
    return { success: false, method: 'failed', message: 'Could not share or copy link.' };
  }
}
