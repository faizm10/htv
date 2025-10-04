#include "Enemy.hpp"
#include "Utils.hpp"
#include <algorithm>
#include <cmath>

Enemy::Enemy(const std::string& id, const std::string& room, const std::string& summary,
             const std::vector<std::string>& flags, int severity)
    : id(id), room(room), summary(summary), flags(flags), severity(severity),
      maxHp(severity * 10), hp(maxHp), speed(50.0f), cleaned(false),
      position({0, 0}), targetPosition({0, 0}), currentPathIndex(0),
      flashTimer(0.0f), flashDuration(0.2f), isFlashing(false) {
}

void Enemy::Update(float deltaTime) {
    UpdateMovement(deltaTime);
    UpdateFlash(deltaTime);
}

void Enemy::Draw() const {
    Color enemyColor = WHITE;
    
    // Color based on room type
    if (room == "customers") enemyColor = BLUE;
    else if (room == "accounts") enemyColor = GREEN;
    else if (room == "fixed") enemyColor = YELLOW;
    else if (room == "loans") enemyColor = RED;
    
    // Flash effect
    if (isFlashing) {
        enemyColor = ColorAlpha(enemyColor, 0.3f);
    }
    
    // Draw enemy as a circle
    DrawCircleV(position, 15.0f, enemyColor);
    DrawCircleLinesV(position, 15.0f, BLACK);
    
    // Draw health bar
    if (hp < maxHp) {
        float healthRatio = static_cast<float>(hp) / maxHp;
        Vector2 barPos = {position.x - 20, position.y - 25};
        DrawRectangle(barPos.x, barPos.y, 40, 4, RED);
        DrawRectangle(barPos.x, barPos.y, 40 * healthRatio, 4, GREEN);
    }
    
    // Draw flags as small indicators
    int flagCount = 0;
    for (const auto& flag : flags) {
        Color flagColor = GetFlagColor(flag);
        Vector2 flagPos = {position.x - 10 + flagCount * 8, position.y + 20};
        DrawCircleV(flagPos, 3.0f, flagColor);
        flagCount++;
    }
    
    // Draw "CLEANED" text if cleaned
    if (cleaned) {
        DrawText("CLEANED", position.x - 25, position.y - 40, 10, GREEN);
    }
    
    // Draw summary text
    DrawText(summary.c_str(), position.x - 30, position.y + 30, 8, BLACK);
}

void Enemy::TakeDamage(int damage) {
    hp -= damage;
    if (hp <= 0) {
        hp = 0;
    }
    StartFlash();
}

void Enemy::CleanFlag(const std::string& flag) {
    auto it = std::find(flags.begin(), flags.end(), flag);
    if (it != flags.end()) {
        flags.erase(it);
        StartFlash();
    }
    
    // Mark as cleaned if no flags remain
    if (flags.empty()) {
        cleaned = true;
    }
}

bool Enemy::HasFlag(const std::string& flag) const {
    return std::find(flags.begin(), flags.end(), flag) != flags.end();
}

bool Enemy::IsAtEnd() const {
    return currentPathIndex >= path.size();
}

void Enemy::SetPath(const std::vector<Vector2>& newPath) {
    path = newPath;
    currentPathIndex = 0;
    if (!path.empty()) {
        position = path[0];
        if (path.size() > 1) {
            targetPosition = path[1];
        }
    }
}

void Enemy::MoveAlongPath(float deltaTime) {
    if (path.empty() || currentPathIndex >= path.size()) {
        return;
    }
    
    Vector2 direction = {targetPosition.x - position.x, targetPosition.y - position.y};
    float distance = sqrt(direction.x * direction.x + direction.y * direction.y);
    
    if (distance < 5.0f) {
        // Reached current target, move to next
        currentPathIndex++;
        if (currentPathIndex < path.size()) {
            targetPosition = path[currentPathIndex];
        }
    } else {
        // Move towards target
        direction.x /= distance;
        direction.y /= distance;
        
        float moveDistance = speed * GetSpeedMultiplier() * deltaTime;
        position.x += direction.x * moveDistance;
        position.y += direction.y * moveDistance;
    }
}

void Enemy::StartFlash() {
    isFlashing = true;
    flashTimer = flashDuration;
}

void Enemy::UpdateFlash(float deltaTime) {
    if (isFlashing) {
        flashTimer -= deltaTime;
        if (flashTimer <= 0.0f) {
            isFlashing = false;
        }
    }
}

void Enemy::UpdateMovement(float deltaTime) {
    MoveAlongPath(deltaTime);
}

float Enemy::GetSpeedMultiplier() const {
    // Slower if has more flags (more complex data)
    float multiplier = 1.0f;
    if (flags.size() > 2) {
        multiplier *= 0.7f;
    }
    if (severity > 5) {
        multiplier *= 0.8f;
    }
    return multiplier;
}
