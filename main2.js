
import time from './timer.js';
import {noise2} from './perlin.js';

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
    let width = 0;
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
        reportHistory(fps);
    };

    setInterval(reportFps, 1000 / 20);

    const drawRawFps = () => {
        const fontSize = 40;
        const txt = `fps: ${fps | 0}`;
        const txtMetrics = ctx.measureText(txt);
        if (txtMetrics.width > width) {
            width = txtMetrics.width;
        }
        ctx.fillRect(0, 0, width + 20, fontSize * 1.5 + 10);
        ctx.fillStyle = 'red';
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(txt, 10, fontSize + 10);
    };

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

    const imageDataBox = ctx.createImageData(canvas.width, canvas.height);
    const imageData = imageDataBox.data;

    const frame = () => {
        requestAnimationFrame(frame);
        
        const curTime = time();

        const deltaTime = curTime - lastTime;

        lastTime = curTime;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const xsize = canvas.width;
        const ysize = canvas.height;

        if (keys.has('w')) {
            yo -= deltaTime * speed;
        }

        if (keys.has('s')) {
            yo += deltaTime * speed;
        }

        if (keys.has('a')) {
            xo -= deltaTime * speed;
        }

        if (keys.has('d')) {
            xo += deltaTime * speed;
        }

        const start = time();
        if (zoom2 <= 1) {
            let pixel = 0;
            for (let y = 0; y < ysize; y++) {
                for (let x = 0; x < xsize; x++) {
                    const isSet = get(x+xo, y+yo) < 128;
                    const n = isSet ? 255 : 0;
                    imageData[pixel++] = n;
                    imageData[pixel++] = n;
                    imageData[pixel++] = n;
                    imageData[pixel++] = 255;
                }
            }
            ctx.putImageData(imageDataBox, 0, 0);
        } else {
            let i = 0;
            let x = xo / zoom2 - 2 | 0;
            ctx.fillStyle = 'black';
            while (true) {
                x += 1;
                const x0p = x * zoom2 - xo; 
                const x1p = x0p + zoom + 0.5; 
                const x2p = x1p + zoom + 0.5; 
                if (x0p > xsize) {
                    break;
                }
                let y = yo / zoom2 - 2 | 0;
                while (true) {
                    y += 1;
                    i++;
                    const y0p = y * zoom2 - yo;
                    if (y0p > ysize) {
                        break;
                    }
                    const y1p = y0p + zoom + 0.5; 
                    const y2p = y1p + zoom + 0.5; 
                    const x0y0 = get(x, y) >= 128;
                    const x0y2 = get(x, y+1) >= 128;
                    const x2y0 = get(x+1, y) >= 128;
                    const x2y2 = get(x+1, y+1) >= 128;
                    if (x0y0) {
                        if (x0y2) {
                            if (x2y0) {
                                if (x2y2) {
                                    // ctx.fillStyle = 'black';
                                    ctx.fillRect(x0p, y0p, zoom2 + 1, zoom2 + 1);
                                } else {
                                    // ctx.fillStyle = 'red';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y0p);
                                    ctx.lineTo(x0p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.lineTo(x2p, y0p);
                                    ctx.closePath();
                                    ctx.fill();
                                }
                            } else {
                                if (x2y2) {
                                    // ctx.fillStyle = 'yellow';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.lineTo(x2p, y2p);
                                    ctx.lineTo(x0p, y2p);
                                    ctx.closePath();
                                    ctx.fill();
                                } else {
                                    // ctx.fillStyle = 'orange';
                                    ctx.fillRect(x0p, y0p, zoom, zoom2 + 1);
                                }
                            }
                        } else {
                            if (x2y0) {
                                if (x2y2) {
                                    // ctx.fillStyle = 'blue';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.lineTo(x0p, y0p);
                                    ctx.lineTo(x2p, y0p);
                                    ctx.closePath();
                                    ctx.fill();
                                } else {
                                    // ctx.fillStyle = 'purple';
                                    ctx.fillRect(x0p, y0p, zoom2 + 1, zoom + 1);
                                }
                            } else {
                                if (x2y2) {
                                    // ctx.fillStyle = 'red';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                    // ctx.fillStyle = 'green';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                } else {
                                    // ctx.fillStyle = 'green';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                }
                            }
                        }
                    } else {
                        if (x0y2) {
                            if (x2y0) {
                                if (x2y2) {
                                    // ctx.fillStyle = 'green';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.lineTo(x0p, y2p);
                                    ctx.lineTo(x2p, y2p);
                                    ctx.closePath();
                                    ctx.fill();
                                } else {
                                    // ctx.fillStyle = 'blue';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                    // ctx.fillStyle = 'yellow';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                }
                            } else {
                                if (x2y2) {
                                    // ctx.fillStyle = 'chartreuse';
                                    ctx.fillRect(x0p, y1p, zoom2 + 1, zoom + 1);
                                } else {
                                    // ctx.fillStyle = 'blue';
                                    ctx.beginPath();
                                    ctx.moveTo(x0p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x0p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                }
                            }
                        } else {
                            if (x2y0) {
                                if (x2y2) {
                                    // ctx.fillStyle = 'cyan';
                                    ctx.fillRect(x1p, y0p, zoom + 1, zoom2 + 1);
                                } else {
                                    // ctx.fillStyle = 'yellow';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y0p);
                                    ctx.lineTo(x1p, y0p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                }
                            } else {
                                if (x2y2) {
                                    // ctx.fillStyle = 'red';
                                    ctx.beginPath();
                                    ctx.moveTo(x2p, y2p);
                                    ctx.lineTo(x1p, y2p);
                                    ctx.lineTo(x2p, y1p);
                                    ctx.closePath();
                                    ctx.fill();
                                } else {
                                }
                            }
                        }
                    }
                }
            }
        }
        const end = time();
        fps = 1000 / (end - start);
        // drawRawFps();
        drawFpsHistory(10, 10, 200, 100);
    };

    frame();
};

main();
