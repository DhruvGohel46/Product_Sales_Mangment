import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

def create_database():
    # Default params matching config.py
    dbname = "rebill_web_db"
    user = "postgres"
    password = "dharmik"
    host = "localhost"
    
    # Connect to default 'postgres' db to create the new db
    try:
        con = psycopg2.connect(dbname='postgres', user=user, host=host, password=password)
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {dbname}...")
            cur.execute(f"CREATE DATABASE {dbname}")
            print("Database created successfully!")
        else:
            print(f"Database {dbname} already exists.")
            
        cur.close()
        con.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
