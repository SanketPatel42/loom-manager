#!/bin/bash

# Grey Loom Manager - Dependency Cleanup Script
# This script removes confirmed unused dependencies to reduce app size

set -e  # Exit on error

echo "🧹 Grey Loom Manager - Dependency Cleanup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Confirm before proceeding
echo "This script will remove unused dependencies to reduce your app size."
echo ""
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    print_warning "Cleanup cancelled"
    exit 1
fi

echo ""
echo "📦 Step 1: Removing database dependencies (drizzle-orm, pg)..."
npm uninstall drizzle-orm pg @types/pg drizzle-kit 2>/dev/null || print_warning "Some packages were not installed"
print_success "Database dependencies removed"

echo ""
echo "📦 Step 2: Removing unused form validation (zod, @hookform/resolvers)..."
npm uninstall @hookform/resolvers zod 2>/dev/null || print_warning "Some packages were not installed"
print_success "Form validation dependencies removed"

echo ""
echo "📦 Step 3: Checking for unused Radix UI components..."

# List of potentially unused Radix components
# These are installed but may not be used in actual pages
POTENTIALLY_UNUSED=(
    "@radix-ui/react-aspect-ratio"
    "@radix-ui/react-avatar"
    "@radix-ui/react-hover-card"
    "@radix-ui/react-navigation-menu"
)

echo "The following Radix components might be unused:"
for pkg in "${POTENTIALLY_UNUSED[@]}"; do
    echo "  - $pkg"
done

echo ""
read -p "Remove potentially unused Radix components? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    for pkg in "${POTENTIALLY_UNUSED[@]}"; do
        npm uninstall "$pkg" 2>/dev/null || print_warning "$pkg was not installed"
    done
    print_success "Unused Radix components removed"
else
    print_warning "Skipped Radix component removal"
fi

echo ""
echo "🗑️  Step 4: Cleaning up database files..."
if [ -d "src/lib/db" ]; then
    rm -rf src/lib/db
    print_success "Removed src/lib/db directory"
fi

if [ -f "drizzle.config.ts" ]; then
    rm -f drizzle.config.ts
    print_success "Removed drizzle.config.ts"
fi

if [ -f "setup-database.sh" ]; then
    rm -f setup-database.sh
    print_success "Removed setup-database.sh"
fi

if [ -d "drizzle" ]; then
    rm -rf drizzle
    print_success "Removed drizzle directory"
fi

echo ""
echo "🧹 Step 5: Cleaning build artifacts..."
rm -rf dist dist-electron release node_modules/.vite
print_success "Build artifacts cleaned"

echo ""
echo "=========================================="
print_success "Cleanup complete!"
echo ""
echo "📊 Expected savings:"
echo "  • Database packages: ~15 MB"
echo "  • Form validation: ~500 KB"
echo "  • Unused Radix components: ~1-2 MB"
echo "  • Total: ~17-20 MB reduction"
echo ""
echo "🔨 Next steps:"
echo "  1. Run: npm run electron:build"
echo "  2. Check the new file sizes in the 'release' folder"
echo ""
echo "Expected final sizes:"
echo "  • macOS DMG: ~85-100 MB (from 139 MB)"
echo "  • Windows EXE: ~65-80 MB (from 111 MB)"
echo ""
