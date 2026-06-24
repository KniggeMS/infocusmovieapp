import { motion } from 'framer-motion';
import { Home, User, Sparkles, BookOpen, Film, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BottomNavProps {
  currentFilter: string;
  showProfile: boolean;
  onNavigateHome: () => void;
  onShowDiary: () => void;
  onShowProfile: () => void;
  onShowSeries: () => void;
  onShowLists: () => void;
}

const tabConfig: Array<{ key: string; icon: typeof BookOpen; label: string; i18n?: boolean }> = [
  { key: 'diary', icon: BookOpen, label: 'nav.diary', i18n: true },
  { key: 'all', icon: Home, label: 'nav.home', i18n: true },
  { key: 'lists', icon: List, label: 'nav.lists', i18n: true },
  { key: 'series', icon: Film, label: 'nav.series', i18n: true },
  { key: 'profile', icon: User, label: 'Profil' },
];

export function BottomNav({
  currentFilter,
  showProfile,
  onNavigateHome,
  onShowDiary,
  onShowProfile,
  onShowSeries,
  onShowLists,
}: BottomNavProps) {
  const { t } = useTranslation();
  const isActive = (key: string) => {
    if (key === 'profile') return showProfile;
    return currentFilter === key;
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="max-w-sm mx-auto glass-tabbar rounded-2xl px-2 sm:px-3 py-2 shadow-2xl flex justify-around items-center">
        {tabConfig.map(({ key, icon: Icon, label, i18n }) => {
          const active = isActive(key);
          const handler = {
            diary: onShowDiary,
            all: onNavigateHome,
            lists: onShowLists,
            profile: onShowProfile,
            series: onShowSeries,
          }[key];
          const displayLabel = i18n ? t(label) : label;

          return (
            <button
              key={key}
              onClick={handler}
              className="relative flex flex-col items-center gap-0.5 py-1 px-1.5 sm:px-3 min-w-0"
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                  active
                    ? 'text-accent-glow drop-shadow-[0_0_8px_var(--accent-glow)]'
                    : 'text-app-text-muted hover:text-app-text'
                }`}
              />
              <span
                className={`text-[9px] leading-tight transition-colors whitespace-nowrap ${
                  active ? 'text-accent-glow font-semibold' : 'text-app-text-muted'
                }`}
              >
                {displayLabel}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-glow shadow-[0_0_6px_var(--accent-glow)]"
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
