import { canvas, GRID_SPEED, TOP_MARGIN_FOR_NEW_GRIDS } from "../app.js";
import Invader from "./Invader.js";
class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: GRID_SPEED, y: 0 };
        this.invaders = [];
        const COLUMNS = Math.floor(Math.random() * 7) + 3, ROWS = Math.floor(Math.random() * 5) + 1;
        this.width = COLUMNS * 30;
        for (let x = 0; x < COLUMNS; x++)
            for (let y = 0; y < ROWS; y++)
                this.invaders.push(new Invader({ x: x * 30, y: TOP_MARGIN_FOR_NEW_GRIDS + y * 30 }));
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;
        if (this.position.x + this.width >= canvas.width || !this.position.x) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}
export default Grid;
