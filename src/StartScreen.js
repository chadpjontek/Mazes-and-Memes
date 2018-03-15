import React, { Component } from 'react'

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

export default StartScreen