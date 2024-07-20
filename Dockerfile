# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /budgetapp

# Install system dependencies. These are needed for weasyprint
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    libcairo2 \
    libpango1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /budgetapp

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN python manage.py collectstatic
RUN python manage.py compilemessages

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["gunicorn", "-b", "0.0.0.0:8000", "expenseswebsite.wsgi:application"]