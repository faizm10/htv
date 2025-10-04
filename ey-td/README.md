# EY Tower Defense - Bank Merger

A tower defense game that simulates the EY bank merger data validation process. Players defend the core system by placing validation towers to clean data rows as they march toward the core.

## Overview

This project consists of two main components:

1. **Game** (`game/`) - C++17 tower defense game built with raylib
2. **Data Prep** (`data/`) - Python ETL pipeline for processing EY Excel files

## Quick Start

### Prerequisites

- **For the game**: C++17 compiler, CMake, raylib
- **For data prep**: Python 3.10+, pandas, openpyxl

### Installation

#### Game Dependencies

**macOS (Homebrew):**
```bash
brew install raylib cmake
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install libraylib-dev cmake build-essential
```

**Windows:**
```bash
# Using vcpkg
vcpkg install raylib
vcpkg install cmake
```

#### Data Prep Dependencies

```bash
cd data/prep
pip install pandas openpyxl
```

### Building the Game

```bash
cd game
mkdir build
cd build
cmake ..
make
```

### Running Data Preparation

```bash
cd data/prep
python merge_ey.py --in ../raw --out ../outputs --today 2025-01-03
```

### Running the Game

```bash
cd game/build
./ey-td-game
```

## Gameplay

### Objective
- **Win**: Achieve 100% migration readiness
- **Lose**: Core HP reaches 0 or time runs out

### Towers
- **Duplicate Detector** (Blue) - Removes `duplicate_legal_id` flags
- **Expiry Scanner** (Orange) - Removes `expired_legal_id` and `past_maturity_not_closed` flags
- **Balance Checker** (Green) - Removes `dormant_high_balance` and `locked_ratio_gt25` flags
- **Arrears Radar** (Red) - Removes `loan_overdue_120d` and `interest_in_arrears` flags

### Controls
- **Shop Button** - Open tower shop
- **Next Wave** - Start the next wave of data
- **ESC** - Pause/unpause game
- **Right-click** - Cancel tower placement

### Scoring
- **Clean data** reaching core: +readiness percentage
- **Dirty data** reaching core: -core HP
- **Killed enemies**: +funds for tower purchases

## Data Processing

### Input
Place EY Excel files in `data/raw/`:
- `*Customer*.xlsx` - Customer master data
- `*CurSav*.xlsx` - Current/Savings accounts  
- `*FixedTerm*.xlsx` - Fixed term accounts
- `*Loan*.xlsx` - Loan accounts

### Output
The script generates:
- Clean CSV files in `data/outputs/`
- `rows_sample.json` for the game

### Flag Detection
The system automatically detects:
- Expired legal IDs
- Duplicate customer records
- Dormant high-balance accounts
- Overdue loans
- Interest arrears
- And more...

## Project Structure

```
ey-td/
├── game/                    # C++ tower defense game
│   ├── src/                # Source code
│   ├── third_party/        # Dependencies
│   ├── assets/             # Game assets
│   └── CMakeLists.txt      # Build configuration
├── data/                   # Data processing
│   ├── raw/               # Input Excel files
│   ├── prep/              # Python ETL scripts
│   ├── outputs/           # Processed data
│   └── schema.md          # Data schema documentation
└── README.md              # This file
```

## Development

### Adding New Towers
1. Create new tower class in `game/src/Towers/`
2. Inherit from base `Tower` class
3. Implement `OnFire()` and `OnUpgrade()` methods
4. Add to `SceneGame::CreateTower()`

### Adding New Flags
1. Add flag detection logic in `merge_ey.py`
2. Update flag definitions in `schema.md`
3. Create corresponding tower if needed

### Building for Different Platforms

**Emscripten (Web):**
```bash
emcmake cmake ..
emmake make
```

**Cross-compilation:**
See platform-specific CMake configurations.

## Troubleshooting

### Game Won't Build
- Ensure raylib is properly installed
- Check CMake version (3.16+ required)
- Verify C++17 compiler support

### Data Processing Errors
- Check Excel file formats
- Ensure required columns exist
- Verify Python dependencies

### Game Crashes
- Check `rows_sample.json` exists in `data/outputs/`
- Verify file permissions
- Run with debug output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Please ensure compliance with EY data handling policies when using real data.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the schema documentation
3. Create an issue with detailed information
