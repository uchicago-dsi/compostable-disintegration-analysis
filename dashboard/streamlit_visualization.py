import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import streamlit as st

st.set_page_config(
    page_title="Disintegration Dashboard",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Assuming the CSV files are in the correct directories and accessible
observations = pd.read_csv("/Users/ally/Documents/GitHub/2024-winter-compostable/data/finalized_datasets/observations_compiled.csv")
observations = observations.astype({"item_ID": str, "facility_ID": str})
items = pd.read_csv("dashboard/data/items.csv")
items["item_id"] = items["item_id"].astype(str)
facilities = pd.read_csv("dashboard/data/facilities.csv")
facilities["facility_id"] = facilities["facility_id"].astype(str)

df_merged = pd.merge(
    observations, items, left_on="item_ID", right_on="item_id", how="inner"
)
df_merged = pd.merge(
    df_merged, facilities, left_on="facility_ID", right_on="facility_id", how="inner"
)

with st.sidebar:
    st.title("Residual Dashboard")

    trial_list = list(df_merged.trial_ID.unique())
    selected_trials = st.multiselect(
        "Select Trial(s)", ["All Trials"] + trial_list, default="All Trials"
    )

    facility_technology_list = list(df_merged.primary_technology.unique())
    selected_facility_technologies = st.multiselect(
        "Select Facility Technology(s)", 
        ["All Technologies"] + facility_technology_list, 
        default="All Technologies"
    )

    # Trial filter
    if "All Trials" in selected_trials:
        df_selected_trial = df_merged
    else:
        df_selected_trial = df_merged[df_merged.trial_ID.isin(selected_trials)]

    # Facility technology filter
    if "All Technologies" in selected_facility_technologies:
        df_selected_tech = df_selected_trial
    else:
        df_selected_tech = df_selected_trial[df_selected_trial.primary_technology.isin(selected_facility_technologies)]

    # Residual type filter
    residual_type = st.selectbox(
        "Show Residuals by Mass or Surface Area",
        ["Residual by Mass", "Residual by Surface Area"],
    )
    residual = "mass_resid_%" if residual_type == "Residual by Mass" else "sa_resid_%"

    # Material type filter
    material_type = st.selectbox(
        "Choose X-Axis Display",
        [
            "High-Level Material Categories",
            "Generic Material Categories",
            "Specific Material Categories",
            "Item Types",
        ],
    )
    # make this a dictionary
    if material_type == "High-Level Material Categories":
        material = "material_class_i"
    elif material_type == "Generic Material Categories":
        material = "material_class_ii"
    elif material_type == "Item Types":
        material = "item_name"
    else:
        material = "material_class_iii"

    # Anomaly filter
    cap_anomalies = st.checkbox("Limit Residuals to 100%")
    st.markdown(
    "_Note: for most trials, there are some results with over 100% residuals. "
    "Select this box to limit these values to 100%._",
    unsafe_allow_html=True,
    )



def bar_whisker_plot(df, x, y, cap_anomalies):
    '''
    This function generates a bar and whisker plot.
    Input: 
    df: a dataframe that contains trial information
    x: the x-axis chosen by the user of the interface (material types or product types)
    y: the percent residual measure by mass or surface area
    cap_anomalies: takes in a boolean value that indicates whether the y-axis should be clipped to 100%
    '''
    # Check if the DataFrame is empty
    if df.empty:
        plt.text(0.5, 0.5, 'No data available.\nPlease adjust the filter and try again.', 
                 horizontalalignment='center', verticalalignment='center', 
                 transform=plt.gca().transAxes, fontsize=12)
        plt.gca().axes.get_xaxis().set_visible(False)
        plt.gca().axes.get_yaxis().set_visible(False)
        plt.show()
        return  # Exit the function if no data is available

    # Cap anomalies if specified
    if cap_anomalies:
        df[y] = df[y].clip(lower=0, upper=100)

    iqr = df.groupby(x)[y].apply(lambda g: g.quantile(0.75) - g.quantile(0.25))
    nonzero_iqr_order = (
        df[df[x].isin(iqr[iqr > 0].index)]
        .groupby(x)[y]
        .median()
        .sort_values(ascending=False)
        .index
    )
    zero_iqr_order = iqr[iqr == 0].index
    order = nonzero_iqr_order.append(zero_iqr_order)
    plt.figure(figsize=(12, 8))
    unique = df[x].nunique()
    palette = sns.color_palette("husl", unique)
    sns.boxplot(data=df, x=x, y=y, order=order, palette=palette)
    plt.title(f"{residual_type} for Each {material_type}")
    plt.xlabel(material_type)
    plt.ylabel(residual_type)
    plt.xticks(rotation=45, ha="right")

    plt.tight_layout()
    plt.show()


st.markdown("#### Product Residual Analysis of Field Testing Results")
st.write(
    """
    The Compost Research & Education Foundation (CREF) investigates the breakdown 
    of compostable foodware and packaging products. This research is conducted under the Compostable 
    Field Testing Program, where facilities submit data that CREF uses to establish composting best practices.
    This interactive dashboard presents analysis of composting efficiency based on item types and material types of individual items,
    using field testing data from 16 separate trials.

    """
)
item_residual = bar_whisker_plot(df_selected_tech, material, residual, cap_anomalies)
st.pyplot(plt)
