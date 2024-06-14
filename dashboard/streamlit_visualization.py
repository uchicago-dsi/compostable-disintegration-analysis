import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

st.set_page_config(
    page_title="Disintegration Dashboard",
    layout="wide",
    initial_sidebar_state="expanded",
)

# TODO: set up a separate temps df and create the average temps from it
temps = pd.read_csv("dashboard/temperatures.csv", index_col=0)
trial_durations = pd.read_csv("dashboard/trial_durations.csv", index_col=0)
moisture = pd.read_csv("dashboard/moisture.csv", index_col=0)

df = pd.read_csv("dashboard/all_trials_processed.csv")
df["% Disintegrated (Mass)"] = 1 - df["% Residuals (Mass)"]
df["% Disintegrated (Area)"] = 1 - df["% Residuals (Area)"]

id2technology = {
    "WR": "Windrow",
    "CASP": "Covered or Extended Aerated Static Pile",
    "EASP": "Covered or Extended Aerated Static Pile",
    "ASP": "Aerated Static Pile",
    "IV": "In-Vessel",
}


def map_technology(trial_id):
    for key in id2technology:
        if key in trial_id:
            return id2technology[key]
    return "Unknown"


df["Technology"] = df["Trial ID"].apply(map_technology)


# TODO: Maybe I should keep all of this in session state, then update stuff so that you can't add additional stuff to the selection if "All Trials", etc. is selected
if "test_methods" not in st.session_state:
    st.session_state.test_methods = ["All Test Methods"]

with st.sidebar:
    test_methods = list(df["Test Method"].unique())
    st.session_state.test_methods = st.multiselect(
        "Select test method(s)",
        ["All Test Methods"] + test_methods,
        default="All Test Methods",
    )

    if st.session_state.test_methods != ["Bulk Dose"]:
        trial_list = sorted(list(df["Trial ID"].unique()))
        selected_trials = st.multiselect(
            "Select trial(s)", ["All Trials"] + trial_list, default="All Trials"
        )
    else:
        selected_trials = ["All Trials"]
        st.write("Trial selection is disabled for bulk dose test method.")

    materials = list(df["Material Class II"].unique())
    selected_materials = st.multiselect(
        "Select material type(s)",
        ["All Materials"] + materials,
        default="All Materials",
    )

    technology = sorted(list(df["Technology"].unique()))
    selected_technologies = st.multiselect(
        "Select technology",
        ["All Technologies"] + technology,
        default="All Technologies",
    )

    mass_or_area = st.selectbox(
        "Show Results by Mass or by Surface Area",
        [
            "Mass",
            "Surface Area",
        ],
    )

    residuals_or_disintegration = st.selectbox(
        "Show by Residuals Remaining or by Percent Disintegrated",
        [
            "Residuals Remaining",
            "Percent Disintegrated",
        ],
    )

    temp_filter = st.selectbox(
        "Select Average Temperature Range",
        ["All Temperatures", "<140F", "140-150F", "150-160F", ">160F"],
    )

    duration_filter = st.selectbox(
        "Select Trial Duration Range",
        ["All Durations", "30-45 Days", "45-75 Days", ">75 Days"],
    )

    moisture_filter = st.selectbox(
        "Select Average Moisture Content (In Field) Range",
        ["All Moistures", "<40%", "40-45%", "45-50%", "50-55%", "55-60%", ">60%"],
    )

    material_type = st.selectbox(
        "Choose x-axis display",
        [
            "High-Level Material Categories",
            "Generic Material Categories",
            "Specific Material Categories",
            "Item Types",
        ],
    )

    # Anomaly filter
    cap = not st.checkbox("Show results with over 100% Residuals Remaining")
    st.markdown(
        "_Note: There are some results by both mass or surface area with over 100% residuals. The dashboard automatically caps these results at 100% residuals (0% disintegration). Check this box to show all results, including over 100% Residuals. Disintegration results are always capped at 0% (no negative disintegration results)_",
        unsafe_allow_html=True,
    )

    # hide_empty = st.checkbox("Hide categories with no data")

st.markdown("#### CFTP Field Test Results Dashboard")
st.write(
    """
    The Compostable Field Testing Program (CFTP) is an international, open-source research platform for composters to field test the disintegration of compostable foodware and packaging in their real-world operations. Operating since 2016, the CFTP has collected data from field trials conducted at compost facilities varying in geography, scale and processing technologies.

    The University of Chicago Data Science Institute (DSI) and CFTP, with support from the 11th Hour Project, have created this interactive dashboard for public use. This interactive dashboard presents the residuals remaining at the end of a field test.
    """
)

display_dict = {
    ("Mass", "Residuals Remaining"): "% Residuals (Mass)",
    ("Mass", "Percent Disintegrated"): "% Disintegrated (Mass)",
    ("Surface Area", "Residuals Remaining"): "% Residuals (Area)",
    ("Surface Area", "Percent Disintegrated"): "% Disintegrated (Area)",
}
display_col = display_dict[(mass_or_area, residuals_or_disintegration)]

if "All Trials" not in selected_trials:
    df = df[df["Trial ID"].isin(selected_trials)]

if "All Materials" not in selected_materials:
    df = df[df["Material Class II"].isin(selected_materials)]

if "All Test Methods" not in st.session_state.test_methods:
    df = df[df["Test Method"].isin(st.session_state.test_methods)]

if "All Technologies" not in selected_technologies:
    df = df[df["Technology"].isin(selected_technologies)]


def get_filtered_trial_ids(df, col, low, high, inclusive):
    if inclusive:
        return list(df[(df[col] >= low) & (df[col] <= high)].index)
    else:
        return list(df[(df[col] > low) & (df[col] < high)].index)


temp_dict = {
    "<140F": (-float("inf"), 140, False),
    "140-150F": (140, 150, True),
    "150-160F": (150, 160, True),
    ">160F": (160, float("inf"), False),
}

if temp_filter != "All Temperatures":
    col = "Average Temperature (F)"
    low, high, inclusive = temp_dict[temp_filter]
    facility_ids = get_filtered_trial_ids(temps, col, low, high, inclusive=inclusive)
    df = df[df["Trial ID"].isin(facility_ids)]

duration_dict = {
    "30-45 Days": (30, 45, True),
    "45-75 Days": (45, 75, True),
    ">75 Days": (75, float("inf"), False),
}

if duration_filter != "All Durations":
    col = "Trial Duration"
    low, high, inclusive = duration_dict[duration_filter]
    facility_ids = get_filtered_trial_ids(
        trial_durations, col, low, high, inclusive=inclusive
    )
    df = df[df["Trial ID"].isin(facility_ids)]

moisture_dict = {
    "<40%": (-float("inf"), 0.4, False),
    "40-45%": (0.4, 0.45, True),  # "40-45%": (0.40, 0.45, True),
    "45-50%": (0.45, 0.50, True),
    "50-55%": (0.50, 0.55, True),
    "55-60%": (0.55, 0.60, True),
    ">60%": (0.60, float("inf"), False),
}

if moisture_filter != "All Moistures":
    col = "Average % Moisture (In Field)"
    low, high, inclusive = moisture_dict[moisture_filter]
    facility_ids = get_filtered_trial_ids(moisture, col, low, high, inclusive=inclusive)
    df = df[df["Trial ID"].isin(facility_ids)]

selection2material = {
    "High-Level Material Categories": "Material Class I",
    "Generic Material Categories": "Material Class II",
    "Specific Material Categories": "Material Class III",
    "Item Types": "Item Format",
}
material_col = selection2material.get(material_type, "Material Class I")

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
class_III_order = [
    "PLA Lined Bagasse",
    "Unlined Molded Fiber",
]
item_type_order = [
    "Bowl",
    "Clamshell",
    "Cutlery",
    "Biopolymer Bag",
    "Cold Cup",
    "Spoon",
    "Straw",
    "Positive Control - Film",
    "Positive Control - Fiber",
    "Positive Control - Food Scraps",
]

# TODO: Hacky way to generate title...
title = f"{display_col} by {material_type}"
if "All Test Methods" not in st.session_state.test_methods:
    test_methods_str = ", ".join(st.session_state.test_methods)
    title += f", {test_methods_str}"
if "All Technologies" not in selected_technologies:
    technologies_str = ", ".join(selected_technologies)
    title += f", {technologies_str}"

# Count the number of trials
num_trials = len(df["Trial ID"].unique())


def box_and_whisker(
    df_input,
    column,
    groupby="Material Class II",
    title=title,
    num_trials=num_trials,
    cap=False,
    height=800,
    width=1000,
    save=False,
    min_values=5,
):
    df = df_input.copy()  # prevent modifying actual dataframe
    df = df[df[column].notnull()]

    data = []
    x_labels = []

    # Note: don't allow disintegration rates to be negative
    df[column] = df[column].clip(lower=0)

    if cap:
        df[column] = df[column].clip(upper=1)

    max_value = df[column].max()
    max_value = max(100, max_value)

    # Maintain Material Class I sort order for everything
    df['Material Class I'] = pd.Categorical(df['Material Class I'], categories=class_I_order, ordered=True)
    df = df.sort_values(by='Material Class I')
    groups = df[groupby].unique()

    for material in groups:
        group = df[df[groupby] == material]
        if len(group) >= min_values:
            count = group[column].count()
            # TODO: Wait...I don't think this should be this specific for Material Class I...
            class_I_name = group["Material Class I"].iloc[0]
            color = class2color.get(class_I_name, "#000")
            trace = go.Box(
                y=group[column],
                name=material,
                boxpoints="outliers",
                boxmean=True,
                marker_color=color,
                width=0.3,
            )
            data.append(trace)
            x_labels.append(f"     {material} (n={count})")

    if not data:
        st.error("No data available for the selected criteria.")
        return

    y_axis_title = f"{column}"
    if cap:
        y_axis_title += " Capped"

    if len(groups) < 6:
        tickangle = 0
    elif len(groups) < 10:
        tickangle = 45
    else:
        tickangle = 90

    layout = go.Layout(
        height=height,
        width=width,
        showlegend=False,
        title=dict(text=title + f" - {num_trials} Trial(s)", x=0.5, xanchor='center', yanchor='top'),
        xaxis=dict(
            tickmode="array",
            tickvals=list(range(len(x_labels))),
            ticktext=x_labels,
            title_font=dict(size=20),
            tickfont=dict(size=14),
            tickangle=tickangle,
        ),
        yaxis=dict(
            title=y_axis_title,
            tickformat=".0%",
            tickmode="array",
            tickvals=np.arange(0, max_value, 0.25),
            title_font=dict(size=20),
            tickfont=dict(size=16),
            rangemode="tozero",
            range=[0, 1],
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


fig = box_and_whisker(
    df,
    column=display_col,
    groupby=material_col,
    cap=cap,
    min_values=5,
    height=800,
    width=1000,
)
if fig:
    st.plotly_chart(fig, use_container_width=True)

st.write(
    """
    ##### Definitions
    Results are displayed in terms of the “% Residuals”, i.e. the amount of product that remained at the end of the field test, whether by mass or surface area.

    - Max: Maximum value
    - Upper Fence (Top Whisker): Third Quartile + 1.5 * Interquartile Range
    - Interquartile Range: Q3 - Q1
    - Q3: Third quartile (75th percentile)
    - Median: Middle value
    - Mean: Average value
    - Q1: First quartile (25th percentile)
    - Lower Fence (Bottom Whisker): Q1 - 1.5 * Interquartile Range
    - Min: Minimum value
    """
)
