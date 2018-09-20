/* 根据diff得出不同的虚拟dom，根据改变的虚拟dom更新相应的真是dom节点 */

var _render = require('./render')._render
var setAttribute = require('./setAttribute')

const _ = {}
_.each = function each (array, fn) {
    for (var i = 0, len = array.length; i < len; i++) {
        fn(array[i], i)
    }
}

var REPLACE = 0//替换
var REORDER = 1//换顺序。目前未实现
var PROPS = 2//props变化，属性变化
var TEXT = 3//文本变化

/**
 * 
 * @param {dom} node 真实的dom节点
 * @param {vnode修改记录} patches 虚拟dom的修改记录
 */
function patch (node, patches) {
    var walker = {index: 0}
    dfsWalk(node, walker, patches)
    return node;
}

/**
 * 
 * @param {dom} node 
 * @param {当前节点标志} walker 
 * @param {vnode修改记录} patches 
 */
function dfsWalk (node, walker, patches) {
    //找到当前节点对应的修改记录
    var currentPatches = patches[walker.index]

    //遍历子节点
    var len = node.childNodes
        ? node.childNodes.length
        : 0
    for (var i = 0; i < len; i++) {
        var child = node.childNodes[i]
        walker.index++
        dfsWalk(child, walker, patches)
    }
    //将当前节点的修改记录进行真是的dom修改
    if (currentPatches) {
        applyPatches(node, currentPatches)
    }
}
  
function applyPatches (node, currentPatches) {
    _.each(currentPatches, function (currentPatch) {
        switch (currentPatch.type) {
        /**
         * 节点替换，
         * 非文本变成文本      直接新建文本节点
         * 元素节点变元素节点   非文本节点
         */
        case REPLACE:
            var newNode = (typeof currentPatch.node === 'string')
            ? document.createTextNode(currentPatch.node)
            : _render(currentPatch.node)
            node.parentNode.replaceChild(newNode, node)
            break
        /**
         * pros（attrs）修改
         */
        case PROPS:
            setProps(node, currentPatch.props)
            break
        /**
         * 文本节点不同直接替换文本
         */
        case TEXT:
            if (node.textContent) {
                node.textContent = currentPatch.content
            } else {
                // fuck ie
                node.nodeValue = currentPatch.content
            }
            break
        default:
            throw new Error('Unknown patch type ' + currentPatch.type)
        }
    })
    return node;
}
  
function setProps (node, props) {
    for (var key in props) {
        if (props[key] === void 666) {
            node.removeAttribute(key)
        } else {
            var value = props[key]
            setAttribute(node, key, value)
        }
    }
}
module.exports = patch;
