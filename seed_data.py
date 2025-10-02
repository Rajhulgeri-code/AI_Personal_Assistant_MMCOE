import psycopg2
import random
import time
from datetime import datetime, timedelta

# !!! CRITICAL: CONFIRM THIS CONNECTION STRING IS CORRECT !!!
CONN_STRING = "dbname=ai_assistant_db user=postgres host=localhost password=rajiswow123" 

# --- Reusable Functions ---

def execute_sql(sql, params=None):
    """A reusable function to execute single SQL commands."""
    conn = None
    try:
        conn = psycopg2.connect(CONN_STRING)
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        cur.close()
        return True
    except psycopg2.Error as e:
        # If this error appears now, the issue is likely the CONN_STRING (password/user)
        print(f"Database error during execution: {e}")
        return False
    finally:
        if conn:
            conn.close()

def fetch_ids(table):
    """
    Fetches all existing doctor/patient IDs from the quoted schema.
    Uses explicit logic to correctly determine the primary key column name.
    """
    conn = None
    try:
        conn = psycopg2.connect(CONN_STRING)
        cur = conn.cursor()
        
        # --- CRITICAL FIX: Explicitly check the table name for the column name ---
        if table == 'doctors':
            column_name = 'doctor_id'
        elif table == 'patient_data':
            column_name = 'patient_id'
        else:
            # Fallback for any other table (though we only need the two above)
            raise ValueError(f"Unknown table for ID fetching: {table}")
        
        # Executes the query with the correctly formed column name and quoted table name
        cur.execute(f'SELECT {column_name} FROM "public"."{table}";')
        ids = [row[0] for row in cur.fetchall()]
        return ids
    except psycopg2.Error as e:
        print(f"Error fetching IDs: {e}")
        return []
    finally:
        if conn:
            conn.close()

# --- Seeding Functions (Steps 5.1 & 5.2) ---

def seed_doctors_and_patients():
    """Inserts the base data into the doctors and patient_data tables."""
    print("--- Seeding Doctors and Patients ---")

    doctor_data = [
        ('Dr. Amelia Reid', 8, 'Available'),
        ('Dr. Ben Carter', 5, 'Available'),
        ('Dr. Chloe Davis', 6, 'Available'),
        ('Dr. Ethan Hall', 7, 'On Leave'),
        ('Dr. Fiona King', 4, 'Available')
    ]
    # MODIFIED: Quoted table name for robust schema lookup
    doctor_sql = 'INSERT INTO "public"."doctors" (name, max_workload, current_status) VALUES (%s, %s, %s);'
    for data in doctor_data:
        execute_sql(doctor_sql, data)
    print("✅ 5 Doctors inserted.")

    patient_names = [f"Patient {i:02d}" for i in range(1, 21)]
    # MODIFIED: Quoted table name
    patient_data_sql = 'INSERT INTO "public"."patient_data" (name, condition_severity, latest_vitals) VALUES (%s, %s, %s);'

    for name in patient_names:
        severity = random.randint(1, 10)
        vitals = f"Temp: {random.uniform(36.0, 37.5):.1f}, BP: {random.randint(110, 140)}/{random.randint(70, 90)}"
        execute_sql(patient_data_sql, (name, severity, vitals))
    print("✅ 20 Patients inserted.")

# --- Historical Task Seeding (Step 5.3) ---

def seed_historical_tasks():
    """Inserts 200 rows of historical data with routine patterns for ML training."""
    print("--- Seeding 200 Historical Tasks ---")

    # Fetch IDs using the corrected function
    doctor_ids = fetch_ids('doctors')
    patient_ids = fetch_ids('patient_data')
    
    if not doctor_ids or not patient_ids:
        print("🛑 Error: Doctors or Patients IDs could not be fetched. Cannot seed tasks.")
        return

    task_sql = """
    -- MODIFIED: Quoted table name
    INSERT INTO "public"."tasks" (description, task_type, patient_id, doctor_id, urgency_score, priority_score, proactive_score, scheduled_time, status, is_emergency) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    
    tasks_to_insert = 0
    start_date = datetime.now() - timedelta(days=90)
    
    while tasks_to_insert < 200:
        # Routine Task Pattern (50 rows for Dr. Amelia Reid)
        if tasks_to_insert < 50:
            scheduled_time = start_date + timedelta(weeks=tasks_to_insert, days=0, hours=9, minutes=random.randint(0, 30))
            description = "Weekly Admin Review"
            task_type = "Admin"
            doctor_id = doctor_ids[0] 
            patient_id = patient_ids[0] 
        # Random Tasks (150 rows)
        else:
            days_offset = random.randint(1, 90)
            hours_offset = random.randint(8, 17)
            scheduled_time = start_date + timedelta(days=days_offset, hours=hours_offset, minutes=random.randint(0, 59))
            description = random.choice(["Checkup", "Prescription Refill", "Initial Assessment", "Follow-up", "Virtual Consult"])
            task_type = random.choice(["Consult", "Treatment", "Review"])
            doctor_id = random.choice(doctor_ids)
            patient_id = random.choice(patient_ids)

        # Insert all historical tasks as 'Complete'
        params = (
            description, task_type, patient_id, doctor_id, 
            random.uniform(0.1, 9.9), random.uniform(0.1, 9.9), random.uniform(0.1, 9.9), 
            scheduled_time, 'Complete', random.random() < 0.05 
        )
        execute_sql(task_sql, params)
        tasks_to_insert += 1

    print(f"✅ {tasks_to_insert} historical tasks inserted.")


if __name__ == "__main__":
    seed_doctors_and_patients()
    seed_historical_tasks()