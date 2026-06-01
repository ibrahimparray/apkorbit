import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/app_provider.dart';
import '../widgets/screenshot_carousel.dart';
import '../widgets/stat_badge.dart';

class AppDetailScreen extends StatefulWidget {
  final int appId;

  const AppDetailScreen({super.key, required this.appId});

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppProvider>(context, listen: false)
          .loadAppDetail(widget.appId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Consumer<AppProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.selectedApp == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final app = provider.selectedApp;
          if (app == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64,
                      color: theme.textTheme.bodySmall?.color),
                  const SizedBox(height: 16),
                  Text('App not found',
                      style: GoogleFonts.poppins(fontSize: 18)),
                ],
              ),
            );
          }

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverAppBar(
                expandedHeight: 300,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          theme.colorScheme.primaryContainer,
                          theme.scaffoldBackgroundColor,
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        const Spacer(),
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(22),
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: app.iconUrl.isNotEmpty
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(22),
                                  child: Image.network(
                                    app.iconUrl,
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) =>
                                        const Icon(Icons.android, size: 48),
                                  ),
                                )
                              : const Icon(Icons.android, size: 48, color: Colors.grey),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          app.name,
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          app.developer,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: theme.textTheme.bodySmall?.color,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
                leading: IconButton(
                  icon: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_back_rounded),
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildInstallButton(theme, app),
                      const SizedBox(height: 20),
                      _buildStatsRow(theme, app),
                      const SizedBox(height: 24),
                      if (app.screenshots.isNotEmpty) ...[
                        Text(
                          'Screenshots',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ScreenshotCarousel(screenshots: app.screenshots),
                        const SizedBox(height: 24),
                      ],
                      _buildSectionTitle(context, 'About this app'),
                      const SizedBox(height: 12),
                      _buildDescription(theme, app),
                      const SizedBox(height: 24),
                      if (app.changelog.isNotEmpty) ...[
                        _buildSectionTitle(context, "What's New"),
                        const SizedBox(height: 12),
                        _buildChangelog(theme, app),
                        const SizedBox(height: 24),
                      ],
                      if (provider.selectedAppVersions.isNotEmpty) ...[
                        _buildSectionTitle(context, 'Version History'),
                        const SizedBox(height: 12),
                        ...provider.selectedAppVersions.map(
                          (v) => _buildVersionItem(theme, v),
                        ),
                        const SizedBox(height: 24),
                      ],
                      _buildSectionTitle(context, 'Additional Information'),
                      const SizedBox(height: 12),
                      _buildInfoRow(theme, 'Package Name', app.packageName),
                      _buildInfoRow(theme, 'Category', app.categoryName),
                      _buildInfoRow(theme, 'Size', app.formattedSize),
                      _buildInfoRow(theme, 'Updated', _formatDate(app.updatedAt)),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInstallButton(ThemeData theme, app) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Downloading ${app.name}...'),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: theme.colorScheme.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              app.isInstalled ? Icons.update_rounded : Icons.download_rounded,
              size: 22,
            ),
            const SizedBox(width: 8),
            Text(
              app.isInstalled ? 'Update' : 'Install',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${app.formattedSize}',
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow(ThemeData theme, app) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          StatBadge(
            icon: Icons.star_rounded,
            label: 'Rating',
            value: app.rating,
            color: Colors.amber[600],
          ),
          const SizedBox(width: 8),
          StatBadge(
            icon: Icons.download_rounded,
            label: 'Downloads',
            value: app.formattedDownloads,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(width: 8),
          StatBadge(
            icon: Icons.storage_rounded,
            label: 'Size',
            value: app.formattedSize,
            color: Colors.blue,
          ),
          const SizedBox(width: 8),
          StatBadge(
            icon: Icons.update_rounded,
            label: 'Updated',
            value: _formatDateShort(app.updatedAt),
            color: Colors.orange,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Theme.of(context).textTheme.titleLarge?.color,
      ),
    );
  }

  Widget _buildDescription(ThemeData theme, app) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          app.description.isNotEmpty ? app.description : 'No description available.',
          style: GoogleFonts.poppins(
            fontSize: 14,
            height: 1.6,
            color: theme.textTheme.bodyLarge?.color,
          ),
        ),
      ),
    );
  }

  Widget _buildChangelog(ThemeData theme, app) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                app.latestVersionName,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                app.changelog,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  height: 1.5,
                  color: theme.textTheme.bodyLarge?.color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVersionItem(ThemeData theme, version) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.file_copy_rounded,
                size: 20,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Version ${version.version}',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (version.changelog.isNotEmpty)
                    Text(
                      version.changelog,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: theme.textTheme.bodySmall?.color,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            Text(
              version.size,
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: theme.textTheme.bodySmall?.color,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              _formatDate(version.createdAt),
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: theme.textTheme.bodySmall?.color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(ThemeData theme, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: theme.textTheme.bodySmall?.color,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  String _formatDateShort(String dateStr) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays < 1) return 'Today';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      if (diff.inDays < 30) return '${(diff.inDays / 7).round()}w ago';
      return DateFormat('MMM dd').format(date);
    } catch (_) {
      return dateStr;
    }
  }
}
