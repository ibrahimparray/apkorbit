import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:open_file/open_file.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class DownloadProgress {
  final String appId;
  final String appName;
  final double progress;
  final String status;
  final String? filePath;

  DownloadProgress({
    required this.appId,
    required this.appName,
    this.progress = 0,
    this.status = 'idle',
    this.filePath,
  });

  DownloadProgress copyWith({
    String? appId,
    String? appName,
    double? progress,
    String? status,
    String? filePath,
  }) {
    return DownloadProgress(
      appId: appId ?? this.appId,
      appName: appName ?? this.appName,
      progress: progress ?? this.progress,
      status: status ?? this.status,
      filePath: filePath ?? this.filePath,
    );
  }

  Map<String, dynamic> toJson() => {
    'appId': appId,
    'appName': appName,
    'progress': progress,
    'status': status,
    'filePath': filePath,
  };
}

class InstallService extends ChangeNotifier {
  static final InstallService _instance = InstallService._internal();
  factory InstallService() => _instance;
  InstallService._internal();

  final Map<String, DownloadProgress> _downloads = {};
  final Map<String, http.StreamedResponse> _activeDownloads = {};
  bool _isInitialized = false;

  Map<String, DownloadProgress> get downloads => Map.unmodifiable(_downloads);
  List<DownloadProgress> get activeDownloads =>
      _downloads.values.where((d) => d.status == 'downloading').toList();
  List<DownloadProgress> get completedDownloads =>
      _downloads.values.where((d) => d.status == 'completed').toList();

  Future<void> initialize() async {
    if (_isInitialized) return;
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('downloads_history');
    if (saved != null) {
      final list = jsonDecode(saved) as List;
      for (final item in list) {
        final dp = DownloadProgress(
          appId: item['appId'],
          appName: item['appName'],
          progress: (item['progress'] as num).toDouble(),
          status: item['status'],
          filePath: item['filePath'],
        );
        _downloads[dp.appId] = dp;
      }
    }
    _isInitialized = true;
    notifyListeners();
  }

  Future<void> _saveHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final list = _downloads.values.map((d) => d.toJson()).toList();
    await prefs.setString('downloads_history', jsonEncode(list));
  }

  Future<bool> requestStoragePermission() async {
    if (Platform.isAndroid) {
      if (await Permission.storage.isGranted) return true;
      if (await Permission.manageExternalStorage.isGranted) return true;
      final status = await Permission.storage.request();
      if (status.isGranted) return true;
      final manageStatus = await Permission.manageExternalStorage.request();
      return manageStatus.isGranted;
    }
    return true;
  }

  Future<String> getDownloadPath() async {
    final dir = await getApplicationDocumentsDirectory();
    final downloadDir = Directory('${dir.path}/apk_downloads');
    if (!await downloadDir.exists()) {
      await downloadDir.create(recursive: true);
    }
    return downloadDir.path;
  }

  Future<void> downloadAndInstall({
    required String appId,
    required String appName,
    required String packageName,
    required String downloadUrl,
    String versionName = '',
  }) async {
    final hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      _downloads[appId] = DownloadProgress(
        appId: appId,
        appName: appName,
        status: 'permission_denied',
      );
      notifyListeners();
      return;
    }

    _downloads[appId] = DownloadProgress(
      appId: appId,
      appName: appName,
      progress: 0,
      status: 'downloading',
    );
    notifyListeners();

    try {
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(downloadUrl));
      final response = await client.send(request);

      if (response.statusCode != 200) {
        _downloads[appId] = DownloadProgress(
          appId: appId,
          appName: appName,
          status: 'failed',
        );
        notifyListeners();
        return;
      }

      final contentLength = response.contentLength ?? 0;
      final dir = await getDownloadPath();
      final fileName = '${packageName}_${versionName.replaceAll('.', '_')}.apk';
      final file = File('$dir/$fileName');
      _activeDownloads[appId] = response;

      final sink = file.openWrite();
      int received = 0;

      await for (final chunk in response.stream) {
        if (_activeDownloads[appId] == null) break;
        sink.add(chunk);
        received += chunk.length;
        if (contentLength > 0) {
          final pct = (received / contentLength) * 100;
          _downloads[appId] = _downloads[appId]!.copyWith(
            progress: pct.clamp(0, 100),
          );
          notifyListeners();
        }
      }

      await sink.close();
      client.close();
      _activeDownloads.remove(appId);

      if (_downloads[appId]?.status == 'cancelled') {
        if (await file.exists()) await file.delete();
        return;
      }

      _downloads[appId] = _downloads[appId]!.copyWith(
        progress: 100,
        status: 'completed',
        filePath: file.path,
      );
      notifyListeners();
      await _saveHistory();

      await installApk(file.path);
    } catch (e) {
      _downloads[appId] = DownloadProgress(
        appId: appId,
        appName: appName,
        status: 'failed',
      );
      notifyListeners();
    }
  }

  Future<void> installApk(String filePath) async {
    try {
      final result = await OpenFile.open(filePath);
      if (result.type != ResultType.done) {
        debugPrint('OpenFile error: ${result.message}');
      }
    } catch (e) {
      debugPrint('Install error: $e');
    }
  }

  void cancelDownload(String appId) {
    _activeDownloads.remove(appId);
    if (_downloads.containsKey(appId)) {
      _downloads[appId] = _downloads[appId]!.copyWith(status: 'cancelled');
      notifyListeners();
    }
  }

  void clearDownload(String appId) {
    _downloads.remove(appId);
    _saveHistory();
    notifyListeners();
  }

  DownloadProgress? getDownload(String appId) => _downloads[appId];
}
