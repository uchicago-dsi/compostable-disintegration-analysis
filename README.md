# Compostable Disintegration Analysis

## Project Background

The Compost Research & Education Foundation (CREF) researches the disintegration of compostable foodware and packaging to find correlations between different composting methodologies and the rate of disintegration. Through the Compostable Field Testing Program, facilities submit their composting results and CREF analyzes the data to find best composting practices. Facilities submit data in varying formats, so the DSI will help CREF create a database well-suited to the kinds of statistical analysis performed on composting data. CREF will then standardize their data collection process so participating facilities adhere to best practices in both running experiments and in data collection. In the future, CREF will make the data and analysis from their partner facilities available on a public dashboard.

## Project Goals

The DSI will be extending a data pipeline to format data from new experiments into a consistent format and creating visualizations showing disintegration rates for different materials and composting methodology. We will also create a process for importing new trial data that CREF's partner facilities will use in future trials, and start building the infrastructure for a public-facing dashboard of data from composting trials.

## Pipeline
The data pipeline for this project does the following standardizes data from multiple facilities for display on a dashboard displaying decomposition rates of different compostable plastics as well as operating conditions of the associated facilities.

Note: The pipeline was set up to handle multiple disparate files with varied input formats. Future data will come in a standardized format. The pipline is left as one script for ease of iteration and refactoring later when the new data format is known.

### Docker
The pipeline runs in Docker. If you use VS Code, this is set up to run in a [dev container](https://code.visualstudio.com/docs/devcontainers/containers), so build the container the way you normally would. Otherwise, just build the Docker image from the ```Dockerfile``` in the root of the directory.

### Data Files
Download the following files from the DSI Google Drive in the [Results Data for DSI - Raw uploads](https://drive.google.com/drive/folders/1B8aRIF1lWDKfeqlDTkG2y1ERZFD-A8JK?usp=sharing) and save them to ```data/```:
- [CFTP Anonymized Data Compilation Overview - For Sharing](https://docs.google.com/spreadsheets/d/1GsbN9AexDb0j-Hqzz8z3kO4zC5v60ptx/edit?usp=sharing&ouid=114633865943391212776&rtpof=true&sd=true)
- [Donated Data 2023 - Compiled Facility Conditions for DSI](https://docs.google.com/spreadsheets/d/1iEEb8vlHcB_72TLgYi3IzSzRKgPMh-sK/edit?usp=sharing&ouid=114633865943391212776&rtpof=true&sd=true)
- [Donated Data 2023 - Compiled Field Results for DSI](https://docs.google.com/spreadsheets/d/1XwYxdEhrpOxS6_nSf9yARWI-mLswrIBv/edit?usp=sharing&ouid=114633865943391212776&rtpof=true&sd=true)
- [CASP004-01 - Results Pre-Processed for Analysis from PDF Tables](https://docs.google.com/spreadsheets/d/1GfYaqgqx85qq5XM__0D1IfbMomGsLdmQ/edit?usp=sharing&ouid=114633865943391212776&rtpof=true&sd=true)
- [Compiled Field Results - CFTP Gathered Data](https://docs.google.com/spreadsheets/d/1EqRhb09hcXc9SW99vrj5aVUdYHicmUoU/edit?usp=sharing&ouid=114633865943391212776&rtpof=true&sd=true)

These files are all read directly in ```scripts/pipeline-template.py```

### Running the Pipeline
To run the pipeline:

```
python scripts/pipeline-template.py
```

Cleaned data files will be output in ```data/```. To update the files displayed on the dashboard, follow the instuctions in [Updating the Dashboard Data](#updating-the-dashboard-data)

## Dashboard
This is a [Next.js](https://nextjs.org/) project.

### Running the Dashboard
To run the dashboard locally, do **not** use the dev container!

#### Install Packages
Install packages:
```bash
npm install
```

#### Set up Environment Variables for Local Deployment
The dashboard expects a ```.env.local``` file in ```dashboard/``` with a [base64-encoded Google service account JSON](https://www.serverlab.ca/tutorials/linux/administration-linux/how-to-base64-encode-and-decode-from-command-line/) (with permissions to access Cloud Storage buckets):

```
DATA_SOURCE=google
GOOGLE_APPLICATION_CREDENTIALS_BASE64=<base64-encoded-service-account.json>
```

### Deplying the Dashboard
The dashboard is deployed via Vercel and is hosted on CFTP's site in an iframe.

Any update to the ```main``` branch of this repo will update the production deployment of the dashboard.

### Updating the Dashboard Data
If you rerun the pipeline, you need to update data files in Google Cloud Storage.

#### Google Cloud Storage
The dashboard pulls data from Google Cloud Storage via an API. Upload the following files to the root of the ```cftp_data``` storage bucket in the ```compostable``` project in the DSI account:
- ```all_trials_processed.csv```
- ```operating_conditions_avg.csv```
- ```operating_conditions_full.csv```

### Dashboard Structure

There are two dashboards. The dashboard located in ```page.js``` is the default one that is displayed on the CFTP site. There is also a proof of concept operating condition dashboard available at ```/operating-conditions```

#### Data
The dashboard loads via an API call in ```lib/data.js```. Data is managed in the same file. Menu options are fetched in ```page.js``` when the dashboard first loads.

#### Components
The dashboard consists of a [Plotly](https://plotly.com/javascript/) dash and various filters.

The main dashboard lives in ```components/Dashboard.js``` and the controls are in ```components/DashboardControls.js```.

The operating conditions dash is in one single component: ```componenents/OperatingConditionsDashboard.js```

#### API
The data for this project is sensitive, so it is accessed and aggregated via an API. There are endpoints for the trial data (```app/api/data/```), the options for populating the filter menus (```app/api/options```), and for the the operating conditions dash (```app/api/operating-conditions```).
