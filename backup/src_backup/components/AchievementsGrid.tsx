import { Achievement } from '../types/domain';
import { Lock, Popcorn, Library } from 'lucide-react';

interface AchievementsGridProps {
  achievements: Achievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-3 ${
            achievement.unlocked
              ? 'bg-white/10 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] opacity-100'
              : 'bg-white/5 border-transparent opacity-50 grayscale'
          }`}
        >
          <div className="relative">
            <div
              className={`p-3 rounded-full ${
                achievement.unlocked
                  ? 'bg-yellow-400/20 text-yellow-400'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              {achievement.iconName === 'Popcorn' && <Popcorn className="w-8 h-8" />}
              {achievement.iconName === 'Library' && <Library className="w-8 h-8" />}
            </div>
            {!achievement.unlocked && (
              <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1 border border-white/10">
                <Lock className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>

          <div>
            <h3
              className={`text-sm font-bold leading-tight ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}
            >
              {achievement.title}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
