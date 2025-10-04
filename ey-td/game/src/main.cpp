#include <raylib.h>
#include <iostream>
#include <string>
#include "SceneGame.hpp"
#include "Utils.hpp"

int main() {
    // Initialize window
    InitWindow(GameConstants::SCREEN_WIDTH, GameConstants::SCREEN_HEIGHT, "EY Tower Defense - Bank Merger");
    SetTargetFPS(60);
    
    std::cout << "EY Tower Defense - Bank Merger" << std::endl;
    std::cout << "==============================" << std::endl;
    
    // Create game scene
    SceneGame* game = new SceneGame();
    
    // Try to load data from JSON file
    std::string dataPath = "../data/outputs/rows_sample.json";
    if (game->LoadGameData(dataPath)) {
        std::cout << "Loaded game data from: " << dataPath << std::endl;
    } else {
        std::cout << "Using sample data (file not found: " << dataPath << ")" << std::endl;
    }
    
    std::cout << "Game initialized successfully!" << std::endl;
    std::cout << "Controls:" << std::endl;
    std::cout << "  - Click 'Shop' to buy towers" << std::endl;
    std::cout << "  - Click 'Next Wave' to start waves" << std::endl;
    std::cout << "  - ESC to pause/unpause" << std::endl;
    std::cout << "  - Right-click to cancel tower placement" << std::endl;
    std::cout << std::endl;
    
    // Main game loop
    while (!WindowShouldClose()) {
        float deltaTime = GetFrameTime();
        
        // Update game
        game->Update(deltaTime);
        
        // Draw game
        BeginDrawing();
        game->Draw();
        EndDrawing();
        
        // Check for game over
        if (game->IsGameOver()) {
            // Wait a bit before allowing restart
            WaitTime(2.0);
            
            // For now, just exit on game over
            // In a full implementation, you'd show a menu or restart option
            break;
        }
    }
    
    // Cleanup
    delete game;
    CloseWindow();
    
    std::cout << "Game ended. Thank you for playing!" << std::endl;
    return 0;
}
