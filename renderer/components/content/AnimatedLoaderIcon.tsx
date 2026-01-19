/**
 * Returns an animated loader icon as an SVG element.
 *
 * @see https://tabler.io/icons - icon: target-arrow
 * @see https://maxwellito.github.io/vivus-instant/ - for the animation technique
 *
 */
const AnimatedLoaderIcon = ({
  width = 24,
  height = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className = "",
  style = {},
  animationDuration = 3000, // in ms
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-tabler icons-tabler-outline icon-tabler-target-arrow ${className}`}
      style={style}
    >
      <path
        stroke="none"
        d="M0 0h24v24H0z"
        fill="none"
        className="auDeVowy_0"
      />
      <path
        d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
        className="auDeVowy_1"
      />
      <path d="M12 7a5 5 0 1 0 5 5" className="auDeVowy_2" />
      <path d="M13 3.055a9 9 0 1 0 7.941 7.945" className="auDeVowy_3" />
      <path d="M15 6v3h3l3 -3h-3v-3z" className="auDeVowy_4" />
      <path d="M15 9l-3 3" className="auDeVowy_5" />
      <style>
        {`
          .auDeVowy_0{stroke-dasharray:96 98;stroke-dashoffset:97;animation:auDeVowy_draw_0 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}
          .auDeVowy_1{stroke-dasharray:7 9;stroke-dashoffset:8;animation:auDeVowy_draw_1 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}
          .auDeVowy_2{stroke-dasharray:24 26;stroke-dashoffset:25;animation:auDeVowy_draw_2 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}
          .auDeVowy_3{stroke-dasharray:45 47;stroke-dashoffset:46;animation:auDeVowy_draw_3 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}
          .auDeVowy_4{stroke-dasharray:21 23;stroke-dashoffset:22;animation:auDeVowy_draw_4 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}
          .auDeVowy_5{stroke-dasharray:5 7;stroke-dashoffset:6;animation:auDeVowy_draw_5 ${animationDuration}ms ease-in-out infinite,auDeVowy_fade ${animationDuration}ms linear infinite;}

          @keyframes auDeVowy_fade {
            0% {stroke-opacity:1;}
            81.8% {stroke-opacity:1;}
            100% {stroke-opacity:0;}
          }

          @keyframes auDeVowy_draw_0 {
            18.18%{stroke-dashoffset:97;}
            39.79%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
          @keyframes auDeVowy_draw_1 {
            39.79%{stroke-dashoffset:8;}
            41.57%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
          @keyframes auDeVowy_draw_2 {
            41.57%{stroke-dashoffset:25;}
            47.14%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
          @keyframes auDeVowy_draw_3 {
            47.14%{stroke-dashoffset:46;}
            57.39%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
          @keyframes auDeVowy_draw_4 {
            57.39%{stroke-dashoffset:22;}
            62.29%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
          @keyframes auDeVowy_draw_5 {
            62.29%{stroke-dashoffset:6;}
            63.63%{stroke-dashoffset:0;}
            100%{stroke-dashoffset:0;}
          }
        `}
      </style>
    </svg>
  );
};

export default AnimatedLoaderIcon;
