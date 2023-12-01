import React from 'react';
import MainPage from './mainPage';
import WelcomePage from './Welcome';

export default class FakeStackOverflow extends React.Component {
  render() {
    return (
    <div>
      <WelcomePage />
    </div>
  );
  }
}
