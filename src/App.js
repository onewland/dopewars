import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import './App.css';

class MoneyViewer extends React.Component {
  render() {
    return <span id="moneyDisplay">Current Cash: ${this.props.money}</span>
  }
}

class OfferViewer extends React.Component {
  constructor(props) {
    super(props);

    let offerQuantities = this.emptyOfferQuantities();

    this.state = {offerQuantities: offerQuantities}
  }

  emptyOfferQuantities() {
    let offerQuantities = {};

    this.props.offers.forEach(offer =>
      { offerQuantities[offer.productName] = { buy: 0, sell: 0 }; }
    );
    return offerQuantities;
  }

  resetOfferQuantities() {
    this.setState({...this.state, offerQuantities: this.emptyOfferQuantities()})
  }

  attemptPurchase(offer, quantity) {
    console.log(this.state)

    const attemptPurchaseQuantity = quantity == null ?
      this.state.offerQuantities[offer.productName]['buy'] :
      quantity;
    const totalPurchaseCost = offer.price * attemptPurchaseQuantity;

    if(this.props.money >= totalPurchaseCost) {
      this.props.onPlayerBalanceChange(this.props.money - totalPurchaseCost);
      this.props.onPlayerInventoryChange(offer.productName, attemptPurchaseQuantity);
      this.resetOfferQuantities()
    }
  }

  attemptSale(offer, quantity) {
    const attemptSaleQuantity = quantity == null ?
      this.state.offerQuantities[offer.productName]['sell'] :
      quantity;
    const totalSaleAmount = attemptSaleQuantity * offer.price
    const count = this.props.playerInventory[offer.productName]

    if(count >= attemptSaleQuantity) {
      this.props.onPlayerBalanceChange(this.props.money + totalSaleAmount);
      this.props.onPlayerInventoryChange(offer.productName, -attemptSaleQuantity);
      this.resetOfferQuantities()
    }
  }

  maxPurchase(offer) {
    const playerCash = this.props.money;
    return Math.floor(playerCash/offer.price);
  }


  maxSale(offer) {
    // const playerQuantity = ;
    return this.props.playerInventory[offer.productName] || 0;
  }

  maxPurchaseButton(offer) {
    return (
      <Button
        data-product={offer.productName}
        onClick={() => this.attemptPurchase(offer)}
        variant="warning">
        Buy Max: {this.maxPurchase(offer)}
      </Button>
    );
  }

  offerList() {
    return this.props.offers.map(offer =>
      <React.Fragment>
        <tr key={offer.productName + "-adjustable"}>
          <td>{offer.productName}</td>
          <td>{offer.price}</td>
          <td>
            <Form.Control
                data-offer-type="buy"
                data-product={offer.productName}
                onChange={(evt) => this.adjustOfferQuantity(evt)}
                type="number"
                value={this.state.offerQuantities[offer.productName]['buy']}
                placeholder="# Buy"/>
          </td>
          <td>
            <Button data-product={offer.productName}
                    onClick={() => this.attemptPurchase(offer)}>
              Buy {this.state.offerQuantities[offer.productName]['buy']}
            </Button>
          </td>
          <td>
            <Form.Control
              data-offer-type="sell"
              data-product={offer.productName}
              onChange={(evt) => this.adjustOfferQuantity(evt)}
              type="number"
              value={this.state.offerQuantities[offer.productName]['sell']}
              placeholder="# Sell"/>
          </td>
          <td>
            <Button data-product={offer.productName}
                    onClick={() => this.attemptSale(offer)}>
              Sell {this.state.offerQuantities[offer.productName]['sell']}
            </Button>
          </td>
        </tr>
        <tr key={offer.productName + "-fixed"}>
          <td>{/* name column */}</td>
          <td>{/* individual price column */}</td>
          <td>{/* purchase quantity selector column */}</td>
          <td>
            <Button
              data-product={offer.productName}
              onClick={() => this.attemptPurchase(offer, this.maxPurchase(offer))}
              variant="warning">
                Buy Max: {this.maxPurchase(offer)}
            </Button>
          </td>
          <td>{/* sale quantity selector column */}</td>
          <td>
            <Button data-product={offer.productName}
                    onClick={() => this.attemptSale(offer, this.maxSale(offer))}
                    variant="warning">
              Sell Max: {this.maxSale(offer)}
            </Button>
          </td>
        </tr>
      </React.Fragment>
    );
  }

  adjustOfferQuantity(evt) {
    console.log('change')
    const input = evt.target;
    const productName = input.getAttribute("data-product");
    const offerType = input.getAttribute("data-offer-type");

    const oldState = this.state
    oldState.offerQuantities[productName][offerType] = input.value

    console.log('parseIntOut');
    console.log(parseInt(input.value));

    this.setState({...this.state,
      offerQuantities: {
        ...this.state.offerQuantities,
        [productName]: {
          ...this.state.offerQuantities[productName],
          [offerType]: parseInt(input.value)
        }
      }
    });
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

const gameOverConditions = {
  HitDayLimit: {
    GameOverMessage: 'You survived.'
  },
  CopEncounter: {
    GameOverMessage: 'You got busted by the cops!'
  },
  QuitTheGame: {
    GameOverMessage: 'It\'s time for a new life.'
  }
}

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
    this.quitGame = this.quitGame.bind(this);
  }

  shuffleOffers() {
    return offersBase.map(offerBase => {
      // choose a price between 0.5x and 2.5x the base, even probability of distributon
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
            {this.gameAdvanceOptions()}
        </Row>
        <Row>
          <Col className="space-children">
            <header>Player View</header>
            <br/>
            <MoneyViewer money={this.state.money}/>
            <InventoryViewer inventory={this.state.playerInventory}/>
          </Col>
        </Row>
        <Row>
          <OfferViewer
            money={this.state.money}
            offers={this.state.offers}
            onPlayerBalanceChange={this.onPlayerBalanceChange}
            onPlayerInventoryChange={this.onPlayerInventoryChange}
            playerInventory={this.state.playerInventory} />
        </Row>
        <hr/>
        <Row>
          <Col className="col-6">
            <header>Debug Stuff</header>
            <br/>
            <Button onClick={this.adjustMoneyCurry(1000)} className="m-3">Add $1000</Button>
            <Button onClick={this.adjustMoneyCurry(-1000)} className="m-3">Sub $1000</Button>
          </Col>
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
            <header>{this.state.gameOverCondition.GameOverMessage}</header>
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
        this.transitionCity(nextCity);
      } else if(this.state.dayCount === this.gameLength()) {
        this.setState({
          gameState: GAME_STATE_OVER,
          gameOverCondition: gameOverConditions.HitDayLimit
        })
      }
    }
  }

  transitionCity(nextCity) {
    let copEncounter = Math.random() < 0.1;

    if(copEncounter) {
      this.setState({
        gameState: GAME_STATE_OVER,
        gameOverCondition: gameOverConditions.CopEncounter
      });
    }

    this.setState({
      dayCount: this.state.dayCount + 1,
      currentCity: nextCity,
      offers: this.shuffleOffers()
    });
  }

  gameLength() {
    return this.props.maxDays;
  }

  quitGame() {
    this.setState({
      gameState: GAME_STATE_OVER,
      gameOverCondition: gameOverConditions.QuitTheGame
    })
  }

  gameAdvanceOptions() {
    return (
      <Col>
        <h3>Current Day: {this.state.dayCount} / {this.props.maxDays}</h3>
        <ButtonGroup className="mb-3">
          <DropdownButton title="Select Next City">
            {this.state.availableCities.map(city =>
                <Dropdown.Item key={city.name} onSelect={() => this.selectNextCity(city)}>
                  {city.name}
                </Dropdown.Item>
            )}
          </DropdownButton>
          <Button variant="warning" onClick={this.quitGame}>Quit the Game</Button>
        </ButtonGroup>
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