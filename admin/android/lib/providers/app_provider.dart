import 'package:flutter/foundation.dart';
import '../models/app_model.dart';
import '../models/version_model.dart';
import '../models/category_model.dart';
import '../services/api_service.dart';

class AppProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<AppModel> _featuredApps = [];
  List<AppModel> _recentApps = [];
  List<AppModel> _allApps = [];
  List<CategoryModel> _categories = [];
  List<AppModel> _searchResults = [];
  List<AppModel> _updates = [];
  List<AppModel> _downloads = [];
  AppModel? _selectedApp;
  List<VersionModel> _selectedAppVersions = [];
  bool _isLoading = false;
  String? _error;
  bool _isLoggedIn = false;
  String _currentPage = 'home';

  List<AppModel> get featuredApps => _featuredApps;
  List<AppModel> get recentApps => _recentApps;
  List<AppModel> get allApps => _allApps;
  List<CategoryModel> get categories => _categories;
  List<AppModel> get searchResults => _searchResults;
  List<AppModel> get updates => _updates;
  List<AppModel> get downloads => _downloads;
  AppModel? get selectedApp => _selectedApp;
  List<VersionModel> get selectedAppVersions => _selectedAppVersions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _isLoggedIn;
  String get currentPage => _currentPage;

  void setCurrentPage(String page) {
    _currentPage = page;
    notifyListeners();
  }

  Future<void> checkLoginStatus() async {
    final token = await _apiService.token;
    _isLoggedIn = token != null;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _apiService.login(username, password);
      _isLoggedIn = true;
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register(String username, String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _apiService.register(username, email, password);
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _apiService.logout();
    _isLoggedIn = false;
    _featuredApps = [];
    _recentApps = [];
    _allApps = [];
    _categories = [];
    _searchResults = [];
    _updates = [];
    _downloads = [];
    _selectedApp = null;
    _selectedAppVersions = [];
    notifyListeners();
  }

  Future<void> loadHomeData() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final results = await Future.wait([
        _apiService.getFeaturedApps(),
        _apiService.getRecentApps(),
        _apiService.getCategories(),
      ]);

      _featuredApps = results[0] as List<AppModel>;
      _recentApps = results[1] as List<AppModel>;
      _categories = results[2] as List<CategoryModel>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadAllApps() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      _allApps = await _apiService.getAllApps();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadAppDetail(int id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final results = await Future.wait([
        _apiService.getAppDetail(id),
        _apiService.getAppVersions(id),
      ]);

      _selectedApp = results[0] as AppModel;
      _selectedAppVersions = results[1] as List<VersionModel>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchApps(String query) async {
    if (query.isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }
    try {
      _isLoading = true;
      notifyListeners();
      _searchResults = await _apiService.searchApps(query);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadCategoryApps(int categoryId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      final apps = await _apiService.getCategoryAppsById(categoryId);
      if (_allApps.isEmpty) {
        _allApps = apps;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadUpdates() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      _updates = await _apiService.getUpdates();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadDownloads() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      _downloads = await _apiService.getMyDownloads();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
