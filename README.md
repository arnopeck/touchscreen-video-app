# VideoJukebox 🎥

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-blueviolet)](https://vitejs.dev/)
[![Touchscreen](https://img.shields.io/badge/Touchscreen-Ready-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

A modern touchscreen video application designed for kiosk systems, built with vanilla JavaScript and optimized for public displays.

## 🌟 Features

- **Touch-Optimized Interface**
  - Full touchscreen support
  - Responsive design
  - Kiosk mode ready
  - Inactivity timeout management

- **Video Management**
  - Automatic video preloading
  - Error handling with retry mechanism
  - Fullscreen video playback
  - Loading states and user feedback

- **Content Organization**
  - Category-based navigation
  - Project listings
  - Author and institution attribution
  - Easy content management

- **Performance & Security**
  - No external dependencies
  - Optimized asset loading
  - Error recovery mechanisms
  - Kiosk-mode security features

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/touchscreen-video-app.git
   cd touchscreen-video-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
touchscreen-video-app/
├── index.html          # Main application entry point
├── css/               # Stylesheets
│   └── styles.css     # Main styles
├── js/                # JavaScript files
│   └── app.js         # Application logic
├── data/              # Data files
│   └── DB.js          # Content database
├── video/             # Video content
│   ├── archeologie/   # Category videos
│   ├── nature/        # Category videos
│   └── ai/           # Category videos
└── admin/             # Admin interface
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Adding New Content

1. Add video files to the appropriate category folder in `video/`
2. Update `data/DB.js` with new content:
   ```javascript
   {
     "id": "category_id",
     "nome_categoria": "Category Name",
     "descrizione_categoria": "Category Description",
     "progetti": [
       {
         "id": 1,
         "titolo": "Project Title",
         "sottotitolo": "Project Subtitle",
         "istituzioni": ["Institution 1", "Institution 2"],
         "autori": {
           "Institution 1": ["Author 1", "Author 2"],
           "Institution 2": ["Author 3"]
         },
         "file_video": "video/category_id/video.mp4"
       }
     ]
   }
   ```

## 📱 Kiosk Mode Setup

### Chrome Kiosk Mode

1. Create a shortcut to Chrome
2. Add these flags:
   ```
   --kiosk --app=http://localhost:5173 --disable-pinch --overscroll-history-navigation=0
   ```

### Windows Auto-Start

1. Create a batch file (`start-kiosk.bat`):
   ```batch
   @echo off
   start chrome.exe --kiosk --app=http://localhost:5173 --disable-pinch --overscroll-history-navigation=0
   ```

2. Add to Windows startup:
   - Press `Win + R`
   - Type `shell:startup`
   - Copy the batch file to the startup folder

## 🔒 Security Considerations

- The application runs in kiosk mode
- Inactivity timeout returns to home screen
- No external dependencies
- Content is served locally
- Touch events are sanitized

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Code formatting with [Prettier](https://prettier.io/)
- Linting with [ESLint](https://eslint.org/)

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/touchscreen-video-app](https://github.com/yourusername/touchscreen-video-app)
