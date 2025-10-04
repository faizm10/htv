#pragma once

#include <vector>
#include <raylib.h>
#include "Map.hpp"
#include "WaveManager.hpp"
#include "UI.hpp"
#include "Tower.hpp"
#include "DataLoader.hpp"

enum class GameState {
    PLAYING,
    PAUSED,
    GAME_OVER,
    VICTORY
};

class SceneGame {
public:
    SceneGame();
    ~SceneGame();
    
    // Core game loop
    void Update(float deltaTime);
    void Draw() const;
    
    // Game state management
    void StartGame();
    void PauseGame();
    void ResumeGame();
    void EndGame(bool won);
    
    // Data loading
    bool LoadGameData(const std::string& dataPath);
    
    // Getters
    GameState GetGameState() const { return gameState; }
    bool IsGameOver() const { return gameState == GameState::GAME_OVER || gameState == GameState::VICTORY; }
    
private:
    // Core systems
    Map* map;
    WaveManager* waveManager;
    UI* ui;
    DataLoader* dataLoader;
    
    // Game state
    GameState gameState;
    
    // Game data
    int playerFunds;
    int coreHp;
    int maxCoreHp;
    float readiness;
    int currentWave;
    int totalWaves;
    int enemiesReachedCore;
    int issuesFixed;
    
    // Tower management
    std::vector<Tower*> towers;
    TowerType selectedTowerType;
    bool placingTower;
    Vector2 towerPlacementPos;
    
    // Game timing
    float gameStartTime;
    float gameTime;
    
    // Input handling
    void HandleInput();
    void HandleTowerPlacement();
    void HandleTowerSelection();
    
    // Game logic
    void UpdateGameState(float deltaTime);
    void UpdateTowers(float deltaTime);
    void UpdateEnemies(float deltaTime);
    void CheckGameEnd();
    void ProcessEnemyAtCore(Enemy* enemy);
    
    // Tower operations
    Tower* CreateTower(TowerType type, Vector2 position);
    bool CanAffordTower(TowerType type) const;
    int GetTowerCost(TowerType type) const;
    void RemoveTower(Vector2 position);
    Tower* GetTowerAt(Vector2 position) const;
    
    // Game events
    void OnEnemyCleaned(Enemy* enemy);
    void OnEnemyReachedCore(Enemy* enemy);
    void OnWaveComplete();
    void OnGameWon();
    void OnGameLost();
    
    // Utility
    void UpdateUI();
    void DrawTowers() const;
    void DrawTowerPlacement() const;
    bool IsValidTowerPosition(Vector2 position) const;
};
