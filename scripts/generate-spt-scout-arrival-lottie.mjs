/**
 * Simple Property · scout glass + sword shimmer (Bodymovin v5)
 * Usage: node scripts/generate-spt-scout-arrival-lottie.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs/lottie-source");
const PUBLIC_JSON = join(ROOT, "web/lottie/spt-scout-arrival-lottie.json");

const FR = 30;
const OP = 48;
const W = 240;
const H = 240;

const BG = [0.957, 0.941, 0.902, 1];
const INK = [0.239, 0.204, 0.161, 1];
const BLUE = [0.231, 0.353, 0.471, 1];
const GOLD = [0.788, 0.635, 0.153, 1];
const GOLD_BRIGHT = [0.91, 0.78, 0.42, 1];

function ksStatic(o = 100, p = [120, 120, 0], s = [100, 100, 100]) {
  return {
    o: { a: 0, k: o },
    r: { a: 0, k: 0 },
    p: { a: 0, k: p },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: s },
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

function ellipseStroke(size, color, width) {
  return [
    {
      ty: "gr",
      it: [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [size, size] } },
        {
          ty: "st",
          c: { a: 0, k: color },
          o: { a: 0, k: 100 },
          w: { a: 0, k: width },
          lc: 2,
          lj: 2,
        },
        {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
        },
      ],
      nm: "ring",
      np: 2,
      cix: 2,
      bm: 0,
    },
  ];
}

function rectFill(w, h, color, round = 0) {
  return [
    {
      ty: "gr",
      it: [
        {
          ty: "rc",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [w, h] },
          r: { a: 0, k: round },
        },
        { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
        {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
        },
      ],
      nm: "rect",
      np: 2,
      cix: 2,
      bm: 0,
    },
  ];
}

const lottie = {
  v: "5.7.4",
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: "SPT Scout Arrival",
  ddd: 0,
  assets: [],
  layers: [
    {
      ind: 1,
      ty: 4,
      nm: "BG",
      sr: 1,
      ks: ksStatic(),
      ao: 0,
      shapes: rectFill(W, H, BG),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 2,
      ty: 4,
      nm: "Glass lens",
      sr: 1,
      ks: {
        o: ksOpacity([
          [0, 12],
          [12, 28],
          [28, 55],
          [OP, 40],
        ]),
        r: { a: 0, k: -18 },
        p: { a: 0, k: [98, 108, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: ellipseStroke(52, BLUE, 3.2),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 3,
      ty: 4,
      nm: "Glass handle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 42 },
        p: { a: 0, k: [128, 138, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(34, 7, INK, 3),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 4,
      ty: 4,
      nm: "Sword blade",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: -32 },
        p: { a: 0, k: [152, 118, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [92, 92, 100] },
            { t: 18, s: [100, 100, 100] },
            { t: OP, s: [108, 108, 100] },
          ],
        },
      },
      ao: 0,
      shapes: rectFill(12, 72, INK, 2),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 5,
      ty: 4,
      nm: "Sword guard",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: -32 },
        p: { a: 0, k: [138, 148, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(36, 6, GOLD, 2),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 6,
      ty: 4,
      nm: "Shimmer sweep",
      sr: 1,
      ks: {
        o: ksOpacity([
          [0, 0],
          [10, 0],
          [20, 90],
          [34, 100],
          [OP, 0],
        ]),
        r: { a: 0, k: -25 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [72, 92, 0] },
            { t: 20, s: [120, 120, 0] },
            { t: OP, s: [168, 148, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(56, 4, GOLD_BRIGHT, 2),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
    {
      ind: 7,
      ty: 4,
      nm: "Lens glint",
      sr: 1,
      ks: {
        o: ksOpacity([
          [0, 0],
          [16, 0],
          [26, 75],
          [38, 0],
        ]),
        r: { a: 0, k: -40 },
        p: { a: 0, k: [88, 96, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: rectFill(22, 3, GOLD_BRIGHT, 1),
      ip: 0,
      op: OP,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(PUBLIC_JSON), { recursive: true });
writeFileSync(join(OUT_DIR, "spt-scout-arrival-lottie.v0.json"), JSON.stringify(lottie));
writeFileSync(PUBLIC_JSON, JSON.stringify(lottie));
console.log("[generate-spt-scout-arrival-lottie] OK", PUBLIC_JSON);
