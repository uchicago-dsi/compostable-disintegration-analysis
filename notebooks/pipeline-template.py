from abc import ABC, abstractmethod

import pandas as pd

# TODO: figure out how to handle data folder for debugger
# TODO: Can I add an assertion to make sure the total number of observations is correct?

DATA_FOLDER = "../data/"
# DATA_FOLDER = "data/"

ITEMS_PATH = DATA_FOLDER + "CFTP Test Item Inventory with Dimensions - All Trials.xlsx"
EXTRA_ITEMS_PATH = DATA_FOLDER + "Item IDS for CASP004 CASP003.xlsx"

# TODO: Maybe put this in the class?
# Can also keep bags, etc if we want them
TRIAL_COLS = [
    "Trial",
    "Item ID",
    "Item Name",
    "Item Description Refined",
    "Material Class I",
    "Material Class II",
    "Material Class III",
    "Start Weight",
    "% Residuals (Weight)",
    "% Residuals (Area)",
]


class AbstractDataPipeline(ABC):
    def __init__(
        self,
        data_filepath,
        items_filepath=ITEMS_PATH,
        trial=None,
        sheet_name=0,
        skiprows=0,
    ):
        self.data_filepath = data_filepath
        filename, _ = self.data_filepath.rsplit(".", 1)
        self.trial = trial
        file_suffix = f"_{trial}_clean.csv" if self.trial else "_clean.csv"
        self.output_filepath = filename + file_suffix

        # TODO: This is kind of messy and could probably be better
        self.data = self.load_data(
            data_filepath, sheet_name=sheet_name, skiprows=skiprows
        )
        self.items = self.load_items(items_filepath)
        self.item2id = self.load_items_map()
        self.item2id = self.load_extra_items_map() | self.item2id

    @abstractmethod
    def load_data(self, data_filepath, sheet_name=0, skip_rows=0):
        pass

    def load_items(self, items_filepath):
        """Loads the items DataFrame."""
        items = pd.read_excel(items_filepath, sheet_name=0, skiprows=3)
        items["Start Weight"] = items["Average Initial Weight, g"]
        return items

    def load_items_map(self):
        return {
            key.strip(): value
            for key, value in self.items.set_index("Item Description Refined")[
                "Item ID"
            ]
            .to_dict()
            .items()
        }

    def load_extra_items_map(self):
        extra_items = pd.read_excel(EXTRA_ITEMS_PATH)
        return extra_items.set_index("OG Description")["Item ID"].to_dict()

    def preprocess_data(self, df):
        return df

    def join_with_items(self, df):
        """Processes the weight and area DataFrames"""
        return pd.merge(self.items, df, on="Item ID")

    def process_data(self, df):
        return df

    def save_data(self, df):
        df = df[TRIAL_COLS]
        df.to_csv(self.output_filepath, index=False)
        return df

    def run(self, save=False):
        print(f"Running data pipeline for {self.trial}")
        df = self.data.copy()
        df = self.preprocess_data(df)
        df = self.join_with_items(df)
        df = self.process_data(df)
        df = self.save_data(df)
        df = df[TRIAL_COLS]
        if save:
            df.to_csv(self.output_filepath, index=False)
            print(f"Saved to {self.output_filepath}")
        print("Complete!")
        return df


class CASP004Pipeline(AbstractDataPipeline):

    def load_data(self, data_filepath, sheet_name=0, skiprows=0):
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    def load_items(self, items_filepath):
        items = super().load_items(items_filepath)

        # We are using the start weight specific to this trial so drop the Start Weight column
        # Start weight is set in preprocess_data
        items = items.drop("Start Weight", axis=1)
        return items

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
        drop_cols = ["Item Description Refined"]
        df = df.drop(drop_cols, axis=1)
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"

        return df

    def process_data(self, df):
        df["End Weight"] = df[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)
        df["End Weight"] = df["End Weight"].fillna(0)

        df["% Residuals (Area)"] = None
        df["% Residuals (Weight)"] = df["End Weight"] / df["Start Weight"]
        return df


CASP004_PATH = (
    DATA_FOLDER + "CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx"
)
casp004_pipeline = CASP004Pipeline(CASP004_PATH, sheet_name=1, trial="casp004")
casp004_processed = casp004_pipeline.run(save=True)


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
                id_vars=["Facility Name", "Trial Stage", "Bag Set", "Bag Number"],
                value_vars=item_ids,
                var_name="Item ID",
                value_name=value_name,
            )
            .dropna(subset=[value_name])
            .reset_index(drop=True)
        )

    def load_data(self, data_filepath, sheet_name, skiprows):
        df_weight = pd.read_excel(data_filepath, sheet_name=3, skiprows=2)
        weight_melted = self.melt_trial(df_weight, "% Residuals (Weight)")

        df_area = pd.read_excel(data_filepath, sheet_name=4, skiprows=2)
        area_melted = self.melt_trial(df_area, "% Residuals (Area)")

        return pd.merge(
            weight_melted,
            area_melted,
            on=["Facility Name", "Trial Stage", "Bag Set", "Bag Number", "Item ID"],
            how="outer",
        )

    def preprocess_data(self, df):
        df = df[df["Trial Stage"] == "Second Removal"]
        df = df.rename(columns={"Facility Name": "Trial"})
        return df


TEN_TRIALS_PATH = (
    DATA_FOLDER + "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
)
closed_loop_pipeline = ClosedLoopPipeline(TEN_TRIALS_PATH, trial="closed_loop")
closed_loop_processed = closed_loop_pipeline.run(save=True)


class PDFPipeline(AbstractDataPipeline):
    def __init__(self, *args, weight_col="Residual Weight - Oven-dry", **kwargs):
        super().__init__(*args, **kwargs)
        self.weight_col = weight_col

    def load_data(self, data_filepath, sheet_name=0, skiprows=0):
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    # TODO: Maybe need to add setup for extra items here
    def join_with_items(self, df):
        # TODO: Do we want to merge on ID or should we just merge on description if we have it?
        df["Item ID"] = df["Item Description Refined"].str.strip().map(self.item2id)
        # Prevent duplicate columns when merging with items
        drop_cols = ["Item Description From Trial", "Item Description Refined"]
        df = df.drop(drop_cols, axis=1)
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"
        return pd.merge(self.items, df, on="Item ID")

    def process_data(self, df):
        df["% Residuals (Weight)"] = df[self.weight_col] / (
            df["Start Weight"] * df["Number of Items per bag"]
        )
        df["% Residuals (Area)"] = None
        df["Trial"] = df["Trial ID"]
        return df


PDF_TRIALS = DATA_FOLDER + "Compiled Field Results - CFTP Gathered Data.xlsx"

ad001_pipeline = PDFPipeline(PDF_TRIALS, trial="ad001", sheet_name=0, skiprows=1)
ad001_processed = ad001_pipeline.run(save=True)

wr001_pipeline = PDFPipeline(PDF_TRIALS, trial="wr001", sheet_name=1)
wr001_processed = wr001_pipeline.run(save=True)

casp001_pipeline = PDFPipeline(PDF_TRIALS, trial="casp001", sheet_name=2)
casp001_processed = casp001_pipeline.run(save=True)


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
casp003_processed = casp003_pipeline.run(save=True)

wr003_pipeline = PDFPipeline(
    PDF_TRIALS, trial="wr003", sheet_name=4, weight_col="Final Residual Weight - wet"
)
wr003_processed = wr003_pipeline.run(save=True)
