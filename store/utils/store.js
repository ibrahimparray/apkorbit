const FAVORITES_KEY = 'store_favorites'
const HISTORY_KEY = 'store_download_history'
const RECENT_KEY = 'store_recently_viewed'
const INSTALLED_KEY = 'store_installed_apps'
const THEME_KEY = 'store_theme'

export const store = {
  getTheme() {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem(THEME_KEY) || 'dark'
  },
  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  toggleTheme() {
    const current = this.getTheme()
    this.setTheme(current === 'dark' ? 'light' : 'dark')
    return this.getTheme()
  },

  getFavorites() {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') }
    catch { return [] }
  },
  addFavorite(appId) {
    const favs = this.getFavorites()
    if (!favs.includes(appId)) {
      favs.push(appId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    }
    return favs
  },
  removeFavorite(appId) {
    const favs = this.getFavorites().filter(id => id !== appId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return favs
  },
  isFavorite(appId) {
    return this.getFavorites().includes(appId)
  },

  getRecentlyViewed() {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
    catch { return [] }
  },
  addRecentlyViewed(app) {
    const recent = this.getRecentlyViewed().filter(r => r.id !== app.id)
    recent.unshift({ id: app.id, name: app.name, icon_url: app.icon_url, slug: app.slug, category_name: app.category_name })
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 20)))
    return recent
  },

  getDownloadHistory() {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
    catch { return [] }
  },
  addDownload(app, version) {
    const history = this.getDownloadHistory()
    history.unshift({
      id: app.id,
      name: app.name,
      icon_url: app.icon_url,
      version_name: version.version_name,
      version_code: version.version_code,
      file_size: version.file_size,
      downloaded_at: new Date().toISOString(),
    })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
    return history
  },
  clearDownloadHistory() {
    localStorage.setItem(HISTORY_KEY, '[]')
  },

  getInstalledApps() {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(INSTALLED_KEY) || '[]') }
    catch { return [] }
  },
  addInstalled(app, version) {
    const installed = this.getInstalledApps().filter(i => i.id !== app.id)
    installed.push({
      id: app.id,
      name: app.name,
      icon_url: app.icon_url,
      package_name: app.package_name,
      version_name: version.version_name,
      version_code: version.version_code,
      installed_at: new Date().toISOString(),
    })
    localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed))
    return installed
  },
  removeInstalled(appId) {
    const installed = this.getInstalledApps().filter(i => i.id !== appId)
    localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed))
    return installed
  },
  isInstalled(appId) {
    return this.getInstalledApps().some(i => i.id === appId)
  },
  getAppInstallInfo(appId) {
    return this.getInstalledApps().find(i => i.id === appId) || null
  },
}
