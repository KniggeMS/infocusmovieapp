import { useTranslation } from 'react-i18next';
import { Home, Heart, User, Eye, Zap, BarChart2 } from 'lucide-react';

interface BottomNavProps {
  currentFilter: string;
  showProfile: boolean;
  onNavigateHome: () => void;
  onShowFavorites: () => void;
  onShowProfile: () => void;
  onShowWatched: () => void;
  onShowAchievements: () => void;
  onShowStatistics: () => void;
}

export function BottomNav({
  currentFilter,
  showProfile,
  onNavigateHome,
  onShowFavorites,
  onShowProfile,
  onShowWatched,
  onShowAchievements,
  onShowStatistics
}: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-bg/90 backdrop-blur-2xl border-t border-app-border px-6 py-4 flex justify-between items-center z-50 max-w-4xl mx-auto w-full md:rounded-t-3xl">
      <button
        className={`transition-colors ${
          currentFilter === 'all' ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onNavigateHome}
        aria-label={t('nav.home')}
      >
        <Home className="w-6 h-6" />
      </button>

      <button
        className={`transition-colors ${
          currentFilter === 'favorites' ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onShowFavorites}
        aria-label={t('nav.favorites')}
      >
        <Heart className="w-6 h-6" />
      </button>

      <button
        className={`transition-colors ${
          showProfile ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onShowProfile}
        aria-label="Profile"
      >
        <User className="w-6 h-6" />
      </button>

      <button
        className={`transition-colors ${
          currentFilter === 'watched' ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onShowWatched}
        aria-label={t('nav.watched')}
      >
        <Eye className="w-6 h-6" />
      </button>

      <button
        className={`transition-colors ${
          currentFilter === 'achievements' ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onShowAchievements}
        aria-label={t('nav.achievements')}
      >
        <Zap className="w-6 h-6" />
      </button>

      <button
        className={`transition-colors ${
          currentFilter === 'statistics' ? 'text-blue-500' : 'text-app-text-muted hover:text-app-text'
        }`}
        onClick={onShowStatistics}
        aria-label={t('nav.statistics')}
      >
        <BarChart2 className="w-6 h-6" />
      </button>
    </nav>
  );
}
