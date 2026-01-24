import type { SVGProps } from "react";

/**
 * Returns an animated loader icon as an SVG element.
 *
 * @see https://tabler.io/icons - icon: target-arrow
 * @see https://maxwellito.github.io/vivus-instant/ - for the animation technique
 *
 */
const AnimatedLoaderIcon = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 24}
      height={props.height ?? 24}
      viewBox={props.viewBox ?? "0 0 24 24"}
      fill={props.fill ?? "none"}
      stroke={props.color ?? "currentColor"}
      strokeWidth={props.strokeWidth ?? 1.5}
      strokeLinecap={props.strokeLinecap ?? "round"}
      strokeLinejoin={props.strokeLinejoin ?? "round"}
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" className="path_0" />
      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" className="path_1" />
      <path d="M12 7a5 5 0 1 0 5 5" className="path_2" />
      <path d="M13 3.055a9 9 0 1 0 7.941 7.945" className="path_3" />
      <path d="M15 6v3h3l3 -3h-3v-3z" className="path_4" />
      <path d="M15 9l-3 3" className="path_5" />
    </svg>
  );
};

export default AnimatedLoaderIcon;
