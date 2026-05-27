'use client'

import { useMemo } from 'react'
import { generateTree } from './generateTree'

interface PhyloTreeHeroProps {
  seed?: number
  width?: number
  height?: number
}

export function PhyloTreeHero({ seed = 7, width = 800, height = 480 }: PhyloTreeHeroProps) {
  const tree = useMemo(
    () =>
      generateTree({
        seed,
        depth: 7,
        trunkLength: height * 0.18,
        branchAngle: Math.PI / 6.5,
        lengthDecay: 0.74,
        jitter: 0.22,
        origin: { x: width / 2, y: height - 20 },
      }),
    [seed, width, height]
  )

  return (
    <div className="relative w-full overflow-hidden" aria-hidden="true">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full h-auto"
        preserveAspectRatio="xMidYEnd meet"
      >
        <defs>
          <linearGradient id="branchGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-amber)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent-amber)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g>
          {tree.branches.map((b, i) => (
            <line
              key={`b-${i}`}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              stroke="url(#branchGradient)"
              strokeWidth={b.width}
              strokeLinecap="round"
              className="phylo-branch"
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))}
        </g>

        <g>
          {tree.leaves.map((p, i) => (
            <g key={`l-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="url(#leafGlow)"
                className="phylo-leaf-halo"
                style={{ animationDelay: `${(i % 7) * 350}ms` }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={1.6}
                fill="var(--accent-amber)"
                className="phylo-leaf-core"
                style={{ animationDelay: `${(i % 7) * 350}ms` }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
