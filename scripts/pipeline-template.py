import json
import os
from abc import ABC, abstractmethod
from pathlib import Path

import pandas as pd

# TODO: figure out how to handle data folder for debugger
# TODO: Can I add an assertion to make sure the total number of observations is correct?
# TODO: figure out the right abstraction for the load items » items should be loaded separately and passed to the class

CURRENT_DIR = Path(__file__).resolve().parent
DATA_DIR = CURRENT_DIR / "../data/"

# TODO: Maybe put this in the class?
# Can also keep bags, etc if we want them
TRIAL_COLS = [
    "Trial ID",
    "Test Method",
    "Item ID",
    "Item Format",
    "Item Name",
    "Item Description Refined",
    "Item Description Refined (Trial)",
    "Material Class I",
    "Material Class II",
    "Material Class III",
    "Start Weight",
    "% Residuals (Mass)",
    "% Residuals (Area)",
]

ITEMS_PATH = DATA_DIR / "CFTP Test Item Inventory with Dimensions - All Trials.xlsx"
EXTRA_ITEMS_PATH = DATA_DIR / "Item IDS for CASP004 CASP003.xlsx"

ITEMS = pd.read_excel(ITEMS_PATH, sheet_name=0, skiprows=3)
ITEMS["Start Weight"] = ITEMS["Average Initial Weight, g"]

old_json = json.load(open(DATA_DIR / "old_items.json", "r"))
ITEMS["Item ID"] = ITEMS["Item Description Refined"].map(old_json)

item2id = {
    key.strip(): value
    for key, value in ITEMS.set_index("Item Description Refined")["Item ID"]
    .to_dict()
    .items()
}

extra_items = pd.read_excel(EXTRA_ITEMS_PATH)
extra_items = extra_items.set_index("OG Description")["Item ID"].to_dict()

item2id = item2id | extra_items

TRIALS_PATH = DATA_DIR / "CFTP Anonymized Data Compilation Overview - For Sharing.xlsx"
TRIALS = pd.read_excel(TRIALS_PATH, skiprows=3)

trial2id = {
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

OPERATING_CONDITIONS_PATH = (
    DATA_DIR / "Donated Data 2023 - Compiled Facility Conditions for DSI.xlsx"
)

# TODO: Set this up so we can actually plot the full temperature data
df_temps = pd.read_excel(
    OPERATING_CONDITIONS_PATH, sheet_name=3, skiprows=1, index_col="Day #"
)
df_temps.columns = [trial2id[col.replace("*", "")] for col in df_temps.columns]
df_temps.to_csv(DATA_DIR / "temperatures.csv")
df_temps.mean().to_frame("Average Temperature (F)").to_csv(DATA_DIR / "avg_temps.csv")

TRIAL_DURATION = pd.read_excel(
    OPERATING_CONDITIONS_PATH,
    sheet_name=2,
    skiprows=3,
)
TRIAL_DURATION.columns = [
    col.replace("\n", "").strip() for col in TRIAL_DURATION.columns
]
TRIAL_DURATION = TRIAL_DURATION[
    ["Facility Designation", "Endpoint Analysis (trial length)"]
].rename(
    columns={
        "Facility Designation": "Trial ID",
        "Endpoint Analysis (trial length)": "Trial Duration",
    }
)
TRIAL_DURATION["Trial ID"] = (
    TRIAL_DURATION["Trial ID"]
    .str.replace("( ", "(")
    .str.replace(" )", ")")
    .map(trial2id)
)
TRIAL_DURATION.set_index("Trial ID").to_csv(DATA_DIR / "trial_durations.csv")

MOISTURE = pd.read_excel(
    OPERATING_CONDITIONS_PATH, sheet_name=4, skiprows=1, index_col="Week"
)
MOISTURE.columns = [trial2id[col.replace("*", "")] for col in MOISTURE.columns]
MOISTURE = MOISTURE.mean().to_frame("Average % Moisture (In Field)")
MOISTURE.to_csv(DATA_DIR / "moisture.csv")

processed_data = []


class AbstractDataPipeline(ABC):
    def __init__(
        self,
        data_filepath,
        items=ITEMS,
        item2id=item2id,
        trial=None,
        sheet_name=0,
        skiprows=0,
    ):
        self.data_filepath = data_filepath
        filename = self.data_filepath.stem
        self.trial = trial
        file_suffix = f"_{trial}_clean.csv" if self.trial else "_clean.csv"
        self.output_filepath = self.data_filepath.with_name(filename + file_suffix)

        # TODO: This is kind of messy and could probably be better
        self.data = self.load_data(
            data_filepath, sheet_name=sheet_name, skiprows=skiprows
        )
        self.items = items
        self.item2id = item2id

    @abstractmethod
    def load_data(self, data_filepath, sheet_name=0, skip_rows=0):
        pass

    def preprocess_data(self, df):
        return df

    def join_with_items(self, df):
        return pd.merge(self.items, df, on="Item ID")

    def calculate_results(self, df):
        return df

    def run(self, save=False):
        print(f"Running data pipeline for {self.trial}")
        df = self.data.copy()
        df = self.preprocess_data(df)
        df = self.join_with_items(df)
        df = self.calculate_results(df)
        df = pd.merge(df, TRIALS, left_on="Trial ID", right_on="Public Trial ID")
        df = df[TRIAL_COLS]
        if save:
            df.to_csv(self.output_filepath, index=False)
            print(f"Saved to {self.output_filepath}")
        print("Complete!")
        return df


class CASP004Pipeline(AbstractDataPipeline):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        """Processes the weight and area DataFrames"""
        # We are using the start weight specific to this trial so drop the Start Weight column
        # Start weight is set in preprocess_data
        self.items = self.items.drop("Start Weight", axis=1)

    def load_data(self, data_filepath, sheet_name=0, skiprows=0):
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    def preprocess_data(self, data):
        # Only use observations at the end
        df = data[data["Stage"] == "End"]
        # Bags A-5 and A-6 were not found
        df = df[~df["Bag Id"].isin(["A-5", "A-6"])]

        df["Trial"] = df["Trial Id"]

        # Take the average of the three weight observations
        df["End Weight"] = df[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)

        # Null values mean the item fully disintegrated
        df["End Weight"] = df["End Weight"].fillna(0)

        # Ok...we need to do some weird items work arounds here...this might work?
        casp004_items = pd.read_excel(self.data_filepath, sheet_name=2).drop_duplicates(
            subset=["Item Name"]
        )
        casp004_weights = casp004_items.set_index("Item Name")[
            "Weight (average)"
        ].to_dict()
        df["Start Weight"] = df["Product Name"].map(casp004_weights)
        # rename so this matches the other trials
        df["Item Description Refined"] = df["Product Name"]

        # TODO: Some of this should be in the abstract method...
        df["Item ID"] = df["Item Description Refined"].str.strip().map(self.item2id)
        # Prevent duplicate columns when merging with items
        df = df.rename(
            columns={"Item Description Refined": "Item Description Refined (Trial)"}
        )
        df["Trial ID"] = "CASP004-01"
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"

        return df

    def calculate_results(self, df):
        df["End Weight"] = df[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)
        df["End Weight"] = df["End Weight"].fillna(0)

        df["% Residuals (Area)"] = None
        df["% Residuals (Mass)"] = df["End Weight"] / df["Start Weight"]
        return df


CASP004_PATH = (
    DATA_DIR / "CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx"
)
casp004_pipeline = CASP004Pipeline(CASP004_PATH, sheet_name=1, trial="casp004")
processed_data.append(casp004_pipeline.run())


class ClosedLoopPipeline(AbstractDataPipeline):
    def melt_trial(self, df, value_name):
        """Helper method to melt DataFrames."""
        item_ids = [
            "N",
            "O",
            "Q",
            "V",
            "B",
            "D",
            "H",
            "I",
            "J",
            "K",
            "K1",
            "K2",
            "K3",
            "N",
            "O",
            "P",
            "Q",
            "S",
            "V",
        ]
        return (
            df.melt(
                id_vars=["Trial ID", "Trial Stage", "Bag Set", "Bag Number"],
                value_vars=item_ids,
                var_name="Item ID",
                value_name=value_name,
            )
            .dropna(subset=[value_name])
            .reset_index(drop=True)
        )

    def load_data(self, data_filepath, sheet_name, skiprows):
        df_weight = pd.read_excel(data_filepath, sheet_name=3, skiprows=2)
        weight_melted = self.melt_trial(df_weight, "% Residuals (Mass)")

        df_area = pd.read_excel(data_filepath, sheet_name=4, skiprows=2)
        df_area["Trial ID"] = df_area["Facility Name"].map(trial2id)
        area_melted = self.melt_trial(df_area, "% Residuals (Area)")

        return pd.merge(
            weight_melted,
            area_melted,
            on=["Trial ID", "Trial Stage", "Bag Set", "Bag Number", "Item ID"],
            how="outer",
        )

    def preprocess_data(self, df):
        df["Item Description Refined (Trial)"] = None
        df = df[df["Trial Stage"] == "Second Removal"]
        return df


TEN_TRIALS_PATH = DATA_DIR / "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
closed_loop_pipeline = ClosedLoopPipeline(TEN_TRIALS_PATH, trial="closed_loop")
processed_data.append(closed_loop_pipeline.run())


class PDFPipeline(AbstractDataPipeline):
    def __init__(self, *args, weight_col="Residual Weight - Oven-dry", **kwargs):
        super().__init__(*args, **kwargs)
        self.weight_col = weight_col

    def load_data(self, data_filepath, sheet_name=0, skiprows=0):
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    def join_with_items(self, df):
        # TODO: Do we want to merge on ID or should we just merge on description if we have it?
        df["Item ID"] = df["Item Description Refined"].str.strip().map(self.item2id)
        # Prevent duplicate columns when merging with items
        df = df.rename(
            columns={"Item Description Refined": "Item Description Refined (Trial)"}
        )
        drop_cols = ["Item Description From Trial"]
        df = df.drop(drop_cols, axis=1)
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"
        return pd.merge(self.items, df, on="Item ID")

    def calculate_results(self, df):
        df["% Residuals (Mass)"] = df[self.weight_col] / (
            df["Start Weight"] * df["Number of Items per bag"]
        )
        df["% Residuals (Area)"] = None
        df["Trial"] = df["Trial ID"]
        return df


PDF_TRIALS = DATA_DIR / "Compiled Field Results - CFTP Gathered Data.xlsx"

ad001_pipeline = PDFPipeline(PDF_TRIALS, trial="ad001", sheet_name=0, skiprows=1)
processed_data.append(ad001_pipeline.run())

wr001_pipeline = PDFPipeline(PDF_TRIALS, trial="wr001", sheet_name=1)
processed_data.append(wr001_pipeline.run())

casp001_pipeline = PDFPipeline(PDF_TRIALS, trial="casp001", sheet_name=2)
processed_data.append(casp001_pipeline.run())


class CASP003Pipeline(PDFPipeline):
    def preprocess_data(self, data):
        # everything in blug bags was combined and impossible to separate
        return data[data["Trial Bag Colour"] != "Blue"]


casp003_pipeline = CASP003Pipeline(
    PDF_TRIALS,
    trial="casp003",
    sheet_name=3,
    weight_col="Final Residual Weight - wet - aggregate",
)
processed_data.append(casp003_pipeline.run())

wr003_pipeline = PDFPipeline(
    PDF_TRIALS, trial="wr003", sheet_name=4, weight_col="Final Residual Weight - wet"
)
processed_data.append(wr003_pipeline.run())

output_filepath = DATA_DIR / "all_trials_processed.csv"
print(f"Saving all trials to {output_filepath}")
all_trials = pd.concat(processed_data, ignore_index=True)

# Exclude mixed materials and multi-laminate pouches
all_trials = all_trials[~(all_trials["Material Class II"] == "Mixed Materials")]
all_trials = all_trials[
    ~(all_trials["Item Name"] == "Multi-laminate stand-up pounch with zipper")
]
# Exclude anything over 1000% as outlier
all_trials = all_trials[all_trials["% Residuals (Mass)"] < 10]

all_trials.to_csv(output_filepath, index=False)
print("Complete!")
