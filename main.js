
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

document.body.style.textAlign = 'center';
canvas.style.margin = 'auto';
canvas.style.maxWidth = '100vw';
canvas.style.maxHeight = '100vh';
canvas.style.aspectRatio = '1 / 1';

canvas.width = '100%';
canvas.height = '100%';

const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

document.body.addEventListener('resize', resize);

resize();

const zoom = 4;
const size = 16;
const sizeMinusOne = size - 1;

const grid = new Uint8Array(size * size);

const get = (x, y) => {
    return grid[x % size * size + y % size];
};

const set = (x, y, i) => {
    grid[x % size * size + y % size] = i;
}

{
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (Math.random() < 1 / 2) {
                set(x, y, 255);
            }
        }
    }
}

set(10, 10, 255);
set(11, 11, 255);
set(10, 12, 255);

const main = async () => {
    const frame = () => {
        requestAnimationFrame(frame);
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const xsize = canvas.width;
        const ysize = canvas.height;

        const start = new Date();
        let x = 0;
        ctx.fillStyle = 'black';
        while (true) {
            x += 1;
            const x0p = x * zoom * 2; 
            const x1p = x0p + zoom; 
            const x2p = x1p + zoom; 
            if (x0p > xsize) {
                break;
            }
            let y = 0;
            while (true) {
                y += 1;
                const x0y0 = get(x, y) >= 128;
                const x0y2 = get(x, y+1) >= 128;
                const x2y0 = get(x+1, y) >= 128;
                const x2y2 = get(x+1, y+1) >= 128;
                const y0p = y * zoom * 2;
                const y1p = y0p + zoom; 
                const y2p = y1p + zoom; 
                if (y0p > ysize) {
                    break;
                }
                if (x0y0) {
                    if (x0y2) {
                        if (x2y0) {
                            if (x2y2) {
                                // ctx.fillStyle = 'black';
                                ctx.fillRect(x0p, y0p, zoom * 2, zoom * 2);
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
                                ctx.fillRect(x0p, y0p, zoom, zoom * 2);
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
                                ctx.fillRect(x0p, y0p, zoom * 2, zoom);
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
                                ctx.fillRect(x0p, y1p, zoom * 2, zoom);
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
                                ctx.fillRect(x1p, y0p, zoom, zoom * 2);
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
        const end = new Date();
        // ctx.fillStyle = 'red';
        // ctx.font = '40px monospace';
        // ctx.fillText(`fps: ${(10000 / (end - start) | 0) / 10}`, 10, 50);
        // console.log();
    };

    frame();
};

main()
    .catch(e => console.error(e));
