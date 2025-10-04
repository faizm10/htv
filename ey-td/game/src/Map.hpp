#pragma once

#include <vector>
#include <raylib.h>
#include "Utils.hpp"

struct Tile {
    Vector2 position;
    bool isWalkable;
    bool hasTower;
    Color color;
};

class Map {
public:
    Map();
    ~Map();
    
    // Core methods
    void Update(float deltaTime);
    void Draw() const;
    
    // Tower placement
    bool CanPlaceTower(Vector2 position) const;
    bool PlaceTower(Vector2 position);
    void RemoveTower(Vector2 position);
    Vector2 GetNearestValidPosition(Vector2 position) const;
    
    // Pathfinding
    std::vector<Vector2> GetPath(int laneIndex) const;
    std::vector<Vector2> FindPath(Vector2 start, Vector2 end) const;
    
    // Getters
    int GetLaneCount() const { return GameConstants::LANE_COUNT; }
    Vector2 GetCorePosition() const;
    Rectangle GetCoreArea() const;
    
private:
    std::vector<Tile> tiles;
    std::vector<std::vector<Vector2>> lanePaths;
    
    // Core system
    Vector2 corePosition;
    Rectangle coreArea;
    
    // Helper methods
    void InitializeMap();
    void CreateLanes();
    void CreateCore();
    Tile* GetTileAt(Vector2 position);
    const Tile* GetTileAt(Vector2 position) const;
    Vector2 WorldToGrid(Vector2 worldPos) const;
    Vector2 GridToWorld(Vector2 gridPos) const;
};
