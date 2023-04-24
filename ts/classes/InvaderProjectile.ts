import { ctx } from "../app.js";

class InvaderProjectile {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;

  constructor(position: { x: number; y: number }, velocity: { x: number; y: number }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  private draw() {
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
