
let render = require( './render' ).render
let renderComponent = require('./render').renderComponent;
let Component = require('./render').Component;
let diff = require('./diff')

function createElement( tag, attrs, ...children ) {
    return {
        tag,
        attrs,
        children
    }
}
// 将上文定义的createElement方法放到对象React中
const React = {
    createElement,
    Component
}

function Welcome( props ) {
    return <h1>Hello, {props.name}</h1>;
}

class Welcome2 extends React.Component {
    render() {
        return <h1>Hello-Component2, {this.props.name}</h1>;
    }
}


const ReactDOM = {
    render: ( vnode, container ) => {
        container.innerHTML = '';
        return render( vnode, container );
    }
}
ReactDOM.render(
    <div>
        <Welcome name="Sara" />
        <Welcome name="Cahal" />
        <Welcome2 name="Edite" />
    </div>,
    document.getElementById('root')
);

class Counter extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            num: 0
        }
    }
    componentWillUpdate() {
        console.log( 'update' );
    }

    componentWillMount() {
        console.log( 'mount' );
    }

    onClick() {
        this.setState( { num: this.state.num + 1 } );
    }

    render() {
        return (
            <div onClick={ this.onClick.bind(this) }>
                <h1>number: {this.state.num}</h1>
                <button>add</button>
            </div>
        );
    }
}

ReactDOM.render(
    <Counter />,
    document.getElementById( 'main' )
);


//test diff

var d1 = (
    <div>
        <h1>123</h1>
        <span>r</span>
    </div>
)
var d2 = (
    <div>
        <h1>456</h1>
        <p>r</p>
    </div>
)

var a = diff( d1,d2)
console.log( a )

