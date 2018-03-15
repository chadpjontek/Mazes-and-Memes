import React, { Component } from 'react'
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
    const memeHpStyle = {
      width: (((meme.lvl * 30) - (meme.lvl * 30 - meme.hp)) / meme.lvl) * 3.33 + '%'
    }
    const playerHpStyle = {
      width: (((things.player.lvl * 50) + 50) - (((things.player.lvl * 50) + 50) - things.player.hp)) / ((things.player.lvl * .5) + .5) + '%'
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

export default CombatScreen