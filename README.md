# VideoJukebox 🎥

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Touchscreen](https://img.shields.io/badge/Touchscreen-Ready-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

A modern touchscreen video application designed for kiosk systems, built with vanilla JavaScript and optimized for public displays. **Runs completely offline with zero dependencies!**

## 🌟 Features

- **Zero Dependencies**
  - Pure vanilla JavaScript
  - No installation required
  - Works completely offline
  - Just open and run!

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

### Running the Application

1. Simply open `index.html` in a modern web browser
2. That's it! No installation or setup required

### Recommended Browser Settings

For optimal kiosk experience:
- Use Chrome, Edge, or Brave in kiosk mode
- Enable fullscreen mode
- Disable browser navigation
- Set appropriate security policies

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

## 🛠️ Development (Optional)

For developers who want to modify the application, we provide some optional development tools:

### Development Tools (Optional)

If you want to modify the application, you can use these optional tools:
- Vite for development server
- ESLint for code linting
- Prettier for code formatting

To use these tools:
1. Install Node.js and npm (optional, only for development)
2. Run `npm install` to install development dependencies
3. Use `npm run dev` for development server
4. Use `npm run build` to create a production build

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
   --kiosk --app=file:///path/to/your/index.html --disable-pinch --overscroll-history-navigation=0
   ```

### Windows Auto-Start

1. Create a batch file (`start-kiosk.bat`):
   ```batch
   @echo off
   start chrome.exe --kiosk --app=file:///path/to/your/index.html --disable-pinch --overscroll-history-navigation=0
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

- Built with vanilla JavaScript
- Optional development tools:
  - [Vite](https://vitejs.dev/) for development
  - [Prettier](https://prettier.io/) for code formatting
  - [ESLint](https://eslint.org/) for code linting

## 📧 Contact

Arno Peck - [@arnopeck](https://twitter.com/arnopeck)

Project Link: [https://github.com/arnopeck/touchscreen-video-app](https://github.com/arnopeck/touchscreen-video-app)
