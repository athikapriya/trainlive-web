import { CiStreamOn } from "react-icons/ci";
import { TbLiveView } from "react-icons/tb";
import { MdMyLocation } from "react-icons/md";
import { FiLayers } from "react-icons/fi";

export function ShowLiveIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <CiStreamOn
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function ShareLiveIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <TbLiveView
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function MyLocationIcon({ size = 20 }) {
  return (
    <MdMyLocation
      size={size}
      aria-hidden="true"
    />
  );
}

export function LayersIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <FiLayers
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}