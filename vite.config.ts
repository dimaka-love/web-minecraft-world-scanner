import { defineVitConfig } from '@zardoy/vit'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import { fileURLToPath } from 'url' // Import the 'fileURLToPath' function from the 'url' module
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineVitConfig({
    plugins: [
        react(),
        nodePolyfills({
            overrides: {
                fs: fileURLToPath(new URL('./shims/fs.ts', import.meta.url)),
            },
        }),
    ],
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'fix-mc-data',
                    setup(build) {
                        build.onLoad(
                            {
                                filter: /minecraft-data[\/\\]data.js$/,
                            },
                            args => {
                                const file = fs.readFileSync(fileURLToPath(new URL('./shims/mcData.js', import.meta.url)), 'utf8')
                                return { contents: file, loader: 'js' }
                            },
                        )
                    },
                },
                {
                    name: 'fix-fs',
                    setup(build) {
                        build.onLoad(
                            {
                                filter: /^fs$/,
                            },
                            args => {
                                const file = fs.readFileSync(fileURLToPath(new URL('./shims/fs.ts', import.meta.url)), 'utf8')
                                return { contents: file, loader: 'ts' }
                            },
                        )
                    },
                },
            ],
        },
    },
    resolve: {
        alias: {
            'fs/promises': './shims/fsPromises.ts',
            fs: './shims/fs.ts',
        },
    },
})
