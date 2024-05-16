import React, { type ReactElement } from 'react'
import { Animator } from '@arwes/react-animator'
import { Puffs, Dots, MovingLines } from '@arwes/react-bgs'
import { Illuminator } from '@arwes/react-frames'
import { Text } from '@arwes/react-text'
import Parallax from './Parallax'

export default function LandingUI({ children, ...props }) {
    return (
        <div className="inset-0 fixed flex justify-center items-center h-dvh flex-col gap-4 bg-black text-white" {...props}>
            <Illuminator color="hsl(180 50% 50% / 20%)" size={300} />
            <h1 className="text-4xl font-bold">{import.meta.env.VITE_NAME}</h1>
            <h2 className="text-2xl font-semibold">
                <Animator active={true} duration={{ enter: 1 }}>
                    <Text
                        style={{
                            color: '#00ff00',
                            fontFamily: 'monospace',
                        }}
                        manager="sequence"
                        easing="outSine"
                        fixed
                    >
                        Drop ZIP file or folder here
                    </Text>
                </Animator>
            </h2>
            {children}
        </div>
    )
}
