
from pipeline_template import NewTemplatePipeline, CASP004Pipeline, ClosedLoopPipeline, PDFPipeline, CASP003Pipeline, default_dfs
from constants import TRIAL_DATA_PATHS, DATA_DIR, OUTLIER_THRESHOLD
from utils import anonymize_brand, map_technology
import pandas as pd

def main():

  trials_to_run = [
    NewTemplatePipeline(
      TRIAL_DATA_PATHS.get("NEW_TEMPLATE_PATH"), trial_name="OCT_22_PARTIAL"
    ),
    CASP004Pipeline(
      TRIAL_DATA_PATHS.get("CASP004_PATH"), sheet_name=1, trial_name="casp004"
    ),
    ClosedLoopPipeline(
      TRIAL_DATA_PATHS.get("TEN_TRIALS_PATH"), trial_name="closed_loop"
    ),
    PDFPipeline(
      TRIAL_DATA_PATHS.get("PDF_TRIALS"), trial_name="ad001", sheet_name=0, skiprows=1
    ), 
    PDFPipeline(
      TRIAL_DATA_PATHS.get("PDF_TRIALS"), 
      trial_name="wr001", 
      sheet_name=1
    ),
    PDFPipeline(
      TRIAL_DATA_PATHS.get("PDF_TRIALS"), 
      trial_name="casp001", 
      sheet_name=2
    ),
    CASP003Pipeline(
      TRIAL_DATA_PATHS.get("PDF_TRIALS"),
      trial_name="casp003",
      sheet_name=3,
      weight_col="Final Residual Weight - wet - aggregate",
    ),
    PDFPipeline(
      TRIAL_DATA_PATHS.get("PDF_TRIALS"),
      trial_name="wr003",
      sheet_name=4,
      weight_col="Final Residual Weight - wet",
    )
  ]

  output_filepath = DATA_DIR / "all_trials_processed.csv"
  operating_conditions_avg_output_path = DATA_DIR / "operating_conditions_avg.csv"
  operating_conditions_output_path = DATA_DIR / "operating_conditions_full.csv"

  print(f"Saving all trials to {output_filepath}")
  all_trials = pd.concat([trial.run() for trial in trials_to_run], ignore_index=True)
  # Exclude mixed materials and multi-laminate pouches
  all_trials = all_trials[~(all_trials["Material Class II"] == "Mixed Materials")]
  all_trials = all_trials[
      ~(all_trials["Item Name"] == "Multi-laminate stand-up pounch with zipper")
  ]
  # Exclude anything over 1000% as outlier
  all_trials = all_trials[all_trials["% Residuals (Mass)"] < OUTLIER_THRESHOLD]
  # Map Trial IDs to the technology used in the trial
  all_trials["Technology"] = all_trials["Trial ID"].apply(map_technology)
  all_trials["Item Brand"] = all_trials["Item Brand"].apply(anonymize_brand)
  all_trials.to_csv(output_filepath, index=False)

  print(f"Saving average conditions to {operating_conditions_avg_output_path}")
  # Make sure all trial IDs are represented in operating conditions
  unique_trial_ids = pd.DataFrame(
      all_trials["Trial ID"].unique(), columns=["Trial ID"]
  ).set_index("Trial ID")
  df_operating_conditions_avg = unique_trial_ids.merge(
      default_dfs.df_operating_conditions_avg, left_index=True, right_index=True, how="left"
  )
  df_operating_conditions_avg.to_csv(
      operating_conditions_avg_output_path, index_label="Trial ID"
  )

  print(f"Saving full conditions data to {operating_conditions_output_path}")
  # Save full operating conditions data
  df_operating_conditions = pd.concat([default_dfs.df_temps, default_dfs.df_moisture, default_dfs.df_o2], axis=0)
  df_operating_conditions.to_csv(
      operating_conditions_output_path, index=True, index_label="Time Step"
  )

  print("Complete!")

if __name__ == "__main__":
  main()