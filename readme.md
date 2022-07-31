<div align='center'>

<h1>esbuild-wasm-resolve</h1>

<p>File Resolution for Esbuild running in the Browser</p>

<pre>
          import { App } from './index.ts'            

┌──────────────┐                      ┌──────────────┐
│              │ ─── '/index.ts' ───> │              │
│ esbuild-wasm │                      │   resolver   │
│              │ <───── [code] ────── │              │
└──────────────┘                      └──────────────┘
</pre>

<br />
<br />

[![npm version](https://badge.fury.io/js/%40sinclair%2Fesbuild-wasm-resolve.svg)](https://badge.fury.io/js/%40sinclair%2Fesbuild-wasm-resolve)

</div>


## Overview

esbuild-wasm-resolve is a file resolver for esbuild-wasm. Due to Web Browsers do not having direct access to a file system, esbuild-wasm-resolve intercepts file `read` requests made by esbuild during compilation allowing applications to resolve files externally. With this mechanism, esbuild can resolve files from IndexedDB, LocalStorage, Http or any other readable device accessible to the browser.

esbuild-wasm-resolve is primarily made with editors in mind. It is offered as is to anyone who may find it of use.

License MIT

## Install

```bash
$ npm install @sinclair/esbuild-wasm-resolve
```


## Usage

The following shows general usage.

```typescript
import { Compiler } from '@sinclair/esbuild-wasm-resolve'

const compiler = new Compiler({
    
    resolve: path => fetch('http://localhost:5000' + path).then(res => res.text())

}, { wasmURL: 'esbuild.wasm' })

const code = await compiler.compile('/index.ts', { format: 'esm' })
//
//                                   ^ http://localhost:5000/index.ts

console.log(code)
```

Refer to the example [here](https://github.com/sinclairzx81/esbuild-wasm-resolve/tree/main/example) for additional usage.