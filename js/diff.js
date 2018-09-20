var REPLACE = 0
var REORDER = 1
var PROPS = 2
var TEXT = 3
const patch = {}

patch.REPLACE = REPLACE
//节点重新排序问题，目前为了简便没实现，var listDiff = require('list-diff2')
//可以借助其他算法来求，有兴趣参照 https://github.com/livoras/list-diff/blob/master/lib/diff.js
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT


function diff( oldTree,newTree ){
    var walker = {index: 0} // 当前节点的标志
    var patches = {} // 用来记录每个节点差异的对象
    dfsWalk(oldTree, newTree, walker, patches)
    return patches
}

function dfsWalk (oldNode, newNode, walker, patches) {
    var currentPatch = []
    let index = walker.index
    // Node is removed.
    if (newNode === null) {
    //节点是字符串类型，
    } else if ((typeof oldNode === 'string' && typeof oldNode === 'string') || typeof oldNode === 'number' && typeof oldNode === 'number') {
        if (newNode !== oldNode) {
            currentPatch.push({ type: patch.TEXT, content: String(newNode) })
        }
    // 节点相同，属性和子元素可能不同
    } else if (
        oldNode.tag === newNode.tag &&
        oldNode.key === newNode.key
    ) {
      // 属性attrs不同
        var propsPatches = diffProps(oldNode, newNode)
        
        if (propsPatches) {
            console.log( walker,propsPatches )
            currentPatch.push({ type: patch.PROPS, props: propsPatches })
        }
        //如果节点相同，则继续比较子节点
        diffChildren( oldNode.children, newNode.children, walker, patches )
    // 节点不同
    } else {
        currentPatch.push({ type: patch.REPLACE, node: newNode })
    }
    if (currentPatch.length) {
        patches[index] = currentPatch
    }
}

//遍历子节点
function diffChildren (oldChildren, newChildren, walker, patches) {
    oldChildren  = oldChildren || []
    oldChildren.forEach(function (child, i) {
        var newChild = newChildren[i]
        walker.index++
        dfsWalk(child, newChild, walker, patches) // 深度遍历子节点
    })
}

//判断attrs是否相同
//目前的缺陷是两个相同的函数被认为是不同的
function diffProps (oldNode, newNode) {
    var count = 0
    var oldProps = oldNode.attrs || {}
    var newProps = newNode.attrs || {}
    var key, value
    var propsPatches = {}
    // Find out different properties
    for (key in oldProps) {
        value = oldProps[key]
        if (newProps[key] !== value) {
        count++
        propsPatches[key] = newProps[key]
        }
    }
    // Find out new property
    for (key in newProps) {
        value = newProps[key]
        if (!oldProps.hasOwnProperty(key)) {
        count++
        propsPatches[key] = newProps[key]
        }
    }
    // If properties all are identical
    if (count === 0) {
        return null
    }
    return propsPatches
}

module.exports = diff;