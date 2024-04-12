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
df = pd.read_csv("dashboard/all_trials_processed.csv")
# df["% Residuals (Weight)"] = df["% Residuals (Weight)"] * 100
# df["% Residuals (Area)"] = df["% Residuals (Area)"] * 100
# observations = observations.astype({"item_ID": str, "facility_ID": str})
# items = pd.read_csv("dashboard/data/items.csv")
# items["item_id"] = items["item_id"].astype(str)
# facilities = pd.read_csv("dashboard/data/facilities.csv")
# facilities["facility_id"] = facilities["facility_id"].astype(str)

# df_merged = pd.merge(
#     observations, items, left_on="item_ID", right_on="item_id", how="inner"
# )
# df_merged = pd.merge(
#     df_merged, facilities, left_on="facility_ID", right_on="facility_id", how="inner"
# )

with st.sidebar:
    st.title("Residual Dashboard")

    trial_list = list(df.Trial.unique())
    selected_trials = st.multiselect(
        "Select Trial(s)", ["All Trials"] + trial_list, default="All Trials"
    )

    facility_technology_list = list(df["Material Class II"].unique())
    selected_facility_technologies = st.multiselect(
        "Select Facility Technology(s)",
        ["All Technologies"] + facility_technology_list,
        default="All Technologies",
    )

    # Trial filter
    if "All Trials" in selected_trials:
        df_selected_trial = df
    else:
        df_selected_trial = df[df.trial_ID.isin(selected_trials)]

    # Facility technology filter
    if "All Technologies" in selected_facility_technologies:
        df_selected_tech = df_selected_trial
    else:
        df_selected_tech = df_selected_trial[
            df_selected_trial["Material Class II"].isin(selected_facility_technologies)
        ]

    # Residual type filter
    residual_type = st.selectbox(
        "Show Residuals by Mass or Surface Area",
        ["Residual by Mass", "Residual by Surface Area"],
    )
    residual = (
        "% Residuals (Weight)"
        if residual_type == "Residual by Mass"
        else "% Residuals (Area)"
    )

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
        material = "Material Class I"
    elif material_type == "Generic Material Categories":
        material = "Material Class II"
    elif material_type == "Item Types":
        material = "Item Name"
    else:
        material = "Material Class III"

    # Anomaly filter
    cap_anomalies = st.checkbox("Limit Residuals to 100%")
    st.markdown(
        "_Note: for most trials, there are some results with over 100% residuals. "
        "Select this box to limit these values to 100%._",
        unsafe_allow_html=True,
    )


def bar_whisker_plot(df, x, y, cap_anomalies):
    """
    This function generates a bar and whisker plot.
    Input:
    df: a dataframe that contains trial information
    x: the x-axis chosen by the user of the interface (material types or product types)
    y: the percent residual measure by mass or surface area
    cap_anomalies: takes in a boolean value that indicates whether the y-axis should be clipped to 100%
    """
    # Check if the DataFrame is empty
    if df.empty:
        plt.text(
            0.5,
            0.5,
            "No data available.\nPlease adjust the filter and try again.",
            horizontalalignment="center",
            verticalalignment="center",
            transform=plt.gca().transAxes,
            fontsize=12,
        )
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


import matplotlib.colors as mcolors
import numpy as np
import plotly.graph_objects as go

class2color = {
    "Positive Control": "#70AD47",
    "Mixed Materials": "#48646A",
    "Fiber": "#298FC2",
    "Biopolymer": "#FFB600",
}

class_I_order = ["Fiber", "Biopolymer", "Mixed Materials", "Positive Control"]
class_II_order = [
    "Unlined Fiber",
    "Lined Fiber",
    "Biopolymer Film/Bag",
    "Rigid Biopolymer (> 0.75mm)",
    "Rigid Biopolymer (< 0.75mm)",
    "Positive Control - Fiber",
    "Positive Control - Film",
    "Positive Control - Food Scraps",
]


def box_and_whisker(
    df_input, column, class_I=None, cap=False, height=800, width=1000, save=False
):
    df = df_input.copy()  # prevent modifying actual dataframe

    data = []
    x_labels = []

    if cap:
        df[column] = df[column].clip(upper=1)
    if class_I:
        df = df[df["Material Class I"] == class_I]

    max_value = df[column].max()
    max_value = max(100, max_value)

    for class_II in class_II_order:
        group = df[df["Material Class II"] == class_II]
        if not group.empty:
            count = group[column].count()
            class_I_name = group["Material Class I"].iloc[0]
            color = class2color.get(class_I_name, "#000")
            trace = go.Box(
                y=group[column],
                name=class_II,
                boxpoints="outliers",
                marker_color=color,
                width=0.3,
            )
            data.append(trace)
            x_labels.append(f"     {class_II}<br>     n={count}")

    y_axis_title = f"{column}"
    if cap:
        y_axis_title += " Capped"

    layout = go.Layout(
        title_font=dict(size=14, family="Roboto"),
        font=dict(family="Roboto", size=11),
        height=height,
        width=width,
        showlegend=False,
        xaxis=dict(
            tickmode="array",
            tickvals=list(range(len(x_labels))),
            ticktext=x_labels,
            title_font=dict(size=14),
            tickfont=dict(size=11),
            tickangle=90,
        ),
        yaxis=dict(
            title=y_axis_title,
            tickformat=".0%",
            tickmode="array",
            tickvals=np.arange(
                0, max_value, 0.25
            ),  # Adjust this range if your data is not percentage-based
            title_font=dict(size=16),
            tickfont=dict(size=9),
            rangemode="tozero",
        ),
    )

    layout = go.Layout(
        height=height,
        width=width,
        showlegend=False,
        xaxis=dict(
            tickmode="array",
            tickvals=list(range(len(x_labels))),
            ticktext=x_labels,
            title_font=dict(size=14),
            tickfont=dict(size=11),
            tickangle=90,
        ),
        yaxis=dict(
            title=y_axis_title,
            tickformat=".0%",
            tickmode="array",
            tickvals=np.arange(
                0, max_value, 0.25
            ),  # Adjust this range if your data is not percentage-based
            title_font=dict(size=16),
            tickfont=dict(size=9),
            rangemode="tozero",
        ),
    )

    fig = go.Figure(data=data, layout=layout)

    if save:
        filepath = column.replace(" ", "_") + "_box_and_whisker"

        if cap:
            filepath += "_capped"

        filepath += ".png"
        fig.write_image(filepath)

    return fig


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
# item_residual = bar_whisker_plot(df_selected_tech, material, residual, cap_anomalies)
# st.pyplot(plt)

fig = box_and_whisker(
    df, column=residual, class_I=None, cap=cap_anomalies, height=800, width=1000
)
st.plotly_chart(fig, use_container_width=True)
