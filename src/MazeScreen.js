import React, { Component } from 'react'
class MazeScreen extends Component {
  render() {
    const { fog, things, levels, currentLevel, up, down, left, right, mazeLog, windowWidth, windowHeight } = this.props
    const { player } = things
    const maze = levels[currentLevel]
    const hpStyle = {
      height: (((player.lvl * 50) + 50) - (((player.lvl * 50) + 50) - player.hp)) / ((player.lvl * .5) + .5) + '%'
    }
    const xpStyle = {
      height: ((player.lvl * 100) - (player.lvl * 100 - player.xp)) / player.lvl + '%'
    }
    const tileSize = document.getElementsByClassName('tile').item(0) ? document.getElementsByClassName('tile').item(0).clientHeight : 40
    const numCols = Math.floor((windowWidth / tileSize)-1)
    const numRows = Math.floor((windowHeight / tileSize)-8)
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
            tileClass += ' fog transparent';
          } else if (Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) >= 5) {
            tileClass += ' fog transparent';
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
          <div id="up" onClick ={up} className="dPad clickable">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <h3>XP</h3>
          <div className="xpContainer">
            <div className="xpBar" style={xpStyle}>{player.xp}</div>
          </div>
          <div id="left" onClick ={left} className="dPad clickable">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <div id="center" className="dPad"></div>
          <div id="right" onClick ={right} className="dPad clickable">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
          <div id="down" onClick ={down} className="dPad clickable">
            <svg viewBox="0 0 100 100">
              <path className="arrow" d="M50 0l10 10-40 40 40 40-10 10L0 50z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }
}

export default MazeScreen