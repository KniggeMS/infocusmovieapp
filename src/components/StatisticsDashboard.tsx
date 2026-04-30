import { useTranslation } from 'react-i18next';
import { MovieStatistics } from '../types/domain';
import { Popcorn, Library } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface StatisticsDashboardProps {
  statistics: MovieStatistics;
}

export function StatisticsDashboard({ statistics }: StatisticsDashboardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Section 1: KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.total')}</div>
          <div className="text-2xl font-bold text-white">{statistics.totalMovies}</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.watched')}</div>
          <div className="text-2xl font-bold text-blue-400">{statistics.watchedCount}</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.hours')}</div>
          <div className="text-2xl font-bold text-yellow-400">
            {(statistics.totalRuntimeMinutes / 60).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Section 2: Genres (Pie Chart) */}
      {statistics.byGenre.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Popcorn className="w-5 h-5 text-accent-glow" />
            {t('stats.genres')}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.byGenre}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statistics.byGenre.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % 5]}
                      stroke="rgba(0,0,0,0.5)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statistics.byGenre.slice(0, 5).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % 5] }}
                />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Decades (Bar Chart) */}
      {statistics.byDecade.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-400" />
            {t('stats.timeline')}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistics.byDecade}>
                <XAxis
                  dataKey="decade"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
