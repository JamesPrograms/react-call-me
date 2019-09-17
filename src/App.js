import React from 'react';
import Login from './views/Login';
import LoginWithSms from './views/LoginWithSms';
// import util from 'assets/js/util'
import {Switch, Route, BrowserRouter, Redirect} from 'react-router-dom'

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    {/*<Route exact path="/" component={Index}/>*/}
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/loginWithSms" component={LoginWithSms}/>
                    {/*<Redirect from="*" to="/"/>*/}
                </Switch>
            </BrowserRouter>
        )
    }
}

export default App
