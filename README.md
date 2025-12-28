# 🚑 ResQ Grid: Intelligent Incident Command Platform

> **"Seconds Save Lives."**
> A geo-spatial Emergency Response System featuring algorithmic severity inference, real-time heartbeat monitoring, and bi-directional geocoding.

![ResQ Grid Banner](https://via.placeholder.com/1200x400?text=ResQ+Grid+Dashboard+Preview)
*(Note: Replace this link with a real screenshot of your dashboard after uploading)*

## 💡 The Core Innovation
Current emergency reporting is manual and slow. **ResQ Grid** automates the critical first 60 seconds of an incident:

1.  **📍 Bi-Directional Geocoding:** Instantly converts "Main Street" to GPS coordinates (and vice versa) using OpenStreetMap Nominatim.
2.  **🧠 Algorithmic Triage:** The system automatically escalates severity based on incident type (e.g., *Fire* → *High Severity*), removing human error during panic.
3.  **💓 System Reliability:** Includes a 'Heartbeat Protocol' that continuously monitors server health, ensuring 100% uptime visibility for command centers.

## 🛠️ Engineering Architecture



* **Frontend (The Brain):** React.js + Leaflet Maps + Tailwind CSS. Handles logic (Auto-severity, GPS lock) to reduce server load.
* **Backend (The Heart):** Python Flask (REST API) + SQLite. Acts as a secure gateway, sanitizing inputs and managing persistence.
* **Intelligence:** Leverages OpenStreetMap (OSM) APIs for global location intelligence without massive data overhead.
* **UI/UX:** Glassmorphism design system with a mobile-first "Thumb Zone" navigation architecture.

## 🚀 Key Features
* **One-Tap GPS Lock:** Acquires user location via browser Geolocation API with high accuracy.
* **Evidence Chain:** Secure image uploading linked to specific geo-coordinates.
* **Live Command Feed:** Auto-polling dashboard updates every 2 seconds without page refreshes.
* **Verification Workflow:** Admin tools to validate and flag incidents as "Confirmed" using a human-in-the-loop approach.
* **Smart Map Markers:** Emoji-coded markers (🔥, 🚑, 🚓) for instant visual recognition of threat types.

## ⚡ Quick Start

### Prerequisites
* Node.js & npm
* Python 3.x

### 1. Backend Setup (The API)
Navigate to the backend folder, install dependencies, and start the server.

```bash
cd backend
pip install -r requirements.txt
python server.py