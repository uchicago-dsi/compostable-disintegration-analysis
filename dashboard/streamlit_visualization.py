import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

st.set_page_config(
    page_title="Disintegration Dashboard",
    layout="wide",
    initial_sidebar_state="expanded",
)

df = pd.read_csv("dashboard/all_trials_processed.csv")
df["% Disintegrated (Weight)"] = 1 - df["% Residuals (Weight)"]
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

st.markdown("#### CFTP Field Test Results Dashboard")
st.write(
    """
    The Compostable Field Testing Program (CFTP) is an international, open-source research platform for composters to field test the disintegration of compostable foodware and packaging in their real-world operations. Operating since 2016, the CFTP has collected data from field trials conducted at compost facilities varying in geography, scale and processing technologies. 

    The University of Chicago Data Science Institute (DSI) and CFTP, with support from the 11th Hour Project, have created this interactive dashboard for public use. This interactive dashboard presents the residuals remaining at the end of a field test. 
    """
)

# TODO: Maybe I should keep all of this in session state, then update stuff so that you can't add additional stuff to the selection if "All Trials", etc. is selected
if "test_methods" not in st.session_state:
    st.session_state.test_methods = ["All Test Methods"]

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    test_methods = list(df["Test Method"].unique())
    st.session_state.test_methods = st.multiselect(
        "Select test method(s)",
        ["All Test Methods"] + test_methods,
        default="All Test Methods",
    )

with col1:
    if st.session_state.test_methods != ["Bulk Dose"]:
        trial_list = sorted(list(df["Trial ID"].unique()))
        selected_trials = st.multiselect(
            "Select trial(s)", ["All Trials"] + trial_list, default="All Trials"
        )
    else:
        st.write("Trial selection is disabled for bulk dose test method.")
    # Anomaly filter
    cap = not st.checkbox("Show results with over 100% Residuals Remaining")
    st.markdown(
        "_Note: There are some results by both weight or surface area with over 100% residuals. The dashboard automatically caps these results at 100% residuals (0% disintegration). Check this box to show all results, including over 100% Residuals._",
        unsafe_allow_html=True,
    )

with col2:
    materials = list(df["Material Class II"].unique())
    selected_materials = st.multiselect(
        "Select material type(s)",
        ["All Materials"] + materials,
        default="All Materials",
    )

    hide_empty = st.checkbox("Hide categories with no data")


with col3:
    technology = sorted(list(df["Technology"].unique()))
    selected_technologies = st.multiselect(
        "Select technology",
        ["All Technologies"] + technology,
        default="All Technologies",
    )

with col3:
    display = st.selectbox(
        "Show by Mass or by Surface Area",
        [
            "Residual by Mass",
            "Residual by Surface Area",
            "Disintegrated by Mass",
            "Disintegrated by Surface Area",
        ],
    )

with col4:
    material_type = st.selectbox(
        "Choose x-axis display",
        [
            "High-Level Material Categories",
            "Generic Material Categories",
            "Specific Material Categories",
            "Item Types",
        ],
    )

display_dict = {
    "Residual by Mass": "% Residuals (Weight)",
    "Residual by Surface Area": "% Residuals (Area)",
    "Disintegrated by Mass": "% Disintegrated (Weight)",
    "Disintegrated by Surface Area": "% Disintegrated (Area)",
}

display_col = display_dict.get(display)

if "All Test Methods" not in st.session_state.test_methods:
    df = df[df["Test Method"].isin(st.session_state.test_methods)]

if "All Technologies" not in selected_technologies:
    df = df[df["Technology"].isin(selected_technologies)]

# TODO: What? Make this a dictionary or something
if material_type == "High-Level Material Categories":
    material = "Material Class I"
elif material_type == "Generic Material Categories":
    material = "Material Class II"
# TODO: Maybe enforce sort order for this
elif material_type == "Item Types":
    material = "Item Format"
else:
    material = "Material Class III"

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
    df_input,
    column,
    groupby="Material Class II",
    cap=False,
    hide_empty=False,
    height=800,
    width=1000,
    save=False,
):
    df = df_input.copy()  # prevent modifying actual dataframe
    if hide_empty:
        df = df.dropna(subset=[column])

    data = []
    x_labels = []

    if cap:
        df[column] = df[column].clip(upper=1)

    max_value = df[column].max()
    max_value = max(100, max_value)

    # TODO: What colors do we want for other stuff? Should probably make this the same as Material Class II
    groups = df[groupby].unique()
    if groupby == "Material Class II":
        groups = class_II_order
    if groupby == "Material Class I":
        groups = class_I_order

    for material in groups:
        group = df[df[groupby] == material]
        if not group.empty:
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
            x_labels.append(f"     {material}<br>     n={count}")

    y_axis_title = f"{column}"
    if cap:
        y_axis_title += " Capped"

    layout = go.Layout(
        height=height,
        width=width,
        showlegend=False,
        xaxis=dict(
            tickmode="array",
            tickvals=list(range(len(x_labels))),
            ticktext=x_labels,
            title_font=dict(size=20),
            tickfont=dict(size=14),
            tickangle=90,
        ),
        yaxis=dict(
            title=y_axis_title,
            tickformat=".0%",
            tickmode="array",
            tickvals=np.arange(0, max_value, 0.25),
            title_font=dict(size=20),
            tickfont=dict(size=16),
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


fig = box_and_whisker(
    df,
    column=display_col,
    groupby=material,
    cap=cap,
    hide_empty=hide_empty,
    height=800,
    width=1000,
)
st.plotly_chart(fig, use_container_width=True)

st.write(
    """
    ##### Definitions
    Results are displayed in terms of the “% Residuals”, i.e. the amount of product that remained at the end of the field test, whether by weight or surface area.

    TODO: Should we include information by percent disintegrated?

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
