import { ctx } from "../app.js";

class StrikeParticle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
  opacity: number;
  strike: number;

  constructor(
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    strike: number
  ) {
    this.position = position;
    this.velocity = velocity;

    this.opacity = 1;
    this.strike = strike;
  }

  private draw() {
    ctx.save();

    ctx.globalAlpha = this.opacity;

    ctx.font = ".75rem Arial";
    ctx.fillStyle = "white";
    ctx.fillText(this.strike.toString() + "x", this.position.x, this.position.y);

    ctx.restore();
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.opacity > 0.01) this.opacity -= 0.01;

    this.draw();
  }
}

export default StrikeParticle;
