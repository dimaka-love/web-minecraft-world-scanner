import { useSnapshot } from 'valtio'
import Background from './Background'
import { scannerState } from './worldScanner'
import { useEffect, useState } from 'react'

export default () => {
    const [blocksEncountered, setBlocksEncountered] = useState({} as Record<string, number>)
    const { progress, errors } = useSnapshot(scannerState)

    useEffect(() => {
        // todo
        setInterval(() => {
            setBlocksEncountered(scannerState.blocksEncountered)
        }, 500)
    }, [])

    return (
        <div>
            <Background />
            <div>
                Progress: {progress}
                Errors: {errors}
                Blocks Scanned:{' '}
                {Object.entries(blocksEncountered).map(([block, num]) => {
                    return (
                        <span>
                            {block}: {num}
                        </span>
                    )
                })}
            </div>
        </div>
    )
}
