#pragma once

#include "../Tower.hpp"

class ExpiryScanner : public Tower {
public:
    ExpiryScanner(Vector2 position);
    
    void OnFire(Enemy& target) override;
    void OnUpgrade() override;
    std::string GetName() const override;
    std::string GetDescription() const override;
    
private:
    void CreateExpiryScanEffect(const Vector2& targetPos);
    void DrawScanningBeam(const Vector2& targetPos);
};
