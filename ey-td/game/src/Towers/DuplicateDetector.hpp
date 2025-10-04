#pragma once

#include "../Tower.hpp"

class DuplicateDetector : public Tower {
public:
    DuplicateDetector(Vector2 position);
    
    void OnFire(Enemy& target) override;
    void OnUpgrade() override;
    std::string GetName() const override;
    std::string GetDescription() const override;
    
private:
    void CreateDuplicateDetectionEffect(const Vector2& targetPos);
};
