#pragma once

#include <vector>
#include <raylib.h>
#include "Enemy.hpp"
#include "DataLoader.hpp"

class WaveManager {
public:
    WaveManager();
    ~WaveManager();
    
    // Core methods
    void Update(float deltaTime);
    void Draw() const;
    
    // Wave management
    void StartWave(int waveIndex);
    void StartNextWave();
    void SpawnEnemyFromRow(const RowData& rowData);
    
    // Getters
    const std::vector<Enemy*>& GetEnemies() const { return enemies; }
    bool IsWaveActive() const { return waveActive; }
    int GetCurrentWaveIndex() const { return currentWaveIndex; }
    int GetTotalWaves() const { return totalWaves; }
    bool AllWavesComplete() const;
    bool AllEnemiesDead() const;
    
    // Data loading
    void SetWaveData(const std::vector<WaveData>& waveData);
    
    // Cleanup
    void ClearAllEnemies();
    
private:
    std::vector<Enemy*> enemies;
    std::vector<WaveData> waveData;
    
    // Wave state
    bool waveActive;
    int currentWaveIndex;
    int totalWaves;
    float waveTimer;
    float spawnTimer;
    int currentRowIndex;
    
    // Spawn timing
    float spawnInterval;
    float waveDelay;
    
    // Paths for each lane
    std::vector<std::vector<Vector2>> lanePaths;
    
    // Helper methods
    void CreateLanePaths();
    std::vector<Vector2> CreatePathForLane(int laneIndex);
    void UpdateEnemies(float deltaTime);
    void RemoveDeadEnemies();
};
