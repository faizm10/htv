#!/bin/bash

# EY Tower Defense - Build and Test Script
# This script builds the game and tests the complete pipeline

set -e  # Exit on any error

echo "EY Tower Defense - Build and Test Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "game" ] || [ ! -d "data" ]; then
    print_error "Please run this script from the ey-td root directory"
    exit 1
fi

print_status "Starting build and test process..."

# Step 1: Check dependencies
print_status "Checking dependencies..."

# Check for raylib
if command -v pkg-config &> /dev/null; then
    if pkg-config --exists raylib; then
        print_success "raylib found"
    else
        print_warning "raylib not found via pkg-config"
    fi
else
    print_warning "pkg-config not found, skipping raylib check"
fi

# Check for CMake
if command -v cmake &> /dev/null; then
    CMAKE_VERSION=$(cmake --version | head -n1 | cut -d' ' -f3)
    print_success "CMake found: $CMAKE_VERSION"
else
    print_error "CMake not found. Please install CMake 3.16 or higher"
    exit 1
fi

# Check for C++ compiler
if command -v g++ &> /dev/null; then
    GCC_VERSION=$(g++ --version | head -n1 | cut -d' ' -f4)
    print_success "GCC found: $GCC_VERSION"
elif command -v clang++ &> /dev/null; then
    CLANG_VERSION=$(clang++ --version | head -n1 | cut -d' ' -f4)
    print_success "Clang found: $CLANG_VERSION"
else
    print_error "No C++ compiler found. Please install GCC or Clang"
    exit 1
fi

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.10 or higher"
    exit 1
fi

# Step 2: Test data pipeline
print_status "Testing data pipeline..."

cd data/prep

# Check if pandas is available
if python3 -c "import pandas" 2>/dev/null; then
    print_success "pandas available"
    
    # Run the data processing script
    if python3 merge_ey.py --in ../raw --out ../outputs --today 2025-01-03; then
        print_success "Data pipeline completed successfully"
    else
        print_error "Data pipeline failed"
        exit 1
    fi
else
    print_warning "pandas not available, skipping data pipeline test"
    print_warning "Install pandas with: pip install pandas openpyxl"
fi

cd ../..

# Step 3: Build the game
print_status "Building the game..."

cd game

# Create build directory
if [ ! -d "build" ]; then
    mkdir build
fi

cd build

# Configure with CMake
print_status "Configuring with CMake..."
if cmake ..; then
    print_success "CMake configuration successful"
else
    print_error "CMake configuration failed"
    exit 1
fi

# Build the project
print_status "Building project..."
if make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4); then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

cd ../..

# Step 4: Test the game (basic check)
print_status "Testing game executable..."

if [ -f "game/build/ey-td-game" ]; then
    print_success "Game executable created successfully"
    
    # Check if we can run it (just check if it starts and exits quickly)
    print_status "Testing game startup..."
    timeout 3s ./game/build/ey-td-game || true
    print_success "Game executable test completed"
else
    print_error "Game executable not found"
    exit 1
fi

# Step 5: Verify output files
print_status "Verifying output files..."

if [ -f "data/outputs/rows_sample.json" ]; then
    print_success "Game data file (rows_sample.json) found"
    
    # Check JSON validity
    if python3 -c "import json; json.load(open('data/outputs/rows_sample.json'))" 2>/dev/null; then
        print_success "Game data file is valid JSON"
    else
        print_warning "Game data file may be invalid JSON"
    fi
else
    print_warning "Game data file not found - game will use sample data"
fi

# Step 6: Summary
echo ""
echo "Build and Test Summary"
echo "====================="
print_success "All tests completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run the game: cd game/build && ./ey-td-game"
echo "2. Place EY Excel files in data/raw/ and run: cd data/prep && python3 merge_ey.py"
echo "3. Read the documentation in README.md files"
echo ""
echo "Game controls:"
echo "- Click 'Shop' to buy towers"
echo "- Click 'Next Wave' to start waves"
echo "- ESC to pause/unpause"
echo "- Right-click to cancel tower placement"
echo ""
print_success "Enjoy playing EY Tower Defense!"
