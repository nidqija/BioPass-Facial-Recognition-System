# 🧬 BioPass - Facial Recognition & Event Ticketing Verification System

**BioPass** is a modern, real-time facial recognition and biometric event management system. It provides end-to-end event ticketing, customer registration with facial portrait enrollment, secure multi-factor administrator authentication, and live video stream biometric entry verification at event kiosks.

---

## 🌟 Key Features

- 🎥 **Live Biometric Verification Kiosk**
  - Real-time webcam streaming video verification powered by **OpenCV**, **DeepFace**, and **YOLOv11**.
  - Dynamic facial recognition against reference images stored in S3 buckets.
  - Real-time Server-Sent Events (SSE) broadcasting match results directly to the live verification interface.

- 🛡️ **Secure Admin Portal & MFA Authentication**
  - Administrator dashboard for managing event listings, customer registrations, and live stream monitors.
  - Multi-Factor Authentication (MFA) using timed 6-digit OTP codes dispatched via **Mailpit** (SMTP) and secured with **JWT** tokens.

- 🎟️ **Customer Registration & Ticketing**
  - Customer event portal for browsing upcoming events, entering registration credentials, uploading proof of payment, and enrolling facial biometric images.

- ☁️ **Local AWS Infrastructure Emulation**
  - Integrates **Floci** (LocalStack compatible container) for offline S3 object storage and DynamoDB NoSQL database capabilities.
  - Embedded **DynamoDB Admin GUI** for inspecting tables and items in real time.

- 🚀 **One-Command Orchestration**
  - Automated PowerShell environment manager (`run.ps1`) for spinning up Docker containers, React frontend, and FastAPI backend servers in separate managed windows.

---

## 🏗️ Tech Stack

### **Frontend (`/client`)**
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Base UI
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

### **Backend (`/server`)**
- **Framework**: Python FastAPI + Uvicorn
- **AI & Computer Vision**: OpenCV (`cv2`), DeepFace, Ultralytics YOLO (`yolo11n.pt`)
- **Cloud Integration**: Boto3 (AWS SDK for Python)
- **Security & Auth**: PyJWT, OTP Hashing, SMTPLib
- **Real-Time Data**: Asyncio Queues, Server-Sent Events (SSE), Streaming Multi-part Responses

### **Infrastructure & Local Services**
- **Docker Compose**: Service orchestration
- **Floci**: AWS S3 & DynamoDB local emulator (Port `4566`)
- **DynamoDB Admin**: Visual database dashboard (Port `8001`)
- **Mailpit**: Developer SMTP server & Web Email Inspector (Ports `1025` / `8025`)

---

## 📂 Project Structure

```text
biopass_facial_system/
├── client/                     # React 19 Frontend Application
│   ├── src/
│   │   ├── app/                # Feature Modules (Admin, Customer, Kiosk, Manage Events)
│   │   ├── components/         # UI Components & Controls
│   │   └── lib/                # Shared utilities
│   ├── package.json
│   └── vite.config.ts
├── server/                     # FastAPI Backend & AI Engine
│   ├── floci_backend/          # S3 & DynamoDB configuration & seed scripts
│   ├── mailpit/                # Email OTP & authentication logic
│   ├── server_side_events/     # SSE streaming event handlers
│   ├── yolo/                   # YOLO & DeepFace facial detection engine
│   ├── docker-compose.yml      # Local services (Floci, DynamoDB GUI, Mailpit)
│   ├── main.py                 # FastAPI application routes & endpoints
│   └── yolo11n.pt              # YOLO model weights
├── run.ps1                     # Master script to start/stop the entire stack
├── dockerbuild.ps1              # Helper script to build/launch Docker containers
├── LICENSE                     # MIT License
└── README.md                   # System documentation
```

---

## 🔌 Default Ports & Services

| Service | Protocol / Interface | URL / Port |
| :--- | :--- | :--- |
| **React Frontend** | Web Interface | `http://localhost:5173` |
| **FastAPI Backend** | REST API & SSE | `http://127.0.0.1:8000` |
| **Floci (S3 & DynamoDB)** | AWS Local Endpoint | `http://localhost:4566` |
| **DynamoDB Admin GUI** | Web Dashboard | `http://localhost:8001` |
| **Mailpit Web UI** | Email GUI Inspector | `http://localhost:8025` |
| **Mailpit SMTP** | Mail Server | `localhost:1025` |

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
- **Docker Desktop** (running)
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher)
- **PowerShell** (for Windows automated script execution)

---

## 🚀 Quick Start

### 1. Clone & Prepare Environment

Ensure your Python virtual environment is set up under `server/.venv`:

```powershell
# Navigate to server folder
cd server

# Create virtual environment if not already created
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install fastapi uvicorn boto3 pyjwt deepface opencv-python ultralytics pillow
```

Install frontend dependencies:

```powershell
# Navigate to client folder
cd ../client
npm install
```

### 2. Launch the Entire System

Run the main PowerShell orchestration script from the root directory:

```powershell
.\run.ps1
```

This command automatically:
1. Starts the Docker containers (`Floci`, `DynamoDB GUI`, `Mailpit`).
2. Launches the React Frontend on `http://localhost:5173`.
3. Activates the Python environment and starts FastAPI backend server on `http://127.0.0.1:8000`.

### 3. Stop All Running Services

To gracefully stop all services, release ports (`5173`, `8000`), and close open terminal windows:

```powershell
.\run.ps1 -Stop
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](file:///c:/Users/User/Documents/Raziq_Projects/biopass_facial_system/LICENSE) file for details.
