import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { Movie } from '../types/domain';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Film, Clock, Star, TrendingUp } from 'lucide-react';

interface StatisticsDashboardProps {
  movies: Movie[];
}

const GENRE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];

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
    const watchedMovies = movies.filter(m => m.watched);
    const runtimeMinutes = watchedMovies.reduce((sum, m) => sum + getRuntimeMinutes(m), 0);
    const totalHours = roundHours(runtimeMinutes);
    const avgRating = movies.reduce((sum, m) => sum + (m.userRating || 0), 0) / (movies.filter(m => m.userRating).length || 1);

    const genreMap = new Map<string, number>();
    movies.forEach(m => (m.genres || []).forEach(g => {
      if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1);
    }));
    const genreData = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const ratingBuckets = Array.from({ length: 10 }, (_, i) => ({ name: `${i + 1}`, value: 0 }));
    movies.forEach(m => {
      if (m.userRating && m.userRating >= 1 && m.userRating <= 10) {
        ratingBuckets[Math.floor(m.userRating) - 1].value++;
      }
    });

    const decadeMap = new Map<string, number>();
    movies.forEach(m => {
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
      avgRating: movies.filter(m => m.userRating).length > 0 ? Number(avgRating.toFixed(1)) : 0,
      genreData,
      ratingBuckets: ratingBuckets.filter(b => b.value > 0),
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
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-6"
    >
      <h2 className="text-2xl font-bold text-app-text">Statistiken</h2>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Film, label: 'Filme', value: stats.totalCount, sub: `${stats.watchedCount} gesehen` },
          { icon: Clock, label: 'Laufzeit', value: `${stats.totalHours}`, sub: `${stats.totalMinutes} Min.` },
          { icon: Star, label: 'Ø Bewertung', value: stats.avgRating > 0 ? stats.avgRating : '—', sub: 'User-Rating' },
          { icon: TrendingUp, label: 'Ø Laufzeit', value: `${stats.avgRuntime}`, sub: 'Min. pro Film' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-app-card-bg border border-app-border p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 text-app-text-muted mb-2">
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-app-text">{value}</div>
            <div className="text-[11px] text-app-text-muted mt-0.5">{sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Genre Distribution */}
        {stats.genreData.length > 0 && (
          <motion.div variants={itemVariants} className="bg-app-card-bg border border-app-border p-4 sm:p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">Genres</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {stats.genreData.map((_, i) => (
                    <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, fontSize: 13, color: colors.text }}
                  labelStyle={{ color: colors.muted }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {stats.genreData.slice(0, 6).map((g, i) => (
                <span key={g.name} className="flex items-center gap-1.5 text-xs text-app-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                  {g.name} ({g.value})
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rating Distribution */}
        {stats.ratingBuckets.length > 0 && (
          <motion.div variants={itemVariants} className="bg-app-card-bg border border-app-border p-4 sm:p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">Bewertungen</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.ratingBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} />
                <YAxis tick={{ fill: colors.muted, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, fontSize: 13, color: colors.text }}
                  labelStyle={{ color: colors.muted }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.ratingBuckets.map((_, i) => (
                    <Cell key={i} fill={i >= 7 ? '#10b981' : i >= 4 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Decade Distribution */}
      {stats.decadeData.length > 0 && (
        <motion.div variants={itemVariants} className="bg-app-card-bg border border-app-border p-4 sm:p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">Jahrzehnte</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="decade" tick={{ fill: colors.muted, fontSize: 12 }} />
              <YAxis tick={{ fill: colors.muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, fontSize: 13, color: colors.text }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Empty State */}
      {stats.totalCount === 0 && (
        <div className="text-center py-12 text-app-text-muted">
          <div className="text-4xl mb-3 opacity-50">📊</div>
          <p className="font-medium">Noch keine Daten</p>
          <p className="text-sm mt-1 opacity-60">Füge Filme hinzu, um Statistiken zu sehen.</p>
        </div>
      )}
    </motion.div>
  );
});

StatisticsDashboard.displayName = 'StatisticsDashboard';