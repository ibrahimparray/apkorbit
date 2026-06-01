# Private App Store / App Hub

Self-hosted private Android APK marketplace with web admin panel and Android client.

## Project Structure

```
apk-store/
├── backend/          # Node.js + Express API server (port 5000)
├── frontend/
│   ├── admin/        # Next.js admin panel (port 2000)
│   └── store/        # Next.js public storefront (port 6000)
```

## Quick Start

### 1. Database
```bash
mysql -u root < backend/database/schema.sql
```

### 2. Backend API
```bash
cd backend
npm install
npm run migrate
npm run dev
```

### 3. Frontend (Admin Panel)
```bash
cd frontend/admin
npm install
npm run dev
```

### 4. Storefront (Public App Store)
```bash
cd frontend/store
npm install
npm run dev
```

### 5. Android App
```bash
cd frontend/admin/android  # or android/ in project root
flutter pub get
flutter run
```

## Default Login
- **Email:** admin@apkstore.local
- **Password:** admin123

## Tech Stack
- **Backend:** Node.js + Express + MySQL
- **Frontend:** Next.js + Tailwind CSS + Framer Motion
- **Android:** Flutter (Dart)
- **Auth:** JWT
