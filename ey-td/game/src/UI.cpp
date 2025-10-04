#include "UI.hpp"
#include "Utils.hpp"
#include <sstream>

UI::UI() 
    : currentState(UIState::GAME_PLAYING), playerFunds(500), coreHp(100), maxCoreHp(100),
      readiness(0.0f), currentWave(0), totalWaves(0), enemiesRemaining(0),
      shopOpen(false), selectedTowerType(TowerType::DUPLICATE_DETECTOR),
      shopArea({0, GameConstants::GAME_AREA_HEIGHT, GameConstants::SCREEN_WIDTH, GameConstants::UI_HEIGHT}),
      hudArea({0, 0, GameConstants::SCREEN_WIDTH, 60}), messageTimer(0.0f), messageDuration(0.0f),
      showGameOver(false), gameWon(false), finalReadiness(0.0f), finalIssuesFixed(0),
      startWavePressed(false) {
    
    InitializeShopItems();
    
    // Initialize UI elements
    shopButton = {10, GameConstants::GAME_AREA_HEIGHT + 10, 100, 30};
    startWaveButton = {120, GameConstants::GAME_AREA_HEIGHT + 10, 100, 30};
    pauseButton = {230, GameConstants::GAME_AREA_HEIGHT + 10, 100, 30};
}

UI::~UI() {
}

void UI::Update(float deltaTime) {
    // Update message timer
    if (messageTimer > 0.0f) {
        messageTimer -= deltaTime;
    }
    
    HandleInput();
}

void UI::Draw() const {
    DrawHUD();
    
    if (shopOpen) {
        DrawShop();
    }
    
    if (showGameOver) {
        DrawGameOver();
    }
    
    if (messageTimer > 0.0f) {
        DrawMessage();
    }
}

void UI::HandleInput() {
    if (showGameOver) {
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            showGameOver = false;
            currentState = UIState::MAIN_MENU;
        }
        return;
    }
    
    if (shopOpen) {
        HandleShopInput();
    } else {
        HandleGameInput();
    }
}

bool UI::IsMouseOverUI() const {
    Vector2 mousePos = GetMousePosition();
    
    // Check if mouse is over HUD area
    if (mousePos.y < hudArea.y + hudArea.height) {
        return true;
    }
    
    // Check if mouse is over shop area
    if (shopOpen && IsPointInRectangle(mousePos, shopArea)) {
        return true;
    }
    
    return false;
}

void UI::SetState(UIState state) {
    currentState = state;
}

void UI::UpdateGameData(int funds, int coreHp, int maxCoreHp, float readiness, 
                       int currentWave, int totalWaves, int enemiesRemaining) {
    this->playerFunds = funds;
    this->coreHp = coreHp;
    this->maxCoreHp = maxCoreHp;
    this->readiness = readiness;
    this->currentWave = currentWave;
    this->totalWaves = totalWaves;
    this->enemiesRemaining = enemiesRemaining;
}

void UI::OpenShop() {
    shopOpen = true;
    currentState = UIState::SHOP_OPEN;
}

void UI::CloseShop() {
    shopOpen = false;
    currentState = UIState::GAME_PLAYING;
}

bool UI::IsShopOpen() const {
    return shopOpen;
}

void UI::SetSelectedTowerType(TowerType type) {
    selectedTowerType = type;
}

void UI::ShowMessage(const std::string& message, float duration) {
    currentMessage = message;
    messageTimer = duration;
    messageDuration = duration;
}

void UI::ShowGameOverMessage(bool won, float readiness, int issuesFixed) {
    showGameOver = true;
    gameWon = won;
    finalReadiness = readiness;
    finalIssuesFixed = issuesFixed;
    currentState = UIState::GAME_OVER;
}

void UI::DrawHUD() const {
    // Draw HUD background
    DrawRectangleRec(hudArea, ColorAlpha(BLACK, 0.8f));
    
    // Draw funds
    std::string fundsText = "Funds: $" + std::to_string(playerFunds);
    DrawText(fundsText.c_str(), 10, 10, 20, WHITE);
    
    // Draw core HP
    std::string hpText = "Core HP: " + std::to_string(coreHp) + "/" + std::to_string(maxCoreHp);
    DrawText(hpText.c_str(), 10, 35, 16, WHITE);
    
    // Draw readiness bar
    DrawText("Readiness:", 200, 10, 16, WHITE);
    DrawProgressBar(200, 35, 200, 20, readiness / 100.0f, GREEN, WHITE);
    
    std::string readinessText = std::to_string(static_cast<int>(readiness)) + "%";
    DrawText(readinessText.c_str(), 410, 35, 16, WHITE);
    
    // Draw wave info
    std::string waveText = "Wave: " + std::to_string(currentWave + 1) + "/" + std::to_string(totalWaves);
    DrawText(waveText.c_str(), 500, 10, 16, WHITE);
    
    std::string enemiesText = "Enemies: " + std::to_string(enemiesRemaining);
    DrawText(enemiesText.c_str(), 500, 35, 16, WHITE);
    
    // Draw control buttons
    DrawButton("Shop", shopButton.x, shopButton.y, shopButton.width, shopButton.height, BLUE, WHITE);
    DrawButton("Next Wave", startWaveButton.x, startWaveButton.y, startWaveButton.width, startWaveButton.height, GREEN, WHITE);
    DrawButton("Pause", pauseButton.x, pauseButton.y, pauseButton.width, pauseButton.height, ORANGE, WHITE);
}

void UI::DrawShop() const {
    // Draw shop background
    DrawRectangleRec(shopArea, ColorAlpha(DARKGRAY, 0.9f));
    DrawRectangleLinesEx(shopArea, 2, BLACK);
    
    // Draw shop title
    DrawTextCentered("TOWER SHOP", GameConstants::SCREEN_WIDTH / 2, shopArea.y + 10, 20, WHITE);
    
    // Draw shop items
    int itemWidth = 200;
    int itemHeight = 80;
    int spacing = 20;
    int startX = 20;
    int y = shopArea.y + 40;
    
    for (size_t i = 0; i < shopItems.size(); ++i) {
        int x = startX + i * (itemWidth + spacing);
        DrawShopItem(shopItems[i], x, y, itemWidth, itemHeight);
    }
    
    // Draw close button
    DrawButton("Close Shop", GameConstants::SCREEN_WIDTH - 120, shopArea.y + 10, 100, 30, RED, WHITE);
    
    // Draw selected tower info
    if (selectedTowerType != TowerType::DUPLICATE_DETECTOR) {
        std::string towerName;
        switch (selectedTowerType) {
            case TowerType::DUPLICATE_DETECTOR: towerName = "Duplicate Detector"; break;
            case TowerType::EXPIRY_SCANNER: towerName = "Expiry Scanner"; break;
            case TowerType::BALANCE_CHECKER: towerName = "Balance Checker"; break;
            case TowerType::ARREARS_RADAR: towerName = "Arrears Radar"; break;
            default: towerName = "Unknown Tower"; break;
        }
        std::string infoText = "Selected: " + towerName;
        DrawText(infoText.c_str(), 20, shopArea.y + 130, 16, YELLOW);
    }
}

void UI::DrawGameOver() const {
    // Draw overlay
    DrawRectangle(0, 0, GameConstants::SCREEN_WIDTH, GameConstants::SCREEN_HEIGHT, ColorAlpha(BLACK, 0.8f));
    
    // Draw game over panel
    Rectangle panel = {GameConstants::SCREEN_WIDTH / 2 - 300, GameConstants::SCREEN_HEIGHT / 2 - 200, 600, 400};
    DrawRectangleRec(panel, ColorAlpha(DARKGRAY, 0.9f));
    DrawRectangleLinesEx(panel, 3, WHITE);
    
    // Draw title
    std::string title = gameWon ? "MIGRATION COMPLETE!" : "MIGRATION FAILED!";
    Color titleColor = gameWon ? GREEN : RED;
    DrawTextCentered(title, panel.x + panel.width / 2, panel.y + 30, 32, titleColor);
    
    // Draw stats
    std::string readinessText = "Final Readiness: " + std::to_string(static_cast<int>(finalReadiness)) + "%";
    DrawTextCentered(readinessText, panel.x + panel.width / 2, panel.y + 80, 20, WHITE);
    
    std::string issuesText = "Issues Fixed: " + std::to_string(finalIssuesFixed);
    DrawTextCentered(issuesText, panel.x + panel.width / 2, panel.y + 110, 20, WHITE);
    
    // Draw message
    std::string message = gameWon ? 
        "Congratulations! The bank merger is complete.\nAll data has been successfully validated." :
        "The migration has failed. Core systems damaged.\nPlease review data quality and try again.";
    DrawTextCentered(message, panel.x + panel.width / 2, panel.y + 160, 16, WHITE);
    
    // Draw continue button
    DrawTextCentered("Click to Continue", panel.x + panel.width / 2, panel.y + 300, 18, YELLOW);
}

void UI::DrawMessage() const {
    if (messageTimer <= 0.0f) return;
    
    // Calculate alpha based on time remaining
    float alpha = messageTimer / messageDuration;
    Color messageColor = ColorAlpha(WHITE, alpha);
    
    DrawTextCentered(currentMessage, GameConstants::SCREEN_WIDTH / 2, GameConstants::GAME_AREA_HEIGHT / 2, 24, messageColor);
}

void UI::UpdateShop() {
    // Shop update logic if needed
}

void UI::InitializeShopItems() {
    shopItems.clear();
    
    shopItems.push_back({TowerType::DUPLICATE_DETECTOR, "Duplicate Detector", "Detects duplicate legal IDs", 50, BLUE});
    shopItems.push_back({TowerType::EXPIRY_SCANNER, "Expiry Scanner", "Scans for expired documents", 75, ORANGE});
    shopItems.push_back({TowerType::BALANCE_CHECKER, "Balance Checker", "Validates account balances", 60, GREEN});
    shopItems.push_back({TowerType::ARREARS_RADAR, "Arrears Radar", "Detects overdue loans", 80, RED});
}

void UI::DrawShopItem(const ShopItem& item, int x, int y, int width, int height) const {
    // Draw item background
    Color bgColor = (selectedTowerType == item.towerType) ? ColorAlpha(item.color, 0.3f) : ColorAlpha(DARKGRAY, 0.5f);
    DrawRectangle(x, y, width, height, bgColor);
    DrawRectangleLines(x, y, width, height, item.color);
    
    // Draw tower icon
    DrawCircle(x + 20, y + 20, 15, item.color);
    
    // Draw item name
    DrawText(item.name.c_str(), x + 50, y + 5, 14, WHITE);
    
    // Draw item description
    DrawText(item.description.c_str(), x + 50, y + 25, 10, LIGHTGRAY);
    
    // Draw cost
    std::string costText = "$" + std::to_string(item.cost);
    DrawText(costText.c_str(), x + 50, y + 55, 12, YELLOW);
    
    // Draw afford indicator
    if (playerFunds >= item.cost) {
        DrawText("✓", x + width - 20, y + 5, 16, GREEN);
    } else {
        DrawText("✗", x + width - 20, y + 5, 16, RED);
    }
}

bool UI::IsPointInRectangle(Vector2 point, Rectangle rect) const {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
}

void UI::HandleShopInput() {
    Vector2 mousePos = GetMousePosition();
    
    // Handle shop item clicks
    int itemWidth = 200;
    int itemHeight = 80;
    int spacing = 20;
    int startX = 20;
    int y = shopArea.y + 40;
    
    for (size_t i = 0; i < shopItems.size(); ++i) {
        int x = startX + i * (itemWidth + spacing);
        Rectangle itemRect = {static_cast<float>(x), static_cast<float>(y), static_cast<float>(itemWidth), static_cast<float>(itemHeight)};
        
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && IsPointInRectangle(mousePos, itemRect)) {
            if (playerFunds >= shopItems[i].cost) {
                selectedTowerType = shopItems[i].towerType;
            }
        }
    }
    
    // Handle close button
    Rectangle closeButton = {GameConstants::SCREEN_WIDTH - 120, shopArea.y + 10, 100, 30};
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && IsPointInRectangle(mousePos, closeButton)) {
        CloseShop();
    }
}

void UI::HandleGameInput() {
    Vector2 mousePos = GetMousePosition();
    
    // Handle shop button
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && IsPointInRectangle(mousePos, shopButton)) {
        OpenShop();
    }
    
    // Handle start wave button
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && IsPointInRectangle(mousePos, startWaveButton)) {
        startWavePressed = true;
    }
    
    // Handle pause button
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && IsPointInRectangle(mousePos, pauseButton)) {
        if (currentState == UIState::GAME_PLAYING) {
            currentState = UIState::GAME_PAUSED;
        } else {
            currentState = UIState::GAME_PLAYING;
        }
    }
}

// Helper function to get tower name
std::string GetTowerName(TowerType type) {
    switch (type) {
        case TowerType::DUPLICATE_DETECTOR: return "Duplicate Detector";
        case TowerType::EXPIRY_SCANNER: return "Expiry Scanner";
        case TowerType::BALANCE_CHECKER: return "Balance Checker";
        case TowerType::ARREARS_RADAR: return "Arrears Radar";
        default: return "Unknown Tower";
    }
}
