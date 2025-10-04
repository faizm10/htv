#include "Map.hpp"
#include <algorithm>

Map::Map() {
    InitializeMap();
    CreateLanes();
    CreateCore();
}

Map::~Map() {
}

void Map::Update(float deltaTime) {
    // Map doesn't need per-frame updates for now
}

void Map::Draw() const {
    // Draw background
    DrawRectangle(0, 0, GameConstants::SCREEN_WIDTH, GameConstants::GAME_AREA_HEIGHT, LIGHTGRAY);
    
    // Draw tiles
    for (const auto& tile : tiles) {
        DrawRectangleV(tile.position, {40, 40}, tile.color);
        if (!tile.isWalkable) {
            DrawRectangleLines(tile.position.x, tile.position.y, 40, 40, DARKGRAY);
        }
    }
    
    // Draw lane paths
    for (int i = 0; i < lanePaths.size(); ++i) {
        const auto& path = lanePaths[i];
        if (path.size() > 1) {
            for (size_t j = 0; j < path.size() - 1; ++j) {
                DrawLineV(path[j], path[j + 1], ColorAlpha(BLUE, 0.7f));
            }
        }
    }
    
    // Draw core system
    DrawRectangleRec(coreArea, ColorAlpha(RED, 0.8f));
    DrawRectangleLinesEx(coreArea, 3, RED);
    
    // Draw core label
    DrawTextCentered("CORE SYSTEM", corePosition.x, corePosition.y - 20, 16, WHITE);
}

bool Map::CanPlaceTower(Vector2 position) const {
    const Tile* tile = GetTileAt(position);
    if (!tile) return false;
    
    return tile->isWalkable && !tile->hasTower;
}

bool Map::PlaceTower(Vector2 position) {
    Tile* tile = GetTileAt(position);
    if (!tile || !CanPlaceTower(position)) {
        return false;
    }
    
    tile->hasTower = true;
    tile->color = ColorAlpha(GREEN, 0.5f);
    return true;
}

void Map::RemoveTower(Vector2 position) {
    Tile* tile = GetTileAt(position);
    if (tile) {
        tile->hasTower = false;
        tile->color = LIGHTGRAY;
    }
}

Vector2 Map::GetNearestValidPosition(Vector2 position) const {
    Vector2 gridPos = WorldToGrid(position);
    
    // Check 3x3 area around the position
    for (int dy = -1; dy <= 1; ++dy) {
        for (int dx = -1; dx <= 1; ++dx) {
            Vector2 checkPos = {gridPos.x + dx, gridPos.y + dy};
            Vector2 worldPos = GridToWorld(checkPos);
            
            if (CanPlaceTower(worldPos)) {
                return worldPos;
            }
        }
    }
    
    return position; // Return original if no valid position found
}

std::vector<Vector2> Map::GetPath(int laneIndex) const {
    if (laneIndex >= 0 && laneIndex < lanePaths.size()) {
        return lanePaths[laneIndex];
    }
    return {};
}

std::vector<Vector2> Map::FindPath(Vector2 start, Vector2 end) const {
    // Simple pathfinding - for now just return a straight line
    // In a more complex implementation, you'd use A* or similar
    std::vector<Vector2> path;
    path.push_back(start);
    path.push_back(end);
    return path;
}

Vector2 Map::GetCorePosition() const {
    return corePosition;
}

Rectangle Map::GetCoreArea() const {
    return coreArea;
}

void Map::InitializeMap() {
    tiles.clear();
    
    // Create a grid of tiles
    int tileSize = 40;
    int tilesX = GameConstants::SCREEN_WIDTH / tileSize;
    int tilesY = GameConstants::GAME_AREA_HEIGHT / tileSize;
    
    for (int y = 0; y < tilesY; ++y) {
        for (int x = 0; x < tilesX; ++x) {
            Tile tile;
            tile.position = {static_cast<float>(x * tileSize), static_cast<float>(y * tileSize)};
            tile.isWalkable = true;
            tile.hasTower = false;
            tile.color = LIGHTGRAY;
            tiles.push_back(tile);
        }
    }
}

void Map::CreateLanes() {
    lanePaths.clear();
    
    // Create paths for each lane
    for (int i = 0; i < GameConstants::LANE_COUNT; ++i) {
        std::vector<Vector2> path;
        float laneY = GameConstants::LANE_START_Y + i * GameConstants::LANE_SPACING;
        
        // Create a path from left to right with some curves
        path.push_back({-50, laneY}); // Start off-screen
        path.push_back({100, laneY});
        path.push_back({300, laneY});
        path.push_back({500, laneY + 20}); // Curve
        path.push_back({700, laneY});
        path.push_back({900, laneY - 10}); // Another curve
        path.push_back({GameConstants::SCREEN_WIDTH - 100, laneY});
        path.push_back({GameConstants::SCREEN_WIDTH + 50, laneY}); // End off-screen
        
        lanePaths.push_back(path);
        
        // Mark tiles along the path as non-walkable for tower placement
        for (const auto& point : path) {
            Vector2 gridPos = WorldToGrid(point);
            Tile* tile = GetTileAt(GridToWorld(gridPos));
            if (tile) {
                tile->isWalkable = false;
                tile->color = ColorAlpha(BLUE, 0.3f);
            }
        }
    }
}

void Map::CreateCore() {
    // Position the core at the right side of the screen
    corePosition = {GameConstants::SCREEN_WIDTH - 80, GameConstants::GAME_AREA_HEIGHT / 2};
    coreArea = {corePosition.x - 40, corePosition.y - 40, 80, 80};
    
    // Mark core area tiles as non-walkable
    Vector2 gridStart = WorldToGrid({coreArea.x, coreArea.y});
    Vector2 gridEnd = WorldToGrid({coreArea.x + coreArea.width, coreArea.y + coreArea.height});
    
    for (int y = gridStart.y; y <= gridEnd.y; ++y) {
        for (int x = gridStart.x; x <= gridEnd.x; ++x) {
            Tile* tile = GetTileAt(GridToWorld({static_cast<float>(x), static_cast<float>(y)}));
            if (tile) {
                tile->isWalkable = false;
                tile->color = ColorAlpha(RED, 0.3f);
            }
        }
    }
}

Tile* Map::GetTileAt(Vector2 position) {
    Vector2 gridPos = WorldToGrid(position);
    int tileSize = 40;
    int tilesX = GameConstants::SCREEN_WIDTH / tileSize;
    int index = static_cast<int>(gridPos.y) * tilesX + static_cast<int>(gridPos.x);
    
    if (index >= 0 && index < tiles.size()) {
        return &tiles[index];
    }
    return nullptr;
}

const Tile* Map::GetTileAt(Vector2 position) const {
    return const_cast<Map*>(this)->GetTileAt(position);
}

Vector2 Map::WorldToGrid(Vector2 worldPos) const {
    return {worldPos.x / 40.0f, worldPos.y / 40.0f};
}

Vector2 Map::GridToWorld(Vector2 gridPos) const {
    return {gridPos.x * 40.0f, gridPos.y * 40.0f};
}
