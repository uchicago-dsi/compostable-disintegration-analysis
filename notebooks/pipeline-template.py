from abc import ABC, abstractmethod

import pandas as pd

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
    @abstractmethod
    def load_data(self):
        pass

    @abstractmethod
    def process_data(self, data):
        pass

    @abstractmethod
    def save_data(self, data):
        pass

    def run(self):
        data = self.load_data()
        processed_data = self.process_data(data)
        self.save_data(processed_data)


class ClosedLoopPipeline(AbstractDataPipeline):
    def load_data(self, excel_path, sheet_name, skiprows):
        """Loads data from a specific sheet in an Excel file."""
        return pd.read_excel(excel_path, sheet_name=sheet_name, skiprows=skiprows)

    def process_data(self, weight_df, area_df, items_clean):
        """Processes the weight and area DataFrames, then merges with items_clean."""
        # Filter for "Second Removal"
        weight = weight_df[weight_df["Trial Stage"] == "Second Removal"]
        area = area_df[area_df["Trial Stage"] == "Second Removal"]

        # Melt the DataFrames
        weight_melted = self.melt_data_frame(weight, "% Residuals (Weight)")
        area_melted = self.melt_data_frame(area, "% Residuals (Area)")

        # Merge melted DataFrames
        observations_closed_loop = pd.merge(
            weight_melted,
            area_melted,
            on=["Facility Name", "Trial Stage", "Bag Set", "Bag Number", "Item ID"],
            how="outer",
        )

        # Rename and select relevant columns
        observations_closed_loop.rename(
            columns={"Facility Name": "Trial"}, inplace=True
        )
        observations_closed_loop = observations_closed_loop[
            ["Trial", "Item ID", "% Residuals (Weight)", "% Residuals (Area)"]
        ]

        # Join with items_clean and select columns
        joined_cl = pd.merge(items_clean, observations_closed_loop, on="Item ID")
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
        return joined_cl[keep_cols]

    def melt_data_frame(self, df, value_name):
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

    def save_data(self, df, output_path):
        """Saves the DataFrame to a CSV file."""
        df.to_csv(output_path, index=False)


closed_loop_pipeline = ClosedLoopPipeline()
TEN_TRIALS_PATH = (
    DATA_FOLDER + "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
)

observations_weight = closed_loop_pipeline.load_data(
    TEN_TRIALS_PATH, sheet_name=3, skiprows=2
)
observations_sa = closed_loop_pipeline.load_data(
    TEN_TRIALS_PATH, sheet_name=4, skiprows=2
)
processed_data = closed_loop_pipeline.process_data(
    observations_weight, observations_sa, items_clean
)
