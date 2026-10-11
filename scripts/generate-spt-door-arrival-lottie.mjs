/**
 * Simple Property — greystone door-open Lottie (Bodymovin v5)
 * Usage: node scripts/generate-spt-door-arrival-lottie.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs/lottie-source');
const PUBLIC_JSON = join(ROOT, 'web/lottie/spt-door-arrival-lottie.json');

const FR = 30;
const OP = 48; // 1.6s wall (WWL arrival canon)
const W = 240;
const H = 240;

const BG = [0.957, 0.941, 0.902, 1];
const PANEL = [0.239, 0.204, 0.161, 1];
const EDGE = [0.549, 0.514, 0.439, 1];
const SEAM = [0.788, 0.635, 0.153, 1];
const GOLD = [0.831, 0.659, 0.263, 1];

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
      shapes: strokeRect(132, 168, EDGE, 2.5),
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
          [10, 0],
          [22, 100],
          [OP, 85],
        ]),
        r: { a: 0, k: 0 },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [8, 100, 100] },
            { t: 22, s: [22, 100, 100] },
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
          [8, 120, 120],
          [OP, 52, 120],
        ]),
        a: { a: 0, k: [34, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(68, 156, PANEL, 4),
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
          [8, 120, 120],
          [OP, 188, 120],
        ]),
        a: { a: 0, k: [-34, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(68, 156, PANEL, 4),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 6,
      ty: 4,
      nm: 'SPT monogram',
      sr: 1,
      ks: {
        o: ksOpacity([
          [0, 0],
          [14, 0],
          [26, 100],
          [OP, 0],
        ]),
        r: { a: 0, k: 0 },
        p: { a: 0, k: [120, 118, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'rc',
              p: { a: 0, k: [-18, -6] },
              s: { a: 0, k: [36, 3] },
              r: { a: 0, k: 0 },
            },
            {
              ty: 'rc',
              p: { a: 0, k: [-18, 6] },
              s: { a: 0, k: [36, 3] },
              r: { a: 0, k: 0 },
            },
            { ty: 'fl', c: { a: 0, k: GOLD }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
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
          nm: 'sp bars',
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
  ],
  markers: [],
};

mkdirSync(OUT_DIR, { recursive: true });
const srcPath = join(OUT_DIR, 'spt-door-arrival-lottie.v0.json');
writeFileSync(srcPath, JSON.stringify(lottie));
writeFileSync(PUBLIC_JSON, JSON.stringify(lottie));
console.log('[generate-spt-door-arrival-lottie] OK', srcPath, PUBLIC_JSON);
