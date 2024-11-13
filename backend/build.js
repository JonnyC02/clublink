import { build } from 'esbuild'

build({
    entryPoints: ['./dist/index.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: './build/bundle.js',
    minify: true
}).catch(() => process.exit(1))