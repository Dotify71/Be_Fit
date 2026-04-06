# PulsePlan Fitness Tracker 🏋️‍♂️

Hey! This is PulsePlan, a personal health and fitness dashboard I put together using just plain HTML, CSS, and vanilla JavaScript. 

I built this because I wanted a simple, all-in-one place to plan my workouts, watch my macros, and track my water intake without needing to sign up for a bloated commercial app or pay a subscription. Plus, everything you log is saved right in your browser using `localStorage`, which means it's super fast and your data stays entirely on your local machine.

## Features

1. **Dashboard:** Gives you a quick glance at today's stats, a recovery index, and your daily intensity score based on what you actually completed.
2. **Workout Planner:** Schedule your training sessions, pick the intensity, and check them off when finished.
3. **Nutrition:** Log your meals and track your calories, protein, carbs, and fats. 
4. **Hydration:** I added quick-add buttons to easily log water glasses throughout the day.
5. **Goals & Progress:** Keep a log of your weekly weight, sleep, steps, and general mood.
6. **Tools:** Built-in BMI and BMR calculators, plus a small tool to suggest calorie targets depending on if you want to cut or bulk.

## Running it locally

Since there's no backend or database, running this is as easy as it gets:
1. Clone this repo or just download the files.
2. Double-click `index.html` to open it in your web browser.
3. Start tracking!

*(Tip: If you want to see how the dashboard looks when it's actually populated, hit the "Load Demo" button on the sidebar to seed some fake data).*

## Tech used

1. **HTML5** & **CSS3**: I tried to make it look as premium and dynamic as possible using native flexbox/grid, custom variables, and Google Fonts.
2. **Vanilla JS**: No React, no Vue, no bloated Node modules. Just plain Javascript handling the state, math, and DOM updates.
3. **LocalStorage API**: Used to save all the data persistently between reloads.

## AI Disclosure

Just wanting to be fully transparent for the Flavortown Hack Club submission: I used AI to help brainstorm some of the initial UI layout choices and to speed up scaffolding some repetitive HTML tags/structure when I first started. All the core Javascript logic, state handling, calculations, and final debugging was done manually to pull it all together!

**Build with ❤️ for hack club by Dushyant Acharya**