#pragma once

#include <string>
#include <vector>
#include <raylib.h>
#include "../third_party/simple_json.hpp"

struct WaveData {
    int lane;
    std::vector<struct RowData> rows;
};

struct RowData {
    std::string id;
    std::string room;
    std::string summary;
    std::vector<std::string> flags;
    int severity;
};

class DataLoader {
public:
    DataLoader();
    ~DataLoader();
    
    // Load data from JSON file
    bool LoadFromFile(const std::string& filepath);
    
    // Create sample data if file doesn't exist
    void CreateSampleData();
    
    // Getters
    const std::vector<WaveData>& GetWaves() const { return waves; }
    int GetWaveCount() const { return waves.size(); }
    bool IsLoaded() const { return loaded; }
    
private:
    std::vector<WaveData> waves;
    bool loaded;
    
    // JSON parsing helpers
    RowData ParseRowData(const nlohmann::json& json);
    WaveData ParseWaveData(const nlohmann::json& json);
    std::vector<std::string> ParseStringArray(const nlohmann::json& json);
};
