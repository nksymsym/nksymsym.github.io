import failGoalImage from '../images/goal_fail_1.webp'
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

export const stage1Markup = `
  <section class="waterflow" data-stage="1" aria-labelledby="stage-title">

    <div class="waterflow__stage-frame">
      <svg
        class="waterflow__stage"
        viewBox="0 0 600 800"
        role="img"
        aria-labelledby="stage-svg-title stage-svg-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="stage-svg-title">お腰につけたきびだんご</title>
        <desc id="stage-svg-description">ピン抜きゲームのステージ1</desc>

        <defs>
          ${stageArtworkDefs}
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
          <use href="#pipe-joint" x="460" y="450" />
          ${pipeArtwork('tank-outlet', [
            [150, 175],
            [150, 360],
            [460, 360],
            [460, 450],
          ])}
          ${pipeArtwork('clear-goal', [
            [460, 450],
            [460, 550],
          ])}
          ${pipeArtwork('fail-goal', [
            [460, 450],
            [220, 450],
            [220, 550],
          ])}
        </g>

        <g id="water-layer" class="stage-layer water-layer" aria-label="水">
          <path id="water-tank-outlet" class="pipe-water" data-pipe="pipe-tank-outlet" pathLength="1" />
          <path id="water-clear-goal" class="pipe-water" data-pipe="pipe-clear-goal" pathLength="1" />
          <path id="water-fail-goal" class="pipe-water" data-pipe="pipe-fail-goal" pathLength="1" />
          ${tankWaterMarkup}
        </g>

        <g class="pipe-details" aria-hidden="true">
          <use href="#pipe-sleeve" transform="translate(150 235)" />
          <use href="#pipe-sleeve" transform="translate(245 360) rotate(90)" />
          <use href="#pipe-sleeve" transform="translate(460 400)" />
          <use href="#pipe-sleeve" transform="translate(320 450) rotate(90)" />
          <use href="#pipe-sleeve" transform="translate(220 520)" />
          <path class="pipe-shine" d="M137 260 V310 M280 347 H359 M447 487 V523 M262 437 H289" />
        </g>
        ${pipeOutletsMarkup}

        <g id="tank-layer" class="stage-layer tank-layer" aria-label="水槽">
          <g id="tank">
            ${tankMarkup}
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
            data-action="open-clear-route"
            data-direction="right"
            transform="translate(395 470)"
          >
            ${pinArtwork(175)}
          </g>
        </g>

        <g id="stage-display-layer" class="stage-layer stage-display-layer">
          ${stageCardMarkup(1)}
        </g>

        <g id="effects-layer" class="stage-layer effects-layer" aria-hidden="true"></g>
      </svg>
      <div class="waterflow__result" hidden>
        <p id="stage1-result-message" class="waterflow__result-message" role="status"></p>
        <img class="waterflow__result-image" alt="" />
        <div class="waterflow__result-actions">
          <button class="waterflow__retry" type="button" aria-describedby="stage1-result-message">もう一度</button>
          <button class="waterflow__next" type="button" aria-describedby="stage1-result-message" hidden>次へ進む</button>
        </div>
      </div>
    </div>
  </section>
`
