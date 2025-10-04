#pragma once

#include "../Tower.hpp"

class BalanceChecker : public Tower {
public:
    BalanceChecker(Vector2 position);
    
    void OnFire(Enemy& target) override;
    void OnUpgrade() override;
    std::string GetName() const override;
    std::string GetDescription() const override;
    
private:
    void CreateBalanceCheckEffect(const Vector2& targetPos);
};
