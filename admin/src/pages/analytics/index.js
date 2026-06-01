import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { analyticsApi } from '../../utils/api';
import {
  BarChart3, Download, Smartphone, Globe, AppWindow,
  TrendingUp, PieChart as PieChartIcon, Activity, Loader2, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
const DEVICE_COLORS = { android: '#22c55e', ios: '#3b82f6', web: '#f97316', other: '#6b7280' };

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, dlRes] = await Promise.all([
        analyticsApi.dashboard(),
        analyticsApi.downloads({ period }),
      ]);
      setDashboard(dashRes);
      setDownloads(dlRes.downloads || dlRes || []);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const stats = dashboard?.stats || {};
  const topApps = dashboard?.topApps || dashboard?.topDownloads || [];
  const categoryDist = dashboard?.categoryDistribution || [];
  const downloadsByDay = dashboard?.downloadsByDay || [];
  const deviceBreakdown = dashboard?.deviceBreakdown || [];

  const deviceData = [
    { name: 'Android', value: deviceBreakdown?.android || 0, color: DEVICE_COLORS.android },
    { name: 'iOS', value: deviceBreakdown?.ios || 0, color: DEVICE_COLORS.ios },
    { name: 'Web', value: deviceBreakdown?.web || 0, color: DEVICE_COLORS.web },
    { name: 'Other', value: deviceBreakdown?.other || 0, color: DEVICE_COLORS.other },
  ].filter(d => d.value > 0);

  const statCards = [
    { icon: Download, label: 'Total Downloads', value: formatNumber(stats.totalDownloads), color: 'emerald' },
    { icon: AppWindow, label: 'Total Apps', value: formatNumber(stats.totalApps), color: 'primary' },
    { icon: Smartphone, label: 'Active Devices', value: formatNumber(stats.activeDevices || stats.uniqueDevices), color: 'blue' },
    { icon: TrendingUp, label: 'Avg Daily Downloads', value: formatNumber(stats.avgDailyDownloads), color: 'amber' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-4 py-3 text-sm shadow-xl">
          <p className="text-surface-400 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="font-medium" style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-surface-400 mt-1">Track performance and downloads</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="glass-input w-32 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-surface-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Downloads Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Downloads Over Time</h2>
            </div>
            {(downloadsByDay?.length > 0 || downloads?.length > 0) ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={downloadsByDay.length > 0 ? downloadsByDay : downloads}>
                    <defs>
                      <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val?.slice(5) || ''}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Downloads"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#downloadGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-surface-400 text-sm">
                No download data available
              </div>
            )}
          </motion.div>

          {/* Top Apps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Top Apps</h2>
            </div>
            {topApps.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topApps} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700" opacity={0.3} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      tickFormatter={(val) => val?.length > 12 ? `${val.slice(0, 12)}...` : val}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total_downloads" name="Downloads" radius={[0, 6, 6, 0]}>
                      {topApps.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-surface-400 text-sm">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Category Distribution</h2>
            </div>
            {categoryDist.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="name"
                      >
                        {categoryDist.map((entry, i) => (
                          <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1 w-full">
                  {categoryDist.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || COLORS[i] }} />
                      <span className="flex-1 text-sm">{cat.name}</span>
                      <span className="text-sm font-medium">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-surface-400 text-sm">
                No categories yet
              </div>
            )}
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Device Breakdown</h2>
            </div>
            {deviceData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {deviceData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1 w-full">
                  {deviceData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="flex-1 text-sm">{d.name}</span>
                      <span className="text-sm font-medium">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-surface-400 text-sm">
                No device data yet
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
