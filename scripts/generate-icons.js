import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * (isMaskable ? 0.38 : 0.46);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep Dark Cyber Background
      let r = 4;
      let g = 9;
      let b = 17;
      let a = 255;

      if (dist <= maxR) {
        // Outer concentric cyber rings
        const outerRing = Math.abs(dist - maxR * 0.95);
        if (outerRing < maxR * 0.05) {
          r = 0;
          g = 229;
          b = 255;
        }

        const midRing = Math.abs(dist - maxR * 0.75);
        if (midRing < maxR * 0.04) {
          r = 56;
          g = 189;
          b = 248;
        }

        // Inner glowing ambient hydro pool
        if (dist <= maxR * 0.6) {
          const poolGlow = 1 - dist / (maxR * 0.6);
          r = Math.min(255, Math.floor(10 + poolGlow * 80));
          g = Math.min(255, Math.floor(60 + poolGlow * 170));
          b = Math.min(255, Math.floor(120 + poolGlow * 135));
        }

        // Water droplet shape
        const dropTopY = cy - maxR * 0.45;
        const dropBottomY = cy + maxR * 0.22;
        const dropBaseR = maxR * 0.28;

        if (y >= dropTopY && y <= dropBottomY + dropBaseR) {
          const t = Math.max(0, Math.min(1, (y - dropTopY) / (dropBottomY - dropTopY)));
          const halfWidthAtY = t * dropBaseR;

          const dyBase = y - dropBottomY;
          const insideCircle = (dx * dx + dyBase * dyBase) <= (dropBaseR * dropBaseR);
          const insideTaper = Math.abs(dx) <= halfWidthAtY && y < dropBottomY;

          if (insideCircle || insideTaper) {
            const depth = Math.sqrt(dx * dx + (y - dropBottomY) * (y - dropBottomY)) / dropBaseR;
            r = Math.min(255, Math.floor(220 - depth * 140));
            g = Math.min(255, Math.floor(245 - depth * 60));
            b = 255;

            // Highlight caustic reflection
            if (dx < -dropBaseR * 0.2 && dx > -dropBaseR * 0.6 && y > cy - maxR * 0.1 && y < cy + maxR * 0.1) {
              r = 255;
              g = 255;
              b = 255;
            }

            // Central "AS" Symbol Pixel Matrix Inside Droplet
            const asCx = cx;
            const asCy = cy + maxR * 0.08;
            const relX = (x - asCx) / (maxR * 0.18);
            const relY = (y - asCy) / (maxR * 0.18);

            // 'A' on left (-0.9 to -0.1)
            const isA_leftLeg = Math.abs(relX - (-0.5 - relY * 0.35)) < 0.12 && relY >= -0.8 && relY <= 0.8;
            const isA_rightLeg = Math.abs(relX - (-0.5 + relY * 0.35)) < 0.12 && relY >= -0.8 && relY <= 0.8;
            const isA_crossbar = Math.abs(relY - 0.1) < 0.1 && relX >= -0.75 && relX <= -0.25;

            // 'S' on right (0.1 to 0.9)
            const isS_top = Math.abs(relY - (-0.7)) < 0.12 && relX >= 0.2 && relX <= 0.75;
            const isS_mid = Math.abs(relY - 0.0) < 0.12 && relX >= 0.2 && relX <= 0.75;
            const isS_bot = Math.abs(relY - 0.7) < 0.12 && relX >= 0.2 && relX <= 0.75;
            const isS_left = Math.abs(relX - 0.2) < 0.12 && relY >= -0.7 && relY <= 0.0;
            const isS_right = Math.abs(relX - 0.75) < 0.12 && relY >= 0.0 && relY <= 0.7;

            if (isA_leftLeg || isA_rightLeg || isA_crossbar || isS_top || isS_mid || isS_bot || isS_left || isS_right) {
              r = 255;
              g = 255;
              b = 255;
            }
          }
        }

        // Base Water Ripple Ellipse
        const ripY = dy - maxR * 0.4;
        const ripDist = Math.abs(dx * dx / (maxR * 0.4 * maxR * 0.4) + ripY * ripY / (maxR * 0.08 * maxR * 0.08) - 1);
        if (ripDist < 0.2) {
          r = 0;
          g = 229;
          b = 255;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = zlib.crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180));

console.log('Water hydro-arc with AS Symbol PNG Icons generated successfully.');
