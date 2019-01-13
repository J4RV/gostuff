import React, { Component } from 'react';
import Card from './Card'
import LocalPlayerIndex from './LocalPlayerIndex'
import Button from '@material-ui/core/Button';
import axios from 'axios'
import './App.css'

const WhiteCardsPlayed = ({state}) => {
  const allSinnersPlayed = () => {
    for(let i = 0; i < state.players.length; i++){
      if(i == state.currentCzarIndex){
        continue
      }
      if(state.players[i].whiteCardsInPlay.length != state.blackCardInPlay.blanksAmount){
        return false
      }
    }
    return true
  }
  if (allSinnersPlayed()){
    return <p>ALL SINNERS PLAYED</p>
  } else {
    return <p>WAITING FOR SINNERS...</p>
  }
}

const Table = ({state}) => {
  const card = state.blackCardInPlay
  if (card == null) return null
  return (
  <div>
    <Card text={card.text} isBlack={true} className='in-table' />    
    <WhiteCardsPlayed state={state} />
  </div>)
}

const CardsInPlay = ({state, owner}) => (
  <span>
    {state.players[owner].whiteCardsInPlay.map((c, i) =>
      <Card text={c.text} isBlack={false} playable={false} handIndex={i} className='in-table' />            
    )}
  </span>
)

const PlayerInfo = ({player}) => (
  <div className="cah-playerinfo">
    <p>{player.name}</p>
    <p>{player.points.length} points</p>
    <p>{player.whiteCardsInPlay.length} cards in play</p>
  </div>
)

const PlayersInfo = ({state}) => (
  <div style={{display: "flex"}}>
    {state.players.map(p => 
      <PlayerInfo player={p} />
    )}
  </div>
)

class Hand extends Component {
  state = {cardIndexes: []}

  render() {
    const gamestate = this.props.state
    return (
    <div className="cah-hand">
      <div className="cah-hand-cards">
        {gamestate.players[LocalPlayerIndex()].hand.map((c, i) =>
          <Card
            {...c}
            isBlack={false}
            playable={this.isCzar() === false}
            handIndex={i}
            className={`hovering ${this.state.cardIndexes.includes(i) ? 'selected' : ''}`}
            onClick={() => this.handleCardClick(i)}
          />            
        )}
      </div>
      <Button variant="contained" color="primary" onClick={this.playCards}>
        Play cards
      </Button>
    </div>
    )
  }

  isCzar = () => {
    return this.props.state.currentCzarIndex == LocalPlayerIndex()
  }

  handleCardClick = (i) => {
    if(this.isCzar()){
      return
    }
    let newList = this.state.cardIndexes.slice()
    if(newList.includes(i)){
      newList.splice(newList.indexOf(i), 1)
    } else {
      newList.push(i)
    }
    this.setState({cardIndexes: newList})
  }

  playCards = () => {
    axios.post('rest/test/'+LocalPlayerIndex()+'/PlayCards', {
      cardIndexes: this.state.cardIndexes
    }).then(r => {
      this.setState({cardIndexes: []})
    }).catch(r => console.error(r.response.data));      
  }
}

class Game extends Component {
  render() {
    if(this.state == null) return null;
    return (
      <div className="Game">
        <PlayersInfo state={this.state} />
        <Table state={this.state} />
        <CardsInPlay state={this.state} owner={LocalPlayerIndex()} />
        <Hand state={this.state} />        
      </div>
    );
  } 
  componentWillMount() {
    this.updateState()
    // this would be much better with websockets
    window.setInterval(this.updateState, 500)
  }
  updateState = () => {
    fetch("rest/test/"+LocalPlayerIndex()+"/State")
      .then(r => r.json()
      .then(j => console.log(j) & this.setState(j))
    ) 
  }
}

export default Game