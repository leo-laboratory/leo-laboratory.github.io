export interface Point {
  x: number
  y: number
}

export interface Branch {
  x1: number
  y1: number
  x2: number
  y2: number
  depth: number
  width: number
}

export interface Tree {
  branches: Branch[]
  leaves: Point[]
}

export interface GenerateTreeOptions {
  seed?: number
  depth?: number
  trunkLength?: number
  branchAngle?: number
  lengthDecay?: number
  jitter?: number
  origin?: Point
  initialAngle?: number
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateTree(opts: GenerateTreeOptions = {}): Tree {
  const {
    seed = 1,
    depth = 6,
    trunkLength = 90,
    branchAngle = Math.PI / 6,
    lengthDecay = 0.72,
    jitter = 0.18,
    origin = { x: 0, y: 0 },
    initialAngle = -Math.PI / 2,
  } = opts

  const rand = mulberry32(seed)
  const branches: Branch[] = []
  const leaves: Point[] = []

  function grow(x: number, y: number, angle: number, length: number, level: number) {
    const x2 = x + Math.cos(angle) * length
    const y2 = y + Math.sin(angle) * length
    const width = Math.max(0.5, (depth - level) * 0.8)
    branches.push({ x1: x, y1: y, x2, y2, depth: level, width })

    if (level >= depth) {
      leaves.push({ x: x2, y: y2 })
      return
    }

    const jL = 1 + (rand() - 0.5) * jitter
    const jR = 1 + (rand() - 0.5) * jitter
    const aL = angle - branchAngle * jL
    const aR = angle + branchAngle * jR
    const nextLen = length * lengthDecay

    grow(x2, y2, aL, nextLen, level + 1)
    grow(x2, y2, aR, nextLen, level + 1)
  }

  grow(origin.x, origin.y, initialAngle, trunkLength, 0)
  return { branches, leaves }
}
