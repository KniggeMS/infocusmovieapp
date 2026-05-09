import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MovieStatistics } from '../types/domain';
import { Popcorn, Library, Star, Tag } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface StatisticsDashboardProps {
  statistics: MovieStatistics;
}

type Range = 'all' | 'year';

export function StatisticsDashboard({ statistics }: StatisticsDashboardProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>('all');

  const isEmpty = statistics.totalMovies === 0;

  const filteredKpis = useMemo(() => {
    if (range === 'year') {
      return {
        total: statistics.thisYearCount ?? 0,
        watched: statistics.watchedCount,
        // FIX: use year-specific runtime instead of alltime value
        hours: ((statistics as any).thisYearRuntimeMinutes ?? 0) / 60,
      };
    }
    return {
      total: statistics.totalMovies,
      watched: statistics.watchedCount,
      hours: statistics.totalRuntimeMinutes / 60,
    };
  }, [range, statistics]);

  const yearData = (statistics.byYear || []).slice(-8);

  if (isEmpty) {
    return (
      <div className="text-center py-20 text-app-text-muted animate-fade-in">
        <div className="text-4xl mb-4 opacity-50">📊</div>
        <p className="text-lg font-medium">Noch keine Statistiken</p>
        <p className="text-sm mt-1 opacity-60">Füge Filme hinzu, um Auswertungen zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Range Switch */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-white/5 border border-app-border p-1">
          <button
            onClick={() => setRange('all')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              range === 'all' ? 'bg-blue-500 text-white' : 'text-app-text-muted hover:text-app-text'
            }`}
          >
            Allzeit
          </button>
          <button
            onClick={() => setRange('year')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              range === 'year' ? 'bg-blue-500 text-white' : 'text-app-text-muted hover:text-app-text'
            }`}
          >
            Dieses Jahr
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label={t('stats.total')} value={filteredKpis.total} color="text-white" />
        <Kpi label={t('stats.watched')} value={filteredKpis.watched} color="text-blue-400" />
        <Kpi label={t('stats.hours')} value={filteredKpis.hours.toFixed(1)} color="text-yellow-400" />
        <Kpi
          label="⌀ Bewertung"
          value={statistics.ratedCount && statistics.ratedCount > 0 ? (statistics.averageUserRating ?? 0).toFixed(1) : '—'}
          color="text-pink-400"
          icon={<Star className="w-3 h-3" />}
        />
      </div>

      {/* Genres */}
      {statistics.byGenre.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Popcorn className="w-5 h-5 text-accent-glow" />
            {t('stats.genres')}
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.byGenre}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statistics.byGenre.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statistics.byGenre.slice(0, 5).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                {entry.name} <span className="text-app-text-muted">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-year chart */}
      {yearData.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-400" />
            Pro Jahr hinzugefügt
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Decades */}
      {statistics.byDecade.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Library className="w-5 h-5 text-emerald-400" />
            {t('stats.timeline')}
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistics.byDecade}>
                <XAxis dataKey="decade" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Tags */}
      {!!statistics.topTags && statistics.topTags.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-pink-400" />
            Top Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {statistics.topTags.map(tag => (
              <span key={tag.name} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1">
                #{tag.name} <span className="text-app-text-muted">×{tag.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color, icon }: { label: string; value: number | string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
        {icon}{label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
