import { useState } from 'react'
import Head from 'next/head'
import EmptyState from '../components/store/EmptyState'

const initialNotifications = [
  {
    id: 1,
    type: 'update',
    title: 'Updates Available',
    message: '2 of your installed apps have updates ready.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'trending',
    title: 'Trending Now',
    message: 'Check out what\'s popular in the store this week.',
    time: '1 day ago',
    read: false,
  },
  {
    id: 3,
    type: 'new',
    title: 'New Apps Added',
    message: 'New apps have been added to the store.',
    time: '3 days ago',
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <Head><title>Notifications - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Notifications</h1>
              <p className="text-sm text-surface-400 dark:text-surface-500">{unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-all"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`p-4 rounded-2xl transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white dark:bg-surface-900'
                    : 'bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'update'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                      : n.type === 'new'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500'
                      : 'bg-purple-50 dark:bg-purple-500/10 text-purple-500'
                  }`}>
                    {n.type === 'update' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                    ) : n.type === 'new' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${
                        n.read ? 'text-surface-900 dark:text-surface-50' : 'text-surface-900 dark:text-surface-50'
                      }`}>
                        {n.title}
                      </h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1.5">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
