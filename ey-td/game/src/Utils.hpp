#pragma once

#include <string>
#include <raylib.h>
#include <vector>

// Flag color mapping
Color GetFlagColor(const std::string& flag);

// String utilities
std::vector<std::string> SplitString(const std::string& str, char delimiter);
std::string TrimString(const std::string& str);

// Math utilities
float Distance(const Vector2& a, const Vector2& b);
Vector2 Normalize(const Vector2& v);
float Lerp(float a, float b, float t);

// Game utilities
bool IsPointInCircle(const Vector2& point, const Vector2& center, float radius);
bool IsPointInRectangle(const Vector2& point, const Rectangle& rect);
Vector2 GetMouseWorldPosition();

// UI utilities
void DrawTextCentered(const std::string& text, int x, int y, int fontSize, Color color);
void DrawProgressBar(int x, int y, int width, int height, float progress, Color fillColor, Color borderColor);
void DrawButton(const std::string& text, int x, int y, int width, int height, Color color, Color textColor);

// Game constants
namespace GameConstants {
    const int SCREEN_WIDTH = 1200;
    const int SCREEN_HEIGHT = 800;
    const int UI_HEIGHT = 100;
    const int GAME_AREA_HEIGHT = SCREEN_HEIGHT - UI_HEIGHT;
    
    const int LANE_COUNT = 4;
    const float LANE_WIDTH = 100.0f;
    const float LANE_START_Y = 100.0f;
    const float LANE_SPACING = 150.0f;
    
    const int STARTING_FUNDS = 500;
    const int STARTING_CORE_HP = 100;
    
    const float WAVE_SPAWN_INTERVAL = 3.0f;
    const int MAX_WAVES = 10;
}
