# Artworks Gallery Explorer 🎨

Hey there! Welcome to the **Artworks Gallery Explorer** repository. This is a modern, highly interactive React application I built to browse and explore the vast collection from the [Art Institute of Chicago API](https://api.artic.edu/api/v1/artworks). 

If you're evaluating this project or just poking around the code, this document will help you get up and running, explain what it does, and walk through how some of the trickier technical bits were solved!

## 🚀 Quick Start (Running the App)

Getting this up and running on your local machine is super easy.

1. **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed along with `npm`.
2. **Setup:**
   Open your terminal, navigate to the `my-app` directory, and install the dependencies:
   ```bash
   cd my-app
   npm install
   ```
3. **Fire it up:**
   ```bash
   npm run dev
   ```
4. **View:** Open your browser and navigate to the local server (usually `http://localhost:5173`). Have fun exploring!

## ✨ Features and Capabilities

I designed the interface to be really clean, snappy, and responsive. Under the hood, the app employs some rather fun React wizardry to keep things fast while fetching data across different pages. 

Here are the main highlights:
- **Lightning Fast Pagination:** Data is fetched dynamically per-page directly from the Art Institute API. We aren't downloading the whole internet into your browser's memory, just the 12 artworks you're currently looking at.
- **Smart Row Selection:** You can select items individually using the checkboxes on the left.
- **"Select Multiple" Overlay:** Don't want to click 50 times? Use the sleek chevron dropdown `[v]` next to the title header checkbox! You can input a custom number of rows (e.g., 25), and it will intelligently grab them for you in sequence.
- **State Persistence:** Go ahead and select rows on Page 1, flip over to Page 4, select a few more, and come back. Your selections won't clear or disappear!
- **Zero Pre-fetching Penalty:** My absolute favorite part of the codebase. When you custom-select "100 rows" using the overlay, the app *does not* maliciously fetch 100 items from the API. Instead, it securely caches the "indices" of the selected items and waits quietly. The moment you navigate to Page 3 or 4, it instantly recognizes that those rows *should* be checked and visually updates them—meaning 100% accurate functionality with zero unnecessary network calls!

## 💻 Tech Stack

This project was built with a modern, standard utility belt:
* **React 18** + **TypeScript** for rock-solid component architecture.
* **Vite** as a blazing fast build tool and dev server.
* **PrimeReact** & **PrimeIcons** for powerful, accessible component foundations (like the `DataTable`).
* **Tailwind CSS** for highly customized, clean styling overrides on top of the PrimeReact theme.

## 🧠 Code Architecture Notes

If you're checking out the source code, almost all the action happens inside `src/components/ArtworkTable.tsx`. 

- **Selection Logic:** Look for `selectedIds` and `unfetchedSelectedIndices`. `selectedIds` is a pure collection of loaded Artwork IDs, while `unfetchedSelectedIndices` is a clever map of "pending" selections. 
- **Reactive State Update:** State changes use functional updates `setSelectedIds(prev => ...)` preventing React from holding onto stale state across heavy Datatable renders!
- **CSS Magic:** `src/index.css` acts as an override file allowing us to perfectly marry Tailwind's utility classes with PrimeReact's built-in deep DOM components.

***

Thanks for this assignment its was a good and a bit refresh to use vite again after a long time since i was using nextjs and all readme file is bit AI generated but i tried to make it human readable. 
