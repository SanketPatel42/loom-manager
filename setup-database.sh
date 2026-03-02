#!/bin/bash

echo "🚀 Setting up PostgreSQL database for Textile ERP..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    echo "   Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed and running"

# Create database
echo "📦 Creating database..."
createdb textile_erp 2>/dev/null || echo "Database textile_erp already exists"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate migrations
echo "🔄 Generating database schema..."
npm run db:generate

# Apply migrations
echo "🔄 Applying migrations to database..."
npm run db:migrate

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open your browser and navigate to the application"
echo "3. Use the Migration Tool in the dashboard to migrate existing localStorage data"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: textile_erp"
echo "  User: postgres"
echo ""
echo "You can view and manage your database using:"
echo "  - Drizzle Studio: npm run db:studio"
echo "  - psql: psql -d textile_erp"