#ifndef SIMPLE_JSON_HPP
#define SIMPLE_JSON_HPP

#pragma once

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <stdexcept>

namespace nlohmann {
    class json {
    public:
        enum value_t {
            null,
            object,
            array,
            string,
            boolean,
            number_integer,
            number_float,
            discarded
        };

    private:
        value_t m_type;
        std::map<std::string, json> m_object;
        std::vector<json> m_array;
        std::string m_string;
        bool m_boolean;
        double m_number;

    public:
        json() : m_type(null) {}
        json(const char* val) : m_type(string), m_string(val) {}
        json(const std::string& val) : m_type(string), m_string(val) {}
        json(int val) : m_type(number_integer), m_number(val) {}
        json(double val) : m_type(number_float), m_number(val) {}
        json(bool val) : m_type(boolean), m_boolean(val) {}
        json(const std::vector<json>& val) : m_type(array), m_array(val) {}

        // Array access
        json& operator[](size_t index) {
            if (m_type != array) {
                m_type = array;
                m_array.clear();
            }
            if (index >= m_array.size()) {
                m_array.resize(index + 1);
            }
            return m_array[index];
        }

        const json& operator[](size_t index) const {
            if (m_type != array || index >= m_array.size()) {
                throw std::out_of_range("Array index out of range");
            }
            return m_array[index];
        }

        // Object access
        json& operator[](const std::string& key) {
            if (m_type != object) {
                m_type = object;
                m_object.clear();
            }
            return m_object[key];
        }

        const json& operator[](const std::string& key) const {
            if (m_type != object) {
                throw std::out_of_range("Key not found: " + key);
            }
            auto it = m_object.find(key);
            if (it == m_object.end()) {
                throw std::out_of_range("Key not found: " + key);
            }
            return it->second;
        }

        // Type checking
        bool is_null() const { return m_type == null; }
        bool is_object() const { return m_type == object; }
        bool is_array() const { return m_type == array; }
        bool is_string() const { return m_type == string; }
        bool is_number() const { return m_type == number_integer || m_type == number_float; }
        bool is_boolean() const { return m_type == boolean; }

        // Value access - simplified
        std::string as_string() const {
            if (m_type == string) return m_string;
            return "";
        }

        int as_int() const {
            if (m_type == number_integer) return static_cast<int>(m_number);
            return 0;
        }

        double as_double() const {
            if (m_type == number_float || m_type == number_integer) return m_number;
            return 0.0;
        }

        bool as_bool() const {
            if (m_type == boolean) return m_boolean;
            return false;
        }

        // Size
        size_t size() const {
            switch (m_type) {
                case array: return m_array.size();
                case object: return m_object.size();
                default: return 1;
            }
        }

        // Iterators for objects
        auto begin() { return m_object.begin(); }
        auto end() { return m_object.end(); }
        auto begin() const { return m_object.begin(); }
        auto end() const { return m_object.end(); }

        // Contains
        bool contains(const std::string& key) const {
            return m_type == object && m_object.find(key) != m_object.end();
        }

        // Push back for arrays
        void push_back(const json& value) {
            if (m_type != array) {
                m_type = array;
                m_array.clear();
            }
            m_array.push_back(value);
        }

        // Stream operators
        friend std::ostream& operator<<(std::ostream& os, const json& j) {
            switch (j.m_type) {
                case null:
                    os << "null";
                    break;
                case string:
                    os << "\"" << j.m_string << "\"";
                    break;
                case number_integer:
                case number_float:
                    os << j.m_number;
                    break;
                case boolean:
                    os << (j.m_boolean ? "true" : "false");
                    break;
                case array:
                    os << "[";
                    for (size_t i = 0; i < j.m_array.size(); ++i) {
                        if (i > 0) os << ", ";
                        os << j.m_array[i];
                    }
                    os << "]";
                    break;
                case object: {
                    os << "{";
                    bool first = true;
                    for (const auto& pair : j.m_object) {
                        if (!first) os << ", ";
                        os << "\"" << pair.first << "\": " << pair.second;
                        first = false;
                    }
                    os << "}";
                    break;
                }
                case discarded:
                    os << "null";
                    break;
            }
            return os;
        }
    };

    // Simple JSON parsing (very basic implementation)
    inline json parse(const std::string& str) {
        // This is a very basic parser - in real usage, use the full nlohmann/json library
        json result;
        // For our game purposes, we'll implement basic parsing as needed
        return result;
    }
}

#endif // SIMPLE_JSON_HPP
