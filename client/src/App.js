import React from 'react';
import logo from './logo.svg';
import './App.css';

//React use port '4000' (Proxy)
//Main Nodejs  Server port '3000'
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {apiResponse: ""};
  }

  callAPI() {
    //react application will talk to this api url (node server)
    fetch("/react-test")
        .then(res => res.text())
        .then(res => this.setState({apiResponse: res}))
  }
  componentWillMount() {
    this.callAPI();
  }

  // will mount with lifecycle
  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {/*<p> </p>*/}
          {/*<a*/}
          {/*  className="App-link"*/}
          {/*  href="https://reactjs.org"*/}
          {/*  target="_blank"*/}
          {/*  rel="noopener noreferrer"*/}
          {/*>*/}
          {/*  Learn React*/}
          {/*</a>*/}
        </header>
        <p>{this.state.apiResponse}</p>
      </div>
    );
  }
}
export default App;
