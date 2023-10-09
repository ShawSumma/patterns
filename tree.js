
export const Tree = class {
    constructor(color, low, high) {
        this.low = low;
        this.high = high;
        this.color = color;
    }

    nodes() {
        let n = 1;
        if (this.children != null) {
            for (const c of this.children) {
                n += c.nodes();
            }
        }
        return n;
    }

    areaOf(color) {
        if (this.children == null) {
            if (this.color == color) {
                return (this.high[0] - this.low[0]) * (this.high[1] - this.low[1]);
            } else {
                return 0;
            }
        } else {
            let r = 0;
            for (const c of this.children) {
                r += c.areaOf(color);
            }
            return r;
        }
    }

    set(low, high, color) {
        if (
            high[0] <= this.low[0] || low[0] > this.high[0]
            || high[1] <= this.low[1] || low[1] > this.high[1]
        ) {
            return;
        }
        if (
            this.low[0] == this.high[0] - 1
            && this.low[1] == this.high[1] - 1
        ) {
            this.color = color;
        } else if (
            low[0] <= this.low[0] && this.high[0] <= high[0]
            && low[1] <= this.low[1] && this.high[1] <= high[1]
        ) {
            this.color = color;
            delete this.children;
        } else {
            this.replace();
            let found = [];
            for (const c of this.children) {
                c.set(
                    low,
                    high,
                    color,
                );
                found.push(c.color);
            }
            if (found.indexOf(found[0]) == 3) {
                this.color = found[0];
                delete this.children;
            }
        }
    }

    replace() {
        if (this.children != null) {
            return;
        }
        const [lowx, lowy] = this.low;
        const [highx, highy] = this.high;
        const midx = (lowx + highx) >> 1;
        const midy = (lowy + highy) >> 1;
        this.children = [
            new Tree(this.color, [lowx, lowy], [midx, midy]),
            new Tree(this.color, [midx, lowy], [highx, midy]),
            new Tree(this.color, [lowx, midy], [midx, highy]),
            new Tree(this.color, [midx, midy], [highx, highy]),
        ];
        delete this.color;
    }

    draw(ctx) {
        const canvas = ctx.canvas;
        if (this.low[0] > canvas.width) {
            return;
        }
        if (this.low[1] > canvas.height) {
            return;
        }
        if (this.high[0] < 0) {
            return;
        }
        if (this.high[1] < 0) {
            return;
        }
        if (this.color != null) {
            ctx.fillStyle = this.color;
            ctx.fillRect(
                this.low[0],
                this.low[1],
                this.high[0] - this.low[0],
                this.high[1] - this.low[1],
            );
        } else if (this.children != null) {
            for (const c of this.children) {
                c.draw(ctx);
            }
        } else {
            // console.error(this);
        }
    }
};
