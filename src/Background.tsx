import { Puffs, Dots, MovingLines } from '@arwes/react-bgs'
import { Animator } from '@arwes/react-animator'
import { Illuminator } from '@arwes/react-frames'
import { Text } from '@arwes/react-text'
import Parallax from './Parallax'

export default () => {
    return (
        <>
            <Animator active duration={{ enter: 1.3 }}>
                <Parallax>
                    {/* <Dots color="#003020" type="cross" distance={50} size={45} origin="center" style={{ zIndex: -1, position: 'relative' }} /> */}
                    <Dots color="#006845" type="cross" distance={50} size={45} origin="center" style={{ zIndex: -1, position: 'relative' }} />
                </Parallax>
            </Animator>
            <Animator duration={{ interval: 100 }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: -1,
                        // backgroundColor: '#000906',
                        // backgroundImage:
                        //     'radial-gradient(85% 85% at 50% 50%, hsla(185, 100%, 25%, 0.25) 0%, hsla(185, 100%, 25%, 0.12) 50%, hsla(185, 100%, 25%, 0) 100%)',
                    }}
                >
                    {/* <GridLines
lineColor='hsla(180, 100%, 75%, 0.05)'
distance={30}
/> */}
                    {/* <Dots color="hsla(180, 100%, 75%, 0.05)" distance={30} /> */}
                    <MovingLines lineColor="hsla(180, 100%, 75%, 0.07)" distance={30} sets={20} />
                </div>
            </Animator>
        </>
    )
}
