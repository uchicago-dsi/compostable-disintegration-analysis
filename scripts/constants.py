from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
DATA_DIR = CURRENT_DIR / "../data/"

# TODO: Can also keep bags, etc if we want them
TRIAL_COLS = [
    "Trial ID",
    "Test Method",
    "Item ID",
    "Item Format",
    "Item Brand",
    "Item Name",
    "Item Description Refined",
    # "Item Description Refined (Trial)",
    "Material Class I",
    "Material Class II",
    "Material Class III",
    # "Start Weight",
    "% Residuals (Mass)",
    "% Residuals (Area)",
]

TRIAL_TO_ID_MAP = {
    "Facility 1 (Windrow)": "WR004-01",
    "Facility 2 (CASP)": "CASP005-01",
    "Facility 3 (EASP)": "EASP001-01",
    "Facility 4 (In-Vessel)": "IV002-01",
    "Facility 5 (EASP)": "EASP002-01",
    "Facility 6 (CASP)": "CASP006-01",
    "Facility 7 (CASP)": "CASP004-02",
    "Facility 8 (ASP)": "ASP001-01",
    "Facility 9 (EASP)": "EASP003-01",
    "Facility 10 (Windrow)": "WR005-01",
    "Facility 1": "WR004-01",
    "Facility 2": "CASP005-01",
    "Facility 3": "EASP001-01",
    "Facility 4": "IV002-01",
    "Facility 5": "EASP002-01",
    "Facility 6": "CASP006-01",
    "Facility 7": "CASP004-02",
    "Facility 8": "ASP001-01",
    "Facility 9": "EASP003-01",
    "Facility 10": "WR005-01",
}

OUTLIER_THRESHOLD = 10

DATA_SHEET_PATHS = {
  "ITEMS_PATH":Path.joinpath(DATA_DIR, "CFTP Test Item Inventory with Dimensions - All Trials.xlsx"),
  "EXTRA_ITEMS_PATH":Path.joinpath(DATA_DIR, "Item IDS for CASP004 CASP003.xlsx"),
  "TRIALS_PATH":Path.joinpath(DATA_DIR, "CFTP-TrialDetails-Oct22-2024.xlsx"),
  "OPERATING_CONDITIONS_PATH":Path.joinpath(DATA_DIR, "Donated Data 2023 - Compiled Facility Conditions for DSI.xlsx"),
  "OLD_ITEMS_JSON":Path.joinpath(DATA_DIR, "old_items.json"),
}

TRIAL_DATA_PATHS = {
  "NEW_TEMPLATE_PATH": Path.joinpath(DATA_DIR, "CFTP_DisintegrationDataInput_Oct22-2024-partial.csv"),
  "CASP004_PATH": Path.joinpath(DATA_DIR, "CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx"),
  "TEN_TRIALS_PATH": Path.joinpath(DATA_DIR, "Donated Data 2023 - Compiled Field Results for DSI.xlsx"),
  "PDF_TRIALS": Path.joinpath(DATA_DIR, "Compiled Field Results - CFTP Gathered Data.xlsx")
}

ID_TO_TECHNOLOGY_MAP = {
    "WR": "Windrow",
    "CASP": "Covered or Extended Aerated Static Pile",
    "EASP": "Covered or Extended Aerated Static Pile",
    "ASP": "Aerated Static Pile",
    "IV": "In-Vessel",
}

# Anonymize brand names
# Note: no anonymization for BÉSICS®
BRAND_MAPPING = {"BÉSICS®": "BÉSICS®"}  