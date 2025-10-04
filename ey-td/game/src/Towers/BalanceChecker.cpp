#include "BalanceChecker.hpp"
#include "../Enemy.hpp"
#include "../Utils.hpp"
#include <raylib.h>

BalanceChecker::BalanceChecker(Vector2 position)
    : Tower(position, TowerType::BALANCE_CHECKER, 60, 90.0f, 1.2f) {
    color = GREEN;
}

void BalanceChecker::OnFire(Enemy& target) {
    // Create visual effect for balance checking
    CreateBalanceCheckEffect(target.position);
    
    // Clean balance-related flags
    target.CleanFlag("dormant_high_balance");
    if (target.HasFlag("locked_ratio_gt25")) {
        target.CleanFlag("locked_ratio_gt25");
    }
}

void BalanceChecker::OnUpgrade() {
    // Balance checker gets more accurate with upgrades
    range *= 1.15f;
    fireRate *= 1.3f;
}

std::string BalanceChecker::GetName() const {
    return "Balance Checker";
}

std::string BalanceChecker::GetDescription() const {
    return "Validates account balances and checks for dormant high-value accounts";
}

void BalanceChecker::CreateBalanceCheckEffect(const Vector2& targetPos) {
    // Draw balance validation lines
    Vector2 center = targetPos;
    
    // Draw cross pattern for validation
    DrawLine(center.x - 15, center.y, center.x + 15, center.y, ColorAlpha(GREEN, 0.8f));
    DrawLine(center.x, center.y - 15, center.x, center.y + 15, ColorAlpha(GREEN, 0.8f));
    
    // Draw balance symbols
    for (int i = 0; i < 4; ++i) {
        float angle = i * PI / 2.0f;
        Vector2 symbolPos = {
            center.x + cos(angle) * 20,
            center.y + sin(angle) * 20
        };
        DrawCircleV(symbolPos, 3.0f, ColorAlpha(GREEN, 0.7f));
    }
    
    // Draw validation circle
    DrawCircleLinesV(center, 18.0f, ColorAlpha(GREEN, 0.9f));
}
