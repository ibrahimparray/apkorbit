import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/category_model.dart';
import '../providers/app_provider.dart';
import '../widgets/app_card.dart';
import 'app_detail_screen.dart';

class CategoryAppsScreen extends StatefulWidget {
  final CategoryModel category;

  const CategoryAppsScreen({super.key, required this.category});

  @override
  State<CategoryAppsScreen> createState() => _CategoryAppsScreenState();
}

class _CategoryAppsScreenState extends State<CategoryAppsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppProvider>(context, listen: false)
          .loadCategoryApps(widget.category.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _parseColor(widget.category.color);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      color,
                      color.withOpacity(0.7),
                    ],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 80, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              _getIcon(widget.category.icon),
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.category.name,
                                style: GoogleFonts.poppins(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                '${widget.category.appCount} apps',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  color: Colors.white.withOpacity(0.8),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          Consumer<AppProvider>(
            builder: (context, provider, _) {
              if (provider.isLoading) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              final apps = provider.allApps;

              if (apps.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.android,
                          size: 64,
                          color: theme.textTheme.bodySmall?.color?.withOpacity(0.3),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No apps in this category',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                            color: theme.textTheme.bodyLarge?.color,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.7,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final app = apps[index];
                      return AppCard(
                        app: app,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => AppDetailScreen(appId: app.id),
                            ),
                          );
                        },
                      );
                    },
                    childCount: apps.length,
                  ),
                ),
              );
            },
          ),
        ],
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
