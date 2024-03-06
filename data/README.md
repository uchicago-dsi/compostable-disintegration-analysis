### 1. Data

#### 1.1 Data Organization

Our data is structured into three main directories within the `data` folder:

**1.1.1 Compiled Results**

This directory contains processed and raw data used for compiling intermediate csv files used for subsequent analysis:

- **Processed**:
  - `observation_area.csv`: Contains intermediate data sourced from 10 experimental trials collected by the CFTP that is wrangled to summarize the surface area residuals sa_resid_% for each item.
  - `observation_mass.csv`: Contains intermediate data sourced from the same 10 experimental trials wrangled to summarize the mass residuals mass_resid_% for each item.
  - `products.csv`: Intermediate table that summarizes all relevant information about items/products, including ID, brand, certifications, and initial weight, among others. 


- **Raw**:
  - `Compiled Field Results  for DSI - 2023 Bulk 10 Trial Data.xlsx`: It holds raw trial result data for 10 trials and details about the products used and facilities involved.
  - `Compiled Field Results - CFTP Gathered Data.xlsx`: A comprehensive untidy spreadsheet that includes raw data collected from additional 5 trials along with details about the items/products tested. 
  - `CFTP Test Item Inventory with Dimensions - All Trials.xlsx`: It includes item information across all trials (16 trials in the current dataset), and is used for creating the item table.
  - `Donated Data 2023 - Compiled Facility Conditions for DSI.xlsx`: It holds trial condition (i.e. temperature, moisture) observations for 10 trials, and is used for creating the trial condition table.
  - Includes additional raw files which are .csv extracted from `Compiled Field Results - CFTP Gathered Data.xlsx` data for easier access. This is functionally redundant.

**1.1.2 Finalized Datasets**

This directory contains the final datasets that were used in the analyses:

- `bags.csv`: Aggregated data that contains a comprehensive summary of all bags, includes bag_ID, trial_ID, facility_ID, bag_number. 
- `facilities.csv`: Aggregated data that contains summary of the 15 facilities where the trials were conducted.
- `items.csv`: Aggregated list of all items and their characteristics. 
- `observations_compiled.csv`: Aggregated observations from all three data sources (10 trials, 5 trials, CASP004 trial) wrangled to show the mass_resid_%, sa_resid_%, and treated_mass_resid_% (for instances when the rretrieved residuals were dried to counteract the additional weight of moisture post-decomposition)
- `trial_conditions.csv`: Aggregated table of trial conditions, includes temperature, moisture, C:N ratio, etc. 
- `trials.csv`: Aggregated table showing all trials, along with their unique IDs, facilities in which they were conducted, and other details. 

**1.1.3 CASP004-01**

This directory structure is organized into two main subdirectories: `processed`, and `raw`. 

- **processed**: This directory contains data that has likely been cleaned, transformed, or otherwise processed for analysis. The files include:
   - `bag.csv`: Contains detail information specific to the bags (technical replicates) used in this trial.
   - `facility.csv`: Contains information about the facility where the project was conducted.
   - `item.csv`: Contains information about the items included in the trials, and their physical characteristics.
   - `observation.csv`: This file holds recorded observations (mass residuals) from the trial.
   - `trial.csv`: Contains data related to specific environmental variables included tested during the trial.

- **raw**: This directory houses raw data files, which are unprocessed and in their original format. The files include:
   - `Bag&Product Setup.csv`: Unprocessed bag product setup file.
   - `CASP004-01 - Results Pre-Processed for Analysis from PDF Tables.xlsx`: This is an Excel file containing data extracted from PDF tables, pre-processed for analysis but not yet fully cleaned.
   - `materials.csv`: Lists three different levels of material classification of the items used in this trial. 
   - `Test summary per bag & stage.csv`: Summarizes test results, segmented by bag and removal stage.
   - `masterfile.csv`: Contains all pre-processed data files merged together. 

#### 1.2 Accessing Data

The datasets are stored within the project's `data` directory, structured as outlined above.

#### 1.3 Updating Data

Datasets in this repository may be updated as new information becomes available or as additional analyses are conducted. We encourage users to check back regularly for the most up-to-date data.