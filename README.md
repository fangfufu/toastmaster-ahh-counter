# Toastmasters Ah Counter PWA

**[Live Demo](https://fangfufu.github.io/toastmaster-ahh-counter/)**

A Progressive Web App (PWA) built specifically for Toastmasters meetings. This tool helps the "Ah Counter" track filler words and repetitive phrases used by speakers, offering an intuitive, mobile-friendly interface that works entirely offline.

## Features

- **Dynamic Counters**: Large, tap-friendly buttons to count 9 common filler words ("Ah", "Um", "Er", "Well", "So", "Like", "But", "Repeats", "Other").
- **Long Press to Decrement**: Made a mistake? Press and hold any counter for 600ms to reduce the count, accompanied by distinct haptic feedback.
- **Speaker Roles**: Assign specific Toastmasters roles (e.g., Prepared Speech, Table Topics) to each tracked speaker.
- **Session History**: Automatically saves speaker records, displaying their total filler count and detailed breakdown. 
- **Sorting**: Toggle sorting in the session history to instantly see which speaker made the most mistakes, and which filler word they used most frequently.
- **Summary Reports**: Generate a quick popup report detailing the overall session statistics, perfect for reading at the end of the meeting.
- **Import / Export**: Save your session data as a JSON template or import a previous session to review.
- **Three Themes**: Choose between Dark Theme, Light Theme, or the official Toastmasters International color palette.
- **100% Offline Capable**: Built as a PWA with a Service Worker, allowing the app to be installed to your home screen and used without an internet connection.

## How to Install (PWA)

Because this is a Progressive Web App, you can install it directly to your device for a native-like, fullscreen experience:

### iOS (iPhone / iPad)
1. Open the [Live Demo](https://fangfufu.github.io/toastmaster-ahh-counter/) in **Safari**.
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right.

### Android
1. Open the [Live Demo](https://fangfufu.github.io/toastmaster-ahh-counter/) in **Chrome**.
2. You may see a prompt at the bottom of the screen to "Add Ah Counter to Home screen". Tap it if it appears.
3. Otherwise, tap the **three-dot menu** icon in the top right corner.
4. Tap **Install app** or **Add to Home screen**.

### Desktop (Chrome / Edge)
1. Open the [Live Demo](https://fangfufu.github.io/toastmaster-ahh-counter/) in Google Chrome or Microsoft Edge.
2. Look for the **Install icon** (a monitor with a downward arrow, or a `+` sign) on the right side of the URL address bar.
3. Click the icon and select **Install**.
4. The app will open in its own window and can be launched directly from your computer's taskbar or application menu.

## How to Run Locally

Since this app uses Vanilla HTML, CSS, and JS, no build step is required!

1. Clone the repository:
   ```bash
   git clone https://github.com/fangfufu/toastmaster-ahh-counter.git
   cd toastmaster-ahh-counter
   ```
2. Serve the directory using any static web server. For example, using Python:
   ```bash
   python3 -m http.server 43425
   ```
3. Open `http://localhost:43425` in your browser.

## Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`) designed to automatically deploy the app to GitHub Pages.

To deploy:
1. Push your code to the `main` or `master` branch of your GitHub repository.
2. Go to your repository settings -> **Pages**.
3. Ensure the source is set to **GitHub Actions**.
4. The workflow will automatically build and deploy your site. You can monitor the progress in the **Actions** tab.

## Technologies Used

- Vanilla HTML5
- Vanilla CSS3 (with CSS Variables & CSS Grid)
- Vanilla JavaScript (ES6+)
- Service Workers & Web Manifest for PWA capabilities
