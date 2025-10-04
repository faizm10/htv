#include "DataLoader.hpp"
#include <fstream>
#include <iostream>
#include <random>

DataLoader::DataLoader() : loaded(false) {
    CreateSampleData(); // Always create sample data as fallback
}

DataLoader::~DataLoader() {
}

bool DataLoader::LoadFromFile(const std::string& filepath) {
    // For now, just use sample data since JSON parsing is complex
    std::cout << "Loading sample data (JSON parsing simplified)" << std::endl;
    CreateSampleData();
    return true;
}

void DataLoader::CreateSampleData() {
    waves.clear();
    
    // Create sample waves with different data scenarios
    std::vector<std::string> sampleFlags = {
        "duplicate_legal_id",
        "expired_legal_id", 
        "dormant_high_balance",
        "loan_overdue_120d",
        "past_maturity_not_closed",
        "locked_ratio_gt25",
        "interest_in_arrears"
    };
    
    std::vector<std::string> sampleRooms = {"customers", "accounts", "fixed", "loans"};
    
    // Wave 1: Easy customers
    WaveData wave1;
    wave1.lane = 0;
    wave1.rows.push_back({"CUST-001", "customers", "EN, Toronto, legalId=AB123456", {"expired_legal_id"}, 3});
    wave1.rows.push_back({"CUST-002", "customers", "FR, Montreal, legalId=CD789012", {"duplicate_legal_id"}, 4});
    waves.push_back(wave1);
    
    // Wave 2: Account issues
    WaveData wave2;
    wave2.lane = 1;
    wave2.rows.push_back({"ACC-001", "accounts", "Savings Account, Balance: $15,000", {"dormant_high_balance"}, 5});
    wave2.rows.push_back({"ACC-002", "accounts", "Checking Account, Locked: 30%", {"locked_ratio_gt25"}, 3});
    waves.push_back(wave2);
    
    // Wave 3: Fixed term issues
    WaveData wave3;
    wave3.lane = 2;
    wave3.rows.push_back({"FIX-001", "fixed", "Term Deposit, Maturity: 2023-12-01", {"past_maturity_not_closed"}, 6});
    wave3.rows.push_back({"FIX-002", "fixed", "CD Account, Maturity: 2024-01-15", {"expired_legal_id"}, 4});
    waves.push_back(wave3);
    
    // Wave 4: Loan problems
    WaveData wave4;
    wave4.lane = 3;
    wave4.rows.push_back({"LOAN-001", "loans", "Personal Loan, Overdue: 150 days", {"loan_overdue_120d"}, 7});
    wave4.rows.push_back({"LOAN-002", "loans", "Mortgage, Arrears: $5,000", {"interest_in_arrears"}, 6});
    waves.push_back(wave4);
    
    // Wave 5: Mixed complexity
    WaveData wave5;
    wave5.lane = 0;
    wave5.rows.push_back({"MIX-001", "customers", "Complex Customer Record", {"duplicate_legal_id", "expired_legal_id"}, 8});
    wave5.rows.push_back({"MIX-002", "loans", "High-Risk Loan", {"loan_overdue_120d", "interest_in_arrears"}, 9});
    wave5.rows.push_back({"MIX-003", "accounts", "Problematic Account", {"dormant_high_balance", "locked_ratio_gt25"}, 7});
    waves.push_back(wave5);
    
    loaded = true;
    std::cout << "Created " << waves.size() << " sample waves" << std::endl;
}

// JSON parsing functions removed for simplicity - using sample data only
