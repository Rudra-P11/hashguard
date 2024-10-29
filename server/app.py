from flask import Flask, request, jsonify
from cryptography.fernet import Fernet
import hashlib
import secrets
import sqlite3
import time
from email.mime.text import MIMEText
import smtplib
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS 
import os
from datetime import datetime
from pydub import AudioSegment
import speech_recognition as sr

app = Flask(__name__)
CORS(app)

# Generate a key for encryption (you should store this securely)
key = Fernet.generate_key()
cipher_suite = Fernet(key)

# Database connection
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')  # Absolute path to users.db
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Function to create tables
def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create the users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hashed_aadhaar TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        registered_at INTEGER NOT NULL
    )
    ''')

    # Create the otps table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp INTEGER NOT NULL,
        expiration INTEGER NOT NULL
    )
    ''')

    # Commit changes and close the connection
    conn.commit()
    conn.close()

def hash_aadhaar(aadhaar_number):
    return hashlib.sha256(aadhaar_number.encode()).hexdigest()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()  # Hash the password

def encrypt_aadhaar(aadhaar_number):
    return cipher_suite.encrypt(aadhaar_number.encode()).decode()

def generate_otp() -> int:
    """Generates a 6-digit random OTP."""
    return secrets.randbelow(1000000)  # Generates a number between 0 and 999999

def send_otp(email: str, otp: int) -> None:
    """Sends the OTP to the user's email."""
    msg = MIMEText(f'Your OTP for registration is: {otp}')
    msg['Subject'] = 'Your OTP for Registration'
    msg['From'] = 'omkarlakhutework1@gmail.com'  # Replace with your sender email
    msg['To'] = email

    with smtplib.SMTP('smtp.gmail.com', 587) as server:  # Replace with your SMTP server
        server.starttls()
        server.login('omkarlakhutework1@gmail.com', 'gecx rpts oddc sflv')  # Replace with your email and password
        server.send_message(msg)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    aadhaar_number = data.get('aadhaar')
    email = data.get('email')
    password = data.get('password')

    if not aadhaar_number or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    hashed_aadhaar = hash_aadhaar(aadhaar_number)

    # Check for existing email or Aadhaar number
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE hashed_aadhaar = ? OR email = ?", (hashed_aadhaar, email))
    existing_user = c.fetchone()

    if existing_user:
        return jsonify({"error": "Aadhaar number or email already registered."}), 400

    # Generate OTP and send it
    otp = generate_otp()
    send_otp(email, otp)

    # Store OTP with expiration time
    expiration_time = int(time.time()) + 300  # 5 minutes expiration
    try:
        c.execute("INSERT INTO otps (email, otp, expiration) VALUES (?, ?, ?)", (email, otp, expiration_time))
        conn.commit()
    except Exception as e:
        print(f"Error inserting OTP: {e}")
        return jsonify({"error": "OTP generation failed."}), 500
    finally:
        conn.close()

    return jsonify({"message": "User registered successfully. OTP sent to email."}), 201

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    user_otp = data.get('otp')

    if not email or not user_otp:
        return jsonify({"error": "Email and OTP are required."}), 400

    conn = get_db_connection()
    c = conn.cursor()

    # Check if OTP is valid and not expired
    c.execute("SELECT otp, expiration FROM otps WHERE email = ?", (email,))
    otp_record = c.fetchone()

    if otp_record:
        otp, expiration = otp_record
        current_time = int(time.time())
        print(f"Current Time: {current_time}, Expiration: {expiration}, User OTP: {user_otp}, Stored OTP: {otp}")  # Debugging line
        
        if current_time < expiration:  # Check if OTP has expired
            if str(otp) == str(user_otp):  # Ensure correct OTP match
                # Now insert the user information into the database
                hashed_password = hash_password(data['password'])  # Hash the password

                try:
                    # Insert user information into the database
                    c.execute("INSERT INTO users (hashed_aadhaar, email, hashed_password, registered_at) VALUES (?, ?, ?, ?)",
                              (hash_aadhaar(data['aadhaar']), email, hashed_password, int(time.time())))
                    conn.commit()

                    # Delete the OTP after successful registration
                    c.execute("DELETE FROM otps WHERE email = ?", (email,))
                    conn.commit()

                    return jsonify({"message": "User registered successfully."}), 200
                except Exception as e:
                    print(f"Error inserting user: {e}")
                    return jsonify({"error": "User registration failed."}), 500
            else:
                return jsonify({"error": "Invalid OTP."}), 400  # Return specific error for invalid OTP
        else:
            return jsonify({"error": "OTP has expired."}), 400
    else:
        return jsonify({"error": "Invalid OTP."}), 400

from datetime import datetime
from flask import jsonify

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # Hash the password to match the stored format
    hashed_password = hash_password(password)

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT email, hashed_password FROM users WHERE email = ?", (email,))
    user = c.fetchone()

    conn.close()

    if user:
        # Check if the provided password matches the stored hashed password
        if user['hashed_password'] == hashed_password:
            # Password matches
            return jsonify({"message": "Login successful."}), 200
        else:
            # Password does not match
            return jsonify({"error": "Incorrect password."}), 400
    else:
        # User with this email does not exist
        return jsonify({"error": "User not found."}), 404

@app.route('/user-info', methods=['GET'])
def user_info():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT email, registered_at, hashed_aadhaar FROM users ORDER BY registered_at DESC")
    users = c.fetchall()
    conn.close()

    user_list = []

    for user in users:
        # Each user is a tuple; unpack the values
        email, registered_at, hashed_aadhaar = user
        
        # Format the registered_at timestamp
        registered_at_formatted = datetime.fromtimestamp(registered_at).strftime('%Y-%m-%d %H:%M:%S')

        user_list.append({
            "email": email,
            "registered_at": registered_at_formatted,  # Use formatted date
            "hashed_aadhaar": hashed_aadhaar
        })

    return jsonify(user_list), 200


@app.route('/otp-count', methods=['GET'])
def otp_count():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM otps")
    count = c.fetchone()[0]
    conn.close()
    return jsonify({"otp_requests": count}), 200

@app.route('/active-users', methods=['GET'])
def active_users():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users")
    count = c.fetchone()[0]
    conn.close()
    return jsonify({"active_users": count}), 200

# Scheduler function to clean up expired OTPs
def cleanup_expired_otps():
    conn = get_db_connection()
    current_time = int(time.time())
    conn.execute("DELETE FROM otps WHERE expiration < ?", (current_time,))
    conn.commit()
    conn.close()
    print("Expired OTPs cleaned up.")

# Set up the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(cleanup_expired_otps, 'interval', minutes=1)  # Clean up every 1 minute
scheduler.start()

if __name__ == '__main__':
    # Create tables on startup
    create_tables()
    print("Database tables created or verified.")
    try:
        app.run(debug=True)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()  # Shut down the scheduler when the app is stopped

@app.route('/verify_voice', methods=['POST'])
def verify_voice():
    if 'audio' not in request.files:
        return jsonify({'status': 'error', 'message': 'No audio file provided.'})

    audio_file = request.files['audio']

    # Save the uploaded file temporarily
    temp_audio_path = 'temp_audio.wav'
    audio_file.save(temp_audio_path)

    # Convert to WAV format if not already
    audio = AudioSegment.from_file(temp_audio_path)
    audio.export(temp_audio_path, format='wav')

    recognizer = sr.Recognizer()
    with sr.AudioFile(temp_audio_path) as source:
        audio_data = recognizer.record(source)

    try:
        # Recognize the audio
        recognized_text = recognizer.recognize_google(audio_data)
        expected_phrase = "What is your name."
        if recognized_text.lower() == expected_phrase.lower():
            return jsonify({'status': 'success', 'message': 'Verification successful!'})
        else:
            return jsonify({'status': 'failure', 'message': 'Verification failed!'})
    except sr.UnknownValueError:
        return jsonify({'status': 'error', 'message': 'Could not understand audio.'})
    except sr.RequestError:
        return jsonify({'status': 'error', 'message': 'Could not request results from Google Speech Recognition service.'})
    finally:
        # Clean up temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

if __name__ == '__main__':
    app.run(debug=True)
