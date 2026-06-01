import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/category_model.dart';

class CategoryChip extends StatelessWidget {
  final CategoryModel category;
  final bool isSelected;
  final VoidCallback onTap;

  const CategoryChip({
    super.key,
    required this.category,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _parseColor(category.color);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color : theme.cardTheme.color,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? color : color.withOpacity(0.3),
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (category.icon.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Icon(
                  _getIcon(category.icon),
                  size: 18,
                  color: isSelected ? Colors.white : color,
                ),
              ),
            Text(
              category.name,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? Colors.white : theme.textTheme.bodyLarge?.color,
              ),
            ),
            if (category.appCount > 0)
              Padding(
                padding: const EdgeInsets.only(left: 6),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Colors.white.withOpacity(0.2)
                        : color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${category.appCount}',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? Colors.white : color,
                    ),
                  ),
                ),
              ),
          ],
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
