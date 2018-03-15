import React, { Component } from 'react'

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

export default WinGame 