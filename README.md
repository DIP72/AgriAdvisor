# 🌾 AgriAdvisor

### Deterministic Crop Intelligence & Farmer Support Ecosystem
*"Moving from guesswork to data-driven decisions — built for the Indian farmer."*

---

## 🔍 The Problem Statement
Agriculture in Maharashtra faces a **"Knowledge-Action Gap."** Farmers often have the hard work ethic but lack localized data on which crops will actually thrive based on current weather, soil chemistry, and irrigation limits.

**AgriAdvisor** bridges this gap using a transparent comparison engine that mirrors the logic used by the IMD and KVK advisory systems, now featuring persistent community support.

---

## 💡 The "Transparent" Innovation
Unlike complex ML models, AgriAdvisor uses a **Rule-Based Expert System**. This ensures that every recommendation is traceable, explainable, and grounded in the official agricultural benchmarks of Maharashtra.

### 1. Hard/Soft Flag Logic
* **Hard Filters:** Instantly eliminates crops that cannot survive the current season or soil type.
* **Soft Flags:** A color-coded scoring system (Green/Yellow/Red) based on:
    * **Weather Integration:** Live data from OpenWeatherMap API.
    * **Risk Assessment:** Humidity + Temperature thresholds to predict fungal/bacterial risks.

### 2. Persistent Support via MongoDB
We have integrated **MongoDB** to handle persistent data storage. This allows the platform to:
* **Track Community Chats:** Store and retrieve discussions between farmers and experts.
* **History Logging:** Maintain a record of previous recommendations so farmers can track their decision-making over time.

---

## ⚙️ Technical Implementation

### The Tech Stack
* **Frontend:** React.js (Component-based architecture)
* **Styling:** Custom CSS (Modular and responsive design)
* **Animations:** Framer Motion (For smooth UI transitions)
* **Database:** MongoDB (Chat history and user data persistence)
* **Backend:** Node.js / Express.js (API handling and database orchestration)
* **Real-time:** Socket.io (Live community chat updates)
* **Data Layer:** Static JSON Dataset (`maharashtra_full_crop_dataset_15.json`)
* **External APIs:** OpenWeatherMap API for live atmospheric data.



### Project Structure
```plaintext
src/
├── components/       # Reusable UI elements (Weather Cards, Forms)
├── pages/            # Dashboard, Recommendations, Community Chat
├── data/             # maharashtra_full_crop_dataset_15.json
├── assets/           # Crop images and icons
├── App.js            # Routing and core logic
└── index.css         # Global styling
