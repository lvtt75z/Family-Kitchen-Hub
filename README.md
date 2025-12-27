# 🍳 Family Kitchen Hub

A comprehensive family kitchen management system that helps you manage ingredients, discover recipes, and utilize AI-powered features for meal planning and ingredient detection.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)

## 🎯 About

Family Kitchen Hub is a full-stack web application designed to help families manage their kitchen inventory, discover recipes based on available ingredients, and leverage AI capabilities for smart ingredient detection from bill images. The system includes an admin dashboard for managing recipes, ingredients, and user accounts.

## ✨ Features

- 🔐 User authentication and authorization
- 👥 Family member management
- 🧊 Fridge/inventory management
- 📝 Recipe browsing and management
- 🤖 AI-powered recipe recommendations
- 📸 AI-powered bill scanning for ingredient detection
- 💬 Recipe comments and ratings
- ⏰ Cooking reminders
- 📊 Admin dashboard with analytics
- 📧 Email notifications

## 🛠 Technologies

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Build Tool**: Gradle
- **Database**: MySQL
- **Key Dependencies**:
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Mail
  - JWT (JSON Web Tokens) for authentication
  - Lombok for boilerplate reduction
  - MapStruct for object mapping
  - Hibernate Validator

### Frontend (React + Vite)
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Language**: JavaScript (ES6+)
- **Key Dependencies**:
  - React Router DOM for routing
  - Axios for HTTP requests
  - Material-UI (MUI) for UI components
  - TanStack React Query for data fetching
  - Zustand for state management
  - Lucide React for icons
  - Lottie React for animations
  - React Toastify for notifications
  - Day.js for date handling

### AI Recommendation Service (Flask)
- **Framework**: Flask
- **Language**: Python
- **Key Dependencies**:
  - Flask for web framework
  - Flask-CORS for cross-origin resource sharing
  - Custom recommendation algorithms

### AI Detection Service (FastAPI)
- **Framework**: FastAPI
- **Language**: Python
- **Server**: Uvicorn
- **Key Dependencies**:
  - EasyOCR for optical character recognition
  - OpenCV for image processing
  - Pillow for image manipulation
  - NumPy for numerical operations
  - FuzzyWuzzy for fuzzy string matching
  - Python-Levenshtein for string similarity

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### For Backend:
- **Java Development Kit (JDK) 17 or higher**
  - Download from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or use [OpenJDK](https://adoptium.net/)
- **MySQL 8.0 or higher**
  - Download from [MySQL Community Downloads](https://dev.mysql.com/downloads/mysql/)
- **Gradle** (optional, as the project includes Gradle wrapper)

### For Frontend:
- **Node.js 18.x or higher**
  - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

### For AI Detection Service:
- **Python 3.8 or higher**
  - Download from [python.org](https://www.python.org/downloads/)
- **pip** (comes with Python)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ProjectT
```

### 2. Backend Setup (Spring Boot)

```bash
cd FamilyKitchenHub

# Create .env file (copy from example if available)
# Configure your database and other settings
```

Create a `.env` file in the `FamilyKitchenHub` directory with the following variables:

```env
DB_URL=jdbc:mysql://localhost:3306/family_kitchen_hub
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
```

### 3. Frontend Setup (React)

```bash
cd ../FamilyKitchenHub_fe

# Install all dependencies from package.json
# This will install: React, Vite, Axios, Material-UI, React Router, 
# Zustand, React Query, Lucide React, and other dependencies
npm install
```

> **Note**: All required libraries are listed in `package.json` and will be automatically installed. See the [Technologies](#technologies) section for the complete list of frontend dependencies.

### 4. AI Recommendation Service Setup (Flask)

```bash
cd "../Recommended dishes"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors
```

### 5. AI Detection Service Setup (FastAPI)

```bash
cd ../ai_detection_service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `ai_detection_service` directory:

```env
PORT=5002
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173
GPU_ENABLED=false
MAX_IMAGE_SIZE=10485760
```

## ⚙️ Configuration

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE familyKitchenHub;
```

2. The application will automatically create tables on first run using Spring Data JPA.

### Backend Configuration (Spring Boot)

Create a `.env` file in the `FamilyKitchenHub` directory:

```env
# Database Configuration
DB_URL=jdbc:mysql://127.0.0.1:3306/familyKitchenHub
DB_USER=root
DB_PASSWORD=your_mysql_password

# JPA/Hibernate Configuration
DDL_AUTO=update
SHOW_SQL=true
FORMAT_SQL=true

# JWT Configuration
JWT_SECRET=YourSuperSecretJWTKeyThatShouldBeAtLeast256BitsLongForHS256Algorithm
JWT_EXPIRATION=86400000

# Email Configuration (Gmail)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Media Storage
MEDIA_STORAGE_DIR=uploads
MEDIA_BASE_URL=/media

# AI Services
AI_RECOMMENDATION_SERVICE_URL=http://localhost:5001/recommend
AI_DETECTION_SERVICE_URL=http://localhost:5002

# Server Port
PORT=8080
```

The `application.properties` file (located in `src/main/resources/`) is already configured to use these environment variables:

```properties
spring.application.name=FamilyKitchenHub

# MySQL Datasource Configuration
spring.datasource.url=${DB_URL:jdbc:mysql://127.0.0.1:3306/familyKitchenHub}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:}

# Hibernate (JPA) Configuration
spring.jpa.hibernate.ddl-auto=${DDL_AUTO:update}
spring.jpa.show-sql=${SHOW_SQL:true}
spring.jpa.properties.hibernate.format_sql=${FORMAT_SQL:true}

# JWT Configuration
jwt.secret=${JWT_SECRET:YourSuperSecretJWTKeyThatShouldBeAtLeast256BitsLongForHS256Algorithm}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Email Configuration (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Media storage
app.media.storage-dir=${MEDIA_STORAGE_DIR:uploads}
app.media.base-url=${MEDIA_BASE_URL:/media}

# Multipart file upload configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.file-size-threshold=2KB

# AI Services Configuration
ai.recommendation.service.url=${AI_RECOMMENDATION_SERVICE_URL:http://localhost:5001/recommend}
ai.detection.service.url=${AI_DETECTION_SERVICE_URL:http://localhost:5002}

# Server port
server.port=${PORT:8080}
```

### Frontend Configuration (React)

Create a `.env` or `.env.local` file in the `FamilyKitchenHub_fe` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AI_API_URL=http://localhost:5001
```

### AI Recommendation Service Configuration (Flask)

Create a `.env` file in the `Recommended dishes` directory:

```env
FLASK_ENV=development
PORT=5001
```

The Flask service includes these key imports:
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
```

### AI Detection Service Configuration (FastAPI)

Create a `.env` file in the `ai_detection_service` directory:

```env
PORT=5002
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173
GPU_ENABLED=false
MAX_IMAGE_SIZE=10485760
```

The FastAPI service includes these key imports:
```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict
import os
from dotenv import load_dotenv
from bill_detector import BillDetector
```

Required Python packages (in `requirements.txt`):
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
easyocr>=1.7.0
opencv-python>=4.8.0
Pillow>=10.0.0
numpy>=2.0.0
python-multipart>=0.0.6
fuzzywuzzy>=0.18.0
python-Levenshtein>=0.21.0
```

### Email Configuration Notes

For email notifications to work:
- Use Gmail SMTP with an **App Password** (not your regular password)
- Enable 2-factor authentication on your Google account
- Generate an App Password from [Google Account Settings](https://myaccount.google.com/apppasswords)
- The App Password format is like: `abcd efgh ijkl mnop` (16 characters with spaces)

## 🏃 Running the Application

### Option 1: Run All Services at Once

The project includes startup scripts that will run all four services simultaneously.

**Windows:**
```bash
# From the ProjectT root directory
start-all.bat
```

**macOS/Linux:**
```bash
# From the ProjectT root directory
chmod +x start-all.sh
./start-all.sh
```

This will start:
- Backend (Spring Boot) on `http://localhost:8080`
- Frontend (React) on `http://localhost:5173`
- AI Recommendation Service (Flask) on `http://localhost:5001`
- AI Detection Service (FastAPI) on `http://localhost:5002`

### Option 2: Run Services Individually

**1. Backend (Spring Boot):**
```bash
cd FamilyKitchenHub
# Windows:
gradlew.bat bootRun
# macOS/Linux:
./gradlew bootRun
```
The backend will run on `http://localhost:8080`

**2. Frontend (React):**
```bash
cd FamilyKitchenHub_fe
npm run dev
```
The frontend will run on `http://localhost:5173`

**3. AI Recommendation Service (Flask):**
```bash
cd "Recommended dishes"
# Activate virtual environment first
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Run the service
python main.py
```
The AI recommendation service will run on `http://localhost:5001`

**4. AI Detection Service (FastAPI):**
```bash
cd ai_detection_service
# Activate virtual environment first
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Run the service
python main.py
```
The AI detection service will run on `http://localhost:5002`

## 📁 Project Structure

```
ProjectT/
├── FamilyKitchenHub/              # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/              # Java source code
│   │   │   └── resources/         # Configuration files
│   │   │       └── application.properties
│   │   └── test/                  # Test files
│   ├── build.gradle               # Gradle build configuration
│   └── .env                       # Environment variables
│
├── FamilyKitchenHub_fe/           # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API services
│   │   └── App.jsx                # Main app component
│   ├── package.json               # NPM dependencies
│   ├── vite.config.js             # Vite configuration
│   └── .env                       # Environment variables
│
├── Recommended dishes/            # Flask AI recommendation service
│   ├── main.py                    # Main Flask application
│   ├── venv/                      # Python virtual environment
│   └── .env                       # Environment variables
│
├── ai_detection_service/          # FastAPI AI detection service
│   ├── main.py                    # Main FastAPI application
│   ├── bill_detector.py           # Bill detection logic
│   ├── requirements.txt           # Python dependencies
│   ├── venv/                      # Python virtual environment
│   └── .env                       # Environment variables
│
├── start-all.bat                  # Windows startup script
├── start-all.sh                   # Unix startup script
└── README.md                      # This file
```

## 🔧 Development

### Build for Production

**Backend:**
```bash
cd FamilyKitchenHub
gradlew build
```

**Frontend:**
```bash
cd FamilyKitchenHub_fe
npm run build
```

### Linting

**Frontend:**
```bash
cd FamilyKitchenHub_fe
npm run lint
```

## 📝 Additional Documentation

- [Bill Scanner Guide](BILL_SCANNER_GUIDE.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Quick Start](QUICKSTART.md)
- [Technical Details](TECHNICAL_DETAILS.md)
- [ML Models Info](ML_MODELS_INFO.md)

## 🤝 Contributing

This is a private project developed for family kitchen management. If you have suggestions or find issues, please create an issue in the repository.

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Spring Boot community
- React community
- FastAPI community
- All open-source library contributors
