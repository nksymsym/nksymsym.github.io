import failGoalImage from '../images/goal_fail_3.webp'
import clearGoalImage from '../images/goal_clear.webp'
import {
  goalFrameMarkup,
  pinArtwork,
  pipeArtwork,
  pipeOutletsMarkup,
  stageCardMarkup,
  stageArtworkDefs,
  stageBackgroundMarkup,
  tankMarkup,
  tankWaterMarkup,
} from './stageArtwork'

export const stage3Markup = `
  <section class="waterflow" data-stage="3" aria-labelledby="stage-title">

    <div class="waterflow__stage-frame">
      <svg
        class="waterflow__stage"
        viewBox="0 0 600 800"
        role="img"
        aria-labelledby="stage-svg-title stage-svg-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="stage-svg-title">お腰につけたきびだんご</title>
        <desc id="stage-svg-description">ピン抜きゲームのステージ3</desc>

        <defs>
          ${stageArtworkDefs}
          <mask id="stage3-pipe-break-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800">
            <rect x="0" y="0" width="600" height="800" fill="white" />
            <path d="M306 354 L317 358 L330 352 L327 364 L336 373 L329 386 L318 381 L306 387 L309 374 L303 365 Z" fill="black" />
          </mask>
        </defs>

        <g id="background-layer" class="stage-layer stage-background">
          ${stageBackgroundMarkup}
        </g>

        <g id="goal-layer" class="stage-layer goal-layer">
          <g id="goal-fail" class="goal goal-fail">
            <image
              id="goal-fail-image"
              href="${failGoalImage}"
              x="52"
              y="552"
              width="321"
              height="196"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>

          <g id="goal-clear" class="goal goal-clear">
            <image
              id="goal-clear-image"
              href="${clearGoalImage}"
              x="377"
              y="552"
              width="171"
              height="196"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </g>

        ${goalFrameMarkup}

        <g id="pipe-layer" class="stage-layer pipe-layer" aria-label="パイプ">
          <use href="#pipe-joint" x="320" y="360" />
          <use href="#pipe-joint" x="460" y="450" />
          <use href="#pipe-joint" x="320" y="450" />
          ${pipeArtwork('tank-outlet', [
            [150, 175],
            [150, 360],
            [320, 360],
          ])}
          <!-- 破損時の水の落下経路。パイプ自体は常時非表示にする。 -->
          ${pipeArtwork('broken-invisible', [
            [320, 360],
            [320, 420],
          ])}
          ${pipeArtwork('broken', [
            [320, 420],
            [320, 450],
          ])}
          ${pipeArtwork('not-broken', [
            [320, 360],
            [460, 360],
            [460, 450],
          ])}
          ${pipeArtwork('clear-goal', [
            [460, 450],
            [460, 550],
          ])}
          ${pipeArtwork('fail-goal-1', [
            [460, 450],
            [320, 450],
          ])}
          ${pipeArtwork('fail-goal-2', [
            [320, 450],
            [320, 500],
            [220, 500],
            [220, 550],
          ])}
        </g>

        <g id="water-layer" class="stage-layer water-layer" aria-label="水">
          <path id="water-tank-outlet" class="pipe-water" data-pipe="pipe-tank-outlet" pathLength="1" />
          <path id="water-broken-invisible" class="pipe-water" data-pipe="pipe-broken-invisible" pathLength="1" />
          <path id="water-broken" class="pipe-water" data-pipe="pipe-broken" pathLength="1" />
          <path id="water-not-broken" class="pipe-water" data-pipe="pipe-not-broken" pathLength="1" />
          <path id="water-clear-goal" class="pipe-water" data-pipe="pipe-clear-goal" pathLength="1" />
          <path id="water-fail-goal-1" class="pipe-water" data-pipe="pipe-fail-goal-1" pathLength="1" />
          <path id="water-fail-goal-2" class="pipe-water" data-pipe="pipe-fail-goal-2" pathLength="1" />
          ${tankWaterMarkup}
        </g>

        <g class="pipe-details" aria-hidden="true">
          <use href="#pipe-sleeve" transform="translate(150 235)" />
          <use href="#pipe-sleeve" transform="translate(235 360) rotate(90)" />
          <use href="#pipe-sleeve" transform="translate(460 400)" />
          <use href="#pipe-sleeve" transform="translate(385 450) rotate(90)" />
          <use href="#pipe-sleeve" transform="translate(220 536)" />
          <path class="pipe-shine" d="M137 260 V310 M264 347 H287 M365 347 H424 M447 493 V523 M265 487 H289" />
        </g>
        ${pipeOutletsMarkup}

        <g id="tank-layer" class="stage-layer tank-layer" aria-label="水槽">
          <g id="tank">
            ${tankMarkup}
          </g>
        </g>

        <g id="falling-object-layer" class="stage-layer falling-object-layer">
          <g class="wrench__motion">
            <g
              id="wrench"
              class="wrench"
              transform="translate(304 252) rotate(-38) scale(0.68)"
              aria-label="スパナ"
            >
              <path
                class="wrench__body"
                fill-rule="evenodd"
                d="M-8 -23 C-25 -28 -28 -47 -16 -58 Q-11 -62 -11 -55 V-43 Q0 -31 11 -43 V-55 Q11 -62 16 -58 C28 -47 25 -28 8 -23 V32 C19 43 9 52 0 52 C-9 52 -19 43 -8 32 Z M-5 41 A5 5 0 1 0 5 41 A5 5 0 1 0 -5 41 Z"
              />
              <path class="wrench__shine" d="M-19 -48 Q-21 -36 -13 -32 M-4 -17 V23" />
            </g>
          </g>
        </g>

        <g id="pin-layer" class="stage-layer pin-layer" aria-label="ピン">
          <g
            id="pin-1"
            class="pin"
            data-pin="1"
            data-action="release-water"
            data-direction="left"
            transform="translate(30 190)"
          >
            ${pinArtwork(0)}
          </g>

          <g
            id="pin-2"
            class="pin"
            data-pin="2"
            data-action="release-wrench"
            data-direction="right"
            transform="translate(220 280)"
          >
            ${pinArtwork(175)}
          </g>

          <g
            id="pin-3"
            class="pin"
            data-pin="3"
            data-action="open-clear-route"
            data-direction="right"
            transform="translate(395 470)"
          >
            ${pinArtwork(175)}
          </g>
        </g>

        <g id="stage-display-layer" class="stage-layer stage-display-layer">
          ${stageCardMarkup(3)}
        </g>

        <g id="effects-layer" class="stage-layer effects-layer" aria-hidden="true"></g>
      </svg>
      <div class="waterflow__result" hidden>
        <p id="stage3-result-message" class="waterflow__result-message" role="status"></p>
        <img class="waterflow__result-image" alt="" />
        <div class="waterflow__result-actions">
          <button
            class="waterflow__retry"
            type="button"
            aria-describedby="stage3-result-message"
          >もう一度</button>
        </div>
      </div>
    </div>
  </section>
`
