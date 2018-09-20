let setAttribute = require('./setAttribute')
let patch = require('./patch')
let diff = require('./diff')
function _render( vnode ){
    if ( typeof vnode === 'number' ) {
        vnode = String( vnode );
    }
    //处理文本节点
    if( typeof vnode === 'string'){
        const textNode = document.createTextNode( vnode )
        return textNode;
    }
    //处理组件
    if ( typeof vnode.tag === 'function' ) {
        const component = createComponent( vnode.tag, vnode.attrs );
        setComponentProps( component, vnode.attrs );
        return component.base;
    }
    //普通的dom
    const dom = document.createElement( vnode.tag );
    if( vnode.attrs ){
        Object.keys( vnode.attrs ).forEach( key => {
            const value = vnode.attrs[ key ];
            setAttribute( dom, key, value );    // 设置属性
        } );
    }
    vnode.children.forEach( child => render( child, dom ) );    // 递归渲染子节点
    return dom ;    // 返回虚拟dom为真正的DOM
}

function render ( vnode, container ){
    return container.appendChild( _render( vnode ) );
}
//创建组件实例
function createComponent( component, props ) {
    let inst;
    // 如果是类定义组件，则直接返回实例
    if ( component.prototype && component.prototype.render ) {
        inst = new component( props );
    // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
        inst = new Component( props );
        inst.constructor = component;
        inst.render = function() {
            return this.constructor( props );
        }
    }
    return inst;
}

// 绑定props
function setComponentProps( component, props ) {
    if ( !component.base ) {//第一次渲染
        if ( component.componentWillMount ) {
            component.componentWillMount();
        }
    } else if ( component.componentWillReceiveProps ) {//不是第一次渲染
        component.componentWillReceiveProps( props );
    }
    component.props = props;
    renderComponent( component );
}
//组件渲染
function renderComponent( component ) {
    let base;
    const renderer = component.render();//拿到组件render后的虚拟dom
    
    //如果不是第一次啊渲染则触发componentWillUpdate
    if ( component.base && component.componentWillUpdate ) {
        component.componentWillUpdate();
    }
    //第一次虚拟dom变为真dom
    if( !component.base ){
        base = _render( renderer );
    }else{
        //下次更新对比前后的虚拟dom，更细相应的视图
        let _d = diff(component.preVnodeTree,renderer )
        base = patch( component.base,_d )
        
    }
    
    if ( component.base ) {//如果不是第一次啊渲染则触发componentDidUpdate
        if ( component.componentDidUpdate ) {
            component.componentDidUpdate();
        }
    } else if ( component.componentDidMount ) {//第一次渲染则触发componentDidMount
        component.componentDidMount();
    }
    component.preVnodeTree = renderer;//保存本次的虚拟dom，一边下次更新可以对比
    component.base = base;//保存本次的dom，以便下次在此基础上更新
    //base._component = component;
}

// React.Component
class Component {
    constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
    setState( stateChange ) {
        // 将修改合并到state
        Object.assign( this.state, stateChange );
        renderComponent( this );
    }
}

module.exports._render = _render;
module.exports.render = render;
module.exports.Component = Component;