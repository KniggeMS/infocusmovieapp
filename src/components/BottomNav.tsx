import { motion } from 'framer-motion';
import { Home, Heart, User, Eye, Zap, BarChart2, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentFilter: string;
  showProfile: boolean;
  onNavigateHome: () => void;
  onShowFavorites: () => void;
  onShowProfile: () => void;
  onShowWatched: () => void;
  onShowAchievements: () => void;
  onShowStatistics: () => void;
  onShowRecommendations?: () => void;
}

const tabs = [
  { key: 'all', icon: Home, label: 'Home' },
  { key: 'favorites', icon: Heart, label: 'Favoriten' },
  { key: 'profile', icon: User, label: 'Profil' },
  { key: 'watched', icon: Eye, label: 'Gesehen' },
  { key: 'achievements', icon: Zap, label: 'Erfolge' },
  { key: 'statistics', icon: BarChart2, label: 'Statistiken' },
  { key: 'recommendations', icon: Sparkles, label: 'Empfehlungen' },
] as const;

export function BottomNav({
  currentFilter,
  showProfile,
  onNavigateHome,
  onShowFavorites,
  onShowProfile,
  onShowWatched,
  onShowAchievements,
  onShowStatistics,
  onShowRecommendations
}: BottomNavProps) {
  const isActive = (key: string) => {
    if (key === 'profile') return showProfile;
    return currentFilter === key;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-bg/90 backdrop-blur-2xl border-t border-app-border px-2 sm:px-4 py-2 z-50">
      <div className="max-w-4xl mx-auto flex justify-around items-center">
        {tabs.map(({ key, icon: Icon, label }) => {
          const active = isActive(key);
          const handler = {
            all: onNavigateHome,
            favorites: onShowFavorites,
            profile: onShowProfile,
            watched: onShowWatched,
            achievements: onShowAchievements,
            statistics: onShowStatistics,
            recommendations: onShowRecommendations,
          }[key];
          if (key === 'recommendations' && !onShowRecommendations) return null;

          return (
            <button
              key={key}
              onClick={handler}
              className="relative flex flex-col items-center gap-0.5 py-1 px-2 sm:px-3 min-w-0"
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  active ? 'text-accent-glow' : 'text-app-text-muted hover:text-app-text'
                }`}
              />
              <span
                className={`text-[10px] leading-tight transition-colors whitespace-nowrap ${
                  active ? 'text-accent-glow font-semibold' : 'text-app-text-muted'
                }`}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-glow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
