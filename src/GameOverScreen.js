import React, { Component } from 'react'

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

export default GameOverScreen