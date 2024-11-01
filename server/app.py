from flask import Flask, request, jsonify , send_file
from cryptography.fernet import Fernet
import hashlib, secrets, sqlite3, time, smtplib, os
from email.mime.text import MIMEText
from flask_cors import CORS
from datetime import datetime
from pydub import AudioSegment
import speech_recognition as sr
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from pdf2image import convert_from_path
import fitz  # PyMuPDF
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage  # Import for image attachments
from email import encoders
from email.mime.application import MIMEApplication


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
            gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),  -- M for male, F for female, O for other
            vid INTEGER CHECK(vid >= 1000000000000000 AND vid < 10000000000000000) UNIQUE,  -- Ensures 16-digit positive number constraint
            hashed_aadhaar TEXT NOT NULL UNIQUE,
            last_digits TEXT NOT NULL,
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
    c.execute("SELECT id, name, dob, gender, vid, hashed_aadhaar, email, registered_at, last_digits FROM users")
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
            "last_digits": user[8],
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
    
    # Aadhaar last four digits
    last_digits = aadhaar[-4:]
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
                    "INSERT INTO users (hashed_aadhaar, email, hashed_password, name, dob, gender, registered_at ,vid, last_digits) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?) ",
                    (hashed_aadhaar, email, hashed_password, name, dob, gender, current_time , vid, last_digits)
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


# Define the directory to store assets
ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'assets')

@app.route('/generate-aadhaar-card/<email>', methods=['GET'])
def generate_aadhaar_card(email):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Fetch user details
    c.execute("SELECT name, dob, gender, vid , last_digits FROM users WHERE email = ?", (email,))
    user = c.fetchone()

    if user:
        name, dob, gender, vid , last_digits= user
        template_path = os.path.join(ASSETS_DIR, "aadhaar_template.png")  # Set your template path

        # Generate PDF and image
        pdf_filename = generate_pdf(template_path, name, dob, gender, vid, email , last_digits)
        image_filename = pdf_filename.replace('.pdf', '.png')

        # Send the email with PDF and image
        email_status = send_masked_aadhaar_email(email, pdf_filename, image_filename)

        return jsonify({
            "message": "Aadhaar card generated and email sent successfully.",
            "pdf_download": f"/download-pdf/{email}",
            "image_download": f"/download-image/{email}"
        }), 200

    return jsonify({"error": "User not found."}), 404


def send_masked_aadhaar_email(email, pdf_path, image_path):
    # Extract filenames from paths
    pdf_filename = os.path.basename(pdf_path)  # e.g., aadhaar_card_email.pdf
    image_filename = os.path.basename(image_path)  # e.g., aadhaar_card_email.png
    logo_path = os.path.join(ASSETS_DIR, "logo-square-light.png")

    # Set up the MIME message with multipart content
    msg = MIMEMultipart('related')
    msg['Subject'] = 'Here is your masked Aadhaar'
    msg['From'] = 'omkarlakhutework1@gmail.com'
    msg['To'] = email

    # Include HTML with styling
    # HTML content with inline image
    html = f"""
    <html>
    <body>
        <p>Dear user,</p>
        <p>Please find your masked Aadhaar attached as a PDF document. Here’s a preview of your masked Aadhaar:</p>
        <img src="cid:masked_aadhaar_image" alt="Masked Aadhaar" style="width: 100%; max-width: 300px; height: auto;" />

        <!-- Four-line gap -->
        <div style="line-height: 1.5; height: 4em;"></div>

        <p style="font-style: italic; font-weight: bold; color: #333;">
            Best regards,<br>
            HashGuard Team
        </p>

        <!-- Company logo -->
        <img src="cid:company_logo" alt="Company Logo" style="width: 101px; height: auto; margin-top: 5px;" />
        <!-- Four-line gap -->
        <div style="line-height: 1.5; height: 4em;"></div>
    </body>
    </html>
    """
    msg.attach(MIMEText(html, 'html'))

    # Attach the image for inline display
    with open(image_path, 'rb') as img_file:
        img = MIMEImage(img_file.read(), _subtype="png")  # Ensure it's a PNG image
        img.add_header('Content-ID', '<masked_aadhaar_image>')  # Matches the "cid" in HTML
        img.add_header('Content-Disposition', 'inline', filename=image_filename)  # Use the image filename
        msg.attach(img)

    # Attach the PDF as an attachment
    with open(pdf_path, 'rb') as pdf_file:
        pdf = MIMEApplication(pdf_file.read(), _subtype="pdf")
        pdf.add_header('Content-Disposition', 'attachment', filename=pdf_filename)  # Use the PDF filename
        msg.attach(pdf)

    # Attach the company logo
    with open(logo_path, 'rb') as logo_file:
        logo = MIMEImage(logo_file.read(), _subtype="png")
        logo.add_header('Content-ID', '<company_logo>')
        logo.add_header('Content-Disposition', 'inline', filename='hashguard_logo.png')
        msg.attach(logo)

    # Send the email via SMTP
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('omkarlakhutework1@gmail.com', 'gecx rpts oddc sflv')
        server.send_message(msg)

    return jsonify({"message": "Masked Aadhaar email sent successfully."}), 200

# Helper function to generate PDF
def generate_pdf(template_path, name, dob, gender, vid, email , last_digits):
    pdf_filename = os.path.join(ASSETS_DIR, f"aadhaar_card_{email}.pdf")
    c = canvas.Canvas(pdf_filename, pagesize=(243.66, 153.56))
    c.drawImage(template_path, 0, 0, width=243.66, height=153.56)
    c.setFont("Helvetica", 7)

    c.drawString(99.173-18, 104.31 - 8.502 / 2.5, f"Name: {name}")     
    c.drawString(96.063-15, 90.799 - 8.502 / 1.5, f"DOB: {dob}") 
    c.drawString(104.330-23, 73.66 - 8.502 / 1.35, f"Gender: {gender}")  
    c.drawString(96.063-15, 59.401 - 8.502 / 1.40, f"VID: {vid}") 
    c.setFont("Helvetica-Bold", 9)
    c.drawString(138, 39.6, last_digits)
    c.save()

    # Convert the generated PDF to an image
    pdf_to_image(pdf_filename)

    return pdf_filename

# Helper function to convert PDF to image
def pdf_to_image(pdf_path, dpi=300):
    pdf_document = fitz.open(pdf_path)
    page = pdf_document[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72))
    image_filename = pdf_path.replace('.pdf', '.png')
    pix.save(image_filename)
    pdf_document.close()
    
@app.route('/verify-voice', methods=['POST'])
def verify_voice():
    if 'audio' not in request.files:
        return jsonify({'status': 'error', 'message': 'No audio file provided.'})

    audio_file = request.files['audio']

    # Save the uploaded file temporarily
    temp_audio_path = 'temp_audio.wav'
    audio_file.save(temp_audio_path)

    # Convert to WAV format if not already and normalize the audio
    audio = AudioSegment.from_file(temp_audio_path)
    normalized_audio = audio.normalize()
    normalized_audio.export(temp_audio_path, format='wav')

    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 150  # Adjusted for more sensitivity

    with sr.AudioFile(temp_audio_path) as source:
        audio_data = recognizer.record(source)

    try:
        # Recognize the audio
        recognized_text = recognizer.recognize_google(audio_data).strip().rstrip('.')  # Remove trailing period
        expected_phrase = "What is your name"
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

    
@app.route('/verify-captcha', methods=['POST'])
def verify_captcha():
    captcha_checked = request.json.get('captcha_checked', False)
    
    if captcha_checked:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': 'CAPTCHA verification failed!'})



if __name__ == '__main__':
    create_tables()
    print("Database tables created or verified.")
    app.run(debug=True)