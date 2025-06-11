import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'

export default defineConfig({
    html: {
        template: './index.html',
    },
    output: {
        polyfill: 'usage',
        // sourceMap: {
        //     js: envs.isDev ? 'cheap-module-source-map' : 'source-map',
        //     css: true,
        // },
    },
    source: {
        entry: {
            index: './src/index.tsx',
        },
        define: {
            'import.meta.env.VITE_NAME': JSON.stringify('Minecraft World Scanner'),
        },
    },
    dev: {
        progressBar: true,
        writeToDisk: true
    },
    server: {
        // strictPort: true,
    },
    plugins: [
        pluginReact(),
        pluginNodePolyfill(),
    ],
})
