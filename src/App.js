import React from 'react';
import Login from './views/Login';

class App extends React.Component {
    render () {
        return (
            <div>
                {/*<HeaderBar/>*/}
                {/*<main style={mainStyles}>*/}
                {/*    {this.props.children}*/}
                {/*</main>*/}
                {/*<FooterBar/>*/}
                <Login/>
            </div>
        )
    }
}
export default App
