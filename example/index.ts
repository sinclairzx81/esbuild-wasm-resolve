import { Compiler, Resolver } from '@sinclair/esbuild-wasm-resolve'

// ----------------------------------------------------------
// FileSystem
// ----------------------------------------------------------

const filesystem = new Map<string, string>()
filesystem.set(
  '/logger.ts',
  `
    export class Logger {
        public log(...args: any[]) { console.log(...args) }
    }
`,
)
filesystem.set(
  '/database.ts',
  `
    export class Database {
        public get(): string { return '1' }
    }
`,
)
filesystem.set(
  '/server.ts',
  `
    import { Database } from './database.ts'
    import { Logger } from './logger.ts'

    export class Server {
        constructor(
            private readonly database: Database,
            private readonly logger: Logger
        ) {}

        public async listen(port: number) {}
    }
`,
)
filesystem.set(
  '/index.ts',
  `
    import { Database } from './database.ts'
    import { Server } from './server.ts'
    import { Logger } from './logger.ts'
    const server = new Server(
        new Database(),
        new Logger()
    )
    await server.listen(1337)
`,
)

// ----------------------------------------------------------
// Resolver
// ----------------------------------------------------------

export class MemoryResolver implements Resolver {
  constructor(private readonly filesystem: Map<string, string>) {}
  public resolve(path: string) {
    if (!this.filesystem.has(path)) throw Error(`${path} not found`)
    return this.filesystem.get(path)!
  }
}

// ----------------------------------------------------------
// Compiler
// ----------------------------------------------------------

const resolver = new MemoryResolver(filesystem)
const compiler = new Compiler(resolver, { wasmURL: 'esbuild.wasm' })
const code = await compiler.compile('/index.ts', { format: 'esm' })
console.log(code)
