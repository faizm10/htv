#pragma once

#include <string>
#include <vector>
#include <raylib.h>

class Enemy {
public:
    std::string id;
    std::string room;          // "customers", "accounts", "fixed", "loans"
    std::string summary;
    std::vector<std::string> flags;
    int severity;
    int hp;
    int maxHp;
    float speed;
    bool cleaned;
    
    // Position and movement
    Vector2 position;
    Vector2 targetPosition;
    int currentPathIndex;
    std::vector<Vector2> path;
    
    // Visual effects
    float flashTimer;
    float flashDuration;
    bool isFlashing;
    
    // Constructor
    Enemy(const std::string& id, const std::string& room, const std::string& summary,
          const std::vector<std::string>& flags, int severity);
    
    // Core methods
    void Update(float deltaTime);
    void Draw() const;
    void TakeDamage(int damage);
    void CleanFlag(const std::string& flag);
    bool HasFlag(const std::string& flag) const;
    bool IsAtEnd() const;
    
    // Pathfinding
    void SetPath(const std::vector<Vector2>& newPath);
    void MoveAlongPath(float deltaTime);
    
    // Visual effects
    void StartFlash();
    void UpdateFlash(float deltaTime);
    
private:
    void UpdateMovement(float deltaTime);
    float GetSpeedMultiplier() const;
};
