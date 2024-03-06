### Notebook directory

Currently the pipelines we used to clean the data as well as notebooks used to showcase example visualizations are stored in the notebooks folder

To run the notebooks in Docker:
1. Open terminal and type in the following, make sure that it runs without getting an error:
    docker build -t compostable . 
2. Then, after it finishes building, type in the following:
    docker run -p 8888:8888 compostable
3. You will see 3 URLs generated, please copy the last one into your default browser, and Jupyter Notebook will be launched in Docker

**Pipelines**:

The pipelines transform raw data into cleaned and organized data tables, making them more accessible for analysis and visualization. Currently, these pipelines are implemented in notebooks, allowing for a detailed examination and resolution of specific issues within each of the 16 trial datasets.

- `add_bag_compiled.ipynb`: Contains pipeline that extracts all bag information from the 16 trials, and assigns unique IDs for each bag used
  - Uses: `Compiled Field Results - CFTP Gathered Data.xlsx`, `observation_mass.csv`, `masterfile.csv`
  - Produces: `bags.csv`
- `add_facility_trial_trial_conditions.ipynb`: Contains pipeline that extracts summary information regarding facilities, trials, and trial_conditions from the 16 trials, creating unique IDs for each observation
  - Uses: `Donated Data 2023 - Compiled Facility Conditions for DSI.xlsx`, `masterfile.csv`
  - Produces: `facilities.csv`, `trials.csv`, `trial_conditions.csv`
- `add_items.ipynb`: Contains pipeline that extracts summary information regarding all items used in the 16 trials, and assigns unique IDs for each item
  - Uses: `CFTP Test Item Inventory with Dimensions - All Trials.xlsx`
  - Produces: `items.csv`
- `add_observations_10trials.ipynb`: Contains pipelines that 1. cleans observations summary information of the 10 compiled field trials (Compiled Field Results) and 2. cleans the observations table for 5 old trials and CASP004-01, to merge into a finalized observations table
  - Uses: `Compiled Field Results  for DSI - 2023 Bulk 10 Trial Data.xlsx`, `masterfile.csv`, `Compiled Field Results - CFTP Gathered Data.xlsx`
  - Produces: `observations.csv` (Observations table for compiled 10 trials), `observations_compiled.csv` (Observations table for all 16 trials)
- `create_masterfile.ipynb`: cleans and organizes trial data for CASP004-01, creates an aggregated dataset that is used for exploratory analysis
  - Uses: `Test summary per bag & stage.csv`, `Bag&Product Setup.csv`
  - Produces: `masterfile.csv`

**Exploratory Data Visualizations**:

These notebooks conduct exploratory data analysis and showcases examples of data visualizations that can be incorporated into presentations and dashboards for different use cases.

- `CASP004-01_visualizations.ipynb`: showcases all visualizations that we have created for the CASP004-01 trial, including percent residuals by product type, material, brand, and bag placement. 
  - Uses: `masterfile.csv`
- `explore_trials.ipynb`: performs some cleaning of the 10 trials data, and showcases all visualizations that we have created for the 10 trials data
  - Uses: `Compiled Field Results  for DSI - 2023 Bulk 10 Trial Data.xlsx - Product Dimensions Reference.csv`, `Donated Data 2023 - Compiled Field Results for DSI.xlsx - Facility Dimensions.csv`, `Compiled Field Results  for DSI - 2023 Bulk 10 Trial Data.xlsx`
  - Produces: `facility.csv`, `observation_mass.csv`, `observation_area.csv`