# EY Bank Merger Data Schema

This document describes the unified data schema used for processing EY bank data and the flags detected by the tower defense game.

## Data Sources

The system processes data from four main sources:
1. **Customer Data** - Customer master records
2. **Current/Savings Accounts** - Checking and savings account data
3. **Fixed Term Accounts** - Term deposits and CDs
4. **Loan Accounts** - Personal and business loans

## Unified Schema

### Customer Records
| Field | Description | Example |
|-------|-------------|---------|
| customer_id | Unique customer identifier | CUST-001 |
| legal_id | Legal identification number | AB123456 |
| legal_expired_date | Expiration date of legal ID | 2023-12-31 |
| country | Customer country | US |
| city | Customer city | New York |

### Account Records (Current/Savings)
| Field | Description | Example |
|-------|-------------|---------|
| account_id | Unique account identifier | ACC-001 |
| account_type | Type of account | Savings |
| account_status | Current status of account | Active |
| uncleared_balance | Current balance | 15000.00 |
| locked_amount | Amount locked/frozen | 5000.00 |

### Fixed Term Accounts
| Field | Description | Example |
|-------|-------------|---------|
| account_id | Unique account identifier | FIX-001 |
| account_type | Type of account | Term Deposit |
| account_status | Current status of account | Active |
| maturity_date | Date when term matures | 2024-06-15 |

### Loan Records
| Field | Description | Example |
|-------|-------------|---------|
| loan_id | Unique loan identifier | LOAN-001 |
| account_type | Type of loan | Personal Loan |
| last_payment_date | Date of last payment received | 2023-08-15 |
| interest_from_arrears_balance | Outstanding interest arrears | 2500.00 |

## Data Quality Flags

The system detects the following data quality issues:

### Customer Flags

#### `expired_legal_id`
- **Description**: Legal identification document has expired
- **Detection**: `legal_expired_date < today`
- **Severity Weight**: 3
- **Tower**: ExpiryScanner

#### `duplicate_legal_id`
- **Description**: Multiple customers with same legal ID
- **Detection**: `legal_id` appears in multiple customer records
- **Severity Weight**: 4
- **Tower**: DuplicateDetector

### Account Flags

#### `dormant_high_balance`
- **Description**: Dormant account with high balance
- **Detection**: `account_status` contains "Dormant" AND `uncleared_balance > 5000`
- **Severity Weight**: 2
- **Tower**: BalanceChecker

#### `locked_ratio_gt25`
- **Description**: Account has >25% of balance locked
- **Detection**: `locked_amount / max(uncleared_balance, 1) > 0.25`
- **Severity Weight**: 2
- **Tower**: BalanceChecker

#### `past_maturity_not_closed`
- **Description**: Fixed term account past maturity but not closed
- **Detection**: `maturity_date < today` AND `account_status != "Closed"`
- **Severity Weight**: 3
- **Tower**: ExpiryScanner

### Loan Flags

#### `loan_overdue_120d`
- **Description**: Loan payment overdue by 120+ days
- **Detection**: `last_payment_date < today - 120 days`
- **Severity Weight**: 5
- **Tower**: ArrearsRadar

#### `interest_in_arrears`
- **Description**: Interest payments are in arrears
- **Detection**: `interest_from_arrears_balance > 0`
- **Severity Weight**: 4
- **Tower**: ArrearsRadar

## Severity Calculation

Severity scores are calculated as the sum of flag weights for each record:
- Minimum severity: 1 (clean record)
- Maximum severity: 10 (heavily flagged record)

## Game Data Format

The processed data is output as `rows_sample.json` with the following structure:

```json
{
  "waves": [
    {
      "lane": 0,
      "rows": [
        {
          "id": "CUST-042",
          "room": "customers",
          "summary": "EN, Toronto, legalId=AB123456",
          "flags": ["expired_legal_id", "duplicate_legal_id"],
          "severity": 7
        }
      ]
    }
  ],
  "metadata": {
    "generated_at": "2025-01-03T10:30:00",
    "total_records": 150,
    "total_waves": 5,
    "flags_detected": ["expired_legal_id", "duplicate_legal_id", ...]
  }
}
```

## Data Processing Pipeline

1. **Load**: Read Excel files from input directory
2. **Normalize**: Standardize column names and data types
3. **Detect**: Apply flag detection rules
4. **Calculate**: Compute severity scores
5. **Summarize**: Create human-readable summaries
6. **Export**: Generate clean CSV files and game JSON

## File Naming Conventions

### Input Files (Excel)
- `*Customer*.xlsx` - Customer master data
- `*CurSav*.xlsx` - Current/Savings accounts
- `*FixedTerm*.xlsx` - Fixed term accounts
- `*Loan*.xlsx` - Loan accounts

### Output Files
- `customers_clean.csv` - Cleaned customer data
- `accounts_cursav_clean.csv` - Cleaned current/savings accounts
- `accounts_fixed_clean.csv` - Cleaned fixed term accounts
- `accounts_loan_clean.csv` - Cleaned loan data
- `rows_sample.json` - Game data with waves and flags
