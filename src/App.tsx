import { useCallback, useEffect } from 'react'
import { DropEvent, useDropzone } from 'react-dropzone'
import { mountDir, mountFile, scannerState } from './worldScanner'
import LandingUI from './LandingUI'
import Background from './Background'
import { useSnapshot } from 'valtio'
import ScanningUI from './ScanningUI'

export default () => {
    const { started } = useSnapshot(scannerState)

    const onDrop = useCallback(async (e: DragEvent) => {
        if (!e.dataTransfer?.files.length) return
        const { items } = e.dataTransfer
        const item = items[0]!
        if (item.getAsFileSystemHandle) {
            const filehandle = (await item.getAsFileSystemHandle()) as FileSystemFileHandle | FileSystemDirectoryHandle
            if (filehandle.kind === 'file') {
                const file = await filehandle.getFile()

                await mountFile(file)
            } else {
                await mountDir(filehandle)
            }
        } else {
            await mountFile(item.getAsFile()!)
        }
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({})

    if (started) return <ScanningUI />

    return (
        <LandingUI
            {...getRootProps()}
            onDrop={e => {
                e.preventDefault()
                onDrop(e as any)
            }}
        >
            <Background />
            <input {...getInputProps()} accept=".zip" />
        </LandingUI>
    )
}
