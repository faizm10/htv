#include "Utils.hpp"
#include <algorithm>
#include <sstream>
#include <cmath>

Color GetFlagColor(const std::string& flag) {
    if (flag == "duplicate_legal_id") return PURPLE;
    if (flag == "expired_legal_id") return ORANGE;
    if (flag == "past_maturity_not_closed") return YELLOW;
    if (flag == "dormant_high_balance") return GREEN;
    if (flag == "locked_ratio_gt25") return BLUE;
    if (flag == "loan_overdue_120d") return RED;
    if (flag == "interest_in_arrears") return MAROON;
    return GRAY;
}

std::vector<std::string> SplitString(const std::string& str, char delimiter) {
    std::vector<std::string> result;
    std::stringstream ss(str);
    std::string item;
    
    while (std::getline(ss, item, delimiter)) {
        result.push_back(item);
    }
    
    return result;
}

std::string TrimString(const std::string& str) {
    size_t first = str.find_first_not_of(' ');
    if (first == std::string::npos) {
        return "";
    }
    size_t last = str.find_last_not_of(' ');
    return str.substr(first, (last - first + 1));
}

float Distance(const Vector2& a, const Vector2& b) {
    float dx = b.x - a.x;
    float dy = b.y - a.y;
    return sqrt(dx * dx + dy * dy);
}

Vector2 Normalize(const Vector2& v) {
    float length = sqrt(v.x * v.x + v.y * v.y);
    if (length == 0.0f) {
        return {0, 0};
    }
    return {v.x / length, v.y / length};
}

float Lerp(float a, float b, float t) {
    return a + (b - a) * t;
}

bool IsPointInCircle(const Vector2& point, const Vector2& center, float radius) {
    return Distance(point, center) <= radius;
}

bool IsPointInRectangle(const Vector2& point, const Rectangle& rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
}

Vector2 GetMouseWorldPosition() {
    Vector2 mousePos = GetMousePosition();
    return {mousePos.x, mousePos.y};
}

void DrawTextCentered(const std::string& text, int x, int y, int fontSize, Color color) {
    int textWidth = MeasureText(text.c_str(), fontSize);
    DrawText(text.c_str(), x - textWidth / 2, y - fontSize / 2, fontSize, color);
}

void DrawProgressBar(int x, int y, int width, int height, float progress, Color fillColor, Color borderColor) {
    // Draw border
    DrawRectangleLines(x, y, width, height, borderColor);
    
    // Draw fill
    int fillWidth = static_cast<int>(width * progress);
    if (fillWidth > 0) {
        DrawRectangle(x, y, fillWidth, height, fillColor);
    }
}

void DrawButton(const std::string& text, int x, int y, int width, int height, Color color, Color textColor) {
    // Draw button background
    DrawRectangle(x, y, width, height, color);
    DrawRectangleLines(x, y, width, height, BLACK);
    
    // Draw text centered
    int textWidth = MeasureText(text.c_str(), 16);
    int textX = x + (width - textWidth) / 2;
    int textY = y + (height - 16) / 2;
    DrawText(text.c_str(), textX, textY, 16, textColor);
}
