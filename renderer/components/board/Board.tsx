import React from "react";

const Board = () => {
  /*
   * ORIGINAL FILE: Dartboard_heatmap.svg <https://commons.wikimedia.org/wiki/Category:Dartboards_in_art#/media/File:Dartboard_heatmap.svg>
   * AUTHOR: Cmglee <https://commons.wikimedia.org/wiki/User:Cmglee>
   * LICENSE: CC BY-SA 4.0 <https://creativecommons.org/licenses/by-sa/4.0/>
   * CONVERTED WITH svg2jsx <https://svg2jsx.com/>
   * MODIFIED BY: Tim Deres <https://github.com/timderes/>
   */

  // TODO: The values should be adjustable via the settings
  const colors = {
    black: "black",
    green: "green",
    red: "red",
    stroke: "white",
    white: "white",
  };

  /*
   * x1 = Single Area
   * x2 = Double Ring
   * x3 = Triple Ring
   *
   * There are additionally the zones: `x4`, `x5` and `x6`. These are not
   * included in the array because it is not necessary to loop through them
   *
   * x4 = Outer Bullseye
   * x5 = Inner Bullseye
   * x6 = "Missing" Button (Pressed when the player failed to hit any
   * zones (x1-x5) on the board)
   */
  const paths = ["x1", "x2", "x3"];

  const numbers = [
    20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
  ];

  const circles = {
    outerBullseye: {
      radius: 39,
      fill: colors.green,
      score: 25,
      stroke: colors.white,
    },
    bullseye: {
      radius: 19,
      fill: colors.red,
      score: 50,
      stroke: colors.white,
    },
  };

  const setFillColor = (path: string, idx: number) => {
    switch (path) {
      case "#x1":
        return idx % 2 == 0 ? colors.black : colors.white;
      case "#x2":
      case "#x3":
        return idx % 2 == 0 ? colors.red : colors.green;
      default:
        throw new Error(`Color for path "${path}" cannot be set!`);
    }
  };

  return (
    <>
      <svg
        viewBox="-155 -155 310 310"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <path
            id="x1"
            stroke={colors.stroke}
            d="M-6-38a38 38 0 0112 0l15-95a133 133 0 00-42 0z"
          ></path>
          <path
            id="x2"
            stroke={colors.stroke}
            d="M-21-133a133 133 0 0142 0l3-19a152 152 0 00-48 0z"
          ></path>
          <path
            id="x3"
            stroke={colors.stroke}
            d="M-12-76a76 76 0 0124 0l3-19a95 95 0 00-30 0z"
          ></path>
        </defs>
        <g
          id="board"
          fontFamily="sans-serif"
          fontSize="16px"
          strokeLinejoin="round"
          strokeWidth="0.5"
        >
          {paths.map((path, i) => (
            <React.Fragment key={i}>
              {numbers.map((number, idx) => (
                <use
                  data-score={number * (i + 1)}
                  data-zone={`x${i + 1}-n${number}`}
                  key={idx}
                  fill={setFillColor(`#${path}`, idx)}
                  transform={`rotate(${idx * 18})`}
                  onClick={(e) => console.info(e)}
                  xlinkHref={`#${path}`}
                />
              ))}
            </React.Fragment>
          ))}
          <circle
            data-score={circles.outerBullseye.score}
            data-zone="x4-n1"
            fill={circles.outerBullseye.fill}
            stroke={circles.outerBullseye.stroke}
            r={circles.outerBullseye.radius}
            onClick={(e) => console.info(e)}
          />
          <circle
            data-score={circles.bullseye.score}
            data-zone="x5-n1"
            fill={circles.bullseye.fill}
            stroke={circles.bullseye.stroke}
            r={circles.bullseye.radius}
            onClick={(e) => console.info(e)}
          />
        </g>
      </svg>
      <button
        className="mt-3 px-5"
        data-score={0}
        data-zone="x6-n1"
        onClick={(e) => console.info(e)}
      >
        Missed
      </button>
      <button className="mt-3 w-full" disabled>
        Next Round
      </button>
    </>
  );
};

export default Board;
