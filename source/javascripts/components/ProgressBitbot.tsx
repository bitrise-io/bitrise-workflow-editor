const alternate = (a: string, b: string, length: number) =>
  Array.from({ length })
    .map((_, i) => (i % 2 ? b : a))
    .join(';');

const bounceKeySplines = alternate('0.42 0 1 1', '0 0 0.59 1', 6);
const boundKeyTimes = '0;0.15;0.3;0.45;0.6;0.75;1';

const dot0 =
  'M13,2.032 C13,1.412 12.796,1 12.191,1 C11.587,1 11.38,1.413 11.38,2.032 C11.38,2.652 11.688,3.065 12.191,3.065 C12.796,3.065 13,2.652 13,2.032 Z';
const dot1 =
  'M13.198,8.032 C13.198,7.412 12.796,7 12.191,7 C11.587,7 11.184,7.413 11.184,8.032 C11.184,8.652 11.688,8.71634592 12.191,8.71634592 C12.796,8.71634592 13.198,8.652 13.198,8.032 Z';
const dot = alternate(dot0, dot1, 7);

const head0 =
  'M20.953,11.265 C20.651,10.025 19.543,9.2 18.335,9.097 C17.025,9.097 14.911,8.994 12.091,8.994 C9.271,8.994 7.156,9.097 5.947,9.2 C4.637,9.2 3.53,10.129 3.227,11.265 C3.027,12.297 2.624,13.742 2.422,15.29 C2.221,16.323 2.12,17.458 2.019,18.8 C1.919,19.523 2.221,20.245 2.724,20.865 C3.228,21.381 3.933,21.794 4.739,21.794 C6.451,21.897 9.169,22 11.989,22 C14.809,22 17.529,21.897 19.241,21.794 C20.047,21.794 20.751,21.381 21.255,20.864 C21.7955045,20.3213995 22.0556164,19.5598802 21.96,18.8 C22.061,17.458 21.96,16.323 21.76,15.29 C21.558,13.845 21.155,12.297 20.953,11.265 Z M19.946,19.42 C19.745,19.626 19.543,19.729 19.241,19.729 C16.925,19.832 14.508,19.935 12.091,19.935 C9.673,19.935 7.256,19.832 4.94,19.729 C4.638,19.729 4.436,19.626 4.235,19.419 C4.034,19.213 4.034,19.109 4.034,19.006 C4.134,17.768 4.235,16.632 4.436,15.6 C4.537,14.361 4.839,13.123 5.141,11.78 C5.242,11.471 5.544,11.265 6.048,11.265 C8.05962913,11.1319465 10.0749814,11.0629116 12.091,11.058 C14.407,11.058 16.522,11.161 18.133,11.265 C18.536,11.265 18.939,11.575 18.939,11.884 C19.241,13.123 19.543,14.464 19.745,15.704 C19.845,16.632 20.047,17.768 20.148,19.11 C20.148,19.11 20.148,19.213 19.946,19.42 Z';
const head1 =
  'M21.412,11.265 C21.11,10.025 20.002,9.2 18.794,9.097 C17.484,9.097 15.1617441,9.47446415 12.0905,9.5 C9.01925589,9.52553585 6.717,9.097 5.508,9.2 C4.198,9.2 3.091,10.129 2.788,11.265 C2.588,12.297 2.382,13.742 2.18,15.29 C1.979,16.323 1.681,17.458 1.58,18.8 C1.48,19.523 1.782,20.245 2.285,20.865 C2.789,21.381 3.494,21.794 4.3,21.794 C6.012,21.897 9.169,22 11.989,22 C14.809,22 17.988,21.897 19.7,21.794 C20.506,21.794 21.21,21.381 21.714,20.864 C22.2545045,20.3213995 22.5146164,19.5598802 22.419,18.8 C22.52,17.458 22.22,16.323 22.02,15.29 C21.818,13.845 21.614,12.297 21.412,11.265 Z M20.405,19.42 C20.204,19.626 20.002,19.729 19.7,19.729 C17.384,19.832 14.508,19.935 12.091,19.935 C9.673,19.935 6.616,19.832 4.3,19.729 C3.998,19.729 3.796,19.626 3.595,19.419 C3.394,19.213 3.394,19.109 3.394,19.006 C3.494,17.768 3.799,16.632 4,15.6 C4.101,14.361 4.199,13.123 4.501,11.78 C4.602,11.471 4.904,11.265 5.408,11.265 C7.41962913,11.1319465 10.0749814,11.4796453 12.091,11.4747337 C14.407,11.4747337 16.981,11.161 18.592,11.265 C18.995,11.265 19.398,11.575 19.398,11.884 C19.7,13.123 19.798,14.464 20,15.704 C20.1,16.632 20.506,17.768 20.607,19.11 C20.607,19.11 20.607,19.213 20.405,19.42 Z';
const head = alternate(head0, head1, 7);

const leftEye0 =
  'M7.055,15.6 L9.875,15.6 C9.875,14.774 9.17,14.155 8.465,14.155 C7.659,14.154 7.055,14.774 7.055,15.6 Z';
const leftEye1 =
  'M7.055,15.6 L9.875,15.6 C9.875,14.774 9.17,15.155 8.465,15.155 C7.659,15.154 7.055,14.774 7.055,15.6 Z';
const leftEyeTranslate = alternate('0 0', '-0.2 0', 7);
const leftEye = alternate(leftEye0, leftEye1, 3);

const rightEye0 =
  'M14.105,15.6 L16.825,15.6 C16.825,14.774 16.22,14.155 15.515,14.155 C14.709,14.155 14.105,14.775 14.105,15.6 Z';
const rightEye1 =
  'M14.105,15.6 L16.825,15.6 C16.825,14.774 16.22,15.155 15.515,15.155 C14.709,15.155 14.105,14.775 14.105,15.6 Z';
const rightEyeTranslate = alternate('0 0', '0.2 0', 7);
const rightEye = alternate(rightEye0, rightEye1, 3);

const mouth0 =
  'M14.105,16.219 C13.1799564,16.219 12.4861737,16.219 12.0236519,16.219 C11.5611301,16.219 10.9119128,16.219 10.076,16.219 C10.076,17.355 10.983,18.284 12.091,18.284 C13.198,18.284 14.105,17.354 14.105,16.219 Z';
const mouth1 =
  'M14.2186032,16.22 C13.2020562,16.3240775 12.4625218,16.3761163 12,16.3761163 C11.5374782,16.3761163 10.7970496,16.3240775 9.77871427,16.22 C9.77871427,17.356 10.983,18.285 12.091,18.285 C13.198,18.285 14.2186032,17.355 14.2186032,16.22 Z';
const mouthTranslate = alternate('0 0', '0 0.2', 7);
const mouth = alternate(mouth0, mouth1, 7);

const ProgressBitbot = () => (
  <svg fill="currentColor" height="64" viewBox="0 0 24 24" width="64">
    <g fill="currentColor" fillRule="evenodd" stroke="none" strokeWidth="1">
      <path d={dot0}>
        <animate
          attributeName="d"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          values={dot}
        />
      </path>

      <path d={head0}>
        <animate
          attributeName="d"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          values={head}
        />
      </path>

      <path d={mouth0}>
        <animate
          attributeName="d"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          values={mouth}
        />

        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          type="translate"
          values={mouthTranslate}
        />
      </path>

      <path d={leftEye0}>
        <animate
          attributeName="d"
          begin="250ms;leftEye.end+1500ms"
          dur="250ms"
          fill="freeze"
          id="leftEye"
          values={leftEye}
        />

        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          type="translate"
          values={leftEyeTranslate}
        />
      </path>

      <path d={rightEye0}>
        <animate
          attributeName="d"
          begin="250ms;rightEye.end+1500ms"
          dur="250ms"
          fill="freeze"
          id="rightEye"
          values={rightEye}
        />

        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1750ms"
          keySplines={bounceKeySplines}
          keyTimes={boundKeyTimes}
          repeatCount="indefinite"
          type="translate"
          values={rightEyeTranslate}
        />
      </path>
    </g>
  </svg>
);

export default ProgressBitbot;
