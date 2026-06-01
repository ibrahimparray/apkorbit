class CategoryModel {
  final int id;
  final String name;
  final String icon;
  final String color;
  final int appCount;

  CategoryModel({
    required this.id,
    required this.name,
    this.icon = '',
    this.color = '#4CAF50',
    this.appCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      icon: json['icon'] ?? '',
      color: json['color'] ?? '#4CAF50',
      appCount: json['app_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color,
      'app_count': appCount,
    };
  }
}
