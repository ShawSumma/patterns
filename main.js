
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
    const Matter = window.Matter;
    const Engine = Matter.Engine;
    const Runner = Matter.Runner;
    const Render = Matter.Render;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    
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
        const fontSize = 12;
        const border = 2;
        ctx.translate(x, y);
        try {
            ctx.fillStyle = `hsl(90, 50%, 20%)`;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = `hsl(90, 60%, 40%)`;
            ctx.fillRect(border, border, w - border * 2, h - border * 2);
            let x = 5;
            ctx.fillStyle = `hsl(90, 80%, 50%)`
            const blockWidth = (w - 11) / fpsHistory.length;
            const maxHistory = fpsHistory.reduce((x, y) => Math.max(x, y), 0);
            for (const ent of fpsHistory) {
                const n = ent / (maxHistory) * (h - border * 2 - (fontSize + 4));
                ctx.beginPath();
                ctx.fillRect(x - 0.5, h - border * 2 + 1 - n, blockWidth + 1, n);
                x += blockWidth;
            }
            ctx.fillStyle = `hsl(90, 100%, 50%)`
            if (fpsHistory.length != 0) {
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(`${fpsHistory[fpsHistory.length - 1] | 0} FPS`, border + 1, border - 2 + fontSize);
            }
        } finally {
            ctx.translate(-x, -y);
        }
    };

    const tree = new Tree('black', [0, 0], [1 << 12, 1 << 12]);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            if (noise2(x / (200) - 0.15, y / (50)) > 0.52) {
                tree.set([x, y], [x + 1, y + 1], 'red');
            }
        }
    }

    console.log(tree.nodes());

    const engine = Engine.create();

    let boxes = [];


    const balls = [];

    document.addEventListener('click', (event) => {
        const ball = Bodies.circle(event.pageX, event.pageY, 10, {
            restitution: 0.5,
            inertia: 0.01,
        });
        ball.friction = 0;
        balls.push(ball);
        Composite.add(engine.world, [ball]);
    })

    // console.log(ball);

    const gen = () => {
        Composite.remove(engine.world, boxes)
        boxes = [];
        
        tree.forEach((color, low, high) => {
            if (color === 'black' || color == null) {
                return;
            }
            const w = (high[0] - low[0]);
            const h = (high[1] - low[1]);
            const body = Bodies.rectangle(
                low[0] + w/2,
                low[1] + h/2,
                w,
                h,
                {
                    isStatic: true,
                },
            );
            body.friction = 0;
            boxes.push(body);
        });

        Composite.add(engine.world, boxes);
    };

    gen();

    const runner = Runner.create();

    Runner.run(runner, engine);


    // const render = Render.create({
    //     canvas: canvas,
    //     engine: engine,
    //     options: {},
    // });

    // Render.run(render);

    const frame = () => {
        requestAnimationFrame(frame);
        
        const curTime = time();

        const deltaTime = curTime - lastTime;

        lastTime = curTime;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const box of boxes) {
            const size = Math.sqrt(box.area);
            ctx.fillStyle = 'black';
            ctx.fillRect(box.position.x - size/2, box.position.y - size/2, size, size);
        }
        
        // const xsize = canvas.width;
        // const ysize = canvas.height;

        // tree.draw(ctx);

        ctx.fillStyle = 'cyan';
        for (const ball of balls) {
            console.log(ball);
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.circleRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        const endTime = time();
        fps = 1000 / (endTime - curTime);

        drawFpsHistory(10, 10, 100, 50);
    };

    frame();
};

document.addEventListener('DOMContentLoaded', main);
