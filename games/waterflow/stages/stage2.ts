import failGoalImage from '../images/goal_fail_2.webp'
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

const connectionDropDistance = 102

export const stage2Markup = `
  <section class="waterflow" data-stage="2" aria-labelledby="stage-title">

    <div class="waterflow__stage-frame">
      <svg
        class="waterflow__stage"
        viewBox="0 0 600 800"
        role="img"
        aria-labelledby="stage-svg-title stage-svg-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="stage-svg-title">お腰につけたきびだんご</title>
        <desc id="stage-svg-description">ピン抜きゲームのステージ2</desc>

        <defs>
          ${stageArtworkDefs}
          <mask id="connection-channel-mask" maskUnits="userSpaceOnUse" x="280" y="330" width="100" height="60">
            <rect x="280" y="330" width="100" height="60" fill="white" />
            <path d="M298 360 H362" fill="none" stroke="black" stroke-width="22" />
          </mask>
          <mask id="stage2-connection-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800">
            <rect x="0" y="0" width="600" height="800" fill="white" />
            <!-- パイプの輪郭線も含めて隠し、接続部に幅60の隙間を作る。 -->
            <rect x="300" y="330" width="60" height="60" fill="black" />
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
          <use href="#pipe-joint" x="150" y="360" />
          <use href="#pipe-joint" x="220" y="500" />
          ${pipeArtwork('tank-outlet', [
            [150, 175],
            [150, 360],
          ])}
          ${pipeArtwork('direct-fail', [
            [150, 360],
            [150, 500],
            [220, 500],
          ])}
          ${pipeArtwork('before-connection', [
            [150, 360],
            [300, 360],
          ])}
          ${pipeArtwork('bridge', [
            [300, 360],
            [360, 360],
          ])}
          ${pipeArtwork('clear-goal', [
            [360, 360],
            [460, 360],
            [460, 550],
          ])}
          <!-- 水の落下経路。灰色のパイプは常時非表示にする。 -->
          ${pipeArtwork('falling-water', [
            [300, 360],
            [300, 420],
          ])}
          ${pipeArtwork('lower-fail', [
            [300, 420],
            [300, 500],
            [220, 500],
          ])}
          ${pipeArtwork('fail-goal', [
            [220, 500],
            [220, 550],
          ])}
        </g>

        <g id="water-layer" class="stage-layer water-layer" aria-label="水">
          <path id="water-tank-outlet" class="pipe-water" data-pipe="pipe-tank-outlet" pathLength="1" />
          <path id="water-direct-fail" class="pipe-water" data-pipe="pipe-direct-fail" pathLength="1" />
          <path id="water-before-connection" class="pipe-water" data-pipe="pipe-before-connection" pathLength="1" />
          <path id="water-bridge" class="pipe-water" data-pipe="pipe-bridge" pathLength="1" />
          <path id="water-clear-goal" class="pipe-water" data-pipe="pipe-clear-goal" pathLength="1" />
          <path id="water-falling-water" class="pipe-water" data-pipe="pipe-falling-water" pathLength="1" />
          <path id="water-lower-fail" class="pipe-water" data-pipe="pipe-lower-fail" pathLength="1" />
          <path id="water-fail-goal" class="pipe-water" data-pipe="pipe-fail-goal" pathLength="1" />
          ${tankWaterMarkup}
        </g>

        <g class="pipe-details" aria-hidden="true">
          <use href="#pipe-sleeve" transform="translate(150 235)" />
          <use href="#pipe-sleeve" transform="translate(230 360) rotate(90)" />
          <use href="#pipe-sleeve" transform="translate(460 430)" />
          <use href="#pipe-sleeve" transform="translate(300 447)" />
          <use href="#pipe-sleeve" transform="translate(220 536)" />
          <path class="pipe-shine" d="M137 260 V310 M254 347 H280 M393 347 H426 M447 460 V515 M137 414 V458" />
        </g>
        ${pipeOutletsMarkup}

        <g id="falling-object-layer" class="stage-layer falling-object-layer">
          <g class="connectpipe__motion" data-drop-distance="${connectionDropDistance}">
            <g id="connectpipe" class="connectpipe" transform="translate(0 -${connectionDropDistance})" aria-label="接続パイプ">
              <path class="pipe connectpipe__body" d="M300 360 H360" />
              <path class="connectpipe__collar" d="M304 344 V376 M356 344 V376" />
              <path class="pipe-shine" d="M316 347 H344" />
            </g>
          </g>
        </g>

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
            data-action="release-connection"
            data-direction="right"
            transform="translate(220 280)"
          >
            ${pinArtwork(175)}
          </g>

          <g
            id="pin-3"
            class="pin"
            data-pin="3"
            data-action="open-fail-route"
            data-direction="left"
            transform="translate(30 380)"
          >
            ${pinArtwork(0)}
          </g>
        </g>

        <g id="stage-display-layer" class="stage-layer stage-display-layer">
          ${stageCardMarkup(2)}
        </g>

        <g id="effects-layer" class="stage-layer effects-layer" aria-hidden="true"></g>
      </svg>
      <div class="waterflow__result" hidden>
        <p id="stage2-result-message" class="waterflow__result-message" role="status"></p>
        <img class="waterflow__result-image" alt="" />
        <div class="waterflow__result-actions">
          <button class="waterflow__retry" type="button" aria-describedby="stage2-result-message">もう一度</button>
          <button class="waterflow__next" type="button" aria-describedby="stage2-result-message" hidden>次へ進む</button>
        </div>
      </div>
    </div>
  </section>
`
