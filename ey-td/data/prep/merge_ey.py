#!/usr/bin/env python3
"""
EY Bank Merger Data Preparation Script

This script processes EY Excel files and generates clean CSV files and 
a JSON file for the tower defense game.

Usage:
    python merge_ey.py --in data/raw --out data/outputs --today 2025-01-03
"""

import pandas as pd
import json
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EYDataProcessor:
    def __init__(self, input_dir, output_dir, today_date):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.today = pd.to_datetime(today_date)
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Data containers
        self.customers = None
        self.accounts_cursav = None
        self.accounts_fixed = None
        self.accounts_loan = None
        
        # Flag definitions
        self.flags = {
            'expired_legal_id': 'Legal ID has expired',
            'duplicate_legal_id': 'Duplicate legal ID found',
            'dormant_high_balance': 'Dormant account with high balance',
            'locked_ratio_gt25': 'Account locked ratio > 25%',
            'past_maturity_not_closed': 'Account past maturity but not closed',
            'loan_overdue_120d': 'Loan overdue by 120+ days',
            'interest_in_arrears': 'Interest payments in arrears'
        }
    
    def load_data(self):
        """Load data from Excel files"""
        logger.info("Loading data from Excel files...")
        
        try:
            # Load customer data
            customer_files = list(self.input_dir.glob("*Customer*.xlsx"))
            if customer_files:
                self.customers = pd.read_excel(customer_files[0])
                logger.info(f"Loaded {len(self.customers)} customer records")
            
            # Load current/savings accounts
            cursav_files = list(self.input_dir.glob("*CurSav*.xlsx"))
            if cursav_files:
                self.accounts_cursav = pd.read_excel(cursav_files[0])
                logger.info(f"Loaded {len(self.accounts_cursav)} current/savings accounts")
            
            # Load fixed term accounts
            fixed_files = list(self.input_dir.glob("*FixedTerm*.xlsx"))
            if fixed_files:
                self.accounts_fixed = pd.read_excel(fixed_files[0])
                logger.info(f"Loaded {len(self.accounts_fixed)} fixed term accounts")
            
            # Load loan accounts
            loan_files = list(self.input_dir.glob("*Loan*.xlsx"))
            if loan_files:
                self.accounts_loan = pd.read_excel(loan_files[0])
                logger.info(f"Loaded {len(self.accounts_loan)} loan accounts")
                
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def normalize_schema(self):
        """Normalize column names and data types"""
        logger.info("Normalizing schema...")
        
        # Common column mappings
        column_mappings = {
            # Customer fields
            'customer_id': ['CustomerID', 'customerId', 'Customer_Id'],
            'legal_id': ['LegalID', 'legalId', 'Legal_Id', 'legalExpiredDate'],
            'legal_expired_date': ['LegalExpiredDate', 'legalExpiredDate', 'Legal_Expired_Date'],
            'country': ['Country', 'country'],
            'city': ['City', 'city'],
            
            # Account fields
            'account_id': ['AccountID', 'accountId', 'Account_Id'],
            'account_type': ['AccountType', 'accountType', 'Account_Type'],
            'account_status': ['AccountStatus', 'accountStatus', 'Account_Status'],
            'uncleared_balance': ['UnclearedBalance', 'unclearedBalance', 'Uncleared_Balance'],
            'locked_amount': ['LockedAmount', 'lockedAmount', 'Locked_Amount'],
            'maturity_date': ['MaturityDate', 'maturityDate', 'Maturity_Date'],
            
            # Loan fields
            'loan_id': ['LoanID', 'loanId', 'Loan_Id'],
            'last_payment_date': ['LastPaymentDate', 'lastPaymentDate', 'Last_Payment_Date'],
            'interest_from_arrears_balance': ['InterestFromArrearsBalance', 'interestFromArrearsBalance', 'Interest_From_Arrears_Balance']
        }
        
        # Apply mappings to each dataset
        for df_name, df in [('customers', self.customers), ('accounts_cursav', self.accounts_cursav), 
                           ('accounts_fixed', self.accounts_fixed), ('accounts_loan', self.accounts_loan)]:
            if df is not None:
                self._apply_column_mappings(df, column_mappings)
    
    def _apply_column_mappings(self, df, mappings):
        """Apply column name mappings to a dataframe"""
        for standard_name, possible_names in mappings.items():
            for possible_name in possible_names:
                if possible_name in df.columns:
                    df.rename(columns={possible_name: standard_name}, inplace=True)
                    break
    
    def detect_flags(self):
        """Detect data quality issues and assign flags"""
        logger.info("Detecting data quality issues...")
        
        # Process customers
        if self.customers is not None:
            self.customers['flags'] = self.customers.apply(self._detect_customer_flags, axis=1)
            self.customers['severity'] = self.customers['flags'].apply(self._calculate_severity)
        
        # Process accounts
        if self.accounts_cursav is not None:
            self.accounts_cursav['flags'] = self.accounts_cursav.apply(self._detect_account_flags, axis=1)
            self.accounts_cursav['severity'] = self.accounts_cursav['flags'].apply(self._calculate_severity)
        
        if self.accounts_fixed is not None:
            self.accounts_fixed['flags'] = self.accounts_fixed.apply(self._detect_fixed_account_flags, axis=1)
            self.accounts_fixed['severity'] = self.accounts_fixed['flags'].apply(self._calculate_severity)
        
        # Process loans
        if self.accounts_loan is not None:
            self.accounts_loan['flags'] = self.accounts_loan.apply(self._detect_loan_flags, axis=1)
            self.accounts_loan['severity'] = self.accounts_loan['flags'].apply(self._calculate_severity)
    
    def _detect_customer_flags(self, row):
        """Detect flags for customer data"""
        flags = []
        
        # Check for expired legal ID
        if pd.notna(row.get('legal_expired_date')):
            try:
                expired_date = pd.to_datetime(row['legal_expired_date'])
                if expired_date < self.today:
                    flags.append('expired_legal_id')
            except:
                pass
        
        # Check for duplicate legal IDs (simplified check)
        if pd.notna(row.get('legal_id')):
            if self.customers is not None:
                legal_id_count = self.customers[self.customers['legal_id'] == row['legal_id']].shape[0]
                if legal_id_count > 1:
                    flags.append('duplicate_legal_id')
        
        return flags
    
    def _detect_account_flags(self, row):
        """Detect flags for current/savings accounts"""
        flags = []
        
        # Check for dormant high balance
        if pd.notna(row.get('account_status')) and pd.notna(row.get('uncleared_balance')):
            if 'dormant' in str(row['account_status']).lower():
                try:
                    balance = float(row['uncleared_balance'])
                    if balance > 5000:
                        flags.append('dormant_high_balance')
                except:
                    pass
        
        # Check for locked ratio > 25%
        if pd.notna(row.get('locked_amount')) and pd.notna(row.get('uncleared_balance')):
            try:
                locked = float(row['locked_amount'])
                balance = max(float(row['uncleared_balance']), 1)
                if locked / balance > 0.25:
                    flags.append('locked_ratio_gt25')
            except:
                pass
        
        return flags
    
    def _detect_fixed_account_flags(self, row):
        """Detect flags for fixed term accounts"""
        flags = []
        
        # Check for past maturity not closed
        if pd.notna(row.get('maturity_date')) and pd.notna(row.get('account_status')):
            try:
                maturity_date = pd.to_datetime(row['maturity_date'])
                if maturity_date < self.today:
                    if 'closed' not in str(row['account_status']).lower():
                        flags.append('past_maturity_not_closed')
            except:
                pass
        
        return flags
    
    def _detect_loan_flags(self, row):
        """Detect flags for loan accounts"""
        flags = []
        
        # Check for loan overdue 120+ days
        if pd.notna(row.get('last_payment_date')):
            try:
                last_payment = pd.to_datetime(row['last_payment_date'])
                days_overdue = (self.today - last_payment).days
                if days_overdue > 120:
                    flags.append('loan_overdue_120d')
            except:
                pass
        
        # Check for interest in arrears
        if pd.notna(row.get('interest_from_arrears_balance')):
            try:
                arrears = float(row['interest_from_arrears_balance'])
                if arrears > 0:
                    flags.append('interest_in_arrears')
            except:
                pass
        
        return flags
    
    def _calculate_severity(self, flags):
        """Calculate severity score based on flags"""
        if not flags:
            return 1
        
        # Weight different flags
        flag_weights = {
            'expired_legal_id': 3,
            'duplicate_legal_id': 4,
            'dormant_high_balance': 2,
            'locked_ratio_gt25': 2,
            'past_maturity_not_closed': 3,
            'loan_overdue_120d': 5,
            'interest_in_arrears': 4
        }
        
        severity = sum(flag_weights.get(flag, 1) for flag in flags)
        return min(severity, 10)  # Cap at 10
    
    def create_summary_strings(self):
        """Create summary strings for each record"""
        if self.customers is not None:
            self.customers['summary'] = self.customers.apply(self._create_customer_summary, axis=1)
        
        if self.accounts_cursav is not None:
            self.accounts_cursav['summary'] = self.accounts_cursav.apply(self._create_account_summary, axis=1)
        
        if self.accounts_fixed is not None:
            self.accounts_fixed['summary'] = self.accounts_fixed.apply(self._create_fixed_account_summary, axis=1)
        
        if self.accounts_loan is not None:
            self.accounts_loan['summary'] = self.accounts_loan.apply(self._create_loan_summary, axis=1)
    
    def _create_customer_summary(self, row):
        """Create summary string for customer"""
        parts = []
        if pd.notna(row.get('country')):
            parts.append(row['country'])
        if pd.notna(row.get('city')):
            parts.append(row['city'])
        if pd.notna(row.get('legal_id')):
            parts.append(f"legalId={row['legal_id']}")
        
        return ", ".join(parts) if parts else "Unknown Customer"
    
    def _create_account_summary(self, row):
        """Create summary string for account"""
        parts = []
        if pd.notna(row.get('account_type')):
            parts.append(row['account_type'])
        if pd.notna(row.get('uncleared_balance')):
            try:
                balance = float(row['uncleared_balance'])
                parts.append(f"Balance: ${balance:,.0f}")
            except:
                pass
        
        return ", ".join(parts) if parts else "Unknown Account"
    
    def _create_fixed_account_summary(self, row):
        """Create summary string for fixed account"""
        parts = []
        if pd.notna(row.get('account_type')):
            parts.append(row['account_type'])
        if pd.notna(row.get('maturity_date')):
            try:
                maturity = pd.to_datetime(row['maturity_date']).strftime('%Y-%m-%d')
                parts.append(f"Maturity: {maturity}")
            except:
                pass
        
        return ", ".join(parts) if parts else "Unknown Fixed Account"
    
    def _create_loan_summary(self, row):
        """Create summary string for loan"""
        parts = []
        if pd.notna(row.get('account_type')):
            parts.append(row['account_type'])
        if pd.notna(row.get('last_payment_date')):
            try:
                last_payment = pd.to_datetime(row['last_payment_date'])
                days_overdue = (self.today - last_payment).days
                if days_overdue > 0:
                    parts.append(f"Overdue: {days_overdue} days")
            except:
                pass
        
        return ", ".join(parts) if parts else "Unknown Loan"
    
    def save_clean_data(self):
        """Save cleaned data to CSV files"""
        logger.info("Saving cleaned data to CSV files...")
        
        if self.customers is not None:
            output_file = self.output_dir / "customers_clean.csv"
            self.customers.to_csv(output_file, index=False)
            logger.info(f"Saved {len(self.customers)} customer records to {output_file}")
        
        if self.accounts_cursav is not None:
            output_file = self.output_dir / "accounts_cursav_clean.csv"
            self.accounts_cursav.to_csv(output_file, index=False)
            logger.info(f"Saved {len(self.accounts_cursav)} current/savings accounts to {output_file}")
        
        if self.accounts_fixed is not None:
            output_file = self.output_dir / "accounts_fixed_clean.csv"
            self.accounts_fixed.to_csv(output_file, index=False)
            logger.info(f"Saved {len(self.accounts_fixed)} fixed term accounts to {output_file}")
        
        if self.accounts_loan is not None:
            output_file = self.output_dir / "accounts_loan_clean.csv"
            self.accounts_loan.to_csv(output_file, index=False)
            logger.info(f"Saved {len(self.accounts_loan)} loan accounts to {output_file}")
    
    def generate_game_data(self):
        """Generate JSON data for the tower defense game"""
        logger.info("Generating game data...")
        
        waves = []
        
        # Create waves with balanced difficulty
        all_records = []
        
        # Collect all records with their metadata
        if self.customers is not None:
            for _, row in self.customers.iterrows():
                all_records.append({
                    'id': f"CUST-{row.get('customer_id', 'UNKNOWN')}",
                    'room': 'customers',
                    'summary': row.get('summary', 'Unknown Customer'),
                    'flags': row.get('flags', []),
                    'severity': row.get('severity', 1)
                })
        
        if self.accounts_cursav is not None:
            for _, row in self.accounts_cursav.iterrows():
                all_records.append({
                    'id': f"ACC-{row.get('account_id', 'UNKNOWN')}",
                    'room': 'accounts',
                    'summary': row.get('summary', 'Unknown Account'),
                    'flags': row.get('flags', []),
                    'severity': row.get('severity', 1)
                })
        
        if self.accounts_fixed is not None:
            for _, row in self.accounts_fixed.iterrows():
                all_records.append({
                    'id': f"FIX-{row.get('account_id', 'UNKNOWN')}",
                    'room': 'fixed',
                    'summary': row.get('summary', 'Unknown Fixed Account'),
                    'flags': row.get('flags', []),
                    'severity': row.get('severity', 1)
                })
        
        if self.accounts_loan is not None:
            for _, row in self.accounts_loan.iterrows():
                all_records.append({
                    'id': f"LOAN-{row.get('loan_id', 'UNKNOWN')}",
                    'room': 'loans',
                    'summary': row.get('summary', 'Unknown Loan'),
                    'flags': row.get('flags', []),
                    'severity': row.get('severity', 1)
                })
        
        # Create balanced waves
        if all_records:
            # Sort by severity for balanced waves
            all_records.sort(key=lambda x: x['severity'])
            
            # Create 4-6 waves with 3-6 records each
            records_per_wave = len(all_records) // 5  # Aim for 5 waves
            records_per_wave = max(3, min(records_per_wave, 6))  # Between 3-6 records per wave
            
            for wave_idx in range(5):  # Create 5 waves
                start_idx = wave_idx * records_per_wave
                end_idx = start_idx + records_per_wave
                
                if start_idx >= len(all_records):
                    break
                
                wave_records = all_records[start_idx:end_idx]
                
                # Assign lanes (0-3)
                wave = {
                    'lane': wave_idx % 4,
                    'rows': wave_records
                }
                waves.append(wave)
        
        # Create the final JSON structure
        game_data = {
            'waves': waves,
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_records': len(all_records),
                'total_waves': len(waves),
                'flags_detected': list(set(flag for record in all_records for flag in record['flags']))
            }
        }
        
        # Save to JSON file
        output_file = self.output_dir / "rows_sample.json"
        with open(output_file, 'w') as f:
            json.dump(game_data, f, indent=2)
        
        logger.info(f"Generated {len(waves)} waves with {len(all_records)} total records")
        logger.info(f"Game data saved to {output_file}")
    
    def process(self):
        """Main processing pipeline"""
        logger.info("Starting EY data processing...")
        
        try:
            self.load_data()
            self.normalize_schema()
            self.detect_flags()
            self.create_summary_strings()
            self.save_clean_data()
            self.generate_game_data()
            
            logger.info("Data processing completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during processing: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(description='Process EY bank data for tower defense game')
    parser.add_argument('--in', dest='input_dir', default='data/raw', 
                       help='Input directory containing Excel files')
    parser.add_argument('--out', dest='output_dir', default='data/outputs',
                       help='Output directory for processed files')
    parser.add_argument('--today', default=datetime.now().strftime('%Y-%m-%d'),
                       help='Today\'s date for calculations (YYYY-MM-DD)')
    
    args = parser.parse_args()
    
    # Create processor and run
    processor = EYDataProcessor(args.input_dir, args.output_dir, args.today)
    processor.process()

if __name__ == '__main__':
    main()
