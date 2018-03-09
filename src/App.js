import React, { Component } from 'react'
import './App.css'
import update from 'immutability-helper'
import { Howl } from 'howler'
import finalBattle from './boss-battle.mp3';
import victory from './victory.mp3'
import slash from './attack.mp3'
import battle from './meme-battle.mp3'
import healthPickup from './healthPickup.mp3'
import lose from './lose.mp3'
import runAway from './run.mp3'
import stairs from './stairs.mp3'
import weaponPickup from './weaponPickup.mp3'
import * as Hammer from 'hammerjs';
window.Hammer = Hammer.default;

const sounds = {
  battle: {
    sound: new Howl({
      src: [battle]
    })
  },
  finalBattle: {
    sound: new Howl({
      src: [finalBattle]
    })
  },
  victory: {
    sound: new Howl({
      src: [victory]
    })
  },
  slash: {
    sound: new Howl({
      src: [slash]
    })
  },
  healthPickup: {
    sound: new Howl({
      src: [healthPickup]
    })
  },
  lose: {
    sound: new Howl({
      src: [lose]
    })
  },
  runAway: {
    sound: new Howl({
      src: [runAway]
    })
  },
  stairs: {
    sound: new Howl({
      src: [stairs]
    })
  },
  weaponPickup: {
    sound: new Howl({
      src: [weaponPickup]
    })
  }
}

function playSound(id) {
  sounds[id].sound.play();
}
function stopSound(id) {
  sounds[id].sound.stop();
}

class App extends Component {
  constructor(props) {
    super(props);
    this.weaponsList = [
      'laser guided polar bear', 'deadly assault kitten', 'sniper kitty', 'snake in a banana', 'ninja-sheep', 'hedgehog assault unit', 'porcupine in a stocking', 'squirrel grenade', 'dad joke', 'rocket propelled chicken', 'toupée', 'puppy cannon', 'Tom Cruise missile', 'hard loaf of bread', 'pencil with no eraser', 'rubber duck', 'Chuck Norris joke', 'soccer mom', 'pair of old man shoes'
    ]
    this.state = {
      currentScreen: 'start',
      levels: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      },
      memeJson: [],
      currentLevel: 1,
      fog: true,
      things: {
        player: { x: 12, y: 12 },
        memes: [],
        heals: [],
        weapons: [],
        upstairs: [],
        downstairs: [],
        boss: {}
      },
      lastVisited: { coords: { x: 12, y: 12 }, tile: 0 },
      mazeLog: "Level 1",
      attackMsg: "",
      hitMsg: "",
      isBoss: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  }

  componentDidMount() {
    // function to get meme json data
    const getMemes = () => {
      fetch('https://api.imgflip.com/get_memes')
        .then(status)
        .then(json)
        .then((data) => {
          this.setState({
            memeJson: data.data.memes
          })
        }).catch((error) => {
          console.log('Request failed', error);
        });
    }
    // response status
    const status = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else {
        return Promise.reject(new Error(response.statusText))
      }
    }
    // json response
    const json = (response) => {
      return response.json()
    }
    getMemes()
    this.resizeWindow()
  }
  handleKeypress = (e) => {
    if (this.state.currentScreen !== 'maze') {
      return
    }
    switch (e.keyCode) {
      case 37:
        this.left()
        break;
      case 38:
        this.up()
        break;
      case 39:
        this.right()
        break;
      case 40:
        this.down()
        break;
      default:
        break;
    }
  }
  handleSwipe = (e) => {
    if (this.state.currentScreen !== 'maze') {
      return
    }
    const { overallVelocity, angle } = e;
    if (Math.abs(overallVelocity) > .75) {
      if (angle > -100 && angle < -80) {
        this.up()
      }
      if (angle > -10 && angle < 10) {
        this.right()
      }
      if (angle > 80 && angle < 100) {
        this.down()
      }
      if (Math.abs(angle) > 170) {
        this.left()
      }
    }
  }
  resizeWindow = () => {
    this.setState(setWindowSize())
  }
  // generate each level's maze
  generateMazes = () => {
    let i = 1
    const levels = {}
    let level = []
    while (i < 6) {
      level = create_maze(25, 25)
      levels[i] = level
      i++;
    }
    return levels
    // this.setState({ levels })
  }
  // add things to each level
  populateLevels = () => {
    const { memeJson } = this.state
    let levels = this.generateMazes()
    let memes = [[], [], [], [], []], heals = [[{}, {}], [{}, {}], [{}, {}], [{}, {}], [{}, {}]], weapons = [], player, boss = [[], [], [], [], []], upstairs = [], downstairs = []
    // variable to hold coords for each level
    let thingCoords = []
    // create 5 sets of 5 random memes
    const randMeme = shuffle(Array.from(Array(100).keys()))
    for (let lvl = 0; lvl < 5; lvl++) {
      for (let i = 0; i < 5; i++) {
        let randNum = randMeme.next().value
        memes[lvl].push({ id: `l${lvl + 1}i${i}`, lvl: lvl + 1, hp: 30 * (lvl + 1), xp: 40 * (lvl + 1), damgMod: lvl + 1, url: memeJson[randNum].url, name: memeJson[randNum].name, width: memeJson[randNum].width, height: memeJson[randNum].height })
      }
    }
    // create 5 random weapons
    const randWeapon = shuffle(Array.from(Array(this.weaponsList.length).keys()))
    for (let i = 0; i < 5; i++) {
      let randNum = randWeapon.next().value
      weapons.push({ lvl: i + 1, name: this.weaponsList[randNum], damgMod: (i + 1) * 0.5 })
    }
    // loop through each level and add coords to each thing
    for (let l = 1; l < 6; l++) {
      // spawn player if level 1, otherwise stairs up
      if (l === 1) {
        let packedPlayerCoord = this.getEmpty(thingCoords, levels[l])
        let playerCoord = packedPlayerCoord[0]
        thingCoords.push(playerCoord)
        player = { coords: playerCoord, lvl: 1, hp: 100, xp: 0, damgMod: 1 }
      } else {
        let packedUpstairsCoord = this.getEmpty(thingCoords, levels[l])
        let upstairsCoord = packedUpstairsCoord[0]
        thingCoords.push(upstairsCoord)
        upstairs.push(upstairsCoord)
      }
      // spawn boss if level 5, otherwise stairs down
      if (l === 5) {
        let packedBossCoord = this.getEmpty(thingCoords, levels[l])
        let bossCoord = packedBossCoord[0]
        thingCoords.push(bossCoord)
        boss[4][0] = { coords: bossCoord, lvl: 6, hp: 180, xp: 0, damgMod: 3, name: "Over 9000!", url: 'https://vignette.wikia.nocookie.net/dragonball/images/4/4b/VegetaItsOver9000-02.png/revision/latest?cb=20100724145819', width: 640, height: 480 }
      } else {
        let packedDownstairsCoord = this.getEmpty(thingCoords, levels[l])
        let downstairsCoord = packedDownstairsCoord[0]
        thingCoords.push(downstairsCoord)
        downstairs.push(downstairsCoord)
      }
      // spawn weapons
      let packedWeaponCoord = this.getEmpty(thingCoords, levels[l], weapons[l - 1])
      let weaponCoord = packedWeaponCoord[0]
      thingCoords.push(weaponCoord)
      weapons[l - 1].coords = weaponCoord
      // spawn memes 
      let memeCoords = this.getEmpty(thingCoords, levels[l], memes[l - 1])
      for (let i = 0; i < memes[l - 1].length; i++) {
        thingCoords.push(memeCoords[i])
        memes[l - 1][i].coords = memeCoords[i]
      }
      // spawn heals
      let healsCoords = this.getEmpty(thingCoords, levels[l], heals[l - 1])
      for (let i = 0; i < heals[l - 1].length; i++) {
        thingCoords.push(healsCoords[i])
        heals[l - 1][i].coords = healsCoords[i]
      }
      // clear things for next level
      thingCoords = []
    }
    // add things to levels
    levels[1][player.coords.x][player.coords.y] = 'player'
    levels[5][boss[4][0].coords.x][boss[4][0].coords.y] = 'boss'
    for (let i = 0; i < weapons.length; i++) {
      levels[i + 1][weapons[i].coords.x][weapons[i].coords.y] = 'weapons'
    }
    for (let i = 0; i < upstairs.length; i++) {
      levels[i + 2][upstairs[i].x][upstairs[i].y] = 'upstairs'
    }
    for (let i = 0; i < downstairs.length; i++) {
      levels[i + 1][downstairs[i].x][downstairs[i].y] = 'downstairs'
    }
    for (let i = 0; i < heals.length; i++) {
      for (let j = 0; j < heals[i].length; j++) {
        levels[i + 1][heals[i][j].coords.x][heals[i][j].coords.y] = 'heals'
      }
    }
    for (let i = 0; i < memes.length; i++) {
      for (let j = 0; j < memes[i].length; j++) {
        levels[i + 1][memes[i][j].coords.x][memes[i][j].coords.y] = 'memes'
      }
    }
    const lastVisited = {
      coords: {
        x: player.coords.x,
        y: player.coords.y
      },
      tile: 0
    }
    const things = {
      player: player,
      memes: memes,
      heals: heals,
      weapons: weapons,
      upstairs: upstairs,
      downstairs: downstairs,
      boss: boss
    }
    const mazeLog = "Level 1"
    const attackMsg = ""
    const hitMsg = ""
    const currentLevel = 1
    // update state with things
    this.setState({ things, levels, lastVisited, mazeLog, hitMsg, currentLevel, attackMsg })
  }
  // finds tunnel space with nothing in it
  getEmpty = (curThings, level, things) => {
    let coords, x, y, noThingsAt = true, thingCoords = [], newCoords = []
    if (curThings.length !== 0) {
      for (let ele of curThings) {
        thingCoords.push(ele)
      }
    }
    noThingsAt = !thingCoords.some(e => e.x === x && e.y === y)
    if (Array.isArray(things)) {
      for (let i = 0; i < things.length; i++) {
        getRandCoord()
      }
    } else {
      getRandCoord()
    }
    function getRandCoord() {
      do {
        x = Math.floor(Math.random() * level.length)
        y = Math.floor(Math.random() * level[0].length)
        if (level[x][y] === 0 && noThingsAt) {
          coords = { 'x': x, 'y': y }
        }
      } while (!coords)
      thingCoords.push(coords)
      newCoords.push(coords)
      coords = undefined
    }
    return newCoords
  }
  switchScreen = (event) => {
    let currentScreen = event.target.id
    switch (currentScreen) {
      case 'start': this.populateLevels()
        currentScreen = 'maze'
        break
      case 'center': currentScreen = 'combat'
        break
      case 'winGame': currentScreen = 'winGame'
        break
      default: currentScreen = 'maze'
    }
    this.setState({
      currentScreen
    })
  }
  up = () => {
    this.setState(up)
  }
  down = () => {
    this.setState(down(this.state))
  }
  left = () => {
    this.setState(left(this.state))
  }
  right = () => {
    this.setState(right(this.state))
  }
  // handle run outcome
  run = () => {
    const { things, currentLevel } = this.state
    const memeInd = things.memes[currentLevel - 1].findIndex(e => e.coords.x === things.player.coords.x && e.coords.y === things.player.coords.y)
    const enemyDamg = attkRand() * things.memes[currentLevel - 1][memeInd].damgMod
    this.setState(run(enemyDamg, memeInd))
  }
  //handle attack outcome
  attack = () => {
    const { isBoss, things, currentLevel } = this.state
    const playerDamg = Math.floor(attkRand() * things.player.damgMod)
    const memeInd = isBoss ? 0 : things.memes[currentLevel - 1].findIndex(e => e.coords.x === things.player.coords.x && e.coords.y === things.player.coords.y)
    const enemyDamg = isBoss ? attkRand() * things.boss[currentLevel - 1][memeInd].damgMod : attkRand() * things.memes[currentLevel - 1][memeInd].damgMod
    this.setState(combatMsg(playerDamg, enemyDamg))
    this.setState(attack(playerDamg, enemyDamg, memeInd))
  }
  render() {
    const { state, switchScreen, up, down, left, right, attack, run, handleKeypress, handleSwipe } = this
    const { fog, things, levels, currentLevel, mazeLog, attackMsg, hitMsg, isBoss, windowHeight, windowWidth, currentScreen } = state
    // render the current screen
    switch (currentScreen) {
      case 'start': return (
        <div className="App">
          <StartScreen switchScreen={switchScreen} />
        </div>
      )
      case 'gameOver': return (
        <div className="App">
          <GameOverScreen switchScreen={switchScreen} />
        </div>
      )
      case 'winGame': return (
        <div className="App">
          <WinGame />
        </div>
      )
      case 'maze': return (
        <div className="App">
          <MazeScreen
            fog={fog}
            things={things}
            levels={levels}
            currentLevel={currentLevel}
            up={up}
            down={down}
            left={left}
            right={right}
            mazeLog={mazeLog}
            windowHeight={windowHeight}
            windowWidth={windowWidth}
            handleKeypress={handleKeypress}
            handleSwipe={handleSwipe}
          />
        </div>
      )
      case 'combat': return (
        <div className="App">
          <CombatScreen
            currentLevel={currentLevel}
            things={things}
            attack={attack}
            run={run}
            attackMsg={attackMsg}
            hitMsg={hitMsg}
            isBoss={isBoss}
          />
        </div>
      )
      default:
    }
  }
}

const run = (enemyDamg, memeInd) => (state) => {
  stopSound('battle')
  stopSound('finalBattle')
  playSound('runAway')
  const playerHp = damgResult(state.things.player.hp, enemyDamg)
  if (playerHp === 0) {
    return playerDead(state)
  }
  const state1 = update(state, { $merge: { mazeLog: `You escape with your life!` } })
  const state2 = update(state1, { things: { player: { $merge: { hp: playerHp } } } })
  const state3 = update(state2, { $merge: { currentScreen: "maze" } })
  return state3
}
const combatMsg = (playerDamg, enemyDamg) => (state) => {
  const state1 = update(state, { $merge: { attackMsg: `You deal ${playerDamg} damage` } })
  return update(state1, { $merge: { hitMsg: `You take ${enemyDamg} damage` } })
}
const attack = (playerDamg, enemyDamg, memeInd) => (state) => {
  playSound('slash')
  const playerHp = damgResult(state.things.player.hp, enemyDamg)
  const enemyHp = state.isBoss ? damgResult(state.things.boss[state.currentLevel - 1][memeInd].hp, playerDamg) : damgResult(state.things.memes[state.currentLevel - 1][memeInd].hp, playerDamg)
  if (playerHp === 0) {
    return playerDead(state)
  } else if (enemyHp === 0) {
    if (state.isBoss) {
      return winGame(state)
    }
    return memeDead(state, playerHp, memeInd)
  } else {
    const state1 = update(state, { things: { player: { $merge: { hp: playerHp } } } })
    const finalState = state.isBoss ? update(state1, { things: { boss: { [state.currentLevel - 1]: { [memeInd]: { $merge: { hp: enemyHp } } } } } }) : update(state1, { things: { memes: { [state.currentLevel - 1]: { [memeInd]: { $merge: { hp: enemyHp } } } } } })
    return finalState
  }
}
function memeDead(state, playerHp, memeInd) {
  stopSound('battle')
  playSound('victory')
  const state1 = update(state, { lastVisited: { $merge: { tile: 0 } } })
  const state2 = update(state1, { things: { memes: { [state.currentLevel - 1]: { [memeInd]: { $merge: { hp: 0 } } } } } })
  const xp = state.things.player.xp + state.things.memes[state.currentLevel - 1][memeInd].xp
  const lvl = state.things.player.lvl
  if ((xp >= lvl * 100)) {
    return levelUp(state2, xp, lvl)
  }
  const state3 = update(state2, { things: { player: { $merge: { hp: playerHp } } } })
  const state4 = update(state3, { $merge: { mazeLog: "Victory!" } })
  const state5 = update(state4, { things: { player: { $merge: { xp } } } })
  const state6 = update(state5, { $merge: { currentScreen: "maze" } })
  return state6
}
function levelUp(state, xp, lvl) {
  const newXp = xp - lvl * 100
  const state1 = update(state, { $merge: { mazeLog: `You are now level ${lvl + 1}!` } })
  const state2 = update(state1, { things: { player: { $merge: { xp: newXp } } } })
  const state3 = update(state2, { things: { player: { $merge: { lvl: lvl + 1 } } } })
  const state4 = update(state3, { things: { player: { $merge: { damgMod: state.things.player.damgMod + 1 } } } })
  const state5 = update(state4, { things: { player: { $merge: { hp: (lvl + 1) * 100 } } } })
  const state6 = update(state5, { $merge: { currentScreen: "maze" } })
  return state6
}
function playerDead(state) {
  stopSound('battle')
  stopSound('finalBattle')
  playSound('lose')
  return update(state, { $merge: { currentScreen: "gameOver" } })
}
function winGame(state) {
  stopSound('finalBattle')
  playSound('victory')
  return update(state, { $merge: { currentScreen: "winGame" } })
}
function damgResult(hp, damg) {
  if (hp > damg) {
    return hp - damg
  } else
    return 0
}
function checkTile(tile, state) {
  switch (tile) {
    case "memes": {
      playSound('battle')
      const state1 = update(state, { $merge: { attackMsg: "" } })
      const state2 = update(state1, { $merge: { hitMsg: "" } })
      return update(state2, { $merge: { currentScreen: 'combat' } })
    }
    case "weapons": {
      playSound('weaponPickup')
      const damgMod = state.things.player.lvl + state.things.weapons[state.currentLevel - 1].damgMod
      const state1 = update(state, { $merge: { mazeLog: `You found a +${state.currentLevel} ${state.things.weapons[state.currentLevel - 1].name}` } })
      const state2 = update(state1, { things: { player: { $merge: { damgMod } } } })
      const newState = update(state2, { lastVisited: { $merge: { tile: 0 } } })
      return newState
    }
    // TODO: handle these
    case "heals": {
      playSound('healthPickup')
      const state1 = update(state, { things: { player: { $merge: { hp: state.things.player.lvl * 100 } } } })
      const state2 = update(state1, { lastVisited: { $merge: { tile: 0 } } })
      return update(state2, { $merge: { mazeLog: 'You are healed!' } })
    }
    case "downstairs": {
      playSound('stairs')
      const upstairCoords = state.things.upstairs[state.currentLevel - 1]
      const upX = upstairCoords.x
      const upY = upstairCoords.y
      const downstairCoords = state.things.downstairs[state.currentLevel - 1]
      const downX = downstairCoords.x
      const downY = downstairCoords.y
      const state1 = update(state, { $merge: { currentLevel: state.currentLevel + 1 } })
      const state2 = update(state1, { things: { player: { $merge: { coords: upstairCoords } } } })
      const state3 = update(state2, { levels: { [state.currentLevel]: { [downX]: { $merge: { [downY]: 'downstairs' } } } } })
      const state4 = update(state3, { levels: { [state.currentLevel + 1]: { [upX]: { $merge: { [upY]: 'player' } } } } })
      const state5 = update(state4, { lastVisited: { $merge: { tile: 'upstairs' } } })
      const state6 = update(state5, { lastVisited: { $merge: { coords: upstairCoords } } })
      return update(state6, { $merge: { mazeLog: `You've decended to level ${state.currentLevel + 1}` } })
    }
    case "upstairs": {
      playSound('stairs')
      const upstairCoords = state.things.upstairs[state.currentLevel - 2]
      const upX = upstairCoords.x
      const upY = upstairCoords.y
      const downstairCoords = state.things.downstairs[state.currentLevel - 2]
      const downX = downstairCoords.x
      const downY = downstairCoords.y
      const state1 = update(state, { $merge: { currentLevel: state.currentLevel - 1 } })
      const state2 = update(state1, { things: { player: { $merge: { coords: downstairCoords } } } })
      const state3 = update(state2, { levels: { [state.currentLevel]: { [upX]: { $merge: { [upY]: 'upstairs' } } } } })
      const state4 = update(state3, { levels: { [state.currentLevel - 1]: { [downX]: { $merge: { [downY]: 'player' } } } } })
      const state5 = update(state4, { lastVisited: { $merge: { tile: 'downstairs' } } })
      const state6 = update(state5, { lastVisited: { $merge: { coords: downstairCoords } } })
      return update(state6, { $merge: { mazeLog: `You've ascended to level ${state.currentLevel - 1}` } })
    }
    case "boss": {
      playSound('finalBattle')
      const state1 = update(state, { $merge: { attackMsg: "" } })
      const state2 = update(state1, { $merge: { hitMsg: "" } })
      const state3 = update(state2, { $merge: { isBoss: true } })
      return update(state3, { $merge: { currentScreen: 'combat' } })
    }
    default: return update(state, { $merge: { mazeLog: `Level ${state.currentLevel}` } })
  }
}
// move north
function up(state) {
  const lastTile = state.lastVisited.tile,
    lastX = state.lastVisited.coords.x,
    lastY = state.lastVisited.coords.y
  const newTile = state.levels[state.currentLevel][lastX][lastY - 1]
  if (newTile === 1) {
    return
  }
  const state1 = update(state, { levels: { [state.currentLevel]: { [lastX]: { [lastY]: { $set: lastTile } } } } })
  const state2 = update(state1, { things: { player: { coords: { $set: { x: lastX, y: lastY - 1 } } } } })
  const state3 = update(state2, { lastVisited: { $set: { coords: { x: lastX, y: lastY - 1 } } } })
  const state4 = update(state3, { lastVisited: { $merge: { tile: newTile } } })
  const newState = update(state4, { levels: { [state.currentLevel]: { [lastX]: { [lastY - 1]: { $set: "player" } } } } })
  const finalState = checkTile(newTile, newState)
  return finalState
}
// move south
function down(state) {
  const lastTile = state.lastVisited.tile,
    lastX = state.lastVisited.coords.x,
    lastY = state.lastVisited.coords.y
  const newTile = state.levels[state.currentLevel][lastX][lastY + 1]
  if (newTile === 1) {
    return
  }
  const state1 = update(state, { levels: { [state.currentLevel]: { [lastX]: { [lastY]: { $set: lastTile } } } } })
  const state2 = update(state1, { things: { player: { coords: { $set: { x: lastX, y: lastY + 1 } } } } })
  const state3 = update(state2, { lastVisited: { $set: { coords: { x: lastX, y: lastY + 1 } } } })
  const state4 = update(state3, { lastVisited: { $merge: { tile: newTile } } })
  const newState = update(state4, { levels: { [state.currentLevel]: { [lastX]: { [lastY + 1]: { $set: "player" } } } } })
  const finalState = checkTile(newTile, newState)
  return finalState
}
// move west
function left(state) {
  const lastTile = state.lastVisited.tile,
    lastX = state.lastVisited.coords.x,
    lastY = state.lastVisited.coords.y
  const newTile = state.levels[state.currentLevel][lastX - 1][lastY]
  if (newTile === 1) {
    return
  }
  const state1 = update(state, { levels: { [state.currentLevel]: { [lastX]: { [lastY]: { $set: lastTile } } } } })
  const state2 = update(state1, { things: { player: { coords: { $set: { x: lastX - 1, y: lastY } } } } })
  const state3 = update(state2, { lastVisited: { $set: { coords: { x: lastX - 1, y: lastY } } } })
  const state4 = update(state3, { lastVisited: { $merge: { tile: newTile } } })
  const newState = update(state4, { levels: { [state.currentLevel]: { [lastX - 1]: { [lastY]: { $set: "player" } } } } })
  const finalState = checkTile(newTile, newState)
  return finalState
}
// move east
function right(state) {
  const lastTile = state.lastVisited.tile,
    lastX = state.lastVisited.coords.x,
    lastY = state.lastVisited.coords.y
  const newTile = state.levels[state.currentLevel][lastX + 1][lastY]
  if (newTile === 1) {
    return
  }
  const state1 = update(state, { levels: { [state.currentLevel]: { [lastX]: { [lastY]: { $set: lastTile } } } } })
  const state2 = update(state1, { things: { player: { coords: { $set: { x: lastX + 1, y: lastY } } } } })
  const state3 = update(state2, { lastVisited: { $set: { coords: { x: lastX + 1, y: lastY } } } })
  const state4 = update(state3, { lastVisited: { $merge: { tile: newTile } } })
  const newState = update(state4, { levels: { [state.currentLevel]: { [lastX + 1]: { [lastY]: { $set: "player" } } } } })
  const finalState = checkTile(newTile, newState)
  return finalState
}
// random number 5-10
function attkRand() {
  return Math.floor(Math.random() * 6 + 5)
}
// function to generate random maze - iterations(optional) is number of times to 'dig'
// 0 = tunnel / 1 = wall
function create_maze(width, height, iterations) {
  let maze = [];
  const mazeWidth = width;
  const mazeHeight = height;
  if (!iterations) iterations = width * height;
  let moves = [];
  for (let i = 0; i < mazeHeight; i++) {
    maze[i] = [];
    for (let j = 0; j < mazeWidth; j++) {
      maze[i][j] = 1;
    }
  }
  let x = 1;
  let y = 1;
  maze[x][y] = 0;
  moves.push(y + y * mazeWidth);
  for (let itr = 0; itr < iterations; ++itr) {
    if (moves.length) {
      let possibleDirections = "";
      if (x + 2 > 0 && x + 2 < mazeHeight - 1 && maze[x + 2][y] === 1) {
        possibleDirections += "S";
      }
      if (x - 2 > 0 && x - 2 < mazeHeight - 1 && maze[x - 2][y] === 1) {
        possibleDirections += "N";
      }
      if (y - 2 > 0 && y - 2 < mazeWidth - 1 && maze[x][y - 2] === 1) {
        possibleDirections += "W";
      }
      if (y + 2 > 0 && y + 2 < mazeWidth - 1 && maze[x][y + 2] === 1) {
        possibleDirections += "E";
      }
      if (possibleDirections) {
        let move = Math.floor(Math.random() * (possibleDirections.length + 1));
        switch (possibleDirections[move]) {
          case "N":
            maze[x - 2][y] = 0;
            maze[x - 1][y] = 0;
            x -= 2;
            break;
          case "S":
            maze[x + 2][y] = 0;
            maze[x + 1][y] = 0;
            x += 2;
            break;
          case "W":
            maze[x][y - 2] = 0;
            maze[x][y - 1] = 0;
            y -= 2;
            break;
          case "E":
            maze[x][y + 2] = 0;
            maze[x][y + 1] = 0;
            y += 2;
            break;
          default:
            break;
        }
        moves.push(y + x * mazeWidth);
      }
      else {
        let back = moves.pop();
        x = Math.floor(back / mazeWidth);
        y = back % mazeWidth;
      }
    }
  }
  return maze;
}
// non-repeating random number generator
function* shuffle(array) {
  let i = array.length;
  while (i--) {
    yield array.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
  }
}
function setWindowSize() {
  return {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  }
}

class StartScreen extends Component {
  render() {
    const { switchScreen } = this.props
    return (
      <div className="StartScreen">
        <h1 className="meme">MAZES AND MEMES</h1>
        <h2 className="standard-text">Kill the memes and escape the maze!</h2>
        <br />
        <button id="start" onClick={switchScreen}>Start</button>
      </div>
    )
  }
}

class GameOverScreen extends Component {
  render() {
    const { switchScreen } = this.props
    return (
      <div className="StartScreen">
        <h1 className="meme">YOU DIED</h1>
        <h2 className="standard-text">Game Over - Try again</h2>
        <br />
        <button id="start" onClick={switchScreen}>Start</button>
      </div>
    )
  }
}

class WinGame extends Component {
  render() {
    return (
      <div className="StartScreen">
        <h1 className="meme">YOU ESCAPE THE MAZE!</h1>
        <h2 className="standard-text">It's time to collect your reward!</h2>
        <br />
        <form action="https://youtu.be/oHg5SJYRHA0">
          <input id="win" type="submit" value="Collect!" />
        </form>
      </div>
    )
  }
}

class MazeScreen extends Component {
  componentDidMount() {
    window.addEventListener('keydown', this.props.handleKeypress);
    window.addEventListener('resize', setWindowSize);
    const touchElement = document.getElementById('root');
    const hammertime = new Hammer(touchElement);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on('swipe', this.props.handleSwipe);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeypress);
    window.removeEventListener('resize', setWindowSize);
  }
  render() {
    const { fog, things, levels, currentLevel, up, down, left, right, mazeLog, windowWidth, windowHeight } = this.props
    const { player } = things
    const maze = levels[currentLevel]
    const hpStyle = {
      height: ((player.lvl * 100) - (player.lvl * 100 - player.hp)) / player.lvl + '%'
    }
    const xpStyle = {
      height: ((player.lvl * 100) - (player.lvl * 100 - player.xp)) / player.lvl + '%'
    }
    const tileSize = document.getElementsByClassName('tile').item(0) ? document.getElementsByClassName('tile').item(0).clientHeight : 24
    const numCols = Math.floor((windowWidth / tileSize) - 1)
    const numRows = Math.floor((windowHeight / tileSize) - 1)
    let startX = player.coords.x - (Math.floor(numCols / 2));
    let startY = player.coords.y - (Math.floor(numRows / 2));
    if (startX < 0) startX = 0;
    if (startY < 0) startY = 0;
    let endX = startX + numCols;
    let endY = startY + numRows;
    if (endX > maze.length) {
      startX = numCols > maze.length ? 0 : startX - (endX - maze.length);
      endX = maze.length;
    }
    if (endY > maze[0].length) {
      startY = numRows > maze[0].length ? 0 : startY - (endY - maze[0].length);
      endY = maze[0].length;
    }
    let rows = [], tileClass, row;
    for (let y = startY; y < endY; y++) {
      row = [];
      for (let x = startX; x < endX; x++) {
        // check things and add class to tileClass
        // player
        if (maze[x][y] === 'player') {
          tileClass = 'player'
        } else if (maze[x][y] === 'boss') {
          tileClass = 'boss'
        } else if (maze[x][y] === 'weapons') {
          tileClass = 'weapons'
        } else if (maze[x][y] === 'upstairs') {
          tileClass = 'upstairs'
        } else if (maze[x][y] === 'downstairs') {
          tileClass = 'downstairs'
        } else if (maze[x][y] === 'memes') {
          tileClass = 'memes'
        } else if (maze[x][y] === 'heals') {
          tileClass = 'heals'
        } else if (maze[x][y] === 0) {
          tileClass = 'tunnel'
        } else {
          tileClass = 'wall'
        }
        if (fog) {
          const xDiff = player.coords.x - x,
            yDiff = player.coords.y - y;
          if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
            tileClass += ' fog';
          } else if (Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) >= 5) {
            tileClass += ' fog';
          }
        }
        row.push(React.createElement('span', { className: 'tile ' + tileClass, key: x + 'x' + y }, ' '));
      }
      rows.push(React.createElement('div', { className: 'boardRow', key: 'row' + y }, row))
    }
    return (
      <div className="MazeScreen">
        <div className="maze">
          {rows}
        </div>
        <div className="mazeMsg">
          <h2>{mazeLog}</h2>
        </div>
        <div className="dPad-container">
          <h3>HP</h3>
          <div className="hpContainer">
            <div className="hpBar" style={hpStyle}>{player.hp}</div>
          </div>
          <div id="up" onClick={up} className="dPad">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <h3>XP</h3>
          <div className="xpContainer">
            <div className="xpBar" style={xpStyle}>{player.xp}</div>
          </div>
          <div id="left" onClick={left} className="dPad">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <div id="center" className="dPad"></div>
          <div id="right" onClick={right} className="dPad">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <div id="down" onClick={down} className="dPad">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }
}

class CombatScreen extends Component {

  render() {
    const { things, currentLevel, attack, attackMsg, hitMsg, run, isBoss } = this.props
    const x = things.player.coords.x
    const y = things.player.coords.y
    const arr = isBoss ? things.boss[currentLevel - 1].filter(obj => obj.coords.x === x && obj.coords.y === y) : things.memes[currentLevel - 1].filter(obj => obj.coords.x === x && obj.coords.y === y)
    const meme = arr[0]
    const memeLvl = isBoss ? `It's...` : `You encounter a level ${currentLevel}`
    const memeName = isBoss ? `Over 9000!` : `${meme.name}`
    const divStyle = {
      backgroundImage: `url(${meme.url})`,
      width: `${meme.width}px`,
      height: `${meme.height}px`
    };
    const memeHpStyle = isBoss ? {
      width: ((((currentLevel + 1) * 30) - ((currentLevel + 1) * 30 - meme.hp)) / (currentLevel + 1)) * 3.33 + '%'
    } :
      {
        width: (((currentLevel * 30) - (currentLevel * 30 - meme.hp)) / currentLevel) * 3.33 + '%'
      }
    const playerHpStyle = {
      width: ((things.player.lvl * 100) - (things.player.lvl * 100 - things.player.hp)) / things.player.lvl + '%'
    }
    return (
      <div className="CombatScreen">
        <div id="meme" style={divStyle}>
          <div id="memeLvl">{memeLvl}</div>
          <div id="memeName">{memeName}</div>
        </div>
        <div className="combat-log">
          <ul>
            <li id="li0">{attackMsg}</li>
            <li id="li1">{hitMsg}</li>
          </ul>
        </div>
        <div className="combatHpBars">
          <div className="memeHp">
            <div>Enemy's HP</div>
            <div className="memeHpBar" style={memeHpStyle}>{meme.hp}</div>
          </div>
          <div className="playerHp">
            <div>Your HP</div>
            <div className="hpBar" style={playerHpStyle}>{things.player.hp}</div>
          </div>
        </div>
        <div className="combat">
          <button id="attak" onClick={attack}>Attack</button>
          <button id="run" onClick={run}>Run</button>
        </div>
      </div>
    )
  }
}

export default App;
