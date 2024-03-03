# Compostable Disintegration Analysis

## Project Background

The Compost Research & Education Foundation (CREF) researches the disintegration of compostable foodware and packaging to find correlations between different composting methodologies and the rate of disintegration. Through the Compostable Field Testing Program, facilities submit their composting results and CREF analyzes the data to find best composting practices. Facilities submit data in varying formats, so the DSI will help CREF create a database well-suited to the kinds of statistical analysis performed on composting data. CREF will then standardize their data collection process so participating facilities adhere to best practices in both running experiments and in data collection. In the future, CREF will make the data and analysis from their partner facilities available on a public dashboard.

## Project Goals

The DSI will be extending a data pipeline to format data from new experiments into a consistent format and creating visualizations showing disintegration rates for different materials and composting methodology. We will also create a process for importing new trial data that CREF's partner facilities will use in future trials, and start building the infrastructure for a public-facing dashboard of data from composting trials.

## Usage

### Docker

### Docker & Make

We use `docker` and `make` to run our code. There are three built-in `make` commands:

* `make build-only`: This will build the image only. It is useful for testing and making changes to the Dockerfile.
* `make run-notebooks`: This will run a jupyter server which also mounts the current directory into `\program`.
* `make run-interactive`: This will create a container (with the current directory mounted as `\program`) and loads an interactive session. 

The file `Makefile` contains information about about the specific commands that are run using when calling each `make` statement.

### Developing inside a container with VS Code

If you prefer to develop inside a container with VS Code then do the following steps. Note that this works with both regular scripts as well as jupyter notebooks.

1. Open the repository in VS Code
2. At the bottom right a window may appear that says `Folder contains a Dev Container configuration file...`. If it does, select, `Reopen in Container` and you are done. Otherwise proceed to next step. 
3. Click the blue or green rectangle in the bottom left of VS code (should say something like `><` or `>< WSL`). Options should appear in the top center of your screen. Select `Reopen in Container`.




## Repository Structure

### scripts
Project python code

### notebooks
Contains short, clean notebooks to demonstrate analysis.

### data

This section provides details regarding the raw data used in this repository. The data is organized into different directories and files to support reproducibility and clarity in our analyses.

## Data Organization

Our data is structured into three main directories within the `data` folder:

### 1. Compiled Results

This directory contains processed and raw data used for compiling results:

- **Processed**:
  - `observation_area.csv`: Contains intermediate data sourced from the 10 trials wrangled to emphasize the sa_resid_% for each item
  - `observation_mass.csv`: Contains intermediate data sourced from the 10 trials wrangled to emphasize the mass_resid_% for each item
  - `products.csv`: Intermediate table that summarizes all relevant information about items/products, including ID, brand, certifications, and initial weight, among others. 

- **Raw**:
  - `Compiled Field Results - CFTP Gathered Data.xlsx`: A comprehensive spreadsheet that includes raw data collected from the 5 trials along with details about the items/products tested.
  - `observations.csv`: Contains intermediate data sourced from the 10 trials wrangled to show sa_resid_% and mass_resid_% for each item tested. 

### 2. Finalized Datasets

This directory contains the final datasets that were used in the analyses:

- `bags.csv`: Aggregated data that contains a comprehensive summary of all bags, includes bag_ID, trial_ID, facility_ID, bag_number. 
- `facilities.csv`: Aggregated data that contains summary of the 15 facilities where the trials were conducted.
- `items.csv`: Aggregated list of all items and their characteristics. 
- `observations_compiled.csv`: Aggregated observations from all three data sources (10 trials, 5 trials, CASP004 trial) wrangled to show the mass_resid_%, sa_resid_%, and treated_mass_resid_% (for instances when the rretrieved residuals were dried to counteract the additional weight of moisture post-decomposition)
- `trial_conditions.csv`: Aggregated table of trial conditions, includes temperature, moisture, C:N ratio, etc. 
- `trials.csv`: Aggregated table showing all trials, along with their unique IDs, facilities in which they were conducted, and other details. 

## Accessing Data

- The datasets are stored within the project's `data` directory, structured as outlined above.

## Updating Data

Datasets in this repository may be updated as new information becomes available or as additional analyses are conducted. We encourage users to check back regularly for the most up-to-date data.

## Additional Information

For any questions or additional information regarding the data, please open an issue in the repository or contact the project maintainers directly.

### output
Should contain work product generated by the analysis. Keep in mind that results should (generally) be excluded from the git repository.

### contributors
Kristof Turan: kristofturan@uchicago.edu
Cecilia Zhang: xyzhang0329@uchicago.edu
Ally Yun: allym0806@uchicago.edu