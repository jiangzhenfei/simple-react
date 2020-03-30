rrrrr

## React.createElement('div', elementA.props);的调用过程

#### React.createElement 调用 createElement

#### createElement
  element = createElement.apply(this, arguments); [ReactElementValidator.js 444]   实际上是createElement方法，在[ReactElement.js 348]文件定义
  接着调用ReactElement
  
#### ReactElement [ReactElement.js 147] 
返回一个element 
```js
_owner:null
_self:null
_source:null
_store:Object {validated: false}
$$typeof:60103
key:null
props:Object {}
ref:null
type:"div"
```
====================





    
