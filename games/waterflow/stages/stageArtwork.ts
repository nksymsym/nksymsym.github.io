// 全ステージで同じ画材・部品を使い、経路や当たり判定とは分けて描画する。
const tankShape =
  'M150 50 C109 50 80 77 80 115 C80 147 99 163 121 177 Q126 181 126 190 V200 Q150 204 174 200 V190 Q174 181 179 177 C201 163 220 147 220 115 C220 77 191 50 150 50 Z'
const tankNeckShape =
  'M127 190 Q150 194 173 190 Q176 190 176 193 V201 Q176 204 173 204 Q150 207 127 204 Q124 204 124 201 V193 Q124 190 127 190 Z'

export const stageArtworkDefs = `
  <path id="tank-shape" d="${tankShape}" />
  <path id="tank-neck-shape" d="${tankNeckShape}" />
  <clipPath id="tank-water-clip"><use href="#tank-shape" /></clipPath>
  <!-- 風船をかぶせた部分は、パイプと管内の水だけを隠す。 -->
  <mask id="tank-overlap-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800">
    <rect width="600" height="800" fill="white" />
    <use href="#tank-shape" fill="black" />
    <use href="#tank-neck-shape" fill="black" />
  </mask>
  <linearGradient id="water-fill" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#fff5bd" />
    <stop offset="1" stop-color="#f5df8f" />
  </linearGradient>
  <linearGradient id="water-flow-fill" gradientUnits="userSpaceOnUse" x1="120" y1="180" x2="460" y2="550">
    <stop stop-color="#fff5bd" />
    <stop offset="1" stop-color="#f5df8f" />
  </linearGradient>
  <pattern id="wall-bricks" width="96" height="64" patternUnits="userSpaceOnUse">
    <rect width="96" height="64" fill="#f1e5d3" />
    <path class="wall-brick" d="M3 3 L45 2 Q48 3 47 7 L46 27 Q25 29 3 27 Z M51 3 L92 4 L93 27 L51 28 Z M3 35 L21 35 L22 60 L3 60 Z M27 35 Q50 33 70 35 L69 60 L27 59 Z M75 35 L93 35 L93 60 L75 61 Z" />
    <path class="wall-brick--warm" d="M51 3 L92 4 L93 27 L51 28 Z M27 35 Q50 33 70 35 L69 60 L27 59 Z" />
    <path class="wall-brick-shine" d="M8 7 L39 6 M56 8 H86 M32 39 L63 39 M79 39 H88" />
  </pattern>
  <filter id="part-outline" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="outline" />
    <feFlood flood-color="#58696d" />
    <feComposite in2="outline" operator="in" />
    <feMerge>
      <feMergeNode />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <!-- 平らなパイプ端どうしの接続点を下塗りし、描画時の隙間を防ぐ。 -->
  <circle id="pipe-joint" r="18" fill="var(--wf-pipe-color)" />
  <g id="pipe-sleeve">
    <rect class="pipe-sleeve" x="-20" y="-5" width="40" height="10" rx="3" />
    <path class="part-shine" d="M-13 -2 H9" />
  </g>
`

export const stageBackgroundMarkup = `
  <rect class="stage-masonry" width="600" height="800" />
  <path class="stage-wall-edge" d="M50 175 H375 V300 H550 V750 H50 Z" />
  <path class="stage-wall" d="M50 175 H375 V300 H550 V750 H50 Z" />
  <use class="tank-backplate" href="#tank-shape" />
`

// 画像より後に描いて室内の輪郭を揃え、パイプの出口には開口を残す。
export const goalFrameMarkup = `
  <path class="goal-frame" d="M50 550 V750 H550 V550" />
  <path class="goal-divider" d="M50 550 H200 M240 550 H440 M480 550 H550 M375 550 V750" />
`

export const tankMarkup = `
  <use class="tank-shell" href="#tank-shape" />
  <use class="tank-neck" href="#tank-neck-shape" />
  <path class="tank-shine" d="M100 94 Q109 73 130 66 M96 107 L95 113" />
  <path class="tank-neck-shine" d="M132 197 Q145 199 160 198" />
`

export const tankWaterMarkup = `
  <g id="tank-water" clip-path="url(#tank-water-clip)">
    <g class="tank-water__motion">
      <path class="tank-water" d="M80 96 Q97 90 115 96 T150 96 T185 96 T220 96 V196 H80 Z" />
      <path class="tank-water-line" d="M80 96 Q97 90 115 96 T150 96 T185 96 T220 96" />
    </g>
  </g>
`

export const pinArtwork = (handleX: 0 | 175) => `
  <rect class="pin-shaft" x="-4" y="-4.5" width="183" height="9" rx="4.5" />
  <path class="pin-shine" d="M8 -1.5 H164" />
  <circle class="pin-handle" cx="${handleX}" cy="0" r="13" />
  <circle class="pin-handle-hole" cx="${handleX}" cy="0" r="5" />
  <path class="pin-shine" d="M${handleX - 8} -3 Q${handleX - 6} -8 ${handleX} -8" />
`

// Only interior elbows are rounded. Endpoints remain at the stage's branch points.
// Keep the original route length separately so visual rounding cannot change timing.
type Point = readonly [number, number]
export const pipeArtwork = (id: string, points: readonly Point[]) => {
  let length = 0
  let d = `M${points[0].join(' ')}`
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]
    const [px, py] = points[i - 1]
    const before = Math.hypot(x - px, y - py)
    length += before
    const next = points[i + 1]
    if (!next) {
      d += ` L${x} ${y}`
      continue
    }
    const [nx, ny] = next
    const after = Math.hypot(nx - x, ny - y)
    const radius = Math.min(28, before / 2, after / 2)
    const turn = (x - px) * (ny - y) - (y - py) * (nx - x)
    if (!turn) {
      d += ` L${x} ${y}`
      continue
    }
    d += ` L${x - ((x - px) / before) * radius} ${y - ((y - py) / before) * radius}`
    d += ` A${radius} ${radius} 0 0 ${turn > 0 ? 1 : 0} ${x + ((nx - x) / after) * radius} ${y + ((ny - y) / after) * radius}`
  }
  return `<path id="pipe-${id}" class="pipe" d="${d}" data-flow-length="${length}" />`
}

// An eight-pixel extension is purely decorative; goal arrival coordinates stay fixed.
export const pipeOutletsMarkup = `
  <g class="pipe-outlets" aria-hidden="true">
    <path class="pipe-outlet" d="M201 547 V558 H239 V547 M441 547 V558 H479 V547" />
  </g>
`

// 小さなカードでも見分けやすい、犬・猿・雉の顔。
const stageAnimalArtwork = {
  1: `
    <path fill="#d7aa63" d="M-27 -7 L-31 -27 Q-31 -32 -26 -29 L-12 -21 Q0 -25 12 -21 L26 -29 Q31 -32 31 -27 L27 -7 Q33 1 28 13 Q21 26 0 27 Q-21 26 -28 13 Q-33 1 -27 -7 Z" />
    <path fill="#fff1d7" stroke="none" d="M-25 -23 L-22 -11 L-14 -18 Z M25 -23 L22 -11 L14 -18 Z M-26 7 Q-13 7 -8 12 Q0 16 8 12 Q13 7 26 7 Q23 25 0 25 Q-23 25 -26 7 Z" />
    <path stroke="#fff1d7" stroke-width="3" d="M-16 -6 L-11 -7 M11 -7 L16 -6" />
    <g class="stage-card__animal-ink">
      <circle cx="-12" cy="3" r="2" />
      <circle cx="12" cy="3" r="2" />
      <path d="M-4 12 Q0 10 4 12 Q4 15 0 17 Q-4 15 -4 12" />
    </g>
    <path d="M0 17 V20 M-6 20 Q-3 24 0 20 Q3 24 6 20" />
  `,
  2: `
    <g fill="#ae825d">
      <circle cx="-28" cy="1" r="10" />
      <circle cx="28" cy="1" r="10" />
    </g>
    <g fill="#efccb0" stroke="none">
      <circle cx="-28" cy="1" r="5" />
      <circle cx="28" cy="1" r="5" />
    </g>
    <path fill="#ae825d" d="M-25 -3 Q-28 -18 -12 -23 Q-16 -30 -5 -26 Q2 -33 9 -25 Q29 -22 26 -3 Q31 24 0 27 Q-31 24 -25 -3 Z" />
    <path fill="#f4d8bb" stroke="none" d="M0 -10 C-16 -23 -27 -7 -19 7 C-27 24 -10 25 0 25 C10 25 27 24 19 7 C27 -7 16 -23 0 -10 Z" />
    <g class="stage-card__animal-ink">
      <circle cx="-10" cy="1" r="2" />
      <circle cx="10" cy="1" r="2" />
      <circle cx="-2" cy="12" r="1" />
      <circle cx="2" cy="12" r="1" />
    </g>
    <path d="M-8 17 Q0 25 8 17" />
  `,
  3: `
    <path fill="#c96f65" d="M-11 -20 Q-21 -35 -7 -31 Q-4 -38 1 -32 L8 -22 Z" />
    <path fill="#71967d" d="M-18 14 C-28 -1 -23 -19 -9 -23 Q10 -30 22 -15 Q29 -2 17 9 L22 25 Q2 29 -19 23 Z" />
    <path fill="#f0cd79" d="M22 -9 L37 -3 Q39 -1 35 0 L21 3 Z" />
    <path fill="#d98576" stroke="none" d="M1 -15 Q11 -20 20 -13 Q25 -7 19 3 Q9 8 1 0 Z" />
    <circle fill="#fff4df" stroke="none" cx="11" cy="-8" r="4" />
    <circle class="stage-card__animal-ink" cx="12" cy="-8" r="2" />
    <path fill="#f4eedc" stroke="none" d="M-19 16 Q2 23 19 14 L21 20 Q3 29 -18 22 Z" />
    <path stroke="#aec3a5" d="M-15 -10 Q-19 -1 -13 4" />
  `,
} as const

export const stageCardMarkup = (stage: 1 | 2 | 3) => `
  <g id="stage-display" class="stage-card">
    <rect class="stage-card__paper" x="425" y="50" width="125" height="150" rx="14" />
    <path class="stage-card__rule" d="M445 99 H530" />
    <text id="stage-title" class="stage-name" x="487.5" y="82">Stage ${stage}</text>
    <g class="stage-card__animal" transform="translate(487.5 139)" aria-hidden="true">
      ${stageAnimalArtwork[stage]}
    </g>
    <g class="stage-card__progress" aria-hidden="true">
      ${[1, 2, 3].map((number) => `<circle class="${number === stage ? 'is-current' : ''}" cx="${463.5 + (number - 1) * 24}" cy="181" r="4" />`).join('')}
    </g>
  </g>
`
