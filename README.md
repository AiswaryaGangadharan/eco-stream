# 🌿 Eco-Stream

Eco-Stream is a high-fidelity, modern video streaming platform designed for both desktop and mobile excellence. It features a unified video player with advanced gesture controls, a dynamic atmospheric background, and a premium Glassmorphic UI.

---

## 🚀 Features

### 🎬 Advanced Video Player
- **Unified Experience**: Seamless transitions between full-screen and mini-player (PiP) modes.
- **Cinema Mode**: Dynamic background colors based on the video's dominant palette.
- **High-Fidelity Controls**: Custom progress bar with buffer visualization, thumbnail scrubbing, and segment highlights.

### 📱 Mobile Excellence
- **Intelligent Gestures**: 
  - **Swipe Down**: Minimize player.
  - **Double-Tap (Left/Right)**: Seek +/- 10 seconds.
  - **Vertical Swipe (Left)**: Adjust volume.
- **Landscape Support**: Native fullscreen API integration with orientation locking for cinematic viewing.
- **Autoplay Compliance**: Muted initial playback and manual "Play" fallbacks for a smooth mobile experience.

### 🎨 Design & Aesthetics
- **Dynamic Background**: Animated mesh-gradient auroras with cinematic grain and sub-surface scattering.
- **Glassmorphic UI**: High-fidelity blurs, subtle gradients, and elegant micro-animations using `framer-motion`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [React Context API](https://react.dev/reference/react/useContext)

---

## 📥 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/AiswaryaGangadharan/eco-stream.git
cd eco-stream
npm install
```

### 3. Development
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app locally.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📱 Mobile Testing

To test the application on your mobile device over the local network:

1. Ensure your phone and development machine are on the **same Wi-Fi network**.
2. Run the dev server with network access:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Find your local IP address (e.g., `192.168.1.6`).
4. On your mobile browser, navigate to `http://YOUR_IP:3000`.

*Note: HMR (Hot Module Replacement) is enabled for local network testing in `next.config.ts`.*

---

## 📂 Project Structure

- `/app`: Next.js App Router (pages and layouts)
- `/src/components`: UI, Video, and Player components
- `/src/context`: Global video player state
- `/src/hooks`: Custom hooks (dominant color, playback memory)
- `/data`: Mocked video data and metadata
