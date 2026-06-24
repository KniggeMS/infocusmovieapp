import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../types/domain';
import { Lock, Popcorn, Trophy, Star } from 'lucide-react';

interface AchievementsGridProps {
  achievements: Achievement[];
}

const XP_PER_MOVIE = 10;
const XP_PER_LEVEL = 100;

function calculateLevel(count: number) {
  const xp = count * XP_PER_MOVIE;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  return { xp, level, currentLevelXp, xpToNext: XP_PER_LEVEL - currentLevelXp };
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.unlocked).length,
    [achievements],
  );
  const totalCount = achievements.length;
  const movieCount = useMemo(() => {
    const unlockedThresholds = achievements.filter((a) => a.unlocked).map((a) => a.threshold);
    return Math.max(...unlockedThresholds, 0);
  }, [achievements]);

  const { xp, level, currentLevelXp } = calculateLevel(movieCount);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="pb-24 space-y-4">
      {/* XP / Level Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-app-text">Level {level}</p>
            <p className="text-xs text-app-text-muted">{xp} XP gesamt</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-app-text-muted">
              {unlockedCount}/{totalCount} Erfolge
            </p>
            <p className="text-xs text-app-text-muted">{movieCount} Filme</p>
          </div>
        </div>
        <div className="h-2 bg-app-secondary rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-accent-color rounded-full transition-all"
            style={{ width: `${(currentLevelXp / XP_PER_LEVEL) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-app-text-muted">
          <span>
            {currentLevelXp} / {XP_PER_LEVEL} XP zum nächsten Level
          </span>
          <span>Level {level + 1}</span>
        </div>
      </div>

      {/* Achievements Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {achievements.map((a, i) => (
          <motion.div
            key={a.id ?? i}
            variants={cardVariants}
            className={`glass-card rounded-xl p-3 flex flex-col gap-2 ${a.unlocked ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="relative w-10 h-10">
              {a.iconName === 'Popcorn' ? (
                <Popcorn
                  size={40}
                  className={a.unlocked ? 'text-accent-color' : 'text-app-text-muted'}
                />
              ) : (
                <Trophy
                  size={40}
                  className={a.unlocked ? 'text-yellow-400' : 'text-app-text-muted'}
                />
              )}
              {!a.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-app-bg/60 rounded">
                  <Lock size={16} className="text-app-text-muted" />
                </div>
              )}
              {a.unlocked && (
                <Star
                  size={14}
                  className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400"
                />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-app-text leading-tight">{a.title}</p>
              <p className="text-[11px] text-app-text-muted mt-0.5 leading-snug">{a.description}</p>
              {a.unlocked && a.unlockedAt && (
                <p className="text-[10px] text-accent-color mt-1">
                  {new Date(a.unlockedAt).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {a.unlocked && (
              <div className="mt-auto">
                <div className="h-1 bg-accent-color/30 rounded-full">
                  <div className="h-full bg-accent-color rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
