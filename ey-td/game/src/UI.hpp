#pragma once

#include <vector>
#include <raylib.h>
#include "Tower.hpp"

enum class UIState {
    MAIN_MENU,
    GAME_PLAYING,
    GAME_PAUSED,
    SHOP_OPEN,
    GAME_OVER,
    GAME_WON
};

struct ShopItem {
    TowerType towerType;
    std::string name;
    std::string description;
    int cost;
    Color color;
};

class UI {
public:
    UI();
    ~UI();
    
    // Core methods
    void Update(float deltaTime);
    void Draw() const;
    
    // Input handling
    void HandleInput();
    bool IsMouseOverUI() const;
    
    // State management
    void SetState(UIState state);
    UIState GetState() const { return currentState; }
    
    // Game data display
    void UpdateGameData(int funds, int coreHp, int maxCoreHp, float readiness, 
                       int currentWave, int totalWaves, int enemiesRemaining);
    
    // Shop
    void OpenShop();
    void CloseShop();
    bool IsShopOpen() const;
    TowerType GetSelectedTowerType() const { return selectedTowerType; }
    void SetSelectedTowerType(TowerType type);
    
    // Messages
    void ShowMessage(const std::string& message, float duration = 3.0f);
    void ShowGameOverMessage(bool won, float readiness, int issuesFixed);
    
    // Getters
    bool ShouldStartWave() const { return startWavePressed; }
    void ClearStartWaveFlag() { startWavePressed = false; }
    
private:
    UIState currentState;
    
    // Game data
    int playerFunds;
    int coreHp;
    int maxCoreHp;
    float readiness;
    int currentWave;
    int totalWaves;
    int enemiesRemaining;
    
    // Shop
    bool shopOpen;
    TowerType selectedTowerType;
    std::vector<ShopItem> shopItems;
    Rectangle shopArea;
    
    // UI elements
    Rectangle hudArea;
    Rectangle shopButton;
    Rectangle startWaveButton;
    Rectangle pauseButton;
    
    // Messages
    std::string currentMessage;
    float messageTimer;
    float messageDuration;
    
    // Game over
    bool showGameOver;
    bool gameWon;
    float finalReadiness;
    int finalIssuesFixed;
    
    // Input state
    bool startWavePressed;
    
    // Helper methods
    void DrawHUD() const;
    void DrawShop() const;
    void DrawGameOver() const;
    void DrawMessage() const;
    void UpdateShop();
    void InitializeShopItems();
    void DrawShopItem(const ShopItem& item, int x, int y, int width, int height) const;
    bool IsPointInRectangle(Vector2 point, Rectangle rect) const;
    void HandleShopInput();
    void HandleGameInput();
};
