import psycopg2
import random
import time
from datetime import datetime

# !!! CRITICAL: CONFIRM THIS CONNECTION STRING IS CORRECT !!!
CONN_STRING = "dbname=ai_assistant_db user=postgres host=localhost password=rajiswow123"

def fetch_patient_ids():
    """Fetches all existing patient IDs for the streamer."""
    conn = None
    try:
        conn = psycopg2.connect(CONN_STRING)
        cur = conn.cursor()
        # Uses the correct column name
        cur.execute('SELECT patient_id FROM "public"."patient_data";')
        ids = [row[0] for row in cur.fetchall()]
        return ids
    except psycopg2.Error as e:
        print(f"Error fetching patient IDs: {e}")
        return []
    finally:
        if conn:
            conn.close()

def stream_mock_tasks():
    patient_ids = fetch_patient_ids()

    if not patient_ids:
        print("🛑 Cannot stream: Patient data not found. Please run seed_data.py first.")
        return

    task_sql = """
    -- Insert a new task with default scores (0.0) for the models to process
    INSERT INTO "public"."tasks" (description, task_type, patient_id, urgency_score, priority_score, proactive_score, scheduled_time, status, is_emergency) 
    VALUES (%s, %s, %s, 0.0, 0.0, 0.0, %s, 'Pending', %s);
    """

    print("--- Mock Task Streamer Activated ---")
    print("Inserting a new 'Pending' task every 30 seconds. Press Ctrl+C to stop.")

    while True:
        conn = None
        try:
            conn = psycopg2.connect(CONN_STRING)
            cur = conn.cursor()

            description = random.choice(["New Appointment Request", "Urgent Lab Result", "System Alert for Vitals", "Patient Follow-up Call"])
            task_type = random.choice(["Alert", "Request", "Review"])
            patient_id = random.choice(patient_ids)
            is_emergency = random.random() < 0.03 
            current_time = datetime.now()

            params = (description, task_type, patient_id, current_time, is_emergency)

            cur.execute(task_sql, params)
            conn.commit()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] New Task inserted (Patient ID: {patient_id}, Type: {task_type})")

            cur.close()
        except psycopg2.Error as e:
            print(f"Database error during streaming: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        finally:
            if conn:
                conn.close()

        # Pause for 30 seconds
        time.sleep(30) 

if __name__ == "__main__":
    stream_mock_tasks()