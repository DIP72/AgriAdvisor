# CropAdvisor: Maharashtra Edition 🌾

**A Smart, Data-Driven Crop Recommendation Engine for Farmers.**

CropAdvisor is a specialized advisory tool designed to help farmers in Maharashtra make informed planting decisions. By moving away from "black-box" models, we provide a transparent, rule-based recommendation system that aligns with official government advisory logic (IMD/KVK).

---

## 🌍 The Mission
To empower the agricultural backbone of Maharashtra by turning complex climate and soil data into simple, actionable insights. We bridge the gap between high-level meteorological data and the everyday farmer.

## ✨ Core Features

### 🧠 The "Logic" Engine
Unlike standard ML models, our system uses a **Transparent Rule Engine** to ensure 100% explainability:
* **Hard Filters:** Eliminates crops that mismatch non-negotiable factors like Season and Soil Type.
* **Soft Scoring:** A "Flag System" (Green/Yellow/Red) evaluates irrigation, temperature, and humidity.
* **Risk Assessment:** Live tracking of fungal or bacterial risks based on real-time humidity and waterlogging potential.
* **Justified Ranking:** Crops are sorted by "Green Flags" with a clear *"Why this crop?"* breakdown.

### 📱 Smart Functionality
* **Onboarding:** GPS-based location tracking and automated weather data fetching.
* **Live Dashboard:** Real-time weather cards, seasonal badges, and risk alerts.
* **Accessibility:** Integrated **Voice-over support (Marathi/English)** and offline-first capabilities for rural connectivity.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (v18+), Tailwind CSS, Framer Motion
* **State Management:** React Router, Context API (Language & Farm State)
* **Data:** JSON-based Master Dataset (`maharashtra_full_crop_dataset_15.json`)
* **APIs:** OpenWeatherMap (Current & 5-day Forecast), IMD MAUSAM (Integration)
* **Next Phase:** Full MERN Stack (Node.js, Express, MongoDB, Socket.io)


## 🚀 Getting Started

### Prerequisites
* Node.js (v16+)
* OpenWeatherMap API Key

### Installation
```bash
# Clone the repository
git clone [https://github.com/your-username/crop-advisor.git](https://github.com/your-username/crop-advisor.git)

# Install dependencies
npm install

# Set up environment variables
echo "VITE_WEATHER_API_KEY=your_key_here" > .env

# Launch the dashboard
npm start
