# EY Data Preparation Pipeline

Python ETL pipeline for processing EY bank merger data and generating game content.

## Overview

This pipeline processes Excel files containing bank data, detects data quality issues, and generates both clean CSV files and JSON data for the tower defense game.

## Setup

### Prerequisites

- Python 3.10 or higher
- pandas
- openpyxl (for Excel file support)

### Installation

```bash
pip install pandas openpyxl
```

## Usage

### Basic Usage

```bash
python merge_ey.py --in ../raw --out ../outputs --today 2025-01-03
```

### Command Line Options

- `--in` - Input directory containing Excel files (default: `data/raw`)
- `--out` - Output directory for processed files (default: `data/outputs`)
- `--today` - Today's date for calculations (default: current date)

### Input Files

Place Excel files in the input directory with these naming patterns:
- `*Customer*.xlsx` - Customer master data
- `*CurSav*.xlsx` - Current/Savings accounts
- `*FixedTerm*.xlsx` - Fixed term accounts
- `*Loan*.xlsx` - Loan accounts

## Data Processing Pipeline

### 1. Data Loading
- Automatically detects Excel files by name pattern
- Loads data into pandas DataFrames
- Handles multiple file formats and encodings

### 2. Schema Normalization
- Standardizes column names across different data sources
- Maps common variations to unified schema
- Handles missing or differently named columns

### 3. Flag Detection
The system detects the following data quality issues:

#### Customer Flags
- **expired_legal_id** - Legal ID has expired
- **duplicate_legal_id** - Duplicate legal ID across customers

#### Account Flags
- **dormant_high_balance** - Dormant account with balance > $5,000
- **locked_ratio_gt25** - Account locked ratio > 25%

#### Fixed Term Flags
- **past_maturity_not_closed** - Account past maturity but not closed

#### Loan Flags
- **loan_overdue_120d** - Loan overdue by 120+ days
- **interest_in_arrears** - Interest payments in arrears

### 4. Severity Calculation
- Each flag has a weight (1-5)
- Severity = sum of flag weights (capped at 10)
- Used for game difficulty balancing

### 5. Summary Generation
- Creates human-readable summaries for each record
- Includes key identifying information
- Used for game display

### 6. Output Generation

#### CSV Files
- `customers_clean.csv` - Cleaned customer data
- `accounts_cursav_clean.csv` - Cleaned current/savings accounts
- `accounts_fixed_clean.csv` - Cleaned fixed term accounts
- `accounts_loan_clean.csv` - Cleaned loan data

#### Game JSON
- `rows_sample.json` - Game data with waves and flags
- Balanced difficulty progression
- Multiple lanes for varied gameplay

## Configuration

### Flag Detection Rules

Edit the detection methods in `merge_ey.py` to customize:

```python
def _detect_customer_flags(self, row):
    flags = []
    
    # Custom detection logic
    if pd.notna(row.get('legal_expired_date')):
        expired_date = pd.to_datetime(row['legal_expired_date'])
        if expired_date < self.today:
            flags.append('expired_legal_id')
    
    return flags
```

### Severity Weights

Adjust flag weights for different difficulty:

```python
flag_weights = {
    'expired_legal_id': 3,      # Medium severity
    'duplicate_legal_id': 4,    # High severity
    'loan_overdue_120d': 5,     # Critical severity
    # ... other flags
}
```

### Wave Generation

Customize wave creation in `generate_game_data()`:

```python
# Create balanced waves
records_per_wave = len(all_records) // 5  # 5 waves
records_per_wave = max(3, min(records_per_wave, 6))  # 3-6 records per wave
```

## Data Schema

See `../schema.md` for detailed field definitions and mappings.

### Required Columns

**Customers:**
- Customer ID
- Legal ID
- Legal Expired Date
- Country
- City

**Accounts:**
- Account ID
- Account Type
- Account Status
- Uncleared Balance
- Locked Amount (for current/savings)

**Fixed Term:**
- Account ID
- Account Type
- Account Status
- Maturity Date

**Loans:**
- Loan ID
- Account Type
- Last Payment Date
- Interest From Arrears Balance

## Troubleshooting

### Common Issues

**File not found errors:**
- Check file naming conventions
- Verify file paths are correct
- Ensure Excel files are not corrupted

**Column mapping issues:**
- Check column names in Excel files
- Update column mappings in `merge_ey.py`
- Handle missing columns gracefully

**Data type errors:**
- Verify date formats in Excel
- Check numeric data formatting
- Handle empty cells appropriately

**Memory issues with large files:**
- Process files in chunks
- Use data types optimization
- Consider file splitting

### Debug Mode

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Sample Data

If no Excel files are available, the script will create sample data automatically.

## Output Validation

### CSV Validation
- Check record counts match input
- Verify all required columns present
- Validate data types and formats

### JSON Validation
- Verify wave structure
- Check flag assignments
- Validate severity calculations
- Test game loading

### Game Integration
- Copy `rows_sample.json` to game data directory
- Test game loads data correctly
- Verify towers target appropriate flags

## Performance

### Optimization Tips
- Use appropriate data types (category for strings)
- Process files in chunks for large datasets
- Cache expensive calculations
- Use vectorized operations

### Benchmarking
- Time each processing stage
- Monitor memory usage
- Profile slow operations
- Optimize bottlenecks

## Extending the Pipeline

### Adding New Data Sources
1. Add file detection pattern
2. Create loading method
3. Implement schema mapping
4. Add flag detection rules

### Adding New Flags
1. Define detection logic
2. Add severity weight
3. Update tower mappings
4. Test with game

### Custom Output Formats
1. Modify output methods
2. Add new file formats
3. Update validation
4. Document changes

## Integration with Game

The processed data integrates with the game through:

1. **JSON Structure** - Matches game's expected format
2. **Flag Mappings** - Aligns with tower capabilities
3. **Difficulty Balancing** - Severity-based wave progression
4. **Data Quality** - Real-world data issues as game challenges

## Best Practices

- Always validate input data before processing
- Use consistent naming conventions
- Document custom modifications
- Test with sample data first
- Keep processing logs for debugging
- Version control configuration changes
