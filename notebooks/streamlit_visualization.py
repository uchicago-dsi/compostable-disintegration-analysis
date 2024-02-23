import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(
    page_title="Disintegration Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Assuming the CSV files are in the correct directories and accessible
observations = pd.read_csv('../data/finalized_datasets/observations_compiled.csv')
observations['item_ID'] = observations['item_ID'].astype(str)
items = pd.read_csv('../data/finalized_datasets/items.csv')
items['item_id'] = items['item_id'].astype(str)
df_merged = pd.merge(observations, items, left_on='item_ID', right_on='item_id', how='inner')

with st.sidebar:
    st.title('Residual Dashboard')

    trial_list = ['All trials'] + list(df_merged.trial_ID.unique())
    selected_trials = st.multiselect('Select trial(s)', ['All trials'] + trial_list, default='All trials')

    if 'All trials' in selected_trials:
        df_selected_trial = df_merged
    else:
        df_selected_trial = df_merged[df_merged.trial_ID.isin(selected_trials)]

    residual_type = st.selectbox('Choose Residual Type', ['Residual by mass', 'Residual by surface area'])
    residual = 'mass_resid_%' if residual_type == 'Residual by mass' else 'sa_resid_%'
    material_type = st.selectbox('Choose Item Group', ['Class I', 'Class II', 'Class III', 'Item'])
    # make this a dictionary
    if material_type == 'Class I':
        material = 'material_class_i'
    elif material_type == 'Class II':
        material = 'material_class_ii'
    elif material_type == 'Item':
        material = 'item_name'
    else:  
        material = 'material_class_iii'
    cap_anomalies = st.checkbox('Without Anomalies')

def bar_whisker_plot(df, x, y, cap_anomalies):

    if cap_anomalies:
        df[y] = df[y].clip(lower=0, upper=100)

    iqr = df.groupby(x)[y].apply(lambda g: g.quantile(0.75) - g.quantile(0.25))
    nonzero_iqr_order = df[df[x].isin(iqr[iqr > 0].index)].groupby(x)[y].median().sort_values(ascending=False).index
    zero_iqr_order = iqr[iqr == 0].index
    order = nonzero_iqr_order.append(zero_iqr_order)
    plt.figure(figsize=(12, 8))
    unique = df[x].nunique()
    palette = sns.color_palette("husl", unique)
    sns.boxplot(data=df, x=x, y=y, order=order, palette=palette)
    plt.title(f'{y} for Each {x}')
    plt.xticks(rotation=45, ha='right')
    
    plt.tight_layout()
    plt.show()

st.markdown('#### Product Residual Analysis')
item_residual = bar_whisker_plot(df_selected_trial, material, residual, cap_anomalies)
st.pyplot(plt)

