import { hsv } from 'color-convert';

const hues = [
  ...Array.from({ length: 30 }).map((_, n) => n),
  ...Array.from({ length: 360 - 110 }).map((_, n) => n + 110),
];

export function toRGBA(hex: string, a: number) {
  return `rgba(${[hex.substr(1, 2), hex.substr(3, 2), hex.substr(5, 2)].map(n => parseInt(n, 16)).join(',')}, ${a})`;
}

export function lighten(hex: string, power: number) {
  return `#${[hex.substr(1, 2), hex.substr(3, 2), hex.substr(5, 2)]
    .map(n => Math.min(255, Math.floor(parseInt(n, 16) * power)))
    .map(n => `0${n.toString(16)}`.substr(-2))
    .join('')}`;
}

export function getPartColor(index: number) {
  return `#${hsv.hex([hues[Math.floor((index % 1) * hues.length)], 80, 90])}`;
}
