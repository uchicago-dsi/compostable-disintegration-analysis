# Use an official Python runtime as a parent image
FROM python:3.11


# Install build dependencies (for Alpine use 'build-base')
RUN apt-get update && apt-get install -y \
   gcc \
   libc-dev \
   libffi-dev


# Set the working directory in the container
WORKDIR /usr/src/app
COPY scripts/.streamlit/secrets.toml /usr/src/app/.streamlit/


# Copy the current directory contents into the container at /usr/src/app
COPY . .


# If you have a requirements.txt file, copy it and install the Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# Install Jupyter, ipykernel, and pandas
RUN pip install --no-cache-dir jupyter ipykernel pandas


# Make port 8501 available to the world outside this container
EXPOSE 8501


CMD ["streamlit", "run", "scripts/streamlit_visualization.py"]
