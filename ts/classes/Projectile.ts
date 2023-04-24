import { ctx } from "../app.js";

class Projectile {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;

  constructor(position: { x: number; y: number }, velocity: { x: number; y: number }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  private draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.draw();
  }
}

export default Projectile;
