import React from 'react';
import Login from './views/Login';
import util from '@/src/assets/js/util'
console.log(util.goPage)

class App extends React.Component {
    render () {
        return (
            <div>
                <Login/>
            </div>
        )
    }
}
export default App
