import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';
import '../models/app_model.dart';

class UpdateCheckResult {
  final String packageName;
  final int appId;
  final String appName;
  final String latestVersionName;
  final int latestVersionCode;
  final String? changelog;
  final int? fileSize;
  final bool updateAvailable;

  UpdateCheckResult({
    required this.packageName,
    required this.appId,
    required this.appName,
    required this.latestVersionName,
    required this.latestVersionCode,
    this.changelog,
    this.fileSize,
    this.updateAvailable = false,
  });
}

class UpdateChecker extends ChangeNotifier {
  static final UpdateChecker _instance = UpdateChecker._internal();
  factory UpdateChecker() => _instance;
  UpdateChecker._internal();

  final List<UpdateCheckResult> _availableUpdates = [];
  bool _isChecking = false;

  List<UpdateCheckResult> get availableUpdates => List.unmodifiable(_availableUpdates);
  bool get isChecking => _isChecking;
  bool get hasUpdates => _availableUpdates.isNotEmpty;
  int get updateCount => _availableUpdates.length;

  Future<void> checkForUpdates(List<AppModel> installedApps) async {
    _isChecking = true;
    notifyListeners();

    _availableUpdates.clear();

    for (final app in installedApps) {
      try {
        final result = await _checkSingleApp(app);
        if (result != null && result.updateAvailable) {
          _availableUpdates.add(result);
        }
      } catch (e) {
        debugPrint('Update check failed for ${app.packageName}: $e');
      }
    }

    _isChecking = false;
    notifyListeners();
  }

  Future<UpdateCheckResult?> _checkSingleApp(AppModel installedApp) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/apps/check-update');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'package_name': installedApp.packageName,
          'current_version_code': installedApp.versionCode,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['update_available'] == true) {
          return UpdateCheckResult(
            packageName: installedApp.packageName,
            appId: data['app']['id'],
            appName: data['app']['name'],
            latestVersionName: data['version']['version_name'],
            latestVersionCode: data['version']['version_code'],
            changelog: data['version']['changelog'],
            fileSize: data['version']['file_size'],
            updateAvailable: true,
          );
        }
      }
    } catch (e) {
      debugPrint('Error checking ${installedApp.packageName}: $e');
    }
    return null;
  }

  Future<bool> checkSingleApp(String packageName, int currentVersionCode) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/apps/check-update');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'package_name': packageName,
          'current_version_code': currentVersionCode,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['update_available'] == true;
      }
    } catch (e) {
      debugPrint('Update check error: $e');
    }
    return false;
  }

  void clearUpdates() {
    _availableUpdates.clear();
    notifyListeners();
  }
}
