import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Movie } from '../types/domain';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Film, Clock, Star, TrendingUp } from 'lucide-react';

interface StatisticsDashboardProps {
  movies: Movie[];
}

const GENRE_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#f97316',
  '#ef4444',
];

function useChartColors() {
  return useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      text: style.getPropertyValue('--text-main')?.trim() || '#ffffff',
      muted: style.getPropertyValue('--text-muted')?.trim() || '#a0a0a0',
      card: style.getPropertyValue('--bg-card')?.trim() || '#1a1a1a',
      border: style.getPropertyValue('--border-color')?.trim() || '#262626',
    };
  }, []);
}

const roundHours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

const getRuntimeMinutes = (movie: Movie): number => {
  const runtime = movie.runtime;
  const value = typeof runtime === 'string' ? Number(runtime) : runtime;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
};

export const StatisticsDashboard = React.memo(({ movies }: StatisticsDashboardProps) => {
  const { t } = useTranslation();
  const colors = useChartColors();

  const stats = useMemo(() => {
    const watchedMovies = movies.filter((m) => m.watched);
    const runtimeMinutes = watchedMovies.reduce((sum, m) => sum + getRuntimeMinutes(m), 0);
    const totalHours = roundHours(runtimeMinutes);
    const avgRating =
      movies.reduce((sum, m) => sum + (m.userRating || 0), 0) /
      (movies.filter((m) => m.userRating).length || 1);

    const genreMap = new Map<string, number>();
    movies.forEach((m) =>
      (m.genres || []).forEach((g) => {
        if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1);
      }),
    );
    const genreData = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const ratingBuckets = Array.from({ length: 10 }, (_, i) => ({ name: `${i + 1}`, value: 0 }));
    movies.forEach((m) => {
      if (m.userRating && m.userRating >= 1 && m.userRating <= 10) {
        ratingBuckets[Math.floor(m.userRating) - 1].value++;
      }
    });

    const decadeMap = new Map<string, number>();
    movies.forEach((m) => {
      const year = m.releaseDate?.slice(0, 4);
      if (year && /^\d{4}$/.test(year)) {
        const decade = `${year.slice(0, 3)}0s`;
        decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1);
      }
    });
    const decadeData = Array.from(decadeMap.entries())
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));

    return {
      totalCount: movies.length,
      watchedCount: watchedMovies.length,
      totalHours,
      totalMinutes: runtimeMinutes,
      avgRuntime: watchedMovies.length > 0 ? Math.round(runtimeMinutes / watchedMovies.length) : 0,
      avgRating: movies.filter((m) => m.userRating).length > 0 ? Number(avgRating.toFixed(1)) : 0,
      genreData,
      ratingBuckets: ratingBuckets.filter((b) => b.value > 0),
      decadeData,
    };
  }, [movies]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="pb-24 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h2 className="text-lg font-bold text-app-text px-1">Statistiken</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: Film,
            label: 'Filme',
            value: stats.totalCount,
            sub: `${stats.watchedCount} gesehen`,
          },
          {
            icon: Clock,
            label: 'Laufzeit',
            value: `${stats.totalHours}h`,
            sub: `${stats.totalMinutes} Min.`,
          },
          {
            icon: Star,
            label: 'Ø Bewertung',
            value: stats.avgRating > 0 ? stats.avgRating : '—',
            sub: 'User-Rating',
          },
          {
            icon: TrendingUp,
            label: 'Ø Laufzeit',
            value: `${stats.avgRuntime}`,
            sub: 'Min. pro Film',
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <motion.div key={label} variants={itemVariants} className="glass-card rounded-xl p-3">
            <p className="text-xs text-app-text-muted mb-1">{label}</p>
            <div className="flex items-end gap-1">
              <Icon size={14} className="text-accent-color mb-0.5" />
              <span className="text-xl font-bold text-app-text">{value}</span>
            </div>
            <p className="text-xs text-app-text-muted mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {stats.genreData.length > 0 && (
          <motion.div variants={itemVariants} className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-app-text mb-3">Genres</p>
            <div className="flex gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={stats.genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    dataKey="value"
                  >
                    {stats.genreData.map((_, i) => (
                      <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {stats.genreData.slice(0, 6).map((g, i) => (
                  <div key={g.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }}
                    />
                    <span className="text-app-text truncate">
                      {g.name} ({g.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {stats.ratingBuckets.length > 0 && (
          <motion.div variants={itemVariants} className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-app-text mb-3">Bewertungen</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stats.ratingBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 10 }} />
                <YAxis tick={{ fill: colors.muted, fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.ratingBuckets.map((_, i) => (
                    <Cell key={i} fill={i >= 6 ? '#10b981' : i >= 3 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {stats.decadeData.length > 0 && (
          <motion.div variants={itemVariants} className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-app-text mb-3">Jahrzehnte</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={stats.decadeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="decade" tick={{ fill: colors.muted, fontSize: 10 }} />
                <YAxis tick={{ fill: colors.muted, fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill={GENRE_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {stats.totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-app-text-muted">
          <Film size={48} className="mb-4 opacity-30" />
          <p className="font-medium">Noch keine Daten</p>
          <p className="text-sm mt-1">Füge Filme hinzu, um Statistiken zu sehen.</p>
        </div>
      )}
    </motion.div>
  );
});

StatisticsDashboard.displayName = 'StatisticsDashboard';
