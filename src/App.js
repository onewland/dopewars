import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import './App.css';

class MoneyViewer extends React.Component {
  render() {
    return <span id="moneyDisplay">${this.props.money}</span>
  }
}

class OfferViewer extends React.Component {
  attemptPurchase(offer) {
    if(this.props.money >= offer.price) {
      this.props.onPlayerBalanceChange(this.props.money - offer.price);
      this.props.onPlayerInventoryChange(offer.productName, 1);
    }
  }

  attemptSale(offer) {
    let count = this.props.playerInventory[offer.productName]
    if(count > 0) {
      this.props.onPlayerBalanceChange(this.props.money + offer.price);
      this.props.onPlayerInventoryChange(offer.productName, -1);
    }
  }

  offerList() {
    return this.props.offers.map(offer =>
      <tr key={offer.productName}>
        <td>{offer.productName}</td>
        <td>{offer.price}</td>
        <td><Button onClick={() => this.attemptPurchase(offer)}>Buy</Button></td>
        <td><Button onClick={() => this.attemptSale(offer)}>Sell</Button></td>
      </tr>
    );
  }

  render() {
    return (
      <Col>
        <header>City Offers</header>
        <Table>
          <thead>
            <tr>
              <td>Item</td>
              <td>Price</td>
            </tr>
          </thead>
          <tbody>
            {this.offerList()}
          </tbody>
        </Table>
      </Col>
    )
  }
}

class InventoryViewer extends React.Component {
  itemList() {
    return Object.entries(this.props.inventory)
      .filter(entry => entry[1] > 0)
      .map(entry => {
        const [key,val] = entry;
        return (
          <tr key={key}>
            <td>{key}</td>
            <td>{val}</td>
          </tr>
        );
      });
  }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <td>Item</td>
            <td>Count</td>
          </tr>
        </thead>
        <tbody>
          {this.itemList()}
        </tbody>
      </Table>
    );
  }
}

const offer = (name, price) => ({productName: name, price: price})
const offersBase = [
  offer('weed', 100),
  offer('coke', 200),
  offer('ecstasy', 150),
  offer('heroin', 500),
  offer('meth', 300),
  offer('codeine with promethazine', 50)
]


const GAME_STATE_IN_PROGRESS = 'InProgress';
const GAME_STATE_OVER = 'GameOver';

class Game extends React.Component {
  constructor(props) {
    super(props);

    const city = (name, ...meta) => ({name: name, meta: meta})

    let availableCities = [
      city("San Francisco"),
      city("New York"),
      city("Houston")
    ]

    this.state = {
      dayCount: 0,
      money: props.startMoney,
      offers: this.shuffleOffers(availableCities[0]),
      playerInventory: {},
      currentCity: availableCities[0],
      availableCities: availableCities,
      gameState: GAME_STATE_IN_PROGRESS
    };

    this.adjustMoneyCurry = this.adjustMoneyCurry.bind(this);
    this.onPlayerBalanceChange = this.onPlayerBalanceChange.bind(this);
    this.onPlayerInventoryChange = this.onPlayerInventoryChange.bind(this);
  }

  shuffleOffers() {
    return offersBase.map(offerBase => {
      const proportion = 1 + (Math.floor(Math.random() * 250)/100-0.5);

      return offer(offerBase.productName, Math.floor(offerBase.price * proportion))
    });
  }

  adjustMoneyCurry(amount) {
    return () => this.setState({money: this.state.money + amount})
  }

  onPlayerBalanceChange(amount) {
    this.setState({money: amount})
  }

  onPlayerInventoryChange(productName, amount) {
    if(this.state.playerInventory[productName]) {
      let inventory = this.state.playerInventory
      inventory[productName] += amount
      this.setState({inventory: inventory})
    } else if(amount > 0) {
      let inventory = this.state.playerInventory
      inventory[productName] = amount
      this.setState({inventory: inventory})
    } else {
      alert("invalid state");
    }
  }

  inGameView() {
    return (
      <Container>
        <Row id="header-row">
          <Col>
            <header><span role="img" aria-label="stylized 100">💯</span>/3 Dopewars</header>
            <header>Current City: {this.state.currentCity.name} </header>
          </Col>
            {this.nextCityDropdown()}
        </Row>
        <Row>
          <Col className="space-children">
            <header>Player View</header>
            <br/>
            <Button onClick={this.adjustMoneyCurry(1000)}>Add $1000</Button>
            <Button onClick={this.adjustMoneyCurry(-1000)}>Sub $1000</Button>
            <MoneyViewer money={this.state.money}/>
            <InventoryViewer inventory={this.state.playerInventory}/>
          </Col>
          <OfferViewer
            money={this.state.money}
            offers={this.state.offers}
            onPlayerBalanceChange={this.onPlayerBalanceChange}
            onPlayerInventoryChange={this.onPlayerInventoryChange}
            playerInventory={this.state.playerInventory} />
        </Row>
      </Container>
    );
  }

  gameOverView() {
    return (
      <Container>
        <Row id="header-row">
          <Col>
            <header><span role="img" aria-label="stylized 100">💯</span>/3 Dopewars</header>
            <header>Game Over</header>
            <header>You finished with ${this.state.money}</header>
          </Col>
        </Row>
      </Container>
    )
  }

  render() {
    return this.state.gameState === GAME_STATE_IN_PROGRESS ?
        this.inGameView() :
        this.gameOverView();
  }

  selectNextCity(nextCity) {
    if(this.state.gameState === GAME_STATE_IN_PROGRESS) {
      if(this.state.dayCount < this.gameLength()) {
        this.setState({
          dayCount: this.state.dayCount + 1,
          currentCity: nextCity,
          offers: this.shuffleOffers()
        });
      } else if(this.state.dayCount === this.gameLength()) {
        this.setState({gameState: GAME_STATE_OVER})
      }
    }
  }

  gameLength() {
    return this.props.maxDays;
  }

  nextCityDropdown() {
    return (
      <Col>
        <h3>Current Day: {this.state.dayCount} / {this.props.maxDays}</h3>
        <DropdownButton title="Select Next City">
          {this.state.availableCities.map(city =>
              <Dropdown.Item key={city.name} onSelect={() => this.selectNextCity(city)}>
                {city.name}
              </Dropdown.Item>
          )}
        </DropdownButton>
      </Col>
    );
  }
}

function App() {
  return (
    <div className="App">
      <Game startMoney={500} maxDays={10}/>
    </div>
  );
}

export default App;