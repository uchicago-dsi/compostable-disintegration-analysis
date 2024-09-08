# Compostable Disintegration Analysis

## Project Background

The Compost Research & Education Foundation (CREF) researches the disintegration of compostable foodware and packaging to find correlations between different composting methodologies and the rate of disintegration. Through the Compostable Field Testing Program, facilities submit their composting results and CREF analyzes the data to find best composting practices. Facilities submit data in varying formats, so the DSI will help CREF create a database well-suited to the kinds of statistical analysis performed on composting data. CREF will then standardize their data collection process so participating facilities adhere to best practices in both running experiments and in data collection. In the future, CREF will make the data and analysis from their partner facilities available on a public dashboard.

## Project Goals

The DSI will be extending a data pipeline to format data from new experiments into a consistent format and creating visualizations showing disintegration rates for different materials and composting methodology. We will also create a process for importing new trial data that CREF's partner facilities will use in future trials, and start building the infrastructure for a public-facing dashboard of data from composting trials.

## Pipeline
The data pipeline for this project does the following standardizes data from multiple facilities for display on a dashboard displaying decomposition rates of different compostable plastics as well as operating conditions of the associated facilities.

### Docker
The pipeline runs in Docker. If you use VS Code, this is set up to run in a [dev container](https://code.visualstudio.com/docs/devcontainers/containers), so build the container the way you normally would. Otherwise, just build the Docker image from the ```Dockerfile``` in the root of the directory.

### Data Files TODO
Download the following files into the appropriate locations:
- Example FSIS data is located in the DSI Google Drive (permission required to access): [MPI Directory by Establishment Name](https://drive.google.com/file/d/1A9CQqe-iXdFPXQ19WCKdtMNvZy7ypkym/view?usp=sharing) | [Establishment Demographic Data](https://drive.google.com/file/d/1FFtM-F0FSUgJfe39HgIXJtdRwctkG-q5/view?usp=sharing)
    - Save both files to ```data/raw/```
    - You can also download new data from the [FSIS Inspection site](https://www.fsis.usda.gov/inspection/establishments/meat-poultry-and-egg-product-inspection-directory). Just [update the filepaths config file](#using-different-files)

### Using Different Files TODO
If you are using different files (particularly for the FSIS data), just update the filenames in ```pipeline/rafi/config_filepaths.yaml```. Make sure the files are in the expected folder.

### Running the Pipeline
To run the pipeline:

```
python scriptes/pipeline-template.py
```

Cleaned data files will be output in ```data/```. To update the files displayed on the dashboard, follow the instuctions in [Updating the Dashboard Data](#updating-the-dashboard-data)

## Dashboard
This is a [Next.js](https://nextjs.org/) project.

### Running the Dashboard
To run the dashboard locally (do **not** use the dev container!):

Install packages:
```bash
npm install
```

Run the development server from ```dashboard/```:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deplying the Dashboard
The dashboard is deployed via Vercel and is hosted on CFTP's site in an iframe.

Any update to the ```main``` branch of this repo will update the production deployment of the dashboard.

### Updating the Dashboard Data
If you rerun the pipeline, you need to update data files in both Google Cloud Storage and the files packaged with the Vercel deployment from GitHub.

#### Google Cloud Storage
The dashboard pulls data from Google Cloud Storage via an API. Upload the following files to the root of the ```cftp_data``` storage bucket in the ```compostable``` project in the DSI account:
- ```all_trials_processed.csv```
- ```operating_conditions_avg.csv```
- ```operating_conditions_full.csv```

### Dashboard Structure TODO

#### Data
The dashboard loads data in ```lib/data.js```. This loads the packaged data and the Google Cloud Storage data via API calls.

Data is managed in ```lib/state.js``` and ```lib/useMapData.js```

Both the NETS data and farmer locations are sensitive, so those data files are processed behind api routes located in ```api/```.

#### Components
The dashboard consists primarily of a map component and a summary stats component.

The map logic lives in ```components/DeckGLMap.js``` and ```components/ControlPanel.js``` and the summary stats logic lives in ```components/SummaryStats.js``` and the sub-components.
