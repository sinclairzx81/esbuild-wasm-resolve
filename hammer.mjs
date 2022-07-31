import { readFileSync } from 'fs'

export async function clean() {
    await folder('target').delete()
}

export async function format() {
    await shell('prettier --no-semi --single-quote --print-width 240 --trailing-comma all --write src example')
}

export async function start(target = 'target/example') {
    await shell(`hammer serve example/index.html --dist ${target}`)
}

export async function build(target = 'target/build') {
    await shell(`tsc -p src/tsconfig.json --outDir ${target}`)
    await folder(target).add('package.json')
    await folder(target).add('readme.md')
    await folder(target).add('license')
    await shell(`cd ${target} && npm pack`)
}

export async function publish(otp, target = 'target/build') {
    const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
    await shell(`cd ${target} && npm publish sinclair-esbuild-wasm-resolve-${version}.tgz --access=public --otp ${otp}`)
    await shell(`git tag ${version}`)
    await shell(`git push origin ${version}`)
}