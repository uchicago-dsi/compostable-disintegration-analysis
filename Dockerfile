# Use an official Python runtime as a parent image
FROM python:3.11

# Install build dependencies (for Alpine use 'build-base')
RUN apt-get update && apt-get install -y \
   gcc \
   libc-dev \
   libffi-dev \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# If you have a requirements.txt file, copy it and install the Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Jupyter, ipykernel, and pandas
RUN pip install --no-cache-dir jupyter ipykernel pandas

# Make port 8888 available to the world outside this container
EXPOSE 8888

# Define environment variable
ENV NAME World

# Run Jupyter Notebook when the container launches
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root"]