import React from 'react';
import { render } from 'react-dom';
import Upload from './components/upload.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'

function App() {
  const commonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    minHeight: '600px',
    backgroundColor: '#9BC3EB',
    backgroundSize: 'cover',
  };
  return (
    <div className="App" style={commonStyle}>
      <Router>
        <Switch>
          <Route exact path="/" component={Upload}/>
        </Switch>
    </Router>
    </div>
  );
}

export default App;
