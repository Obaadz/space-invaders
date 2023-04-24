import { canvas, ctx, arrows } from "../app.js";
class Player {
    constructor() {
        this.velocity = { x: 0, y: 0 };
        const image = new Image();
        image.src = "./img/spaceship.png";
        this.image = image;
        this.image.onload = () => {
            const SCALE = 0.25;
            this.width = this.image.width * SCALE;
            this.height = this.image.height * SCALE;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20,
            };
        };
        this.rotation = 0;
        this.opacity = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }
    update() {
        if (!this.image || !this.position)
            return;
        if (arrows.left && !arrows.right && this.position.x > 0) {
            this.velocity.x = -4;
            this.rotation = -0.15;
        }
        else if (arrows.right &&
            !arrows.left &&
            this.position.x < canvas.width - this.width) {
            this.velocity.x = 4;
            this.rotation = 0.15;
        }
        else {
            this.velocity.x = 0;
            this.rotation = 0;
        }
        this.position.x += this.velocity.x;
        this.draw();
    }
}
export default Player;
