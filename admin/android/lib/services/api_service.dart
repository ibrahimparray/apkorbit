import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/app_model.dart';
import '../models/version_model.dart';
import '../models/category_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  static const String _tokenKey = 'auth_token';

  Future<String?> get token async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    return _token;
  }

  Future<void> _saveToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(_tokenKey, token);
    } else {
      await prefs.remove(_tokenKey);
    }
  }

  String get baseUrl => ApiConfig.baseUrl;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    if (data['token'] != null) {
      await _saveToken(data['token']);
    }
    return data;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final data = await _post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
    });
    return data;
  }

  Future<void> logout() async {
    await _saveToken(null);
  }

  Map<String, String> _headers({bool auth = false}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  String _resolveUrl(String path) {
    if (path.startsWith('http')) return path;
    return '${ApiConfig.baseUrl}$path';
  }

  Future<dynamic> _get(String endpoint, {bool auth = false}) async {
    final url = Uri.parse(_resolveUrl(endpoint));
    final response = await http
        .get(url, headers: _headers(auth: auth))
        .timeout(const Duration(seconds: 30));
    return _handleResponse(response);
  }

  Future<dynamic> _post(String endpoint, {Map<String, dynamic>? body, bool auth = false}) async {
    final url = Uri.parse(_resolveUrl(endpoint));
    final response = await http
        .post(url, headers: _headers(auth: auth), body: body != null ? jsonEncode(body) : null)
        .timeout(const Duration(seconds: 30));
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw ApiException('Unauthorized', 401);
    } else {
      final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};
      throw ApiException(
        body['message'] ?? 'Request failed',
        response.statusCode,
      );
    }
  }

  Future<List<AppModel>> getApps({int page = 1, int limit = 50, String? category, String? search, String sort = 'newest'}) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'sort': sort,
    };
    if (category != null) params['category'] = category;
    if (search != null) params['search'] = search;
    final qs = params.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&');
    final data = await _get('/apps?$qs');
    final list = data['apps'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  Future<AppModel> getAppDetail(dynamic id) async {
    final data = await _get('/apps/$id');
    return AppModel.fromJson(data['app'] ?? data);
  }

  Future<List<VersionModel>> getAppVersions(dynamic id) async {
    final data = await _get('/apps/$id');
    final list = data['versions'] ?? data['data'] ?? [];
    return (list as List).map((e) => VersionModel.fromJson(e)).toList();
  }

  Future<List<CategoryModel>> getCategories() async {
    final data = await _get('/categories');
    final list = data['categories'] ?? data['data'] ?? [];
    return (list as List).map((e) => CategoryModel.fromJson(e)).toList();
  }

  Future<List<AppModel>> getCategoryApps(String slug) async {
    final data = await _get('/apps?category=$slug&limit=50');
    final list = data['apps'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  Future<List<AppModel>> getCategoryAppsById(int categoryId) async {
    final data = await _get('/apps?category_id=$categoryId&limit=50');
    final list = data['apps'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  Future<List<AppModel>> getAllApps() async {
    return getApps(limit: 200);
  }

  Future<List<AppModel>> getUpdates() async {
    final data = await _get('/apps/updates', auth: true);
    final list = data['updates'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  Future<List<AppModel>> getMyDownloads() async {
    final data = await _get('/downloads/my', auth: true);
    final list = data['downloads'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  Future<List<AppModel>> searchApps(String query) async {
    final data = await _get('/apps?search=${Uri.encodeComponent(query)}&limit=50');
    final list = data['apps'] ?? data['data'] ?? [];
    return (list as List).map((e) => AppModel.fromJson(e)).toList();
  }

  String getDownloadUrl(dynamic appId, [dynamic versionId]) {
    if (versionId != null) {
      return '${ApiConfig.baseUrl}/apps/$appId/download/$versionId';
    }
    return '${ApiConfig.baseUrl}/apps/$appId/download';
  }

  String getIconUrl(String? iconPath) {
    if (iconPath == null || iconPath.isEmpty) return '';
    if (iconPath.startsWith('http')) return iconPath;
    final base = ApiConfig.baseUrl.replaceAll('/api', '');
    return '$base$iconPath';
  }

  String getScreenshotUrl(String? screenshotPath) {
    if (screenshotPath == null || screenshotPath.isEmpty) return '';
    if (screenshotPath.startsWith('http')) return screenshotPath;
    final base = ApiConfig.baseUrl.replaceAll('/api', '');
    return '$base$screenshotPath';
  }

  Future<Map<String, dynamic>> checkUpdate(String packageName, int currentVersionCode) async {
    try {
      final data = await _post('/apps/check-update', body: {
        'package_name': packageName,
        'current_version_code': currentVersionCode,
      });
      return data;
    } catch (_) {
      return {'update_available': false};
    }
  }

  Future<List<AppModel>> getFeaturedApps() async {
    return getApps(sort: 'downloads', limit: 20);
  }

  Future<List<AppModel>> getRecentApps() async {
    return getApps(sort: 'updated', limit: 20);
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
