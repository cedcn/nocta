# Nocta 🌙

**Sleep Sounds App — an Expo / React Native port of [XMSLEEP](https://github.com/Tosencen/XMSLEEP)**

## 🔄 XMSLEEP sync baseline

| | Commit | Version | Date |
|---|---|---|---|
| Current baseline | `ad39be2` | v2.3.3 | 2026-09-08 |
| Previous baseline | `c9c6d9b` | v2.2.1 | 2026-03-13 |

To see what changed upstream since the last sync: `git -C ../XMSLEEP log ad39be2..HEAD`.

Not ported (by choice): Bilibili radio, local audio library, sound diary, daily-quote upgrade (Bing image / history), custom backgrounds, simple mode, monochrome theme, and Android-only features (widgets, Firebase, in-app updater, MediaSession notifications).

## ✨ Features

### 🎵 Sounds
- **113 white-noise sounds** in 8 categories. The manifest is fetched from jsDelivr (raw GitHub as fallback) on launch and cached, with a bundled copy as the offline fallback.
- **Multi-sound mixing** with per-sound volume, which is saved between sessions.
- **Dynamic presets**: 3–10 presets, each holding up to 10 sounds. You can create, rename and delete them.
- **Sleep timer** (15/30/45/60/120 min) that fades the sound out over 5 s. It is based on absolute time, so it stays accurate in the background.
- **Auto countdown**: optionally starts the timer whenever a preset is played.

### 🌬️ Breathing & meditation
- Four guided breathing methods (4-7-8, box, belly, 4-2-6) with an animated guide and inhale/exhale cues.
- 40 guided meditation sessions in 4 categories, streamed from Bilibili.

### 🍅 Focus
- **Pomodoro timer**: focus and break phases, a ringtone and vibration when a phase ends, and a count of today's completed sessions. It keeps running in the background and sends a notification.
- **Big Clock**: a full-screen flip clock that keeps the screen awake, with two fonts, 12/24 h and landscape support.

### 🌦️ Weather recommendations
- Current weather comes from Open-Meteo by default, or QWeather with your own key. It uses approximate location, and 20 animated Meteocons icons.
- Recommends sound mixes based on weather and time of day.

### 🌐 Languages
- 简体中文, 繁體中文, English, 한국어, 日本語 and Русский. It can follow the system language.

## 📱 Screens

1. **Home**: categories, featured sound, weather card, Pomodoro entry
2. **Mixer**: timer, presets, mixing
3. **Breathe**: breathing methods and meditation (can be hidden in Settings)
4. **Quotes**: daily quote
5. **Settings**: auto countdown, tab visibility, Big Clock, weather, language, web player

## 🛠️ Tech Stack

- Expo ~55 / React Native 0.83 / TypeScript
- expo-audio, React Navigation 7, AsyncStorage
- i18next + expo-localization, expo-location, expo-secure-store, lottie-react-native, expo-notifications

## 🚀 Quick Start

```bash
pnpm install
npm run prebuild   # native modules changed, regenerate ios/ and android/
npm run ios        # or: npm run android
```

## 📄 License

MIT License. Based on the XMSLEEP project. Weather icons are [Meteocons](https://github.com/basmilius/meteocons) by Bas Milius (MIT).
