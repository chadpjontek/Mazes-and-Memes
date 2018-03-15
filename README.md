# Mazes and Memes

Mazes and Memes is a *roguelike* dungeon crawler that brings the theme of memes to the genre. Each level's maze, enemies, and things inside are procedurally generated. This is what I've coded so far:

- Initial UI and React components for the start, maze, and combat screens.
- The fetch to gather JSON meme data.
- The function to create random mazes
- The functions to create each level including the things and coordinates inside it.
- Rendering of each level as player enters
- Player movement
- Object interactions
- Handling combat
- Lose condition
- Boss added
- Win condition and reward
- svgs used for tiles
- Added music and sound
- Updated manifest.json for homescreen/splash branding
- Refactored code for organization

**TODO:**

- Store json data in IndexDB, cache images, and serve offline first for best UX

Current playable version: 
https://mazes-and-memes.netlify.com/
Use hard refresh to update service worker on subsequent visits.