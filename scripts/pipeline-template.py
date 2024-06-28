import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd

# TODO: figure out how to handle data folder for debugger
# TODO: Can I add an assertion to make sure the total number of observations is correct?
# TODO: figure out the right abstraction for the load items » items should be loaded separately and passed to the class

CURRENT_DIR = Path(__file__).resolve().parent
DATA_DIR = CURRENT_DIR / "../data/"

# TODO: Can also keep bags, etc if we want them
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

old_json = json.load(Path.open(DATA_DIR / "old_items.json"))
ITEMS["Item ID"] = ITEMS["Item Description Refined"].map(old_json)

OUTLIER_THRESHOLD = 10

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
    """An abstract base class for a data pipeline.

    This class provides a template for data pipelines, including methods for
    loading, preprocessing, and calculating results from data. It also includes
    a method for running the entire pipeline and saving the results.

    Attributes:
        data_filepath: Path to the data file.
        items: DataFrame containing item information.
        item2id: Dictionary mapping items to IDs.
        trial: Trial identifier.
        output_filepath: Path to save the output file.
        data: Loaded data.
    """

    def __init__(
        self,
        data_filepath: Path,
        items: pd.DataFrame = ITEMS,
        item2id: Dict[str, Any] = item2id,
        trials: pd.DataFrame = TRIALS,
        trial_name: Optional[str] = None,
        sheet_name: int = 0,
        skiprows: int = 0,
    ) -> None:
        """Initializes the AbstractDataPipeline with the given parameters.

        Args:
            data_filepath: Path to the data file.
            items: DataFrame containing item information.
            item2id: Dictionary mapping items to IDs.
            trial_name: Trial name. Defaults to None.
            trials: DataFrame containing trial information. Defaults to TRIALS.
            sheet_name: Sheet name or index to load. Defaults to 0.
            skiprows: Number of rows to skip at the start of the file. Defaults to 0.
        """
        self.data_filepath = data_filepath
        filename = self.data_filepath.stem
        self.trial_name = trial_name
        self.trials = trials
        file_suffix = f"_{trial_name}_clean.csv" if self.trial_name else "_clean.csv"
        self.output_filepath = self.data_filepath.with_name(filename + file_suffix)

        # TODO: This is kind of messy and could probably be better
        self.raw_data = self.load_data(
            data_filepath, sheet_name=sheet_name, skiprows=skiprows
        )
        self.items = items
        self.item2id = item2id

    @abstractmethod
    def load_data(
        self, data_filepath: Path, sheet_name: int = 0, skip_rows: int = 0
    ) -> pd.DataFrame:
        """Loads data from the specified file.

        This method should be implemented by subclasses to load data from the
        specified file path.

        Args:
            data_filepath: Path to the data file.
            sheet_name: Sheet name or index to load. Defaults to 0.
            skip_rows: Number of rows to skip at the start of the file. Defaults to 0.

        Returns:
            DataFrame: Loaded data.
        """
        pass

    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocesses the data.

        This method can be overridden by subclasses to provide specific
        preprocessing steps.

        Args:
            data: Data to preprocess.

        Returns:
            DataFrame: Preprocessed data.
        """
        return data

    def join_with_items(self, data: pd.DataFrame) -> pd.DataFrame:
        """Joins the data with item information.

        Args:
            data: Data to join.

        Returns:
            DataFrame: Data joined with item information.
        """
        return self.items.merge(data, on="Item ID")

    def calculate_results(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculates results from the data.

        This method can be overridden by subclasses to provide specific
        calculations.

        Args:
            data: Data to calculate results from.

        Returns:
            DataFrame: Data with calculated results.
        """
        return data

    def run(self, save: bool = False) -> pd.DataFrame:
        """Runs the data pipeline.

        This method runs the entire data pipeline, including loading data,
        preprocessing, joining with item information, calculating results,
        and optionally saving the output to a file.

        Args:
            save: Whether to save the output to a file. Defaults to False.

        Returns:
            DataFrame: Final processed data.
        """
        print(f"Running data pipeline for {self.trial_name}")
        data = self.raw_data.copy()
        data = self.preprocess_data(data)
        data = self.join_with_items(data)
        data = self.calculate_results(data)
        data = data.merge(self.trials, left_on="Trial ID", right_on="Public Trial ID")
        data = data[TRIAL_COLS]
        if save:
            data.to_csv(self.output_filepath, index=False)
            print(f"Saved to {self.output_filepath}")
        print("Complete!")
        return data


class CASP004Pipeline(AbstractDataPipeline):
    """Pipeline for processing CASP004 trial data."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Initializes the CASP004Pipeline with the given parameters.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        super().__init__(*args, **kwargs)
        # We are using the start weight specific to this trial so drop the Start Weight column
        # Start weight is set in preprocess_data
        self.items = self.items.drop("Start Weight", axis=1)

    def load_data(
        self, data_filepath: Path, sheet_name: int = 0, skiprows: int = 0
    ) -> pd.DataFrame:
        """Loads data from the specified Excel file.

        Args:
            data_filepath (Path): Path to the data file.
            sheet_name (int, optional): Sheet name or index to load. Defaults to 0.
            skiprows (int, optional): Number of rows to skip at the start of the file. Defaults to 0.

        Returns:
            pd.DataFrame: Loaded data.
        """
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocesses the data.

        This method performs the following steps:
        - Filters observations to only include the "End" stage.
        - Excludes bags A-5 and A-6.
        - Takes the average of three weight observations.
        - Fills null values with zero (indicating full disintegration).
        - Maps start weights and item descriptions.
        - Ensures no null items after mapping.

        Args:
            data: Data to preprocess.

        Returns:
            pd.DataFrame: Preprocessed data.
        """
        # Only use observations at the end
        data = data[data["Stage"] == "End"].copy()
        # Bags A-5 and A-6 were not found
        data = data[~data["Bag Id"].isin(["A-5", "A-6"])]

        data["Trial"] = data["Trial Id"]

        # Take the average of the three weight observations
        data["End Weight"] = data[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)

        # Null values mean the item fully disintegrated
        data["End Weight"] = data["End Weight"].fillna(0)

        # Ok...we need to do some weird items work arounds here...this might work?
        casp004_items = pd.read_excel(self.data_filepath, sheet_name=2).drop_duplicates(
            subset=["Item Name"]
        )
        casp004_weights = casp004_items.set_index("Item Name")[
            "Weight (average)"
        ].to_dict()
        data["Start Weight"] = data["Product Name"].map(casp004_weights)
        # rename so this matches the other trials
        data["Item Description Refined"] = data["Product Name"]

        # TODO: Some of this should be in the abstract method...
        data["Item ID"] = data["Item Description Refined"].str.strip().map(self.item2id)
        # Prevent duplicate columns when merging with items
        data = data.rename(
            columns={"Item Description Refined": "Item Description Refined (Trial)"}
        )
        data["Trial ID"] = "CASP004-01"
        if data["Item ID"].isna().sum() > 0:
            raise ValueError("There are null items after mapping")

        return data

    def calculate_results(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculates results from the data.

        This method calculates the percentage of residuals by mass and sets
        residuals by area to None.

        Args:
            data: Data to calculate results from.

        Returns:
            pd.DataFrame: Data with calculated results.
        """
        data["End Weight"] = data[["Weight 1", "Weight 2", "Weight 3"]].mean(axis=1)
        data["End Weight"] = data["End Weight"].fillna(0)

        data["% Residuals (Area)"] = None
        data["% Residuals (Mass)"] = data["End Weight"] / data["Start Weight"]
        return data


CASP004_PATH = (
    DATA_DIR / "CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx"
)
casp004_pipeline = CASP004Pipeline(CASP004_PATH, sheet_name=1, trial_name="casp004")
processed_data.append(casp004_pipeline.run())


class ClosedLoopPipeline(AbstractDataPipeline):
    """Pipeline for processing Closed Loop trial data."""

    def melt_trial(self, data: pd.DataFrame, value_name: str) -> pd.DataFrame:
        """Helper method to melt DataFrames.

        Args:
            data (pd.DataFrame): DataFrame to melt.
            value_name (str): Name of the value column after melting.

        Returns:
            pd.DataFrame: Melted DataFrame.
        """
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
            data.melt(
                id_vars=["Trial ID", "Trial Stage", "Bag Set", "Bag Number"],
                value_vars=item_ids,
                var_name="Item ID",
                value_name=value_name,
            )
            .dropna(subset=[value_name])
            .reset_index(drop=True)
        )

    def load_data(
        self, data_filepath: Path, sheet_name: int = 0, skiprows: int = 0
    ) -> pd.DataFrame:
        """Loads data from the specified Excel file.

        Args:
            data_filepath: Path to the data file.
            sheet_name: Sheet name or index to load. Defaults to 0.
            skiprows: Number of rows to skip at the start of the file. Defaults to 0.

        Returns:
            pd.DataFrame: Loaded and merged data.
        """
        df_weight = pd.read_excel(data_filepath, sheet_name=3, skiprows=2)
        weight_melted = self.melt_trial(df_weight, "% Residuals (Mass)")

        df_area = pd.read_excel(data_filepath, sheet_name=4, skiprows=2)
        df_area["Trial ID"] = df_area["Facility Name"].map(trial2id)
        area_melted = self.melt_trial(df_area, "% Residuals (Area)")

        return weight_melted.merge(
            area_melted,
            on=["Trial ID", "Trial Stage", "Bag Set", "Bag Number", "Item ID"],
            how="outer",
        )

    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocesses the data.

        This method sets the item description to None and filters the data to
        only include the "Second Removal" stage.

        Args:
            data: Data to preprocess.

        Returns:
            pd.DataFrame: Preprocessed data.
        """
        data["Item Description Refined (Trial)"] = None
        data = data[data["Trial Stage"] == "Second Removal"]
        return data


TEN_TRIALS_PATH = DATA_DIR / "Donated Data 2023 - Compiled Field Results for DSI.xlsx"
closed_loop_pipeline = ClosedLoopPipeline(TEN_TRIALS_PATH, trial_name="closed_loop")
processed_data.append(closed_loop_pipeline.run())


class PDFPipeline(AbstractDataPipeline):
    """Pipeline for processing PDF trial data."""

    def __init__(
        self, *args: Any, weight_col: str = "Residual Weight - Oven-dry", **kwargs: Any
    ) -> None:
        """Initializes the PDFPipeline with the given parameters.

        Args:
            *args: Arbitrary non-keyword arguments.
            weight_col: Column name for the residual weight. Defaults to "Residual Weight - Oven-dry".
            **kwargs: Arbitrary keyword arguments.
        """
        super().__init__(*args, **kwargs)
        self.weight_col = weight_col

    def load_data(
        self, data_filepath: Path, sheet_name: int = 0, skiprows: int = 0
    ) -> pd.DataFrame:
        """Loads data from the specified Excel file.

        Args:
            data_filepath (Path): Path to the data file.
            sheet_name (int, optional): Sheet name or index to load. Defaults to 0.
            skiprows (int, optional): Number of rows to skip at the start of the file. Defaults to 0.

        Returns:
            pd.DataFrame: Loaded data.
        """
        return pd.read_excel(data_filepath, sheet_name=sheet_name, skiprows=skiprows)

    def join_with_items(self, data: pd.DataFrame) -> pd.DataFrame:
        """Joins the data with item information.

        This method maps item descriptions to item IDs and merges the data with
        item information, dropping any unnecessary columns.

        Args:
            data: Data to join.

        Returns:
            pd.DataFrame: Data joined with item information.
        """
        # TODO: Do we want to merge on ID or should we just merge on description if we have it?
        data["Item ID"] = data["Item Description Refined"].str.strip().map(self.item2id)
        # Prevent duplicate columns when merging with items
        data = data.rename(
            columns={"Item Description Refined": "Item Description Refined (Trial)"}
        )
        drop_cols = ["Item Description From Trial"]
        data = data.drop(drop_cols, axis=1)
        if data["Item ID"].isna().sum() > 0:
            raise ValueError("There are null items after mapping")
        return self.items.merge(data, on="Item ID")

    def calculate_results(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculates results from the data.

        This method calculates the percentage of residuals by mass and sets
        residuals by area to None.

        Args:
            df (pd.DataFrame): Data to calculate results from.

        Returns:
            pd.DataFrame: Data with calculated results.
        """
        df["% Residuals (Mass)"] = df[self.weight_col] / (
            df["Start Weight"] * df["Number of Items per bag"]
        )
        df["% Residuals (Area)"] = None
        df["Trial"] = df["Trial ID"]
        return df


PDF_TRIALS = DATA_DIR / "Compiled Field Results - CFTP Gathered Data.xlsx"

ad001_pipeline = PDFPipeline(PDF_TRIALS, trial_name="ad001", sheet_name=0, skiprows=1)
processed_data.append(ad001_pipeline.run())

wr001_pipeline = PDFPipeline(PDF_TRIALS, trial_name="wr001", sheet_name=1)
processed_data.append(wr001_pipeline.run())

casp001_pipeline = PDFPipeline(PDF_TRIALS, trial_name="casp001", sheet_name=2)
processed_data.append(casp001_pipeline.run())


class CASP003Pipeline(PDFPipeline):
    """Pipeline for processing CASP003 trial data."""

    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocesses the data.

        This method filters out data where the trial bag color is blue, as
        items in blue bags were combined and impossible to separate.

        Args:
            data (pd.DataFrame): Data to preprocess.

        Returns:
            pd.DataFrame: Preprocessed data.
        """
        return data[data["Trial Bag Colour"] != "Blue"]


casp003_pipeline = CASP003Pipeline(
    PDF_TRIALS,
    trial_name="casp003",
    sheet_name=3,
    weight_col="Final Residual Weight - wet - aggregate",
)
processed_data.append(casp003_pipeline.run())

wr003_pipeline = PDFPipeline(
    PDF_TRIALS,
    trial_name="wr003",
    sheet_name=4,
    weight_col="Final Residual Weight - wet",
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
all_trials = all_trials[all_trials["% Residuals (Mass)"] < OUTLIER_THRESHOLD]

all_trials.to_csv(output_filepath, index=False)
print("Complete!")
