#pragma once

#include "../Tower.hpp"

class ArrearsRadar : public Tower {
public:
    ArrearsRadar(Vector2 position);
    
    void OnFire(Enemy& target) override;
    void OnUpgrade() override;
    std::string GetName() const override;
    std::string GetDescription() const override;
    
private:
    void CreateArrearsDetectionEffect(const Vector2& targetPos);
};
