# Mazes and Memes

Mazes and Memes is a *roguelike* dungeon crawler that aims to bring the theme of memes to the genre. The goal is to procedurally generate a maze, enemies and things inside it. This is what I've coded so far:

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
- Add music/sound
- Updated manifest.json for homescreen/splash branding

**TODO:**
- Refactor
- Offline first

Current playable version: 
https://mazes-and-memes.netlify.com/
Use hard refresh to update service worker on subsequent visits.