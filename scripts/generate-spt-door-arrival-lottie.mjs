/**
 * Simple Property — greystone door-open Lottie (Bodymovin v5)
 * Usage: node scripts/generate-spt-door-arrival-lottie.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOTTIE_FR,
  LOTTIE_OP,
  LOTTIE_HOLD_FRAMES,
} from './lib/door-arrival-canon.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs/lottie-source');
const PUBLIC_JSON = join(ROOT, 'web/lottie/spt-door-arrival-lottie.json');

const FR = LOTTIE_FR;
const OP = LOTTIE_OP;
const HOLD = LOTTIE_HOLD_FRAMES;
const W = 240;
const H = 240;

/** Greystone + steel door · match simple-property.css + favicon mark */
function hexToLottie(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
}

const BG = hexToLottie('#f4f0e6');
const FRAME_EDGE = hexToLottie('#b8b2a8');
const FRAME_FILL = hexToLottie('#d8d4cc');
const DOOR_STEEL = hexToLottie('#4a5058');
const DOOR_STEEL_HI = hexToLottie('#5a6169');
const INK = hexToLottie('#3d3429');
const SEAM = hexToLottie('#c9a227');
const GOLD = hexToLottie('#c9a227');
const SAGE = hexToLottie('#4a6741');

function ksPos(frames) {
  return {
    a: 1,
    k: frames.map(([t, x, y]) => ({
      i: { x: 0.42, y: 1 },
      o: { x: 0.58, y: 0 },
      t,
      s: [x, y, 0],
    })),
  };
}

function ksOpacity(frames) {
  return {
    a: 1,
    k: frames.map(([t, o]) => ({
      i: { x: 0.33, y: 1 },
      o: { x: 0.67, y: 0 },
      t,
      s: [o],
    })),
  };
}

function ksStatic(o = 100, p = [120, 120, 0], s = [100, 100, 100]) {
  return {
    o: { a: 0, k: o },
    r: { a: 0, k: 0 },
    p: { a: 0, k: p },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: s },
  };
}

function rectFill(w, h, color, round = 0) {
  const items = [
    {
      ty: 'rc',
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [w, h] },
      r: { a: 0, k: round },
    },
    { ty: 'fl', c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
    {
      ty: 'tr',
      p: { a: 0, k: [0, 0] },
      a: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 100 },
      sk: { a: 0, k: 0 },
      sa: { a: 0, k: 0 },
    },
  ];
  return [{ ty: 'gr', it: items, nm: 'rect', np: 3, cix: 2, bm: 0 }];
}

function strokeRect(w, h, color, width) {
  const items = [
    {
      ty: 'rc',
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [w, h] },
      r: { a: 0, k: 6 },
    },
    {
      ty: 'st',
      c: { a: 0, k: color },
      o: { a: 0, k: 100 },
      w: { a: 0, k: width },
      lc: 2,
      lj: 2,
    },
    {
      ty: 'tr',
      p: { a: 0, k: [0, 0] },
      a: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 100 },
      sk: { a: 0, k: 0 },
      sa: { a: 0, k: 0 },
    },
  ];
  return [{ ty: 'gr', it: items, nm: 'frame', np: 3, cix: 2, bm: 0 }];
}

function circleFill(diameter, color) {
  const items = [
    {
      ty: 'el',
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [diameter, diameter] },
    },
    { ty: 'fl', c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
    {
      ty: 'tr',
      p: { a: 0, k: [0, 0] },
      a: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 100 },
      sk: { a: 0, k: 0 },
      sa: { a: 0, k: 0 },
    },
  ];
  return [{ ty: 'gr', it: items, nm: 'dot', np: 3, cix: 2, bm: 0 }];
}

const lottie = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'SPT Door Arrival',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'BG',
      sr: 1,
      ks: ksStatic(100, [120, 120, 0]),
      ao: 0,
      shapes: rectFill(W, H, BG),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Frame',
      sr: 1,
      ks: ksStatic(100, [120, 120, 0]),
      ao: 0,
      shapes: [
        ...rectFill(132, 168, FRAME_FILL, 6),
        ...strokeRect(132, 168, FRAME_EDGE, 2.5),
      ],
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 7,
      ty: 4,
      nm: 'Pediment',
      sr: 1,
      ks: ksStatic(100, [120, 52, 0]),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-36, 14], [36, 14], [0, -22]],
                  c: true,
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: SAGE }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
            {
              ty: 'st',
              c: { a: 0, k: INK },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 1.2 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: 'sage peak',
          np: 4,
          cix: 2,
          bm: 0,
        },
      ],
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Light seam',
      sr: 1,
      ks: {
        o: ksOpacity([
          [0, 0],
          [HOLD, 0],
          [HOLD + 10, 0],
          [HOLD + 22, 100],
          [OP, 85],
        ]),
        r: { a: 0, k: 0 },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [8, 100, 100] },
            { t: HOLD, s: [8, 100, 100] },
            { t: HOLD + 22, s: [22, 100, 100] },
            { t: OP, s: [28, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: rectFill(8, 140, SEAM, 2),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Door L',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: ksPos([
          [0, 120, 120],
          [HOLD, 120, 120],
          [HOLD + 8, 120, 120],
          [OP, 52, 120],
        ]),
        a: { a: 0, k: [34, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        ...rectFill(68, 156, DOOR_STEEL, 2),
        ...rectFill(52, 132, DOOR_STEEL_HI, 1),
      ],
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: 'Door R',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: ksPos([
          [0, 120, 120],
          [HOLD, 120, 120],
          [HOLD + 8, 120, 120],
          [OP, 188, 120],
        ]),
        a: { a: 0, k: [-34, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        ...rectFill(68, 156, DOOR_STEEL, 2),
        ...rectFill(52, 132, DOOR_STEEL_HI, 1),
      ],
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 8,
      ty: 4,
      nm: 'Knob',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: ksPos([
          [0, 120, 120],
          [HOLD, 120, 120],
          [HOLD + 8, 120, 120],
          [OP, 168, 128],
        ]),
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: circleFill(10, GOLD),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

mkdirSync(OUT_DIR, { recursive: true });
const srcPath = join(OUT_DIR, 'spt-door-arrival-lottie.v0.json');
writeFileSync(srcPath, JSON.stringify(lottie));
writeFileSync(PUBLIC_JSON, JSON.stringify(lottie));
console.log('[generate-spt-door-arrival-lottie] OK', srcPath, PUBLIC_JSON);
