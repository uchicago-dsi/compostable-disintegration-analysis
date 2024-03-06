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

We mainly used three folders:

- `data`: store raw and processed data
- `notebooks`: store notebooks for pipelines and visualizations
- `dashboard`: store data used for dashboard and the script for running the streamlit app

### Data

#### Data Organization

Our data is structured into three main directories within the `data` folder:

##### 1. Compiled Results

This directory contains processed and raw data used for compiling results:

- **Processed**:
  - `observation_area.csv`: Contains intermediate data sourced from the 10 trials wrangled to emphasize the sa_resid_% for each item
  - `observation_mass.csv`: Contains intermediate data sourced from the 10 trials wrangled to emphasize the mass_resid_% for each item
  - `products.csv`: Intermediate table that summarizes all relevant information about items/products, including ID, brand, certifications, and initial weight, among others. 

- **Raw**:
  - `Compiled Field Results - CFTP Gathered Data.xlsx`: A comprehensive spreadsheet that includes raw data collected from the 5 trials along with details about the items/products tested.
  - `observations.csv`: Contains intermediate data sourced from the 10 trials wrangled to show sa_resid_% and mass_resid_% for each item tested. 

##### 2. Finalized Datasets

This directory contains the final datasets that were used in the analyses:

- `bags.csv`: Aggregated data that contains a comprehensive summary of all bags, includes bag_ID, trial_ID, facility_ID, bag_number. 
- `facilities.csv`: Aggregated data that contains summary of the 15 facilities where the trials were conducted.
- `items.csv`: Aggregated list of all items and their characteristics. 
- `observations_compiled.csv`: Aggregated observations from all three data sources (10 trials, 5 trials, CASP004 trial) wrangled to show the mass_resid_%, sa_resid_%, and treated_mass_resid_% (for instances when the rretrieved residuals were dried to counteract the additional weight of moisture post-decomposition)
- `trial_conditions.csv`: Aggregated table of trial conditions, includes temperature, moisture, C:N ratio, etc. 
- `trials.csv`: Aggregated table showing all trials, along with their unique IDs, facilities in which they were conducted, and other details. 

#### Accessing Data

The datasets are stored within the project's `data` directory, structured as outlined above.

#### Updating Data

Datasets in this repository may be updated as new information becomes available or as additional analyses are conducted. We encourage users to check back regularly for the most up-to-date data.

### Notebooks

Currently the pipelines we used to clean the data as well as notebooks used to showcase example visualizations are stored in the notebooks folder

#### Basic setup for running the notebooks

To run the notebooks in Docker:
1. Open terminal and type in the following, make sure that it runs without getting an error:
    docker build -t compostable . 
2. Then, after it finishes building, type in the following:
    docker run -p 8888:8888 compostable
3. You will see 3 URLs generated, please copy the last one into your default browser, and Jupyter Notebook will be launched in Docker

#### Notebook Organization

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

### Dashboard

This part provides instructions for setting up, running, and deploying the Streamlit dashboard, which is currently set up for private viewing. Only users invited by email can access the app on a Streamlit website.

#### Dashboard Organization

**1. Data**:

The dashboard utilizes data stored under `dashboard/data`:

- `observations_compiled.csv`: This file is generated by executing the `add_observations_10trials.ipynb` notebook.
- `items.csv`: This file is generated by executing the `add_items.ipynb` notebook.
- `facilities.csv`: This file is generated by executing the `add_facility_trial_trial_conditions.ipynb` notebook.

**2. Streamlit Script File**:

The main Streamlit file, `streamlit_visualization.py`, is located under the `dashboard` directory.

#### Running Locally in Docker

**1. Building the Docker Container**

First, build the Docker container using the following command:

```bash
docker build -t streamlit_dashboard -f Dockerfile.dashboard .
```

Please run in the terminal under the root directory of the project.

**2. Running the Dashboard Locally**

Once the Docker image is built, run the dashboard locally by executing:

```bash
docker run -p 8501:8501 streamlit_dashboard
```

**3. Accessing the Dashboard locally**

After starting the Docker container, the Streamlit dashboard is accessible via the following URL: 

- http://0.0.0.0:8501

#### Deploying the Private Dashboard on Streamlit Website

The team deployed the app privately using Streamlit Sharing, allowing access only to invited individuals.

To deploy the app, we used:
- repo: `https://github.com/dsi-clinic/2024-winter-compostable`
- branch: `dev`
- main file path: `dashboard/streamlit_visualization.py`

**Note**: the app is deployed at the root level, so the data file path in the `streamlit_visualization.py`are all relative to the the root.

### contributors
Kristof Turan: kristofturan@uchicago.edu
Cecilia Zhang: xyzhang0329@uchicago.edu
Ally Yun: allym0806@uchicago.edu