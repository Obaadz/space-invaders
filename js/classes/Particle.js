import { ctx } from "../app.js";
class Particle {
    constructor(position, velocity, radius, color, fade = false) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fade = fade;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.opacity > 0.01 && this.fade)
            this.opacity -= 0.01;
        this.draw();
    }
}
export default Particle;
