import { ctx } from "../app.js";
class InvaderProjectile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
    }
    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }
}
export default InvaderProjectile;
