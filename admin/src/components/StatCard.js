import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary: 'from-primary-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    rose: 'from-rose-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color] || colors.primary} flex items-center justify-center shadow-lg shadow-${color}-500/20`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm text-surface-400">{label}</p>
        {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}
