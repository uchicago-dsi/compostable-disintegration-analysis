from abc import ABC, abstractmethod

import pandas as pd

# TODO: figure out how to handle data folder for debugger

DATA_FOLDER = "../data/"
# DATA_FOLDER = "data/"

ITEMS_PATH = DATA_FOLDER + "CFTP Test Item Inventory with Dimensions - All Trials.xlsx"

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
    def __init__(self, data_filepath, items_filepath=ITEMS_PATH):
        self.data_filepath = data_filepath
        filename, _ = self.data_filepath.rsplit(".", 1)
        self.output_filepath = f"{filename}_clean.csv"

        self.data = self.load_data(data_filepath)
        self.items = self.load_items(items_filepath)
        self.item2id = self.load_items_map()

    @abstractmethod
    def load_data(self, data_filepath):
        pass

    def load_items(self, items_filepath):
        """Loads the items DataFrame."""
        items = pd.read_excel(items_filepath, sheet_name=0, skiprows=3)
        items["Start Weight"] = items["Average Initial Weight, g"]
        return items

    # TODO: maybe this is an abstract method?
    def load_items_map(self):
        return {
            key.strip(): value
            for key, value in self.items.set_index("Item Description Refined")[
                "Item ID"
            ]
            .to_dict()
            .items()
        }

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

    # TODO: Make saving the csv an argument
    def run(self, save=False):
        df = self.preprocess_data(self.data)
        df = self.join_with_items(df)
        df = self.process_data(df)
        df = self.save_data(df)
        df = df[TRIAL_COLS]
        if save:
            df.to_csv(self.output_filepath, index=False)
        return df


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

    def load_data(self, data_filepath):
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
        df_pp = df[df["Trial Stage"] == "Second Removal"]
        df_pp = df_pp.rename(columns={"Facility Name": "Trial"})
        return df_pp


TEN_TRIALS_PATH = (
    DATA_FOLDER + "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
)
closed_loop_pipeline = ClosedLoopPipeline(TEN_TRIALS_PATH)


closed_loop_processed = closed_loop_pipeline.run()


class CASP004Pipeline(AbstractDataPipeline):
    def load_items(self, items_filepath):
        """Loads the items DataFrame."""
        return pd.read_excel(items_filepath, sheet_name=2).drop_duplicates(
            subset=["Item Name"]
        )

    def load_items_map(self):
        # TODO: Ok...not sure how to set this up for this trial actually
        # items_casp004.set_index('Item Name')['Weight (average)'].to_dict()
        # observations_casp004['Start Weight'] = observations_casp004['Product Name'].map(casp004_weights)

        return {
            key.strip(): value
            for key, value in self.items.set_index("Item Description Refined")[
                "Item ID"
            ]
            .to_dict()
            .items()
        }

    def load_data(self, data_filepath):
        return pd.read_excel(data_filepath, sheet_name=1)

    def preprocess_data(self):
        # Only use observations at the end
        df_pp = self.data[self.data["Stage"] == "End"]
        # Bags A-5 and A-6 were not found
        df_pp = self.data[~self.data["Bag Id"].isin(["A-5", "A-6"])]

        # Take the average of the three weight observations
        df_pp["End Weight"] = df_pp[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)

        # Null values mean the item fully disintegrated
        df_pp["End Weight"] = df_pp["End Weight"].fillna(0)

        # TODO: Need to set up some sort of item joining method
        # observations_casp004['Item ID'] = observations_casp004['Product Name'].map(item2id)

        return df_pp


CASP004_PATH = (
    DATA_FOLDER + "CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx"
)
# casp004_pipeline = CASP004Pipeline(CASP004_PATH, items_filepath=CASP004_PATH)


# casp004_processed = casp004_pipeline.run()


class AD001Pipeline(AbstractDataPipeline):
    """
    def run(self):
        preprocessed_data = self.preprocess_data()
        joined_data = self.join_with_items(preprocessed_data)
        processed_data = self.process_data(joined_data)
        processed_data.to_csv(self.output_filepath, index=False)
        return processed_data
    """

    def __init__(self, data_filepath, items_filepath=ITEMS_PATH):
        super().__init__(data_filepath, items_filepath)
        filename, _ = self.data_filepath.rsplit(".", 1)
        self.output_filepath = f"{filename}_ad001_clean.csv"

    def load_data(self, data_filepath):
        return pd.read_excel(data_filepath, sheet_name=0, skiprows=1)

    def join_with_items(self, df):
        # TODO: Do we want to merge on ID or should we just merge on description if we have it?
        df["Item ID"] = df["Item Description Refined"].map(self.item2id)
        # Prevent duplicate columns when merging with items
        drop_cols = ["Item Description From Trial", "Item Description Refined"]
        df = df.drop(drop_cols, axis=1)
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"
        return pd.merge(self.items, df, on="Item ID")

    def process_data(self, df):
        df["% Residuals (Weight)"] = df["Residual Weight - Oven-dry"] / (
            df["Start Weight"] * df["Number of Items per bag"]
        )
        df["% Residuals (Area)"] = None
        df["Trial"] = df["Trial ID"]
        return df


PDF_TRIALS = DATA_FOLDER + "Compiled Field Results - CFTP Gathered Data.xlsx"
ad001_pipeline = AD001Pipeline(PDF_TRIALS)

ad001_processed = ad001_pipeline.run()

class WR001Pipeline(AbstractDataPipeline):
    def __init__(self, data_filepath, items_filepath=ITEMS_PATH):
        super().__init__(data_filepath, items_filepath)
        filename, _ = self.data_filepath.rsplit(".", 1)
        self.output_filepath = f"{filename}_wr001_clean.csv"

    def load_data(self, data_filepath):
        return pd.read_excel(data_filepath, sheet_name=1)

    def join_with_items(self, df):
        df["Item ID"] = df["Item Description Refined"].map(self.item2id)
        # Prevent duplicate columns when merging with items
        drop_cols = ["Item Description From Trial", "Item Description Refined"]
        df = df.drop(drop_cols, axis=1)
        assert df["Item ID"].isnull().sum() == 0, "There are null items after mapping"
        return pd.merge(self.items, df, on="Item ID")

    def process_data(self, df):
        df["% Residuals (Weight)"] = df["Residual Weight - Oven-dry"] / (
            df["Start Weight"] * df["Number of Items per bag"]
        )
        df["% Residuals (Area)"] = None
        df["Trial"] = df["Trial ID"]
        return df


PDF_TRIALS = DATA_FOLDER + "Compiled Field Results - CFTP Gathered Data.xlsx"
ad001_pipeline = AD001Pipeline(PDF_TRIALS)

ad001_processed = ad001_pipeline.run()
