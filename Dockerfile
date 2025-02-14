# TODO: python
FROM python:3.12-slim
# Swith to root to update and install python dev tools
# Then return to NB_UID user. This is monstly done to demonstrate
# how to do this if additional packages are required.
WORKDIR /project

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["/bin/bash"]