class VersionModel {
  final int id;
  final int appId;
  final String versionName;
  final int versionCode;
  final String changelog;
  final int fileSize;
  final String fileUrl;
  final int minSdk;
  final int targetSdk;
  final bool isCurrent;
  final int downloadsCount;
  final String createdAt;

  VersionModel({
    required this.id,
    required this.appId,
    this.versionName = '',
    this.versionCode = 0,
    this.changelog = '',
    this.fileSize = 0,
    this.fileUrl = '',
    this.minSdk = 21,
    this.targetSdk = 34,
    this.isCurrent = false,
    this.downloadsCount = 0,
    this.createdAt = '',
  });

  factory VersionModel.fromJson(Map<String, dynamic> json) {
    return VersionModel(
      id: json['id'] ?? 0,
      appId: json['app_id'] ?? 0,
      versionName: json['version_name'] ?? json['version'] ?? '',
      versionCode: json['version_code'] ?? 0,
      changelog: json['changelog'] ?? '',
      fileSize: json['file_size'] ?? json['size'] ?? 0,
      fileUrl: json['file_url'] ?? json['download_url'] ?? '',
      minSdk: json['min_sdk'] ?? 21,
      targetSdk: json['target_sdk'] ?? 34,
      isCurrent: json['is_current'] == true || json['is_current'] == 1,
      downloadsCount: json['downloads_count'] ?? json['download_count'] ?? 0,
      createdAt: json['created_at'] ?? '',
    );
  }

  String get formattedSize {
    if (fileSize <= 0) return '—';
    final mb = fileSize / (1024 * 1024);
    return mb >= 1 ? '${mb.toStringAsFixed(1)} MB' : '${(fileSize / 1024).toStringAsFixed(0)} KB';
  }

  String get formattedDownloads {
    if (downloadsCount <= 0) return '0';
    if (downloadsCount >= 1000000) return '${(downloadsCount / 1000000).toStringAsFixed(1)}M';
    if (downloadsCount >= 1000) return '${(downloadsCount / 1000).toStringAsFixed(1)}K';
    return downloadsCount.toString();
  }
}
