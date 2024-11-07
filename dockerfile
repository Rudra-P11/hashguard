# Use the official Python image from Docker Hub
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements.txt first to install dependencies before copying the entire code
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application into the container
COPY . /app/

# Set the FLASK_APP environment variable for Railway
ENV FLASK_APP=server/app.py
ENV FLASK_RUN_HOST=0.0.0.0  # Allow access from any IP

# Expose the port that Flask will run on (default is 5000)
EXPOSE 5000

# Command to run your app (Railway will automatically run this when deploying)
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]