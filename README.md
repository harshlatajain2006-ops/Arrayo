# Arrayo — Interactive Array Visualizer

A self-contained educational prototype for visualizing common 1D array operations.

## Modules
1. Address Calculation
2. Insertion & Deletion
3. Linear Search
4. Binary Search

## Project structure

```text
Arrayo/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   └── defaults.json
└── README.md
```

## Database / persistence

This prototype does **not require a server-side database**. All array operations and animations run in the browser.

`data/defaults.json` is included as the project's local seed/configuration data. It contains the sample values used by the visualizer. This makes the project easy to extend later to a real backend/database without pretending that a database is required for the current prototype.

If persistent user data is added later, a backend such as Firebase, Supabase, or a REST API can be connected to the existing JavaScript layer.

## Run locally

Simply open `index.html` in Chrome, Edge, or another modern browser.

For the most reliable local development experience, serve the folder with a static server, for example:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

No npm install, build step, framework, or external dependency is required.

## Deployment

The project can be deployed directly to static hosting such as Vercel, Netlify, GitHub Pages, or any web server.

For Vercel, upload/push the `Arrayo` folder as the project root. No build command is required for this static version.

## Notes

- Maximum array size: 15 elements.
- Memory addresses are simulated for educational purposes.
- Binary Search can automatically sort the input array or warn when it is unsorted.
