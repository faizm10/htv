#include "WaveManager.hpp"
#include "Utils.hpp"
#include <algorithm>
#include <functional>

WaveManager::WaveManager() 
    : waveActive(false), currentWaveIndex(0), totalWaves(0), waveTimer(0.0f),
      spawnTimer(0.0f), currentRowIndex(0), spawnInterval(1.0f), waveDelay(2.0f) {
    CreateLanePaths();
}

WaveManager::~WaveManager() {
    ClearAllEnemies();
}

void WaveManager::Update(float deltaTime) {
    UpdateEnemies(deltaTime);
    
    if (waveActive) {
        spawnTimer += deltaTime;
        
        // Check if we should spawn next enemy
        if (spawnTimer >= spawnInterval && currentWaveIndex < totalWaves) {
            const WaveData& currentWave = waveData[currentWaveIndex];
            
            if (currentRowIndex < currentWave.rows.size()) {
                SpawnEnemyFromRow(currentWave.rows[currentRowIndex]);
                currentRowIndex++;
                spawnTimer = 0.0f;
            } else {
                // Wave complete, wait for all enemies to be cleared
                if (AllEnemiesDead()) {
                    waveActive = false;
                    currentRowIndex = 0;
                }
            }
        }
    }
}

void WaveManager::Draw() const {
    // Draw lane paths
    for (int i = 0; i < lanePaths.size(); ++i) {
        const auto& path = lanePaths[i];
        if (path.size() > 1) {
            for (size_t j = 0; j < path.size() - 1; ++j) {
                DrawLineV(path[j], path[j + 1], ColorAlpha(GRAY, 0.5f));
            }
        }
        
        // Draw lane markers
        if (!path.empty()) {
            DrawCircleV(path[0], 8.0f, ColorAlpha(BLUE, 0.3f));
            DrawCircleV(path.back(), 8.0f, ColorAlpha(RED, 0.3f));
        }
    }
    
    // Draw enemies
    for (const auto& enemy : enemies) {
        if (enemy) {
            enemy->Draw();
        }
    }
}

void WaveManager::StartWave(int waveIndex) {
    if (waveIndex < 0 || waveIndex >= totalWaves) {
        return;
    }
    
    currentWaveIndex = waveIndex;
    currentRowIndex = 0;
    waveActive = true;
    spawnTimer = 0.0f;
    
    std::cout << "Starting wave " << (waveIndex + 1) << std::endl;
}

void WaveManager::StartNextWave() {
    if (currentWaveIndex + 1 < totalWaves) {
        StartWave(currentWaveIndex + 1);
    }
}

void WaveManager::SpawnEnemyFromRow(const RowData& rowData) {
    Enemy* enemy = new Enemy(rowData.id, rowData.room, rowData.summary, rowData.flags, rowData.severity);
    
    // Set path based on lane (use a simple hash of the ID to determine lane)
    int laneIndex = std::hash<std::string>{}(rowData.id) % lanePaths.size();
    if (laneIndex < lanePaths.size()) {
        enemy->SetPath(lanePaths[laneIndex]);
    }
    
    enemies.push_back(enemy);
    std::cout << "Spawned enemy: " << rowData.id << " in lane " << laneIndex << std::endl;
}

bool WaveManager::AllWavesComplete() const {
    return currentWaveIndex >= totalWaves - 1 && AllEnemiesDead();
}

bool WaveManager::AllEnemiesDead() const {
    return enemies.empty();
}

void WaveManager::SetWaveData(const std::vector<WaveData>& waveData) {
    this->waveData = waveData;
    this->totalWaves = waveData.size();
    this->currentWaveIndex = 0;
    this->waveActive = false;
    this->currentRowIndex = 0;
    
    std::cout << "Loaded " << totalWaves << " waves" << std::endl;
}

void WaveManager::ClearAllEnemies() {
    for (auto& enemy : enemies) {
        delete enemy;
    }
    enemies.clear();
}

void WaveManager::CreateLanePaths() {
    lanePaths.clear();
    
    // Create 4 lanes with paths from left to right
    for (int i = 0; i < 4; ++i) {
        lanePaths.push_back(CreatePathForLane(i));
    }
}

std::vector<Vector2> WaveManager::CreatePathForLane(int laneIndex) {
    std::vector<Vector2> path;
    
    float startY = GameConstants::LANE_START_Y + laneIndex * GameConstants::LANE_SPACING;
    float endX = GameConstants::SCREEN_WIDTH - 100;
    
    // Create a simple horizontal path with some curves
    path.push_back({-50, startY}); // Start off-screen
    path.push_back({100, startY});
    path.push_back({300, startY});
    path.push_back({500, startY + 20}); // Slight curve
    path.push_back({700, startY});
    path.push_back({900, startY - 10}); // Another curve
    path.push_back({endX, startY});
    path.push_back({endX + 50, startY}); // End off-screen
    
    return path;
}

void WaveManager::UpdateEnemies(float deltaTime) {
    for (auto it = enemies.begin(); it != enemies.end();) {
        Enemy* enemy = *it;
        if (enemy) {
            enemy->Update(deltaTime);
            
            // Remove enemies that reached the end
            if (enemy->IsAtEnd()) {
                delete enemy;
                it = enemies.erase(it);
                continue;
            }
        }
        ++it;
    }
}

void WaveManager::RemoveDeadEnemies() {
    enemies.erase(
        std::remove_if(enemies.begin(), enemies.end(),
            [](Enemy* enemy) {
                if (enemy && enemy->hp <= 0) {
                    delete enemy;
                    return true;
                }
                return false;
            }),
        enemies.end()
    );
}
