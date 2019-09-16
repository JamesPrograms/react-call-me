import React from 'react';
import Login from './views/Login';
// import util from 'assets/js/util'
import {Switch, Route, BrowserRouter, Redirect} from 'react-router-dom'

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    {/*<Route exact path="/" component={Index}/>*/}
                    <Route exact path="/login" component={Login}/>
                    {/*<Redirect from="*" to="/"/>*/}
                </Switch>
            </BrowserRouter>
        )
    }
}

export default App
