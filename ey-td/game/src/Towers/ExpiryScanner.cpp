#include "ExpiryScanner.hpp"
#include "../Enemy.hpp"
#include "../Utils.hpp"
#include <raylib.h>

ExpiryScanner::ExpiryScanner(Vector2 position)
    : Tower(position, TowerType::EXPIRY_SCANNER, 75, 100.0f, 1.0f) {
    color = ORANGE;
}

void ExpiryScanner::OnFire(Enemy& target) {
    // Create visual effect for expiry scanning
    CreateExpiryScanEffect(target.position);
    DrawScanningBeam(target.position);
    
    // Clean expiry-related flags
    target.CleanFlag("expired_legal_id");
    if (target.HasFlag("past_maturity_not_closed")) {
        target.CleanFlag("past_maturity_not_closed");
    }
}

void ExpiryScanner::OnUpgrade() {
    // Expiry scanner gets more thorough with upgrades
    fireRate *= 1.4f; // Faster scanning
    // Can detect more expiry types at higher levels
}

std::string ExpiryScanner::GetName() const {
    return "Expiry Scanner";
}

std::string ExpiryScanner::GetDescription() const {
    return "Scans documents for expiration dates and validates legal compliance";
}

void ExpiryScanner::CreateExpiryScanEffect(const Vector2& targetPos) {
    // Draw scanning beam from tower to target
    DrawLineV(position, targetPos, ColorAlpha(ORANGE, 0.8f));
    
    // Draw expiry check marks around target
    for (int i = 0; i < 6; ++i) {
        float angle = i * PI / 3.0f;
        Vector2 checkPos = {
            targetPos.x + cos(angle) * 25,
            targetPos.y + sin(angle) * 25
        };
        DrawCircleV(checkPos, 4.0f, ColorAlpha(ORANGE, 0.6f));
    }
    
    // Draw validation circle
    DrawCircleLinesV(targetPos, 15.0f, ColorAlpha(ORANGE, 0.9f));
}

void ExpiryScanner::DrawScanningBeam(const Vector2& targetPos) {
    // Draw animated scanning beam
    static float beamWidth = 5.0f;
    static float beamAnimation = 0.0f;
    beamAnimation += GetFrameTime();
    
    float beamIntensity = (sin(beamAnimation * 10.0f) + 1.0f) / 2.0f;
    
    // Draw thick beam with varying intensity
    Vector2 beamStart = position;
    Vector2 beamEnd = targetPos;
    
    for (int i = 0; i < beamWidth; ++i) {
        Color beamColor = ColorAlpha(ORANGE, beamIntensity * 0.7f);
        DrawLine(beamStart.x + i, beamStart.y, beamEnd.x + i, beamEnd.y, beamColor);
    }
}
