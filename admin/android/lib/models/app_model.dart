class AppModel {
  final int id;
  final String name;
  final String packageName;
  final String iconUrl;
  final String description;
  final String shortDescription;
  final String latestVersionName;
  final int latestVersionCode;
  final String categoryName;
  final int categoryId;
  final String categorySlug;
  final String categoryColor;
  final double rating;
  final int totalDownloads;
  final int fileSize;
  final String updatedAt;
  final String createdAt;
  final String changelog;
  final List<String> screenshots;
  final bool isFeatured;
  final bool isPublished;
  final bool isArchived;
  final bool isInstalled;
  final bool hasUpdate;
  final int versionCode;
  final String versionName;
  final String websiteUrl;
  final String slug;
  final String developer;

  AppModel({
    required this.id,
    required this.name,
    required this.packageName,
    this.iconUrl = '',
    this.description = '',
    this.shortDescription = '',
    this.latestVersionName = '',
    this.latestVersionCode = 0,
    this.categoryName = '',
    this.categoryId = 0,
    this.categorySlug = '',
    this.categoryColor = '#6366f1',
    this.rating = 0,
    this.totalDownloads = 0,
    this.fileSize = 0,
    this.updatedAt = '',
    this.createdAt = '',
    this.changelog = '',
    this.screenshots = const [],
    this.isFeatured = false,
    this.isPublished = true,
    this.isArchived = false,
    this.isInstalled = false,
    this.hasUpdate = false,
    this.versionCode = 0,
    this.versionName = '',
    this.websiteUrl = '',
    this.slug = '',
    this.developer = '',
  });

  factory AppModel.fromJson(Map<String, dynamic> json) {
    return AppModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      packageName: json['package_name'] ?? '',
      iconUrl: json['icon_url'] ?? '',
      description: json['description'] ?? '',
      shortDescription: json['short_description'] ?? '',
      latestVersionName: json['version_name'] ?? json['latest_version_name'] ?? '',
      latestVersionCode: json['version_code'] ?? json['latest_version_code'] ?? 0,
      categoryName: json['category_name'] ?? json['category'] ?? '',
      categoryId: json['category_id'] ?? 0,
      categorySlug: json['category_slug'] ?? '',
      categoryColor: json['category_color'] ?? json['color'] ?? '#6366f1',
      rating: (json['rating'] ?? 0).toDouble(),
      totalDownloads: json['total_downloads'] ?? json['download_count'] ?? 0,
      fileSize: json['file_size'] ?? json['size'] ?? 0,
      updatedAt: json['updated_at'] ?? '',
      createdAt: json['created_at'] ?? '',
      changelog: json['changelog'] ?? '',
      screenshots: _parseScreenshots(json['screenshots']),
      isFeatured: json['is_featured'] == true || json['is_featured'] == 1,
      isPublished: json['is_published'] == true || json['is_published'] == 1,
      isArchived: json['is_archived'] == true || json['is_archived'] == 1,
      isInstalled: json['is_installed'] == true || json['is_installed'] == 1,
      hasUpdate: json['has_update'] == true || json['has_update'] == 1,
      versionCode: json['version_code'] ?? 0,
      versionName: json['version_name'] ?? '',
      websiteUrl: json['website_url'] ?? '',
      slug: json['slug'] ?? '',
      developer: json['developer'] ?? json['author'] ?? json['creator'] ?? '',
    );
  }

  static List<String> _parseScreenshots(dynamic screenshots) {
    if (screenshots == null) return [];
    if (screenshots is List) {
      return screenshots.map((e) => e.toString()).toList();
    }
    if (screenshots is String) {
      try {
        final parsed = _parseJsonString(screenshots);
        if (parsed is List) {
          return parsed.map((e) => e.toString()).toList();
        }
      } catch (_) {}
    }
    return [];
  }

  static dynamic _parseJsonString(String str) {
    try {
      return jsonDecode(str);
    } catch (_) {
      return str;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'package_name': packageName,
      'icon_url': iconUrl,
      'description': description,
      'short_description': shortDescription,
      'version_name': latestVersionName,
      'version_code': latestVersionCode,
      'category_name': categoryName,
      'category_id': categoryId,
      'category_slug': categorySlug,
      'category_color': categoryColor,
      'rating': rating,
      'total_downloads': totalDownloads,
      'file_size': fileSize,
      'updated_at': updatedAt,
      'created_at': createdAt,
      'changelog': changelog,
      'screenshots': screenshots,
      'is_featured': isFeatured,
      'is_published': isPublished,
      'is_archived': isArchived,
      'is_installed': isInstalled,
      'has_update': hasUpdate,
      'version_code': versionCode,
      'version_name': versionName,
      'website_url': websiteUrl,
      'slug': slug,
      'developer': developer,
    };
  }

  String get formattedSize {
    if (fileSize <= 0) return '—';
    final mb = fileSize / (1024 * 1024);
    return mb >= 1 ? '${mb.toStringAsFixed(1)} MB' : '${(fileSize / 1024).toStringAsFixed(0)} KB';
  }

  String get formattedDownloads {
    if (totalDownloads <= 0) return '0';
    if (totalDownloads >= 1000000) return '${(totalDownloads / 1000000).toStringAsFixed(1)}M';
    if (totalDownloads >= 1000) return '${(totalDownloads / 1000).toStringAsFixed(1)}K';
    return totalDownloads.toString();
  }
}
