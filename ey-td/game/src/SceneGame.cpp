#include "SceneGame.hpp"
#include "Towers/DuplicateDetector.hpp"
#include "Towers/ExpiryScanner.hpp"
#include "Towers/BalanceChecker.hpp"
#include "Towers/ArrearsRadar.hpp"
#include "Utils.hpp"
#include <algorithm>
#include <iostream>

SceneGame::SceneGame() 
    : map(nullptr), waveManager(nullptr), ui(nullptr), dataLoader(nullptr),
      gameState(GameState::PLAYING), playerFunds(GameConstants::STARTING_FUNDS),
      coreHp(GameConstants::STARTING_CORE_HP), maxCoreHp(GameConstants::STARTING_CORE_HP),
      readiness(0.0f), currentWave(0), totalWaves(0), enemiesReachedCore(0), issuesFixed(0),
      selectedTowerType(TowerType::DUPLICATE_DETECTOR), placingTower(false),
      gameStartTime(0.0f), gameTime(0.0f) {
    
    // Initialize core systems
    map = new Map();
    waveManager = new WaveManager();
    ui = new UI();
    dataLoader = new DataLoader();
    
    StartGame();
}

SceneGame::~SceneGame() {
    // Clean up towers
    for (auto tower : towers) {
        delete tower;
    }
    towers.clear();
    
    // Clean up core systems
    delete map;
    delete waveManager;
    delete ui;
    delete dataLoader;
}

void SceneGame::Update(float deltaTime) {
    if (gameState == GameState::PAUSED) {
        return;
    }
    
    gameTime += deltaTime;
    
    HandleInput();
    UpdateGameState(deltaTime);
    UpdateUI();
}

void SceneGame::Draw() const {
    // Clear screen
    ClearBackground(RAYWHITE);
    
    // Draw game world
    map->Draw();
    DrawTowers();
    
    // Draw wave manager (enemies and paths)
    waveManager->Draw();
    
    // Draw UI
    ui->Draw();
    
    // Draw tower placement preview
    if (placingTower) {
        DrawTowerPlacement();
    }
}

void SceneGame::StartGame() {
    gameState = GameState::PLAYING;
    gameStartTime = GetTime();
    gameTime = 0.0f;
    
    // Reset game data
    playerFunds = GameConstants::STARTING_FUNDS;
    coreHp = GameConstants::STARTING_CORE_HP;
    maxCoreHp = GameConstants::STARTING_CORE_HP;
    readiness = 0.0f;
    currentWave = 0;
    enemiesReachedCore = 0;
    issuesFixed = 0;
    
    // Clear towers
    for (auto tower : towers) {
        delete tower;
    }
    towers.clear();
    
    // Load wave data
    if (dataLoader->IsLoaded()) {
        waveManager->SetWaveData(dataLoader->GetWaves());
        totalWaves = dataLoader->GetWaveCount();
    }
    
    std::cout << "Game started with " << totalWaves << " waves" << std::endl;
}

void SceneGame::PauseGame() {
    gameState = GameState::PAUSED;
}

void SceneGame::ResumeGame() {
    gameState = GameState::PLAYING;
}

void SceneGame::EndGame(bool won) {
    gameState = won ? GameState::VICTORY : GameState::GAME_OVER;
    
    // Show game over screen
    ui->ShowGameOverMessage(won, readiness, issuesFixed);
    
    std::string message = won ? 
        "Migration completed successfully!" : 
        "Migration failed - Core systems compromised!";
    std::cout << message << std::endl;
}

bool SceneGame::LoadGameData(const std::string& dataPath) {
    return dataLoader->LoadFromFile(dataPath);
}

void SceneGame::HandleInput() {
    HandleTowerPlacement();
    HandleTowerSelection();
    
    // Check for wave start
    if (ui->ShouldStartWave()) {
        ui->ClearStartWaveFlag();
        if (currentWave < totalWaves) {
            waveManager->StartWave(currentWave);
            currentWave++;
        }
    }
    
    // Handle escape key
    if (IsKeyPressed(KEY_ESCAPE)) {
        if (placingTower) {
            placingTower = false;
        } else {
            // Toggle pause
            if (gameState == GameState::PLAYING) {
                PauseGame();
            } else if (gameState == GameState::PAUSED) {
                ResumeGame();
            }
        }
    }
}

void SceneGame::HandleTowerPlacement() {
    Vector2 mousePos = GetMouseWorldPosition();
    
    if (placingTower) {
        towerPlacementPos = mousePos;
        
        // Check for placement
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            if (IsValidTowerPosition(towerPlacementPos) && CanAffordTower(selectedTowerType)) {
                Tower* newTower = CreateTower(selectedTowerType, towerPlacementPos);
                if (newTower) {
                    towers.push_back(newTower);
                    playerFunds -= GetTowerCost(selectedTowerType);
                    map->PlaceTower(towerPlacementPos);
                    placingTower = false;
                    
                    std::string towerName;
                    switch (selectedTowerType) {
                        case TowerType::DUPLICATE_DETECTOR: towerName = "Duplicate Detector"; break;
                        case TowerType::EXPIRY_SCANNER: towerName = "Expiry Scanner"; break;
                        case TowerType::BALANCE_CHECKER: towerName = "Balance Checker"; break;
                        case TowerType::ARREARS_RADAR: towerName = "Arrears Radar"; break;
                        default: towerName = "Unknown Tower"; break;
                    }
                    ui->ShowMessage("Placed " + towerName);
                }
            }
        }
        
        // Cancel placement
        if (IsMouseButtonPressed(MOUSE_BUTTON_RIGHT)) {
            placingTower = false;
        }
    }
}

void SceneGame::HandleTowerSelection() {
    // Handle tower selection from UI
    TowerType uiSelectedType = ui->GetSelectedTowerType();
    if (uiSelectedType != selectedTowerType) {
        selectedTowerType = uiSelectedType;
        if (CanAffordTower(selectedTowerType)) {
            placingTower = true;
        }
    }
}

void SceneGame::UpdateGameState(float deltaTime) {
    UpdateTowers(deltaTime);
    UpdateEnemies(deltaTime);
    
    // Update wave manager
    waveManager->Update(deltaTime);
    
    // Check for game end conditions
    CheckGameEnd();
}

void SceneGame::UpdateTowers(float deltaTime) {
    const auto& enemies = waveManager->GetEnemies();
    
    for (auto tower : towers) {
        if (tower) {
            tower->Update(deltaTime, enemies);
        }
    }
}

void SceneGame::UpdateEnemies(float deltaTime) {
    const auto& enemies = waveManager->GetEnemies();
    
    for (auto enemy : enemies) {
        if (enemy) {
            enemy->Update(deltaTime);
            
            // Check if enemy reached the core
            if (enemy->IsAtEnd()) {
                ProcessEnemyAtCore(enemy);
            }
        }
    }
}

void SceneGame::CheckGameEnd() {
    // Check win condition (readiness >= 100%)
    if (readiness >= 100.0f) {
        OnGameWon();
        return;
    }
    
    // Check lose condition (core HP <= 0)
    if (coreHp <= 0) {
        OnGameLost();
        return;
    }
    
    // Check if all waves complete and no enemies remain
    if (waveManager->AllWavesComplete() && waveManager->GetEnemies().empty()) {
        if (readiness < 100.0f) {
            // Game over - didn't reach 100% readiness
            OnGameLost();
        }
    }
}

void SceneGame::ProcessEnemyAtCore(Enemy* enemy) {
    if (!enemy) return;
    
    enemiesReachedCore++;
    
    if (enemy->cleaned) {
        // Clean enemy increases readiness
        float readinessIncrease = enemy->severity * 2.0f;
        readiness += readinessIncrease;
        readiness = std::min(readiness, 100.0f);
        
        issuesFixed++;
        ui->ShowMessage("Clean data processed! +" + std::to_string(static_cast<int>(readinessIncrease)) + "% readiness");
    } else {
        // Dirty enemy damages core
        int damage = std::max(1, enemy->severity / 2);
        coreHp -= damage;
        coreHp = std::max(coreHp, 0);
        
        ui->ShowMessage("Dirty data reached core! -" + std::to_string(damage) + " HP");
    }
}

Tower* SceneGame::CreateTower(TowerType type, Vector2 position) {
    switch (type) {
        case TowerType::DUPLICATE_DETECTOR:
            return new DuplicateDetector(position);
        case TowerType::EXPIRY_SCANNER:
            return new ExpiryScanner(position);
        case TowerType::BALANCE_CHECKER:
            return new BalanceChecker(position);
        case TowerType::ARREARS_RADAR:
            return new ArrearsRadar(position);
        default:
            return nullptr;
    }
}

bool SceneGame::CanAffordTower(TowerType type) const {
    return playerFunds >= GetTowerCost(type);
}

int SceneGame::GetTowerCost(TowerType type) const {
    switch (type) {
        case TowerType::DUPLICATE_DETECTOR: return 50;
        case TowerType::EXPIRY_SCANNER: return 75;
        case TowerType::BALANCE_CHECKER: return 60;
        case TowerType::ARREARS_RADAR: return 80;
        default: return 100;
    }
}

void SceneGame::RemoveTower(Vector2 position) {
    auto it = std::find_if(towers.begin(), towers.end(),
        [position](Tower* tower) {
            return Distance(tower->position, position) < 25.0f;
        });
    
    if (it != towers.end()) {
        delete *it;
        towers.erase(it);
        map->RemoveTower(position);
        
        // Refund some money
        playerFunds += 25; // Half cost refund
    }
}

Tower* SceneGame::GetTowerAt(Vector2 position) const {
    auto it = std::find_if(towers.begin(), towers.end(),
        [position](Tower* tower) {
            return Distance(tower->position, position) < 25.0f;
        });
    
    return (it != towers.end()) ? *it : nullptr;
}

void SceneGame::OnEnemyCleaned(Enemy* enemy) {
    if (enemy && enemy->cleaned) {
        issuesFixed++;
    }
}

void SceneGame::OnEnemyReachedCore(Enemy* enemy) {
    ProcessEnemyAtCore(enemy);
}

void SceneGame::OnWaveComplete() {
    std::cout << "Wave " << currentWave << " completed" << std::endl;
}

void SceneGame::OnGameWon() {
    EndGame(true);
}

void SceneGame::OnGameLost() {
    EndGame(false);
}

void SceneGame::UpdateUI() {
    int enemiesRemaining = waveManager->GetEnemies().size();
    
    ui->UpdateGameData(playerFunds, coreHp, maxCoreHp, readiness,
                      currentWave, totalWaves, enemiesRemaining);
}

void SceneGame::DrawTowers() const {
    for (const auto tower : towers) {
        if (tower) {
            tower->Draw();
        }
    }
}

void SceneGame::DrawTowerPlacement() const {
    if (!placingTower) return;
    
    Vector2 pos = towerPlacementPos;
    Color color = CanAffordTower(selectedTowerType) ? GREEN : RED;
    
    // Draw placement preview
    DrawCircleLines(pos.x, pos.y, 20, color);
    
    // Draw tower preview
    DrawCircle(pos.x, pos.y, 15, ColorAlpha(color, 0.5f));
    
    // Draw range preview
    float range = 100.0f; // Default range
    DrawCircleLines(pos.x, pos.y, range, ColorAlpha(color, 0.3f));
}

bool SceneGame::IsValidTowerPosition(Vector2 position) const {
    return map->CanPlaceTower(position);
}
