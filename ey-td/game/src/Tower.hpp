#pragma once

#include <string>
#include <vector>
#include <raylib.h>

class Enemy;

enum class TowerType {
    DUPLICATE_DETECTOR,
    EXPIRY_SCANNER,
    BALANCE_CHECKER,
    ARREARS_RADAR
};

class Tower {
public:
    virtual ~Tower() = default;
    Vector2 position;
    float range;
    float fireRate;
    int cost;
    TowerType towerType;
    std::string targetFlag;
    
    // Game state
    float lastFireTime;
    int level;
    int maxLevel;
    
    // Visual
    Color color;
    float rotation;
    
    // Constructor
    Tower(Vector2 pos, TowerType type, int cost, float range = 100.0f, float fireRate = 1.0f);
    
    // Core methods
    virtual void Update(float deltaTime, const std::vector<Enemy*>& enemies);
    virtual void Draw() const;
    virtual void TryFire(const std::vector<Enemy*>& enemies);
    virtual void Upgrade();
    virtual void DrawRange() const;
    
    // Utility methods
    bool CanAffordUpgrade(int playerFunds) const;
    int GetUpgradeCost() const;
    bool IsInRange(const Enemy& enemy) const;
    Enemy* FindTarget(const std::vector<Enemy*>& enemies) const;
    
    // Getters
    int GetSellValue() const;
    virtual std::string GetName() const;
    virtual std::string GetDescription() const;
    
protected:
    virtual void OnFire(Enemy& target);
    virtual void OnUpgrade();
    float GetDamage() const;
    Color GetTowerColor() const;
    
private:
    void UpdateRotation(float deltaTime);
};
