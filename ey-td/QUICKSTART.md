# EY Tower Defense - Quick Start Guide

Get up and running with the EY Tower Defense game in minutes!

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

**macOS:**
```bash
brew install raylib cmake
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libraylib-dev cmake build-essential
```

**For data processing (optional):**
```bash
pip install pandas openpyxl
```

### 2. Build and Test

```bash
./build_and_test.sh
```

This script will:
- Check all dependencies
- Test the data pipeline
- Build the game
- Verify everything works

### 3. Play the Game

```bash
cd game/build
./ey-td-game
```

## 🎮 How to Play

### Objective
- **Win**: Achieve 100% migration readiness
- **Lose**: Core HP reaches 0

### Gameplay
1. **Click "Shop"** to open the tower store
2. **Select a tower** (Duplicate Detector, Expiry Scanner, etc.)
3. **Click on the map** to place towers
4. **Click "Next Wave"** to start data rows marching
5. **Towers automatically target** enemies with matching flags
6. **Clean data increases readiness**, dirty data damages core

### Tower Types
- 🔵 **Duplicate Detector** - Removes duplicate legal IDs
- 🟠 **Expiry Scanner** - Scans for expired documents  
- 🟢 **Balance Checker** - Validates account balances
- 🔴 **Arrears Radar** - Detects overdue loans

## 📊 Data Processing (Optional)

### Process Real Data
1. Place EY Excel files in `data/raw/`:
   - `*Customer*.xlsx` - Customer records
   - `*CurSav*.xlsx` - Current/Savings accounts
   - `*FixedTerm*.xlsx` - Fixed term accounts
   - `*Loan*.xlsx` - Loan accounts

2. Run data processing:
```bash
cd data/prep
python3 merge_ey.py --in ../raw --out ../outputs --today 2025-01-03
```

3. The game will automatically use the processed data!

## 🛠️ Troubleshooting

### Game Won't Start
- Check if `raylib` is installed: `pkg-config --exists raylib`
- Try running: `./build_and_test.sh` for diagnostics

### Build Errors
- Ensure CMake 3.16+ is installed
- Check C++17 compiler support
- Verify raylib installation

### Data Processing Issues
- Install Python dependencies: `pip install pandas openpyxl`
- Check Excel file formats and column names
- See `data/schema.md` for required columns

## 🎯 Game Tips

### Strategy
- **Start with Duplicate Detectors** - they handle common issues
- **Place towers near lane intersections** for better coverage
- **Balance your defenses** - don't focus on just one type
- **Watch the readiness meter** - aim for steady progress

### Advanced Tips
- **Clean data gives more readiness** than killing dirty data
- **Higher severity enemies** are more valuable when cleaned
- **Plan tower placement** before waves start
- **Upgrade towers** when you have extra funds

## 📁 Project Structure

```
ey-td/
├── game/                 # C++ tower defense game
├── data/                 # Data processing pipeline
├── build_and_test.sh    # Automated build script
└── README.md            # Full documentation
```

## 🔗 Next Steps

- Read the full `README.md` for detailed documentation
- Explore `data/schema.md` for data format details
- Check `game/README.md` for development information
- Customize the game by modifying tower types or adding new features

## 🆘 Need Help?

1. Run `./build_and_test.sh` for automated diagnostics
2. Check the troubleshooting sections in README files
3. Verify your system meets the requirements
4. Review the sample data files in `data/raw/`

---

**Have fun defending the core system! 🏦⚔️**
