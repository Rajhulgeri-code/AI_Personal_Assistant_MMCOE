import psycopg2

# Define the connection string using your details
conn_string = "dbname=ai_assistant_db user=postgres host=localhost password=rajiswow123"

print("Attempting to connect to the database...")
try:
    # Establish the connection
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()

    print("\nSUCCESS! Database connection established. 🎉")

    # Test the connection with a simple query
    cur.execute("SELECT current_database();")
    db_name = cur.fetchone()[0]
    print(f"Successfully connected to database: {db_name}")

    # Clean up
    cur.close()
    conn.close()

except psycopg2.Error as e:
    print(f"\nFAILURE! Database connection failed. 🛑")
    print(f"Error details: {e}")