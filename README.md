# GEO LEARNER

`GEO LEARNER` is a learning-oriented web application for exploring how Earth appears when observed from different bodies in the Solar System.

The app is intended for junior-high and high-school earth science learners, as well as users interested in comparing planetary viewpoints. It is designed to be published as a static client-side application on GitHub Pages.

## Overview

The application allows users to switch the observation viewpoint and inspect the following at the same time:

- Earth's phase
- Distance from the selected viewpoint to Earth
- Apparent angular size of Earth
- Solar elongation, meaning how far Earth appears from the Sun
- The observational differences caused by viewing Earth from an inner orbit or an outer orbit

The `Learning Module` panel provides explanatory guidance and a short quiz based on the current simulation state.

## Features

- Viewpoint switching
  - Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus, Neptune
- 3D simulation display
  - Simplified Solar System layout rendered in 3D
  - Visual relationship between the selected body and Earth
- Earth inset display
  - Enlarged phase view of Earth shown at the top of the learning panel
  - The lit side faces the actual direction of the Sun, with an illumination gauge and metric tiles
- Observation log
  - Tracks which viewpoints have been observed and which quizzes have been cleared (stored locally)
  - Quiz options are shuffled on each request; a viewpoint counts as cleared only if its quiz is answered correctly with no wrong answer there earlier in the same visit
  - Small toast notifications for first observations and cleared quizzes
- First-visit guide
  - A dismissible three-step guide (choose a viewpoint, move through time, check with a quiz)
- Learning panel
  - Context-sensitive explanation of the current state
  - Observation prompts
  - Viewpoint-specific quiz
- Time controls
  - Play and pause (also with the Space key, unless a control was reached with the keyboard)
  - Multiple playback speeds
  - Timeline scrubber with year ticks
- Interface options
  - Default Japanese UI with an English toggle
  - Light mode and dark mode switching
  - Show and hide controls for the left and right side panels (desktop)
  - Full orbit overview mode to zoom out and see the entire Solar System
  - Responsive layout: fixed-height console on wide screens, stacked layout with a horizontal viewpoint strip on phones
  - Respects `prefers-reduced-motion`
  - Custom SVG favicon for the published site

## Technology Stack

- React 18
- Vite
- Three.js
- React Three Fiber
- drei
- CSS

The current implementation does not use a backend API or database. Language and theme preferences and the observation log are stored locally in the browser.

## Program Specification

### Simulation Model

This application uses a simplified orbital model intended for educational use.

- Planetary motion is approximated with near-circular, prograde orbits (counter-clockwise seen from ecliptic north, +y)
- Orbital radius and orbital period are represented with fixed learning-oriented values
- The Moon is modeled as a simplified circular orbit around Earth at a constant distance (about 384,000 km), tilted about 5.1° from the ecliptic
- Displayed distances and body sizes are visually compressed for readability in the 3D view

### Calculated Values

The application calculates the following values from the simplified model.

- Approximate position vectors of each body
- Distance from the selected viewpoint to Earth
- Apparent angular diameter of Earth
- Phase angle and illuminated fraction of Earth
- Apparent elongation between the Sun and Earth
- Whether the selected viewpoint is inside or outside Earth's orbit

### Learning Guidance

The `Learning Module` produces the following based on the current simulation state.

- A summary of the current observation
- Explanations related to phase, distance, and elongation
- A prompt encouraging the user to continue observing the simulation
- A short quiz adapted to the current viewpoint

### Constraints and Scope

This repository is public-facing, so the scope of the simulator should be stated clearly.

- This application is an educational approximation, not a high-precision ephemeris tool
- Real observational conditions, atmospheric effects, optical systems, and strict orbital elements are not modeled
- The visualization is intentionally adjusted for clarity and comparison

## Project Structure

```text
GEO-LEARNER/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AppHeader.jsx
│   │   ├── EarthInset.jsx
│   │   ├── Icons.jsx
│   │   ├── LearningModule.jsx
│   │   ├── SimulationCanvas.jsx
│   │   ├── SimulationControls.jsx
│   │   └── ViewpointSelector.jsx
│   ├── data/
│   │   └── celestialBodies.js
│   ├── lib/
│   │   ├── i18n.js
│   │   ├── orbitalMath.js
│   │   ├── storage.js
│   │   └── tutor.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Component Structure

### `AppHeader`

- Shows the brand, the observation-log progress, and panel toggles
- Provides language and theme switching controls

### `ViewpointSelector`

- Displays the selectable viewpoints grouped by orbit (inside Earth's orbit, next to Earth, outside Earth's orbit)
- Manages the active selection state
- Marks observed viewpoints and cleared quizzes

### `EarthInset`

- Displays an enlarged phase view of Earth with the terminator drawn from the illuminated fraction
- Places the lit side toward the Sun as seen from the current viewpoint
- Shows illumination, distance, apparent angular size, and elongation

### `SimulationCanvas`

- Renders the 3D Solar System view
- Shows the positional relationship between the current viewpoint and Earth
- Frames the camera so both the observer and Earth stay in view
- Overlays key values, a legend, and the overview toggle on the stage
- Supports an overview mode that zooms out to show all planetary orbits

### `SimulationControls`

- Starts and stops time progression
- Changes playback speed
- Adjusts the simulation timeline

### `LearningModule`

- Displays the Earth inset view at the top of the panel
- Shows explanatory guidance
- Displays a simplified orbital relationship diagram with the elongation angle
- Presents quiz questions, feedback, and a retry option
- Displays the current simulation input state in a collapsible section
- Regenerates text content according to the selected language

## Local Development

### Requirements

- Node.js 22 recommended
- npm

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow that deploys the application to GitHub Pages when changes are pushed to the `main` branch.

### Repository setting required

In the GitHub repository settings, configure Pages to use **GitHub Actions** as the deployment source.

### Deployment flow

1. Push changes to `main`
2. GitHub Actions installs dependencies
3. Vite builds the application
4. The generated `dist/` directory is deployed to GitHub Pages

## Future Extensions

- Support for more accurate orbital parameters or ephemeris-based calculations
- Additional lesson modes for specific earth science topics
- Integration with a real AI tutoring API
- Further mobile optimization

## Public Repository Notice

This README is written for a public repository. Do not commit personal data, credentials, secret keys, or confidential service configuration values into this project.
