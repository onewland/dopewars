import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './App.css';

class MoneyViewer extends React.Component {
  render() {
    return <span id="moneyDisplay">${this.props.money}</span>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {money: props.startMoney};
    this.adjustMoneyCurry = this.adjustMoneyCurry.bind(this);
  }

  adjustMoneyCurry(amount) {
    return () => this.setState({money: this.state.money + amount})
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <header>💯/3 Dopewars</header>
          </Col>
        </Row>
        <Row>
          <Col className="space-children">
            <header>Money</header>
            <br/>
            <Button onClick={this.adjustMoneyCurry(10)}>Increment</Button>
            <Button onClick={this.adjustMoneyCurry(-10)}>Decrement</Button>
            <MoneyViewer money={this.state.money}/>
          </Col>
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