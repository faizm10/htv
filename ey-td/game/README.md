# EY Tower Defense Game

C++17 tower defense game built with raylib that simulates EY bank merger data validation.

## Building

### Prerequisites

- C++17 compiler (GCC 7+, Clang 5+, MSVC 2017+)
- CMake 3.16+
- raylib library

### Installation

**macOS:**
```bash
brew install raylib cmake
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libraylib-dev cmake build-essential
```

**Windows:**
```bash
# Using vcpkg
vcpkg install raylib
vcpkg install cmake
```

### Build Steps

```bash
mkdir build
cd build
cmake ..
make
```

The executable `ey-td-game` will be created in the build directory.

## Running

```bash
./ey-td-game
```

The game looks for `../data/outputs/rows_sample.json` by default. If not found, it will use sample data.

## Game Architecture

### Core Classes

- **SceneGame** - Main game loop and state management
- **Map** - Game world with lanes and tower placement
- **WaveManager** - Manages enemy spawning and wave progression
- **Enemy** - Data rows that march toward the core
- **Tower** - Base class for validation towers
- **UI** - User interface and game controls

### Tower Types

1. **DuplicateDetector** - Detects and removes duplicate legal IDs
2. **ExpiryScanner** - Scans for expired legal documentation
3. **BalanceChecker** - Validates account balances
4. **ArrearsRadar** - Identifies overdue loans and arrears

### Game Flow

1. Player places towers to defend against data rows
2. Waves of enemies (data rows) spawn with various flags
3. Towers automatically target enemies with matching flags
4. Clean data increases readiness, dirty data damages core
5. Win at 100% readiness, lose if core HP reaches 0

## Controls

- **Left Click** - Place towers, interact with UI
- **Right Click** - Cancel tower placement
- **ESC** - Pause/unpause game
- **Shop Button** - Open tower shop
- **Next Wave** - Start next wave of enemies

## Data Integration

The game reads from `rows_sample.json` with this structure:

```json
{
  "waves": [
    {
      "lane": 0,
      "rows": [
        {
          "id": "CUST-042",
          "room": "customers",
          "summary": "EN, Toronto, legalId=AB123456",
          "flags": ["expired_legal_id", "duplicate_legal_id"],
          "severity": 7
        }
      ]
    }
  ]
}
```

## Development

### Adding New Towers

1. Create header file in `src/Towers/`
2. Create implementation file
3. Inherit from base `Tower` class
4. Implement required methods:
   - `OnFire(Enemy& target)`
   - `OnUpgrade()`
   - `GetName()`
   - `GetDescription()`

### Adding New Enemy Types

1. Extend `Enemy` class
2. Add new room types
3. Update flag detection logic
4. Modify tower targeting rules

### UI Modifications

The UI system is in `src/UI.cpp`. Key components:
- HUD display (funds, HP, readiness)
- Shop interface
- Game over screens
- Message system

## Debugging

### Common Issues

**Game crashes on startup:**
- Check if `rows_sample.json` exists
- Verify raylib installation
- Check file permissions

**Towers not firing:**
- Verify enemy flags match tower types
- Check range calculations
- Debug targeting logic

**Performance issues:**
- Limit number of enemies
- Optimize drawing calls
- Use object pooling

### Debug Output

The game outputs debug information to console:
- Wave loading status
- Enemy spawning
- Tower placement
- Game state changes

## Asset Management

Assets are stored in `assets/` directory:
- `fonts/` - Font files
- `sfx/` - Sound effects
- `sprites/` - Image files

Currently using raylib's built-in shapes and colors. Add custom assets as needed.

## Platform Support

- **Windows** - Visual Studio, MinGW, Clang
- **macOS** - Xcode, Clang
- **Linux** - GCC, Clang
- **Web** - Emscripten (experimental)

## Performance

Target performance:
- 60 FPS on modern hardware
- <100ms frame times
- Memory usage <100MB

Optimization techniques:
- Object pooling for enemies
- Spatial partitioning for tower targeting
- Efficient rendering batching
- Minimal dynamic allocations

## Testing

Run the game with sample data to verify:
- All towers function correctly
- Enemy pathfinding works
- UI interactions respond
- Game state transitions properly
- Win/lose conditions trigger

## Future Enhancements

- Sound effects and music
- Particle effects for tower firing
- Tower upgrade system
- Multiple difficulty levels
- Save/load game states
- Web deployment with Emscripten
