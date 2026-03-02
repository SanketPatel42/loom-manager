# Textile Manufacturing ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed specifically for textile manufacturing operations. Built with React, TypeScript, and enhanced browser storage for robust data management.

## 🏭 Features

### Production Management
- **Beam Records** - Track warping and beam production
- **Taka Management** - Monitor taka stock and folding operations
- **Quality Control** - Manage quality standards and rates
- **Beam Pasar** - Record beam pasar operations

### Workforce Management
- **Worker Profiles** - Maintain worker contact information
- **Machine Sheets** - Track daily/night production across multiple machines
- **Salary Calculator** - Automated wage calculation based on production and quality rates

### Business Operations
- **Sales Management** - Track sales with payment terms and status
- **Purchase Records** - Monitor yarn procurement and inventory
- **Stock Management** - Track yarn inventory by count/danier
- **Transaction Records** - Manage firm transactions with document storage

### Dashboard & Analytics
- **Real-time Dashboard** - Key metrics and daily summaries
- **Production Analytics** - Track performance across all operations
- **Payment Tracking** - Monitor pending and completed payments

### Cloud Backup & Data Recovery
- **Cloud Backup** - One-click backup of all data to Firebase
- **Cloud Restore** - Restore data from cloud when local storage fails
- **Automatic Sync** - Keep your data safe in the cloud
- **Data Recovery** - Recover from data loss or corruption

## 🚀 Quick Start

### Prerequisites

1. **Node.js** - Version 16 or higher
2. **Modern Browser** - Chrome, Firefox, Safari, or Edge with localStorage support

### Installation

1. **Clone and install**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm install
   ```

2. **No additional setup required** - The enhanced storage system works out of the box!

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open application**
   Navigate to `http://localhost:5173`

## 📊 Database Configuration

### Environment Variables
Configure your database connection in `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=textile_erp
NODE_ENV=development
```

### Database Schema
The system uses 11 main tables for comprehensive data management:
- `beams` - Production records
- `takas` - Stock management  
- `worker_profiles` - Employee data
- `qualities` - Quality standards
- `sales` - Sales transactions
- `purchases` - Procurement records
- `firms` - Business partners
- `transactions` - Financial records
- `stock` - Inventory tracking
- `beam_pasar` - Beam operations
- `worker_sheet_data` - Complex production data

## 🔄 Data Migration

### From localStorage to PostgreSQL

The application includes a built-in migration tool accessible from the main dashboard:

1. **Access Migration Tool** - Available on the main dashboard
2. **Check Data** - Tool automatically detects localStorage data
3. **Migrate** - One-click migration to PostgreSQL
4. **Verify** - Confirm successful migration

## ☁️ Cloud Backup

### Firebase Cloud Backup Setup

The application includes a cloud backup feature using Firebase Realtime Database:

1. **Setup Firebase** - See [CLOUD_BACKUP_GUIDE.md](CLOUD_BACKUP_GUIDE.md) for detailed instructions
2. **Configure Credentials** - Add Firebase config to `.env.local`
3. **Backup Data** - One-click backup from the dashboard
4. **Restore Data** - Recover data when local storage fails

**Quick Setup:**
```bash
# Copy environment template
cp .env.example .env.local

# Add your Firebase credentials to .env.local
# Then restart the dev server
npm run dev
```

For complete setup instructions, see [CLOUD_BACKUP_GUIDE.md](CLOUD_BACKUP_GUIDE.md)

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:setup        # Create database
npm run db:generate     # Generate migrations
npm run db:migrate      # Apply migrations
npm run db:studio       # Open Drizzle Studio

# Code Quality
npm run lint            # Run ESLint
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **ShadCN UI** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **AG Grid** - Advanced data grids for complex tables

### Backend/Database
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database operations
- **Node.js** - Runtime environment

### Key Features
- **Async Storage Layer** - Seamless database operations
- **Real-time Updates** - Live data synchronization
- **Error Handling** - Comprehensive error management
- **Loading States** - User-friendly loading indicators
- **Data Validation** - Input validation and sanitization

## 📱 CRUD Operations

All entities support full CRUD operations:

### Create
- Add new records through intuitive forms
- Real-time validation and error handling
- Automatic ID generation and timestamps

### Read
- Fetch and display records with loading states
- Search and filter capabilities
- Pagination for large datasets

### Update
- Edit existing records with pre-populated forms
- Optimistic updates with error rollback
- Change tracking and audit trails

### Delete
- Safe deletion with confirmation dialogs
- Cascade deletion handling
- Soft delete options where appropriate

## 🚀 Production Deployment

### Environment Setup
```env
# Production database
DB_HOST=your-production-host
DB_PORT=5432
DB_USER=your-production-user
DB_PASSWORD=your-secure-password
DB_NAME=textile_erp
NODE_ENV=production
```

### Build and Deploy
```bash
# Build for production
npm run build
```

## 📈 Performance Benefits

### PostgreSQL Advantages
- **Concurrent Access** - Multiple users can access the same data
- **Data Persistence** - Data survives browser clearing and system restarts
- **Backup & Recovery** - Standard PostgreSQL backup procedures
- **Scalability** - Can handle large datasets efficiently
- **ACID Compliance** - Ensures data integrity

### Optimizations
- **Connection Pooling** - Efficient database connections
- **Lazy Loading** - Components loaded on demand
- **Caching** - Strategic data caching
- **Bundle Splitting** - Optimized JavaScript bundles

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Troubleshooting
- Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for database issues
- Verify PostgreSQL is running: `pg_isready`
- Check logs in browser console
- Ensure environment variables are set correctly

For additional support, please open an issue in the repository.

## 🔒 Security & Improvement Report

A detailed analysis of security vulnerabilities, data storage issues, and recommended feature improvements has been generated. 

Please refer to [SECURITY_AND_IMPROVEMENTS.md](SECURITY_AND_IMPROVEMENTS.md) for the full report, which includes:
- **Critical Security Vulnerabilities**: Path traversal risks and insecure Firebase configuration.
- **Data Storage Improvements**: Recommendations for migrating to SQLite and encrypting local data.
- **Feature Roadmap**: Suggestions for cloud sync, multi-user support, and auto-updates.

