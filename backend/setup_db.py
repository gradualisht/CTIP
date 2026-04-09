"""
Run this script once to create all database tables.
Usage: python setup_db.py
"""
from app.db.database import engine
from app.db import models

models.Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
