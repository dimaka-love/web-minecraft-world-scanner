/// <reference types="@zardoy/vit/twin-sc" />
/// <reference types="vite/client" />
/// <reference types="@types/wicg-file-system-access" />

import { renderToDom } from '@zardoy/react-util'
import App from './App'
import './globals.css'
import 'tailwindcss/tailwind.css'

renderToDom(<App />, {
    strictMode: false,
})
