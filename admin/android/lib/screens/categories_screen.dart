import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'category_apps_screen.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Categories',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Consumer<AppProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.categories.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.categories.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.category_rounded,
                    size: 80,
                    color: theme.textTheme.bodySmall?.color?.withOpacity(0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No categories available',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: theme.textTheme.bodyLarge?.color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => provider.loadHomeData(),
                    child: const Text('Refresh'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadHomeData(),
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: provider.categories.length,
              itemBuilder: (context, index) {
                final category = provider.categories[index];
                return _buildCategoryCard(context, theme, category, () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CategoryAppsScreen(category: category),
                    ),
                  );
                });
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryCard(
    BuildContext context,
    ThemeData theme,
    category,
    VoidCallback onTap,
  ) {
    final color = _parseColor(category.color);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: theme.cardTheme.color,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      _getIcon(category.icon),
                      size: 28,
                      color: color,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    category.name,
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${category.appCount} apps',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: theme.textTheme.bodySmall?.color,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  IconData _getIcon(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'games':
        return Icons.sports_esports;
      case 'tools':
        return Icons.build;
      case 'social':
        return Icons.people;
      case 'music':
        return Icons.music_note;
      case 'video':
        return Icons.videocam;
      case 'books':
        return Icons.book;
      case 'productivity':
        return Icons.checklist;
      case 'communication':
        return Icons.chat;
      case 'news':
        return Icons.article;
      case 'maps':
        return Icons.map;
      case 'shopping':
        return Icons.shopping_bag;
      case 'health':
        return Icons.favorite;
      case 'education':
        return Icons.school;
      case 'entertainment':
        return Icons.movie;
      case 'finance':
        return Icons.account_balance;
      case 'lifestyle':
        return Icons.spa;
      case 'photography':
        return Icons.camera_alt;
      case 'sports':
        return Icons.fitness_center;
      case 'weather':
        return Icons.wb_sunny;
      case 'business':
        return Icons.business;
      default:
        return Icons.apps;
    }
  }
}
