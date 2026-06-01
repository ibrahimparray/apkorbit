import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/category_model.dart';
import '../providers/app_provider.dart';
import '../widgets/app_card.dart';
import '../widgets/category_chip.dart';
import 'app_detail_screen.dart';
import 'categories_screen.dart';
import 'search_screen.dart';
import 'downloads_screen.dart';
import 'updates_screen.dart';
import 'settings_screen.dart';

final CategoryModel _allCategory = CategoryModel(
  id: -1,
  name: 'All',
  icon: 'apps',
  color: '#4CAF50',
  appCount: 0,
);

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  int _selectedCategory = -1;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppProvider>(context, listen: false).loadHomeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final screens = [
      _buildHomeTab(context, theme),
      const CategoriesScreen(),
      const DownloadsScreen(),
      const UpdatesScreen(),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: screens[_selectedIndex],
      ),
      bottomNavigationBar: _buildBottomNav(theme),
    );
  }

  Widget _buildBottomNav(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: theme.scaffoldBackgroundColor,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: theme.textTheme.bodySmall?.color,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.category_rounded), label: 'Categories'),
          BottomNavigationBarItem(icon: Icon(Icons.download_rounded), label: 'Downloads'),
          BottomNavigationBarItem(icon: Icon(Icons.system_update_rounded), label: 'Updates'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_rounded), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildHomeTab(BuildContext context, ThemeData theme) {
    return Consumer<AppProvider>(
      builder: (context, provider, _) {
        return RefreshIndicator(
          onRefresh: () => provider.loadHomeData(),
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverAppBar(
                floating: true,
                pinned: true,
                expandedHeight: 60,
                title: Text(
                  'APK Store',
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleLarge?.color,
                  ),
                ),
                actions: [
                  IconButton(
                    icon: Icon(Icons.search_rounded),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SearchScreen()),
                      );
                    },
                  ),
                ],
              ),
              if (provider.isLoading && provider.featuredApps.isEmpty)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else ...[
                if (provider.error != null)
                  SliverToBoxAdapter(
                    child: _buildErrorBanner(context, provider.error!),
                  ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                    child: _buildSearchBar(context, theme),
                  ),
                ),
                if (provider.categories.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildCategoryRow(context, provider),
                  ),
                if (provider.featuredApps.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildSectionHeader(context, 'Featured Apps'),
                  ),
                if (provider.featuredApps.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildFeaturedRow(provider),
                  ),
                if (provider.recentApps.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildSectionHeader(context, 'Recent Apps'),
                  ),
                if (provider.recentApps.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: _buildRecentGrid(provider),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 80)),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildSearchBar(BuildContext context, ThemeData theme) {
    return Material(
      elevation: 0,
      borderRadius: BorderRadius.circular(28),
      color: theme.inputDecorationTheme.fillColor,
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SearchScreen()),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            children: [
              Icon(Icons.search_rounded, color: theme.textTheme.bodySmall?.color),
              const SizedBox(width: 12),
              Text(
                'Search apps...',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  color: theme.textTheme.bodySmall?.color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryRow(BuildContext context, AppProvider provider) {
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: provider.categories.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: CategoryChip(
                category: _allCategory,
                isSelected: _selectedCategory == -1,
                onTap: () {
                  setState(() => _selectedCategory = -1);
                  provider.loadHomeData();
                },
              ),
            );
          }
          final cat = provider.categories[index - 1];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: CategoryChip(
              category: cat,
              isSelected: _selectedCategory == cat.id,
              onTap: () {
                setState(() => _selectedCategory = cat.id);
                provider.loadCategoryApps(cat.id);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Row(
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: theme.textTheme.titleLarge?.color,
            ),
          ),
          const Spacer(),
          TextButton(
            onPressed: () {},
            child: Text('See all', style: GoogleFonts.poppins(fontSize: 13)),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturedRow(AppProvider provider) {
    return SizedBox(
      height: 260,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: provider.featuredApps.length,
        itemBuilder: (context, index) {
          final app = provider.featuredApps[index];
          return AppCard(
            app: app,
            isFeatured: true,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => AppDetailScreen(appId: app.id),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildRecentGrid(AppProvider provider) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final app = provider.recentApps[index];
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
        childCount: provider.recentApps.length,
      ),
    );
  }

  Widget _buildErrorBanner(BuildContext context, String error) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              error,
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.red[700]),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 16),
            onPressed: () => Provider.of<AppProvider>(context, listen: false).clearError(),
          ),
        ],
      ),
    );
  }
}
