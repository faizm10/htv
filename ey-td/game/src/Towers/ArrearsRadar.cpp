#include "ArrearsRadar.hpp"
#include "../Enemy.hpp"
#include "../Utils.hpp"
#include <raylib.h>

ArrearsRadar::ArrearsRadar(Vector2 position)
    : Tower(position, TowerType::ARREARS_RADAR, 80, 110.0f, 0.8f) {
    color = RED;
}

void ArrearsRadar::OnFire(Enemy& target) {
    // Create visual effect for arrears detection
    CreateArrearsDetectionEffect(target.position);
    
    // Clean arrears-related flags
    target.CleanFlag("loan_overdue_120d");
    if (target.HasFlag("interest_in_arrears")) {
        target.CleanFlag("interest_in_arrears");
    }
}

void ArrearsRadar::OnUpgrade() {
    // Arrears radar gets better detection range with upgrades
    range *= 1.25f;
    fireRate *= 1.2f;
}

std::string ArrearsRadar::GetName() const {
    return "Arrears Radar";
}

std::string ArrearsRadar::GetDescription() const {
    return "Advanced radar system to detect overdue loans and interest arrears";
}

void ArrearsRadar::CreateArrearsDetectionEffect(const Vector2& targetPos) {
    // Draw radar sweep effect
    static float sweepAngle = 0.0f;
    sweepAngle += GetFrameTime() * 3.0f;
    
    // Draw radar sweep lines
    for (int i = 0; i < 3; ++i) {
        float angle = sweepAngle + i * 2.0f * PI / 3.0f;
        Vector2 sweepEnd = {
            targetPos.x + cos(angle) * 25,
            targetPos.y + sin(angle) * 25
        };
        DrawLineV(targetPos, sweepEnd, ColorAlpha(RED, 0.6f));
    }
    
    // Draw radar detection rings
    for (int i = 1; i <= 3; ++i) {
        float radius = i * 8.0f;
        DrawCircleLinesV(targetPos, radius, ColorAlpha(RED, 0.5f));
    }
    
    // Draw warning indicators
    for (int i = 0; i < 8; ++i) {
        float angle = i * PI / 4.0f;
        Vector2 warningPos = {
            targetPos.x + cos(angle) * 30,
            targetPos.y + sin(angle) * 30
        };
        DrawCircleV(warningPos, 2.0f, ColorAlpha(RED, 0.8f));
    }
}
