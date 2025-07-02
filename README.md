# Dungeon-Dorm

*Embark on a Dungeons & Dragons-inspired journey across campus!*

## 📜 Overview

**Dungeons and Dormitories** is a location-based adventure game that transforms the UCF campus into a living, breathing D&D map. Players follow a main questline—visiting real campus landmarks, battling NPCs, collecting loot, and leveling up their characters.

Inspired by **Pokémon GO**, Dungeons and Dormitories uses your GPS location to trigger in-game events and battles. The game is available both on **web** and **mobile**, with a consistent experience powered by a **MERN stack backend**, a **React web frontend**, and a **Flutter mobile app**.

---

## 🧙‍♂️ Gameplay

- 🌍 Real-World Map Integration: Roam your actual campus to explore dungeons and discover quest locations.
- 🏰 Quest System: Follow the main quest that guide you to different campus landmarks.
- ⚔️ Turn-Based Battles: Defeat enemy characters using classic D&D-inspired abilities.
- 🎒 Loot & Level Up: Earn items, gold, and XP to grow your character and unlock new gear.

---

## 💻 Tech Stack

| Layer         | Technology              |
|---------------|--------------------------|
| **Frontend**  | React (Web)              |
| **Mobile**    | Flutter                  |
| **Backend**   | Node.js, Express.js      |
| **Database**  | MongoDB                  |
| **Authentication** | TBD      |
| **Location Services** | TDB |
| **Hosting**   | TBD |

---

## 🚀 Getting Started

### Backend Setup

```bash
npm install
npm run dev
---

### Web Frontend (React)

```bash
cd frontend
npm install
npm start
```

The React app will run at `http://localhost:3000`.

---

### Mobile Frontend (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

Ensure a physical device or emulator is running.

---

## 📂 Project Structure

```
/api       → Express server & MongoDB schemas
/frontend      → React web app
/mobile        → Flutter mobile app
```

---

## 🔐 Authentication

- Register/login via email
- Users have player profiles saved in MongoDB

---

## 🧭 Credits

- Designed and developed by Team 21
- Inspired by Pokémon GO, Dungeons & Dragons, and university campus life
