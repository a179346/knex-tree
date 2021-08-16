<h1 align="center">knex-tree 👋</h1>
<p>
  <a href="https://github.com/a179346/knex-tree/actions/workflows/build.yml" target="_blank">
    <img alt="Documentation" src="https://github.com/a179346/knex-tree/actions/workflows/build.yml/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/knex-tree" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/npm/v/knex-tree?maxAge=3600)" />
  </a>
  <a href="https://github.com/a179346/knex-tree#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/a179346/knex-tree/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/a179346/knex-tree/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/a179346/knex-tree" />
  </a>
</p>

> Search hierarchical data structures in sql with knex

## 🔗 Link
+ [Github](https://github.com/a179346/knex-tree#readme)
+ [npm](https://www.npmjs.com/package/knex-tree)

## 📥 Install

```sh
npm install knex-tree
```

## 📖 Usage
- ### Example data
| id | parentId | desc |
|---|---|---|
| 1 | null | I am 1 |
| 2 | 1 | I am 2 |
| 3 | 1 | I am 3 |
| a | 2 | I am a |
| b | 2 | I am b |
- ### KnexTree
##### `KnexTree.Constructor()` => `KnexTree`
```js
const { KnexTree } = require('knex-tree');
const knex = require('knex');

const tree = new KnexTree({
  db: knex({ ... }),
  table: 'mytree',
  idColumn: 'id',
  parentIdColumn: 'parentId',
});
```
##### `KnexTree.node(id)` => `KnexNode`
```js
const node = tree.node(5);
```
##### `KnexTree.getAllData()` => `Promise<Model[]>`
```js
const data = await tree.getAllData();
```
- ### KnexNode
##### `KnexNode.id` => `id`
```js
const id = node.id;
```
##### `KnexNode.isExist()` => `Promise<boolean>`
```js
const isExist = await node.isExist();
```
##### `KnexNode.getData()` => `Promise<Model | null>`
```js
// data is null if the id doesn't exist in the table
const data = await node.getData();
```
##### `KnexNode.getParentData()` => `Promise<Model | null>`
```js
// data is null if parent dosen't exist in the table
const data = await node.getParentData();
```
##### `KnexNode.getChildrenData()` => `Promise<Model[] | null>`
```js
// data is null if no children
const data = await node.getChildrenData();
```
##### `KnexNode.isRoot()` => `Promise<boolean>`
```js
// return true if node is root
const data = await node.isRoot();
```
##### `KnexNode.getPath()` => `Promise<(Model & ITreeLv)[] | null>`
```js
// return the path from root to this node
const data = await node.getPath();
```
##### `KnexNode.hasChild(id)` => `Promise<Model | null>`
```js
// data is null if there is no data which match "id = 7" & "parentId = this.id"
const data = await node.hasChild(7);
```
##### `KnexNode.hasParent(id)` => `Promise<Model | null>`
```js
// data is null if there is no data which match "id = 7" & "hasChild(this.id)"
const data = await node.hasParent(7);
```
##### `KnexNode.hasAncestor(id, maxLevel?)` => `Promise<(Model & ITreeLv) | null>`
```js
// data is null if this is no ancestor whose id = 7
const data = await node.hasAncestor(7);
```
##### `KnexNode.hasDescendant(id, maxLevel?)` => `Promise<(Model & ITreeLv) | null>`
```js
// data is null if this is no descendant whose id = 7
const data = await node.hasDescendant(7);
```
##### `KnexNode.getPathUpTo(id, maxLevel?)` => `Promise<(Model & ITreeLv)[] | null>`
```js
// data is null if this is no ancestor whose id = 7
// return the path from this node to the ancestor(id = 7)
const data = await node.getPathUpTo(7);
```
##### `KnexNode.getPathDownTo(id, maxLevel?)` => `Promise<(Model & ITreeLv)[] | null>`
```js
// data is null if this is no descendant whose id = 7
// return the path from this node to the descendant(id = 7)
const data = await node.getPathDownTo(7);
```
##### `KnexNode.getDescendants(maxLevel?)` => `Promise<(Model & ITreeLv)[] | null>`
```js
// data is null if this.id doesn't exist
// return all descendants
let data = await node.getDescendants();

// return all descendants whose TreeLv <= 2
data = await node.getDescendants(2);
```

## 🙋‍♂️ Author


* Github: [@a179346](https://github.com/a179346)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/a179346/knex-tree/issues).

## 🌟 Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [a179346](https://github.com/a179346).<br />
This project is [MIT](https://github.com/a179346/knex-tree/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_