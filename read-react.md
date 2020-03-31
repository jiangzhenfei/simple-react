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

## 测试用例二
```jsx
class Component extends React.Component {
  render() {
    return React.createElement('span');
  }
}
Component.defaultProps = {fruit: 'persimmon'};

const container = document.createElement('div');
const instance = ReactDOM.render(
  React.createElement(Component, {fruit: 'mango'}),
  container,
);
```
#### ReactDOM.render 调用render
render [ReactDOMLegacy.js 287]
```
render(
  element: React$Element<any>,
  container: Container,
  callback: ?Function,
){
....
  return legacyRenderSubtreeIntoContainer(
    null,
    /**
      _owner:null
      _self:null
      _source:null
      _store:Object {validated: false}
      $$typeof:60103
      key:null
      props:Object {fruit: "mango"}
      ref:null
      type:class Component extends React.Compone
    **/
    element,
    container,
    false,
    callback,
  );
}

```

#### legacyRenderSubtreeIntoContainer [ReactDOMLegacy.js 175]
```js
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>, // null
   // {_owner:null,_self:null,_source:null,_store:Object {validated: false},$$typeof:60103,key:null,props:Object {fruit: "mango"},ref:null,type:class Component extends React.Compone}
  children: ReactNodeList,      
  
  container: Container,  // 真实的dom
  forceHydrate: boolean, // false
  callback: ?Function,   // undefined
) {
  let root: RootType = (container._reactRootContainer: any); // 第一次肯定undefined
  let fiberRoot;
  
  if (!root) {
    // 调用了 legacyCreateRootFromDOMContainer 这个函数下面介绍了,下面一整个流程都在创建fiberRoot
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
    
    // Initial mount should not be batched.
    // unbatchedUpdates[ReactFiberWorkLoop.js 1128]
    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback); // 会有单独讲updateContainer
    });
  }

}
```
## legacyCreateRootFromDOMContainer 的调用流程
legacyCreateRootFromDOMContainer [ReactDOMLegacy.js 113] 
根据 shouldHydrate 为false，不是服务端渲染，情况内部所有的子元素，然后调用 createLegacyRoot [ReactDOMRoot.js 162]
```
return createLegacyRoot(
    container,     // dom
    shouldHydrate  // undefined
      ? {
          hydrate: true,
        }
      : undefined,
  );
  function createLegacyRoot(container,undefined){
    // 此处 LegacyRoot = 0;
    return new ReactDOMBlockingRoot(container, LegacyRoot, options);
  }
  
  function ReactDOMBlockingRoot(
    container: Container,
    tag: RootTag,
    options: void | RootOptions,
  ) {
    this._internalRoot = createRootImpl(container, tag, options); // 指向 FiberRoot
  }
  
  function createRootImpl(
    container: Container,
    tag: RootTag,
    options: void | RootOptions,
  ) {
    // tag是0 后面两个参数一个是false, 一个是null 不需要管
    const root = createContainer(container, tag, hydrate, hydrationCallbacks);
    //----> internalContainerInstanceKey = '__reactContainer$' + randomKey; container[internalContainerInstanceKey] = root.current; 
    markContainerAsRoot(root.current, container); 
  }
  
  function createContainer(
      containerInfo: Container,
      tag: RootTag,
      hydrate: boolean,
      hydrationCallbacks: null | SuspenseHydrationCallbacks,
  ): OpaqueRoot {
    return createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks); // [ReactFiberRoot.js 145]
  }
  
  function createFiberRoot(
    containerInfo: any,
    tag: RootTag,
    hydrate: boolean,
    hydrationCallbacks: null | SuspenseHydrationCallbacks,
  ): FiberRoot {
      /*  FiberRoot ----->new FiberRootNode
      firstPendingTime:0
      firstSuspendedTime:0
      hydrate:false
      interactionThreadID:1
      lastExpiredTime:0
      lastPendingTime:0
      lastPingedTime:0
      lastSuspendedTime:0
      memoizedInteractions:Set(0) {}
      mutableSourcePendingUpdateTime:0
      nextKnownPendingLevel:0
      pendingChildren:null
      pendingContext:null
      pendingInteractionMap:Map(0) {}
      pingCache:null
      tag:0
      timeoutHandle:-1
      */
    const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any);
    if (enableSuspenseCallback) {
      root.hydrationCallbacks = hydrationCallbacks;
    }

    // createHostRootFiber ->
    
    
    const uninitializedFiber = createHostRootFiber(tag); 
    root.current = uninitializedFiber; // FiberRoot 的current指向 RootFiber
    uninitializedFiber.stateNode = root;

    initializeUpdateQueue(uninitializedFiber); // fiber.updateQueue = queue;
    /*queue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
        pending: null,
      },
      effects: null,
    }
    */

    return root;
  }
  // const LegacyRoot = 0;
  // const BlockingRoot = 1;
  // const ConcurrentRoot = 2;
  
  function createHostRootFiber(tag) {
    let mode;
    // ConcurrentRoot 2
    if (tag === ConcurrentRoot) {
      mode = ConcurrentMode | BlockingMode | StrictMode;
    // BlockingRoot 1
    } else if (tag === BlockingRoot) {
      mode = BlockingMode | StrictMode;
    } else {
    /*
    export type TypeOfMode = number;
    export const NoMode = 0b0000;
    export const StrictMode = 0b0001;
    export const BlockingMode = 0b0010;
    export const ConcurrentMode = 0b0100;
    export const ProfileMode = 0b1000;
    */
      mode = NoMode;
    }
    // hostRoot 3     mode 0
    return createFiber(HostRoot, null, null, mode); ----> new FiberNode(tag, pendingProps, key, mode) 
  }
  
  function FiberNode(
    tag: WorkTag,
    pendingProps: mixed,
    key: null | string,
    mode: TypeOfMode,
  ) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;

    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.ref = null;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;

    this.mode = mode;

    // Effects
    this.effectTag = NoEffect;
    this.nextEffect = null;

    this.firstEffect = null;
    this.lastEffect = null;

    this.expirationTime = NoWork;
    this.childExpirationTime = NoWork;

    this.alternate = null;

    if (enableProfilerTimer) {
      // Note: The following is done to avoid a v8 performance cliff.
      //
      // Initializing the fields below to smis and later updating them with
      // double values will cause Fibers to end up having separate shapes.
      // This behavior/bug has something to do with Object.preventExtension().
      // Fortunately this only impacts DEV builds.
      // Unfortunately it makes React unusably slow for some applications.
      // To work around this, initialize the fields below with doubles.
      //
      // Learn more about this here:
      // https://github.com/facebook/react/issues/14365
      // https://bugs.chromium.org/p/v8/issues/detail?id=8538
      this.actualDuration = Number.NaN;
      this.actualStartTime = Number.NaN;
      this.selfBaseDuration = Number.NaN;
      this.treeBaseDuration = Number.NaN;

      // It's okay to replace the initial doubles with smis after initialization.
      // This won't trigger the performance cliff mentioned above,
      // and it simplifies other profiler code (including DevTools).
      this.actualDuration = 0;
      this.actualStartTime = -1;
      this.selfBaseDuration = 0;
      this.treeBaseDuration = 0;
    }

    // This is normally DEV-only except www when it adds listeners.
    // TODO: remove the User Timing integration in favor of Root Events.
    if (enableUserTimingAPI) {
      this._debugID = debugCounter++;
      this._debugIsCurrentlyTiming = false;
    }

  }

```

## unbatchedUpdates 
```
function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  // const BatchedContext = /*               */ 0b000001;
  // const LegacyUnbatchedContext = /*       */ 0b001000;
  const prevExecutionContext = executionContext;
  executionContext &= ~BatchedContext;
  executionContext |= LegacyUnbatchedContext; // 8 
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      flushSyncCallbackQueue();
    }
  }
}
```

## updateContainer

```
function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot, // fiberRoot updateContainer(children, fiberRoot, parentComponent, callback);
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  
  const current = container.current;
  const currentTime = requestCurrentTimeForUpdate(); // Sync 最大32为整数（1073741821） MAGIC_NUMBER_OFFSET = Sync-1 1073741822
  
  // 在初次渲染并不足知道干啥 初次为null
  const suspenseConfig = requestCurrentSuspenseConfig();
  
  //
  const expirationTime = computeExpirationForFiber(
    currentTime,    // 1073741822
    current,        // rootFiber
    suspenseConfig, // null 
  );
  /*
    callback:null
    expirationTime:1073741823
    next:null
    payload:null
    priority:97
    suspenseConfig:null
    tag:0
   */
   
  const update = createUpdate(expirationTime, suspenseConfig);
  
  enqueueUpdate(current, update); // 创建循环引用
  
  scheduleUpdateOnFiber(current, expirationTime);
  
}
```








    
