#include "Tower.hpp"
#include "Enemy.hpp"
#include "Utils.hpp"
#include <algorithm>
#include <cmath>

Tower::Tower(Vector2 pos, TowerType type, int cost, float range, float fireRate)
    : position(pos), range(range), fireRate(fireRate), cost(cost), towerType(type),
      lastFireTime(0.0f), level(1), maxLevel(3), color(WHITE), rotation(0.0f) {
    
    // Set target flag based on tower type
    switch (type) {
        case TowerType::DUPLICATE_DETECTOR:
            targetFlag = "duplicate_legal_id";
            color = BLUE;
            break;
        case TowerType::EXPIRY_SCANNER:
            targetFlag = "expired_legal_id";
            color = ORANGE;
            break;
        case TowerType::BALANCE_CHECKER:
            targetFlag = "dormant_high_balance";
            color = GREEN;
            break;
        case TowerType::ARREARS_RADAR:
            targetFlag = "loan_overdue_120d";
            color = RED;
            break;
    }
}

void Tower::Update(float deltaTime, const std::vector<Enemy*>& enemies) {
    UpdateRotation(deltaTime);
    TryFire(enemies);
}

void Tower::Draw() const {
    // Draw tower base
    DrawCircleV(position, 20.0f, color);
    DrawCircleLinesV(position, 20.0f, BLACK);
    
    // Draw tower top (rotating part)
    Vector2 topPos = {position.x + cos(rotation) * 15, position.y + sin(rotation) * 15};
    DrawLine(position.x, position.y, topPos.x, topPos.y, BLACK);
    DrawCircleV(topPos, 5.0f, BLACK);
    
    // Draw level indicator
    for (int i = 0; i < level; ++i) {
        Vector2 levelPos = {position.x - 15 + i * 8, position.y + 25};
        DrawCircleV(levelPos, 3.0f, GOLD);
    }
    
    // Draw range when selected (would be implemented in UI)
    // DrawRange();
}

void Tower::TryFire(const std::vector<Enemy*>& enemies) {
    float currentTime = GetTime();
    if (currentTime - lastFireTime < 1.0f / fireRate) {
        return;
    }
    
    Enemy* target = FindTarget(enemies);
    if (target) {
        OnFire(*target);
        lastFireTime = currentTime;
    }
}

void Tower::Upgrade() {
    if (level < maxLevel) {
        level++;
        range *= 1.2f;
        fireRate *= 1.3f;
        OnUpgrade();
    }
}

void Tower::DrawRange() const {
    DrawCircleLines(position.x, position.y, range, ColorAlpha(GRAY, 0.3f));
}

bool Tower::CanAffordUpgrade(int playerFunds) const {
    return playerFunds >= GetUpgradeCost() && level < maxLevel;
}

int Tower::GetUpgradeCost() const {
    return cost * level;
}

bool Tower::IsInRange(const Enemy& enemy) const {
    float dx = enemy.position.x - position.x;
    float dy = enemy.position.y - position.y;
    float distance = sqrt(dx * dx + dy * dy);
    return distance <= range;
}

Enemy* Tower::FindTarget(const std::vector<Enemy*>& enemies) const {
    Enemy* bestTarget = nullptr;
    float closestDistance = range + 1.0f;
    
    for (Enemy* enemy : enemies) {
        if (!enemy->HasFlag(targetFlag) || enemy->cleaned) {
            continue;
        }
        
        if (IsInRange(*enemy)) {
            float dx = enemy->position.x - position.x;
            float dy = enemy->position.y - position.y;
            float distance = sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                bestTarget = enemy;
            }
        }
    }
    
    return bestTarget;
}

int Tower::GetSellValue() const {
    return (cost * level) / 2;
}

std::string Tower::GetName() const {
    switch (towerType) {
        case TowerType::DUPLICATE_DETECTOR: return "Duplicate Detector";
        case TowerType::EXPIRY_SCANNER: return "Expiry Scanner";
        case TowerType::BALANCE_CHECKER: return "Balance Checker";
        case TowerType::ARREARS_RADAR: return "Arrears Radar";
        default: return "Unknown Tower";
    }
}

std::string Tower::GetDescription() const {
    switch (towerType) {
        case TowerType::DUPLICATE_DETECTOR: 
            return "Detects and removes duplicate legal IDs";
        case TowerType::EXPIRY_SCANNER: 
            return "Scans for expired legal documentation";
        case TowerType::BALANCE_CHECKER: 
            return "Checks for dormant accounts with high balances";
        case TowerType::ARREARS_RADAR: 
            return "Identifies overdue loans and arrears";
        default: 
            return "Unknown tower functionality";
    }
}

void Tower::OnFire(Enemy& target) {
    // Create visual effect
    DrawCircleLines(position.x, position.y, range, ColorAlpha(color, 0.5f));
    
    // Clean the target flag
    target.CleanFlag(targetFlag);
    
    // Play sound effect (placeholder)
    // PlaySound(soundEffect);
}

void Tower::OnUpgrade() {
    // Tower-specific upgrade logic can be overridden
}

float Tower::GetDamage() const {
    return 1.0f + (level - 1) * 0.5f;
}

Color Tower::GetTowerColor() const {
    return color;
}

void Tower::UpdateRotation(float deltaTime) {
    rotation += deltaTime * 2.0f; // Slow rotation
}
