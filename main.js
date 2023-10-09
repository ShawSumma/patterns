
import time from './timer.js';
import {noise2} from './perlin.js';
import {Tree} from './tree.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

document.body.style.textAlign = 'center';
document.body.style.overflow = 'hidden';
canvas.style.margin = 'auto';
canvas.style.aspectRatio = '1 / 1';

canvas.width = '100%';
canvas.height = '100%';

{
    const resize = () => {
        const w = innerWidth;
        const h = innerHeight;
        canvas.width = w;
        canvas.height = h;
    }

    document.body.addEventListener('resize', resize);

    resize();
}

const zoom = 1;
const powSize = 11;
const size = 1 << powSize;
const sizeMinusOne = size - 1;
const zoom2 = zoom * 2;
const upscale = 0.02;
const speed = 0.1;

let xo = size * 16;
let yo = size * 16;

const grid = new Uint8Array(size * size);

const get = (x, y) => {
    return grid[((x & sizeMinusOne) << powSize) + (y & sizeMinusOne)];
};

const set = (x, y, i) => {
    grid[((x & sizeMinusOne) << powSize) + (y & sizeMinusOne)] = i;
}

const noise = [];

for (let x = 0; x < 8; x++) {
    noise.push([2 ** x, 0.5 ** x]);
}

{
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            let n = 0;
            for (const [up, f] of noise) {
                n += noise2(x * upscale * up, y * upscale * up) * f;
            }
            set(x, y, Math.floor(n * 256));
        }
    }
}

const keys = new Set();
{
    const keydown = (event) => {
        keys.add(event.key)
    };

    const keyup = (event) => {
        keys.delete(event.key);
    };

    document.body.addEventListener('keydown', keydown);
    document.body.addEventListener('keyup', keyup);
}

const main = () => {
    let fps = 0;
    const fpsHistoryLength = 300;
    let fpsHistory = Array(fpsHistoryLength).fill(0);
    let lastTime = time();
    
    const reportHistory = (n) => {
        while (fpsHistory.length >= fpsHistoryLength) {
            fpsHistory.shift();
        }
        fpsHistory.push(n);
    };

    const reportFps = () => {
        if (fps === Infinity) {
            return;
        }
        reportHistory(fps);
    };

    setInterval(reportFps, 1000 / 20);

    const drawFpsHistory = (x, y, w, h) => {
        const fontSize = 16;
        ctx.translate(x, y);
        try {
            ctx.fillStyle = `hsl(90, 50%, 20%)`;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = `hsl(90, 60%, 40%)`;
            ctx.fillRect(5, 5, w - 10, h - 10);
            let x = 5;
            ctx.fillStyle = `hsl(90, 80%, 50%)`
            const blockWidth = (w - 11) / fpsHistory.length;
            const maxHistory = fpsHistory.reduce((x, y) => Math.max(x, y), 0);
            for (const ent of fpsHistory) {
                const n = ent / (maxHistory) * (h - 10 - (fontSize + 4));
                ctx.beginPath();
                ctx.fillRect(x - 0.5, h - 5 - n, blockWidth + 1, n);
                x += blockWidth;
            }
            ctx.fillStyle = `hsl(90, 100%, 50%)`
            if (fpsHistory.length != 0) {
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(`${fpsHistory[fpsHistory.length - 1] | 0} FPS`, 5 + 2, 5 + fontSize);
            }
        } finally {
            ctx.translate(-x, -y);
        }
    };

    const tree = new Tree('black', [0, 0], [1 << 20, 1 << 20]);

    for (let x = 0; x < 90; x++) {
        tree.set([x, x], [100-x, 100-x], x % 2 ? 'red' : 'blue');
    }
    
    const frame = () => {
        requestAnimationFrame(frame);
        
        const curTime = time();

        const deltaTime = curTime - lastTime;

        lastTime = curTime;

        const xsize = canvas.width;
        const ysize = canvas.height;

        tree.draw(ctx);

        const endTime = time();
        fps = 1000 / (endTime - curTime);
        // drawFpsHistory(10, 10, 200, 100);
    };

    frame();
};

main();
