import convert from "color-convert"
import { ACCENT_COLOR_LIGHTNESS, ACCENT_COLOR_SATURATION } from "./Constants"

export function getColor(hue: number, darkness: number) {
	return "#"+convert.hsl.hex([hue, ACCENT_COLOR_SATURATION, ACCENT_COLOR_LIGHTNESS - 5 * darkness])
}

export function getRandomHue(): number {
	return Math.floor(Math.random()*360)
}