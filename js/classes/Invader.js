import { ctx } from "../app.js";
import InvaderProjectile from "./InvaderProjectile.js";
class Invader {
    constructor(position) {
        this.velocity = { x: 0, y: 0 };
        const image = new Image();
        image.src = "./img/invader.png";
        this.image = image;
        this.image.onload = () => {
            const SCALE = 1;
            this.width = this.image.width * SCALE;
            this.height = this.image.height * SCALE;
            this.position = { x: position.x, y: position.y };
        };
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    update(velocity) {
        if (!this.image || !this.position)
            return;
        this.position.x += velocity.x;
        this.position.y += velocity.y;
        this.draw();
    }
    shoot(InvaderProjectiles) {
        if (this.position)
            InvaderProjectiles.push(new InvaderProjectile({ x: this.position.x + this.width / 2, y: this.position.y }, { x: 0, y: 4 }));
    }
}
export default Invader;
