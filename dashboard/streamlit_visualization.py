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

with st.sidebar:
    st.title("Residual Dashboard")

    trial_list = list(df.Trial.unique())
    selected_trials = st.multiselect(
        "Select Trial(s)", ["All Trials"] + trial_list, default="All Trials"
    )

    # TODO: This is bad — handle "select all" better
    # Trial filter
    if "All Trials" in selected_trials:
        df = df
    else:
        df = df[df.Trial.isin(selected_trials)]

    materials = list(df["Material Class II"].unique())
    selected_materials = st.multiselect(
        "Select Facility Technology(s)",
        ["All Technologies"] + materials,
        default="All Technologies",
    )

    # TODO: Also bad
    # Facility technology filter
    if "All Technologies" in selected_materials:
        df = df
    else:
        df = df[df["Material Class II"].isin(selected_materials)]

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
    # TODO: What? Make this a dictionary or something
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
    cap = st.checkbox("Limit Residuals to 100%")
    st.markdown(
        "_Note: for most trials, there are some results with over 100% residuals. "
        "Select this box to limit these values to 100%._",
        unsafe_allow_html=True,
    )

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
    df, column=residual, class_I=None, cap=cap, height=800, width=1000
)
st.plotly_chart(fig, use_container_width=True)
