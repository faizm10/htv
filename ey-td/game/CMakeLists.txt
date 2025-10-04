cmake_minimum_required(VERSION 3.16)
project(ey-td-game)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find raylib
find_package(raylib QUIET)
if(NOT raylib_FOUND)
    # Try to find raylib in common locations
    find_library(RAYLIB_LIBRARY
        NAMES raylib
        PATHS /usr/local/lib /usr/lib /opt/homebrew/lib
    )
    find_path(RAYLIB_INCLUDE_DIR
        NAMES raylib.h
        PATHS /usr/local/include /usr/include /opt/homebrew/include
    )
    
    if(RAYLIB_LIBRARY AND RAYLIB_INCLUDE_DIR)
        set(raylib_FOUND TRUE)
        message(STATUS "Found raylib: ${RAYLIB_LIBRARY}")
    else()
        message(FATAL_ERROR "raylib not found. Please install raylib:
        macOS: brew install raylib
        Ubuntu/Debian: sudo apt-get install libraylib-dev
        Windows: Use vcpkg or download from https://github.com/raysan5/raylib")
    endif()
endif()

# Include directories
include_directories(third_party)
include_directories(${RAYLIB_INCLUDE_DIR})

# Source files
set(SOURCES
    src/main.cpp
    src/SceneGame.cpp
    src/Map.cpp
    src/WaveManager.cpp
    src/Enemy.cpp
    src/Tower.cpp
    src/Towers/DuplicateDetector.cpp
    src/Towers/ExpiryScanner.cpp
    src/Towers/BalanceChecker.cpp
    src/Towers/ArrearsRadar.cpp
    src/UI.cpp
    src/DataLoader.cpp
    src/Utils.cpp
)

# Create executable
add_executable(ey-td-game ${SOURCES})

# Link libraries
if(raylib_FOUND)
    target_link_libraries(ey-td-game ${RAYLIB_LIBRARY})
else()
    target_link_libraries(ey-td-game raylib)
endif()

# Platform-specific settings
if(WIN32)
    target_link_libraries(ey-td-game winmm)
endif()

# Copy assets to build directory
file(COPY assets DESTINATION ${CMAKE_BINARY_DIR})

# Set working directory for debugging
set_target_properties(ey-td-game PROPERTIES
    VS_DEBUGGER_WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}"
)

# Compiler flags
if(MSVC)
    target_compile_options(ey-td-game PRIVATE /W4)
else()
    target_compile_options(ey-td-game PRIVATE -Wall -Wextra -Wpedantic)
endif()
