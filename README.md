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
  - Enlarged phase view of Earth
- Learning panel
  - Context-sensitive explanation of the current state
  - Observation prompts
  - Viewpoint-specific quiz
- Time controls
  - Play and pause
  - Multiple playback speeds
  - Timeline scrubber
- Interface options
  - Default Japanese UI with an English toggle
  - Light mode and dark mode switching
  - Custom SVG favicon for the published site

## Technology Stack

- React 18
- Vite
- Three.js
- React Three Fiber
- drei
- CSS

The current implementation does not use a backend API or database. Language and theme preferences are stored locally in the browser.

## Program Specification

### Simulation Model

This application uses a simplified orbital model intended for educational use.

- Planetary motion is approximated with near-circular orbits
- Orbital radius and orbital period are represented with fixed learning-oriented values
- The Moon is modeled as a simplified relative orbit around Earth
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
│   │   ├── LearningModule.jsx
│   │   ├── SimulationCanvas.jsx
│   │   ├── SimulationControls.jsx
│   │   └── ViewpointSelector.jsx
│   ├── data/
│   │   └── celestialBodies.js
│   ├── lib/
│   │   ├── i18n.js
│   │   ├── orbitalMath.js
│   │   └── tutor.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── AI指示書.md
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Component Structure

### `ViewpointSelector`

- Displays the list of selectable viewpoints
- Manages the active selection state
- Provides language and theme switching controls

### `SimulationCanvas`

- Renders the 3D Solar System view
- Shows the positional relationship between the current viewpoint and Earth
- Displays the Earth inset panel

### `SimulationControls`

- Starts and stops time progression
- Changes playback speed
- Adjusts the simulation timeline

### `LearningModule`

- Displays the current simulation input state
- Shows explanatory guidance
- Displays a simplified orbital relationship diagram
- Presents quiz questions and feedback
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
