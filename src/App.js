import React from 'react';
import Login from './views/Login';
import LoginWithSms from './views/LoginWithSms';
import BeautyList from './views/BeautyList';
import BeautyRanking from './views/BeautyRanking';
import BeautyVideoPlaying from './views/BeautyVideoPlaying';
import BeautyChatList from './views/BeautyChatList';
import BeautyCustomInfo from './views/BeautyCustomInfo';
import {BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

class App extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/login" component={Login}/>
                    <Route path="/loginWithSms" component={LoginWithSms}/>
                    <Route path="/beautyList" component={BeautyList}/>
                    <Redirect exact from="/" to="/beautyList"/>
                    <Route exact path="/beautyRanking" component={BeautyRanking}/>
                    <Route exact path="/beautyVideoPlaying" component={BeautyVideoPlaying}/>
                    <Route exact path="/beautyChatList" component={BeautyChatList}/>
                    <Route exact path="/beautyCustomInfo" component={BeautyCustomInfo}/>
                </Switch>
            </Router>
        )
    }
}

export default App
