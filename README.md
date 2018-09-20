# simple-react
### 启动
下载最近火热的零配置打包工具parcel
```node
npm install -g parcel-bundler
```
然后下支持jsx语法插件依赖
```node 
npm install
```
接着执行以下代码打开localhost:1234
```node
parcel index.html
```
### commit 584551e069e53606dc1ed753ae5c5aa7c2fd129c
1.本次提交只是实现react从虚拟dom转真是dom

2.组件的渲染，

3.更细你的思路是整个dom重新渲染，性能很差，没有加入diff算法和局部更新

### commit 03b5a844742537bbc9a08a5bb26cef301632f8a2
#### diff.js
主要实现变化前后虚拟dom的变更记录，返回虚拟dom变更记录
#### patch.js
主要是根据虚拟dom的变更记录，来更新真实的dom，局部更新
#### render.js
实现虚拟dom到真实dom，实现组件的渲染和更新
#### setAttribute.js
实现自定义属性的绑定和方法的绑定
