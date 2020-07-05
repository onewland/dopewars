import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

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
    return Object.entries(this.props.inventory).map(entry => {
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


class Game extends React.Component {
  constructor(props) {
    super(props);

    let offers = [
      {
        productName: 'weed',
        price: 100
      },
      {
        productName: 'coke', 
        price: 200
      }
    ];

    this.state = {money: props.startMoney, offers: offers, playerInventory: {}};
    this.adjustMoneyCurry = this.adjustMoneyCurry.bind(this);
    this.onPlayerBalanceChange = this.onPlayerBalanceChange.bind(this);
    this.onPlayerInventoryChange = this.onPlayerInventoryChange.bind(this);
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

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <header><span role="img" aria-label="stylized 100">💯</span>/3 Dopewars</header>
          </Col>
        </Row>
        <Row>
          <Col className="space-children">
            <header>Player View</header>
            <br/>
            <Button onClick={this.adjustMoneyCurry(100)}>Add $100</Button>
            <Button onClick={this.adjustMoneyCurry(-100)}>Sub $100</Button>
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
}

function App() {
  return (
    <div className="App">
      <Game startMoney={100}/>
    </div>
  );
}

export default App;