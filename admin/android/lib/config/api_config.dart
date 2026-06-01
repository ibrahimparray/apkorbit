class ApiConfig {
  static String baseUrl = 'http://10.0.2.2:5000/api';

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String apps = '/apps';
  static const String categories = '/categories';
  static const String featured = '/apps/featured';
  static const String recent = '/apps/recent';
  static const String search = '/apps/search';
  static const String downloads = '/downloads';
  static const String updates = '/apps/updates';
  static const String users = '/users';
  static const String stats = '/apps/stats';

  static String appDetail(int id) => '/apps/$id';
  static String appVersions(int id) => '/apps/$id/versions';
  static String appScreenshots(int id) => '/apps/$id/screenshots';
  static String categoryApps(int id) => '/categories/$id/apps';
  static String downloadApk(int versionId) => '/downloads/$versionId';
  static String downloadProgress(int id) => '/downloads/$id/progress';
  static String userDownloads() => '/downloads/my';
  static String checkUpdate(int appId, String version) =>
      '/apps/$appId/check-update/$version';

  static void updateBaseUrl(String url) {
    baseUrl = url;
  }
}
