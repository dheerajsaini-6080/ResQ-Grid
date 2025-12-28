import sqlite3
import datetime
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# 📂 CONFIGURATION
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 🗄️ DATABASE SETUP (Upgraded Schema)
def init_db():
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    # Create table with new columns for MAP and PHOTO
    c.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            description TEXT,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            severity TEXT,
            image_url TEXT,
            status TEXT DEFAULT 'Unverified',
            timestamp TEXT,
            upvotes INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- ROUTES ---

@app.route('/')
def home():
    return "ResQ Connect Backend (v2.0) is Live! 🚑"

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    conn = sqlite3.connect('incidents.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()
    c.execute("SELECT * FROM incidents ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# 📸 SERVE IMAGES
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 📢 REPORT INCIDENT (Now handles Files + Coords)
@app.route('/api/report', methods=['POST'])
def report_incident():
    # Handle Text Data
    type_val = request.form.get('type')
    location = request.form.get('location')
    lat = request.form.get('latitude')
    lng = request.form.get('longitude')
    description = request.form.get('description')
    severity = request.form.get('severity')
    
    # Handle Image Upload
    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            filename = secure_filename(f"{datetime.datetime.now().timestamp()}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_filename = filename

    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO incidents (type, description, location, latitude, longitude, severity, image_url, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        type_val, description, location, lat, lng, severity, image_filename,
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Incident Reported!"})

@app.route('/api/verify/<int:id>', methods=['POST'])
def verify_incident(id):
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    c.execute("UPDATE incidents SET status = 'Verified' WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Verified!"})

if __name__ == '__main__':
    app.run(debug=True, port=5005)