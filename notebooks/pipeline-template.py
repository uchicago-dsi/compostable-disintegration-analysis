from abc import ABC, abstractmethod

import pandas as pd

# TODO: figure out how to handle this for debugger

DATA_FOLDER = "../data/"
# DATA_FOLDER = "data/"

ITEMS_PATH = DATA_FOLDER + "CFTP Test Item Inventory with Dimensions - All Trials.xlsx"
items = pd.read_excel(ITEMS_PATH, sheet_name=0, skiprows=3)

items["Start Weight"] = items["Average Initial Weight, g"]

items_cols = [
    "Item ID",
    "Item Name",
    "Item Description Refined",
    "Material Class I",
    "Material Class II",
    "Material Class III",
    "Start Weight",
]

items_clean = items[items_cols]
item2id = {
    key.strip(): value
    for key, value in items_clean.set_index("Item Description Refined")["Item ID"]
    .to_dict()
    .items()
}


class AbstractDataPipeline(ABC):
    def __init__(self, items=items_clean):
        self.items = items

    @abstractmethod
    def load_data(self):
        pass

    @abstractmethod
    def preprocess_data(self, data):
        pass

    def process_data(self, df):
        """Processes the weight and area DataFrames, then merges with items_clean."""

        joined = pd.merge(self.items, df, on="Item ID")
        keep_cols = [
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
        return joined[keep_cols]

    def save_data(self, df, output_filepath):
        """Saves the DataFrame to a CSV file."""
        df.to_csv(output_filepath, index=False)

    def run(self, data_filepath):
        preprocessed_data = self.preprocess_data(data_filepath)
        processed_data = self.process_data(preprocessed_data)
        filename, _ = data_filepath.rsplit(".", 1)
        output_filepath = f"{filename}_clean.csv"
        self.save_data(processed_data, output_filepath)
        return processed_data


class ClosedLoopPipeline(AbstractDataPipeline):
    def load_data(self, excel_path, sheet_name, skiprows):
        """Loads data from a specific sheet in an Excel file."""
        return pd.read_excel(excel_path, sheet_name=sheet_name, skiprows=skiprows)

    def melt_trial(self, df, value_name):
        """Helper method to melt DataFrames."""
        return (
            df.melt(
                id_vars=["Facility Name", "Trial Stage", "Bag Set", "Bag Number"],
                value_vars=[
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
                ],
                var_name="Item ID",
                value_name=value_name,
            )
            .dropna(subset=[value_name])
            .reset_index(drop=True)
        )

    def preprocess_data(self, data):
        df_weight = self.load_data(TEN_TRIALS_PATH, sheet_name=3, skiprows=2)
        df_weight = df_weight[df_weight["Trial Stage"] == "Second Removal"]

        df_area = self.load_data(TEN_TRIALS_PATH, sheet_name=4, skiprows=2)
        df_area = df_area[df_area["Trial Stage"] == "Second Removal"]

        weight_melted = self.melt_trial(df_weight, "% Residuals (Weight)")
        area_melted = self.melt_trial(df_area, "% Residuals (Area)")

        joined = pd.merge(
            weight_melted,
            area_melted,
            on=["Facility Name", "Trial Stage", "Bag Set", "Bag Number", "Item ID"],
            how="outer",
        )

        joined = joined.rename(columns={"Facility Name": "Trial"})

        # TODO: Do we care about bags, etc? If so, keep them here
        joined = joined[
            ["Trial", "Item ID", "% Residuals (Weight)", "% Residuals (Area)"]
        ]

        return joined


closed_loop_pipeline = ClosedLoopPipeline()
TEN_TRIALS_PATH = (
    DATA_FOLDER + "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
)


processed_data = closed_loop_pipeline.run(TEN_TRIALS_PATH)

breakpoint()
