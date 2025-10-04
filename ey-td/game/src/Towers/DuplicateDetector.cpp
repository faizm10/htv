#include "DuplicateDetector.hpp"
#include "../Enemy.hpp"
#include "../Utils.hpp"
#include <raylib.h>

DuplicateDetector::DuplicateDetector(Vector2 position)
    : Tower(position, TowerType::DUPLICATE_DETECTOR, 50, 120.0f, 1.5f) {
    color = BLUE;
}

void DuplicateDetector::OnFire(Enemy& target) {
    // Create visual effect for duplicate detection
    CreateDuplicateDetectionEffect(target.position);
    
    // Clean duplicate flags
    target.CleanFlag("duplicate_legal_id");
    
    // Special effect: if target has multiple duplicate flags, clean them all
    if (target.HasFlag("duplicate_customer_id")) {
        target.CleanFlag("duplicate_customer_id");
    }
}

void DuplicateDetector::OnUpgrade() {
    // Duplicate detector gets better at finding duplicates with upgrades
    range *= 1.3f; // Better detection range
    fireRate *= 1.2f; // Faster processing
}

std::string DuplicateDetector::GetName() const {
    return "Duplicate Detector";
}

std::string DuplicateDetector::GetDescription() const {
    return "Advanced algorithm to detect and merge duplicate customer records";
}

void DuplicateDetector::CreateDuplicateDetectionEffect(const Vector2& targetPos) {
    // Draw scanning lines effect
    for (int i = 0; i < 8; ++i) {
        float angle = i * PI / 4.0f;
        Vector2 start = {position.x + cos(angle) * 30, position.y + sin(angle) * 30};
        Vector2 end = {targetPos.x + cos(angle) * 10, targetPos.y + sin(angle) * 10};
        
        DrawLineV(start, end, ColorAlpha(BLUE, 0.7f));
    }
    
    // Draw detection circle around target
    DrawCircleLinesV(targetPos, 20.0f, ColorAlpha(BLUE, 0.8f));
}
