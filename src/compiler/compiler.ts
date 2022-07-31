/*--------------------------------------------------------------------------

@sinclair/esbuild-wasm-resolve

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import * as esbuild from 'esbuild-wasm'
import { Barrier } from '../async/index'
import { Path } from '../path/index'

export interface Resolver {
  resolve(path: string): Promise<string> | string
}

export interface CompilerOptions extends esbuild.InitializeOptions {}

export class Compiler {
  private readonly decoder: TextDecoder
  private readonly barrier: Barrier
  constructor(private readonly resolver: Resolver, private readonly options: CompilerOptions = { wasmURL: 'esbuild.wasm' }) {
    this.decoder = new TextDecoder()
    this.barrier = new Barrier(true)
    esbuild.initialize({ ...this.options }).then(() => this.barrier.resume())
  }

  public async compile(entryPoint: string, options: esbuild.BuildOptions = {}) {
    await this.barrier.wait()
    const result = await esbuild.build({
      entryPoints: [entryPoint.charAt(0) === '/' ? entryPoint.slice(1) : entryPoint],
      plugins: [
        {
          name: '@sinclair/esbuild-wasm-resolve',
          setup: (build) => {
            build.onResolve({ filter: /.*/ }, (args) => this.onResolveCallback(args))
            build.onLoad({ filter: /.*/ }, (args) => this.onLoadCallback(args))
          },
        },
      ],
      ...options,
      // required
      bundle: true,
      write: false,
    })
    const contents = result.outputFiles![0].contents
    return this.decoder.decode(contents)
  }

  private onResolveCallback(args: esbuild.OnResolveArgs) {
    if (args.kind === 'entry-point') {
      return { path: '/' + args.path }
    }
    if (args.kind === 'import-statement') {
      const dirname = Path.dirname(args.importer)
      const path = Path.join(dirname, args.path)
      return { path }
    }
    throw Error('not resolvable')
  }

  private async onLoadCallback(args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult> {
    const extname = Path.extname(args.path)
    const contents = await Promise.resolve(this.resolver.resolve(args.path))
    const loader = extname === '.ts' ? 'ts' : extname === '.tsx' ? 'tsx' : extname === '.js' ? 'js' : extname === '.jsx' ? 'jsx' : 'default'
    return { contents, loader }
  }
}
