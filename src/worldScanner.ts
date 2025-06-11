import { proxy } from 'valtio'
import { configure, mounts, umount, fs, BackendConfiguration, promises } from '@zenfs/core'
import { WebAccess } from '@zenfs/dom'
import { Zip } from '@zenfs/archives'
import minecraftData from 'minecraft-data'
import { Anvil, level } from 'prismarine-provider-anvil'
import WorldLoader from 'prismarine-world'
import { Vec3 } from 'vec3'
import ChunkLoader from 'prismarine-chunk'
// import { WorldReader, RegionDataFrame, RegionReader } from '@xmcl/game-data'

console.log(minecraftData('1.18.2'))

const beforeMountShared = () => {
    controller?.abort() // todo wait
    if (mounts.has('/data')) {
        umount('/data')
    }
    controller = new AbortController()
    Object.assign(scannerState, initialScannerState)
}

export const mountFile = async (file: File) => {
    beforeMountShared()
    if (!file.name.endsWith('.zip')) throw new Error('Only zip files are supported')
    const zipData = await file.arrayBuffer()
    await configure({
        mounts: {
            '/data': { backend: Zip, data: zipData },
        },
    })
    await readWorld()
}
export const mountDir = async (dir: FileSystemDirectoryHandle) => {
    beforeMountShared()
    await configure({
        mounts: {
            '/data': {
                backend: WebAccess,
                handle: dir,
            },
        },
    })
    await readWorld()
}

const debugReading = async () => {
    console.log('downloading')
    const arrayBuffer = await fetch('https://play.isavvy.education/background/iSavvy_Pack.zip').then(async res => res.arrayBuffer())
    await configure({
        mounts: {
            '/resourcepack': { backend: Zip, data: arrayBuffer },
        },
    })
    console.log('downloaded')
    const data = await promises.readFile('/resourcepack/assets/minecraft/blockstates/lift.json', 'utf8')
    console.log(data)
    console.log('done')
}

debugReading()

const readWorld = async () => {
    const { SpawnX, SpawnZ, SpawnY, Version } = await level.readLevel('/data/level.dat')
    // const version = Version?.Name || '1.8'
    const version = '1.18'
    const World = WorldLoader(version)
    const Chunk = ChunkLoader(version)
    const anvil = new (Anvil(version))('/data/region')
    const world = new World(
        () => {
            return new Chunk(undefined as any)
        },
        anvil,
        0, // disable saving
    )
    const regionsList = (await fs.promises.readdir('/data/region')).filter(f => f.endsWith('.mca'))
    // all negative are first
    const sortedRegions = regionsList.sort((a, b) => {
        const [ax, az] = a
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        const [bx, bz] = b
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        const minA = Math.min(ax, az)
        const minB = Math.min(bx, bz)

        return minA - minB
    })
    const minXRegion = sortedRegions.reduce((acc, region) => {
        const [x] = region
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        return Math.min(acc, x)
    }, Infinity)
    const minZRegion = sortedRegions.reduce((acc, region) => {
        const [, z] = region
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        return Math.min(acc, z)
    }, Infinity)
    const maxXRegion = sortedRegions.reduce((acc, region) => {
        const [x] = region
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        return Math.max(acc, x)
    }, -Infinity)
    const maxZRegion = sortedRegions.reduce((acc, region) => {
        const [, z] = region
            .match(/r\.(-?\d+)\.(-?\d+)\.mca/)!
            .slice(1)
            .map(Number) as [number, number]
        return Math.max(acc, z)
    }, -Infinity)
    const minX = minXRegion * 512 // 32 * 16
    const minZ = minZRegion * 512
    const maxX = maxXRegion * 512
    const maxZ = maxZRegion * 512
    console.log('Available files:', sortedRegions)
    // const loadedColumn = await world.getColumnAt(new Vec3(SpawnX, 0, SpawnZ))

    let progressTotal: number
    outer: for (let columnX = minX; columnX <= maxX; columnX += 16) {
        for (let columnZ = minZ; columnZ <= maxZ; columnZ += 16) {
            try {
                const column = await world.getColumnAt(new Vec3(columnX, 0, columnZ))
                progressTotal ??= (maxX - minX) * (maxZ - minZ) * (column['worldHeight'] - column['minY'])
                for (let x = 0; x < 16; x++) {
                    for (let z = 0; z < 16; z++) {
                        for (let y = column['minY']; y < column['worldHeight']; y++) {
                            if (controller?.signal.aborted) break outer
                            scannerState.progress += 1 / progressTotal

                            const block = column.getBlock(new Vec3(x, y, z))
                            if (block.type === 0) continue
                            scannerState.blocksEncountered[block.name] ??= 0
                            scannerState.blocksEncountered[block.name]!++
                        }
                    }
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    // console.log('Missing column at', columnX, columnZ)
                    continue
                }
                scannerState.errors++
                console.warn(err)
                // throw err
            }
        }
    }
    if (controller?.signal.aborted) return
    // console.log((await world.getBlock(new Vec3(minX, SpawnY, minZ))).name)
    // console.log((await world.getBlock(new Vec3(maxX, SpawnY, maxZ))).name)
}

// const readWorldXmcl = async () => {
//     const reader: WorldReader = await WorldReader.create('/data')
//     const levelData = await reader.getLevelData()
//     const chunkX = Math.floor(levelData.SpawnX / 16)
//     const chunkZ = Math.floor(levelData.SpawnZ / 16)
//     const region = await reader.getRegionData(chunkX, chunkZ)
//     region.Level.Sections.forEach((section, i) => {
//         console.log(i, section.Data)
//     })
// }

let controller: AbortController | undefined
const initialScannerState = {
    started: false,
    blocksEncountered: {} as Record<string, number>,
    progress: 0,
    errors: 0,
}
export const scannerState = proxy({ ...initialScannerState })

globalThis.scannerState = scannerState

export const startScan = (path = '/data') => {}
