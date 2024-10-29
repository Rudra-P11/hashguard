from flask import Flask, request, jsonify
from cryptography.fernet import Fernet
import hashlib, secrets, sqlite3, time, smtplib, os
from email.mime.text import MIMEText
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)
key = Fernet.generate_key()
cipher_suite = Fernet(key)

# Database connection
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Create tables if they don't exist
def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
         CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob TEXT NOT NULL CHECK(dob GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),  -- Ensures YYYY-MM-DD format
            gender TEXT CHECK(gender IN ('M', 'F', 'O')),  -- M for male, F for female, O for other
            vid INTEGER CHECK(vid >= 1000000000000000 AND vid < 10000000000000000) UNIQUE,  -- Ensures 16-digit positive number constraint
            hashed_aadhaar TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            registered_at INTEGER NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            otp TEXT NOT NULL,
            expiration INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/show-users', methods=['GET'])
def show_users():
    conn = get_db_connection()
    c = conn.cursor()
    # Select all fields from the users table
    c.execute("SELECT id, name, dob, gender, vid, hashed_aadhaar, email, registered_at FROM users")
    users = c.fetchall()
    conn.close()
    
    # Create a list of dictionaries for each user
    user_list = [
        {
            "id": user[0],
            "name": user[1],
            "dob": user[2],
            "gender": user[3],
            "vid": user[4],
            "hashed_aadhaar": user[5],
            "email": user[6],
            "registered_at": user[7]
        } 
        for user in users
    ]
    return jsonify({"users": user_list}), 200

# Endpoint to show all OTP requests
@app.route('/show-otps', methods=['GET'])
def show_otps():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT email, otp, expiration FROM otps")
    otps = c.fetchall()
    conn.close()
    
    otp_list = [dict(otp) for otp in otps]
    return jsonify({"otps": otp_list}), 200

# Remove expired OTPs
def delete_expired_otps():
    conn = get_db_connection()
    current_time = int(time.time())
    with conn:
        conn.execute("DELETE FROM otps WHERE expiration <= ?", (current_time,))
    conn.close()

def generate_vid(aadhaar):
    # Generate a salted hash-based VID
    salt = str(int(time.time()))  # Use a timestamp for added uniqueness
    vid = hashlib.sha256((aadhaar + salt).encode()).hexdigest()
    return str(int(vid, 16))[:16]  # Truncate to 16 digits

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    aadhaar = data.get('aadhaar')
    password = data.get('password')
    name = data.get('name')
    dob = data.get('dob')
    gender = data.get('gender')

    # Check if all fields are provided
    if not email or not aadhaar or not password or not name or not dob or not gender:
        return jsonify({"error": "All fields are required."}), 400

    # Validate DOB format (YYYY-MM-DD)
    try:
        dob_formatted = datetime.strptime(dob, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Date of Birth must be in YYYY-MM-DD format."}), 400

    # Hash Aadhaar
    hashed_aadhaar = hashlib.sha256(aadhaar.encode()).hexdigest()

    conn = get_db_connection()
    c = conn.cursor()

    # Delete any previous OTPs for this email before registering
    c.execute("DELETE FROM otps WHERE email = ?", (email,))

    # Check for existing email or Aadhaar
    c.execute("SELECT * FROM users WHERE hashed_aadhaar = ? OR email = ?", (hashed_aadhaar, email))
    if c.fetchone():
        conn.close()
        return jsonify({"error": "Aadhaar or email already registered."}), 400


    # Generate OTP and store with expiration
    otp = secrets.randbelow(1000000)
    expiration_time = int(time.time()) + 300  # 5 minutes
    hashed_otp = hashlib.sha256(str(otp).encode()).hexdigest()
    c.execute("INSERT INTO otps (email, otp, expiration) VALUES (?, ?, ?)", (email, hashed_otp, expiration_time))
    conn.commit()
    conn.close()

    # Send OTP email
    msg = MIMEText(f'Your OTP is: {otp}')
    msg['Subject'] = 'OTP for Registration'
    msg['From'] = 'omkarlakhutework1@gmail.com'
    msg['To'] = email
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('omkarlakhutework1@gmail.com', 'gecx rpts oddc sflv')
        server.send_message(msg)

    # Return a message indicating the OTP was sent
    return jsonify({"message": "OTP sent successfully. Complete registration by verifying the OTP."}), 201

@app.route('/delete-otp', methods=['POST'])
def delete_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required."}), 400

    conn = get_db_connection()
    c = conn.cursor()

    # Delete the OTP associated with the email
    c.execute("DELETE FROM otps WHERE email = ?", (email,))
    conn.commit()
    conn.close()

    return jsonify({"message": "OTP deleted successfully."}), 200

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    user_otp = data.get('otp')
    aadhaar = data.get('aadhaar')
    password = data.get('password')
    name = data.get('name')
    dob = data.get('dob')
    gender = data.get('gender')
    
    # Hash the password and Aadhaar for storage
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    hashed_aadhaar = hashlib.sha256(aadhaar.encode()).hexdigest()
    
    # Hash the user OTP for comparison
    hashed_user_otp = hashlib.sha256(str(user_otp).encode()).hexdigest()

    conn = get_db_connection()
    c = conn.cursor()
    current_time = int(time.time())

    # Generate a unique 16-digit VID using hashing
    vid = generate_vid(aadhaar)
    c.execute("SELECT * FROM users WHERE vid = ?", (vid,))
    while c.fetchone():  # Ensure VID uniqueness
        vid = generate_vid(aadhaar)

    try:
        # Retrieve OTP details for the email
        c.execute("SELECT otp, expiration FROM otps WHERE email = ?", (email,))
        otp_record = c.fetchone()

        if otp_record:
            otp, expiration = otp_record
            hashed_stored_otp = otp  # The stored OTP is already hashed

            if current_time < expiration and hashed_stored_otp == hashed_user_otp:
                # Register user if OTP is valid
                c.execute(
                    "INSERT INTO users (hashed_aadhaar, email, hashed_password, name, dob, gender, registered_at ,vid) VALUES (?, ?, ?, ?, ?, ?, ? ,?) ",
                    (hashed_aadhaar, email, hashed_password, name, dob, gender, current_time , vid)
                )
                c.execute("DELETE FROM otps WHERE email = ?", (email,))
                conn.commit()
                return jsonify({"message": "User registered successfully."}), 200
            
            elif current_time >= expiration:
                # Delete expired OTP and notify user
                c.execute("DELETE FROM otps WHERE email = ?", (email,))
                conn.commit()
                return jsonify({"error": "OTP expired. Please request a new one."}), 400

        return jsonify({"error": "Invalid OTP."}), 400

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        conn.close()

@app.route('/check-otp', methods=['POST'])
def check_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required."}), 400

    conn = get_db_connection()
    c = conn.cursor()
    current_time = int(time.time())

    # Retrieve OTP details for the email
    c.execute("SELECT otp, expiration FROM otps WHERE email = ?", (email,))
    otp_record = c.fetchone()

    if otp_record:
        hashed_stored_otp, expiration = otp_record
        remaining_time = expiration - current_time

        if remaining_time > 0:
            return jsonify({
                "otpExists": True,
                "remainingTime": remaining_time
            }), 200
        else:
            # OTP expired, delete it from the database
            c.execute("DELETE FROM otps WHERE email = ?", (email,))
            conn.commit()
            return jsonify({"otpExists": False}), 200

    return jsonify({"otpExists": False}), 200


@app.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.json
    email = data.get('email')

    # Generate a new OTP
    otp = secrets.randbelow(1000000)
    expiration_time = int(time.time()) + 300  # 5 minutes

    # Hash the OTP before storing
    hashed_otp = hashlib.sha256(str(otp).encode()).hexdigest()

    conn = get_db_connection()
    c = conn.cursor()
    
    # Delete any previous OTPs for this email
    c.execute("DELETE FROM otps WHERE email = ?", (email,))
    
    # Insert the new hashed OTP
    c.execute("INSERT INTO otps (email, otp, expiration) VALUES (?, ?, ?)", (email, hashed_otp, expiration_time))
    conn.commit()
    conn.close()

    # Send the new OTP email
    msg = MIMEText(f'Your OTP is: {otp}')  # Consider including the actual OTP in the message
    msg['Subject'] = 'OTP for Registration'
    msg['From'] = 'omkarlakhutework1@gmail.com'  # Set the sender's email address
    msg['To'] = email  # Set the recipient's email address
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('omkarlakhutework1@gmail.com', 'gecx rpts oddc sflv')
        server.send_message(msg)

    return jsonify({"message": "New OTP sent successfully."}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    c = conn.cursor()
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    try:
        c.execute("SELECT * FROM users WHERE email = ? AND hashed_password = ?", (email, hashed_password))
        user = c.fetchone()
        if user:
            return jsonify({"message": "Successfully logged in", "email": email}), 200
        else:
            return jsonify({"error": "Invalid login credentials"}), 401
    finally:
        conn.close()

if __name__ == '__main__':
    create_tables()
    app.run(debug=True)