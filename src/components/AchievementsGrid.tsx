import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../types/domain';
import { Lock, Popcorn, Library, Trophy, Star } from 'lucide-react';

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
  const unlockedCount = useMemo(() => achievements.filter(a => a.unlocked).length, [achievements]);
  const totalCount = achievements.length;
  const movieCount = useMemo(() => {
    const maxThreshold = Math.max(...achievements.map(a => a.threshold), 0);
    const unlockedThresholds = achievements.filter(a => a.unlocked).map(a => a.threshold);
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* XP / Level Bar */}
      <motion.div
        variants={cardVariants}
        className="bg-app-card-bg border border-app-border rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-app-text">Level {level}</div>
              <div className="text-[11px] text-app-text-muted">{xp} XP gesamt</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-app-text-muted uppercase tracking-wider">
              {unlockedCount}/{totalCount} Erfolge
            </div>
            <div className="text-[11px] text-app-text-muted">
              {movieCount} Filme
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative w-full h-3 bg-app-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${(currentLevelXp / XP_PER_LEVEL) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-app-text-muted">
          <span>{currentLevelXp} / {XP_PER_LEVEL} XP zum nächsten Level</span>
          <span>Level {level + 1}</span>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            variants={cardVariants}
            whileHover={a.unlocked ? { scale: 1.02 } : {}}
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3 ${
              a.unlocked
                ? 'bg-app-card-bg border-yellow-500/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]'
                : 'bg-app-secondary/30 border-app-border opacity-60'
            }`}
          >
            <div className="relative">
              <motion.div
                className={`p-3 rounded-full ${
                  a.unlocked
                    ? 'bg-yellow-400/15 text-yellow-400'
                    : 'bg-app-secondary/50 text-app-text-muted'
                }`}
                animate={a.unlocked ? { rotate: [0, -10, 10, -5, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.3, ease: 'easeInOut' }}
              >
                {a.iconName === 'Popcorn' ? (
                  <Popcorn className="w-7 h-7" />
                ) : (
                  <Library className="w-7 h-7" />
                )}
              </motion.div>
              {!a.unlocked && (
                <div className="absolute -top-1 -right-1 bg-app-bg rounded-full p-1 border border-app-border">
                  <Lock className="w-3 h-3 text-app-text-muted" />
                </div>
              )}
              {a.unlocked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-1 -right-1"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </div>

            <div>
              <h3 className={`text-sm font-bold leading-tight ${a.unlocked ? 'text-app-text' : 'text-app-text-muted'}`}>
                {a.title}
              </h3>
              <p className="text-[10px] text-app-text-muted mt-1 leading-relaxed line-clamp-2">
                {a.description}
              </p>
            </div>

            {/* Threshold Progress */}
            {a.unlocked && (
              <div className="w-full h-1 bg-yellow-500/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}