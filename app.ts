const scoreNumEl = document.getElementById("score-number") as HTMLSpanElement,
  gameOverEl = document.getElementById("game-over"),
  highestScoreEl = document.getElementById("highest-score") as HTMLSpanElement,
  highestStrikeEl = document.getElementById("highest-strike") as HTMLSpanElement,
  heartsEl = document.getElementById("hearts"),
  strikeEl = document.getElementById("strike-number") as HTMLSpanElement;
let score = 0,
  highestScore = Number(localStorage.getItem("highestScore")) || 0,
  highestStrike = Number(localStorage.getItem("highestStrike")) || 1,
  strike = 1;

const canvas = document.getElementById("canvas") as HTMLCanvasElement,
  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const arrows = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  },
  PROJECTILE_DURATION_IN_MS = 500,
  GRID_SPEED = 2.5,
  DEFAULT_HEALTH = 3,
  OPACITY_INTERVAL_TIME_IN_MS = 5,
  TOP_MARGIN_FOR_NEW_GRIDS = 30;

const game = {
  over: false,
  active: true,
  health: 3,
};

let interval: any;

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && game.active === false && player) {
    player.position.x = canvas.width / 2 - player.width / 2;
    player.position.y = canvas.height - player.height - 20;
    player.opacity = 1;

    score = 0;
    strike = 1;
    scoreNumEl.textContent = "0";
    strikeEl.textContent = "1x";
    gameOverEl.classList.remove("block");

    projectiles.length = 0;
    grids.length = 0;
    invaderProjectiles.length = 0;
    particles.length = 0;

    createBgParticles();

    game.over = false;
    game.active = true;
    game.health = DEFAULT_HEALTH;

    createHearts(DEFAULT_HEALTH);
  }

  if (!game.over)
    switch (e.key) {
      case "d":
      case "D":
      case "ي":
        arrows.right = true;
        break;
      case "a":
      case "A":
      case "ش":
        arrows.left = true;
        break;
      case "w":
        arrows.up = true;
        break;
      case "s":
        arrows.down = true;
        break;
      case " ":
        arrows.space = true;
        break;
    }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "d":
    case "D":
    case "ي":
      arrows.right = false;
      break;
    case "a":
    case "A":
    case "ش":
      arrows.left = false;
      break;
    case "w":
      arrows.up = false;
      break;
    case "s":
      arrows.down = false;
      break;
    case " ":
      arrows.space = false;
      break;
  }
});

class Player {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  image: HTMLImageElement;
  rotation: number;
  opacity: number;

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

  private draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);

    ctx.restore();
  }

  update() {
    if (!this.image || !this.position) return;

    if (arrows.left && !arrows.right && this.position.x > 0) {
      this.velocity.x = -4;
      this.rotation = -0.15;
    } else if (
      arrows.right &&
      !arrows.left &&
      this.position.x < canvas.width - this.width
    ) {
      this.velocity.x = 4;
      this.rotation = 0.15;
    } else {
      this.velocity.x = 0;
      this.rotation = 0;
    }

    this.position.x += this.velocity.x;

    this.draw();
  }
}

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

class Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
  opacity: number;
  fade: boolean;

  constructor(
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    radius: number,
    color: string,
    fade = false
  ) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fade = fade;
  }

  private draw() {
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

    if (this.opacity > 0.01 && this.fade) this.opacity -= 0.01;

    this.draw();
  }
}

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

class Invader {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor(position: { x: number; y: number }) {
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

  private draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }

  update(velocity: { x: number; y: number }) {
    if (!this.image || !this.position) return;

    this.position.x += velocity.x;
    this.position.y += velocity.y;

    this.draw();
  }

  shoot(InvaderProjectiles: InvaderProjectile[]) {
    if (this.position)
      InvaderProjectiles.push(
        new InvaderProjectile(
          { x: this.position.x + this.width / 2, y: this.position.y },
          { x: 0, y: 4 }
        )
      );
  }
}

class Grid {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  invaders: Invader[];
  width: number;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: GRID_SPEED, y: 0 };

    this.invaders = [];

    const COLUMNS = Math.floor(Math.random() * 7) + 3,
      ROWS = Math.floor(Math.random() * 5) + 1;

    this.width = COLUMNS * 30;

    for (let x = 0; x < COLUMNS; x++)
      for (let y = 0; y < ROWS; y++)
        this.invaders.push(
          new Invader({ x: x * 30, y: TOP_MARGIN_FOR_NEW_GRIDS + y * 30 })
        );
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

const player = new Player(),
  projectiles: Projectile[] = [],
  grids: Grid[] = [new Grid()],
  invaderProjectiles: InvaderProjectile[] = [],
  particles: Particle[] = [],
  strikeParticles: StrikeParticle[] = [];

let inTimeout_flag = false;

function animate() {
  requestAnimationFrame(animate);

  if (!game.active) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (arrows.space && !inTimeout_flag && !game.over) {
    inTimeout_flag = true;

    projectiles.push(
      new Projectile(
        { x: player.position.x + player.width / 2, y: player.position.y - 10 },
        { x: 0, y: -5 }
      )
    );

    setTimeout(() => {
      inTimeout_flag = false;
    }, PROJECTILE_DURATION_IN_MS);
  }

  particles.forEach((particle, indexOfParticle) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) setTimeout(() => particles.splice(indexOfParticle, 1), 0);
    else particle.update();
  });

  strikeParticles.forEach((strikeParticle, indexOfStrikeParticle) => {
    if (strikeParticle.opacity <= 0)
      setTimeout(() => strikeParticles.splice(indexOfStrikeParticle, 1), 0);
    else strikeParticle.update();
  });

  projectiles.forEach((projectile, i) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => projectiles.splice(i, 1), 0);

      strike = 1;
      strikeEl.textContent = "1x";
    } else projectile.update();
  });

  invaderProjectiles.forEach((projectile, i) => {
    if (projectile.position.y >= canvas.height)
      setTimeout(() => invaderProjectiles.splice(i, 1), 0);
    else {
      projectile.update();

      const collisionAtX =
          projectile.position.x + projectile.height >= player.position.x &&
          projectile.position.x + projectile.height + projectile.width <=
            player.position.x + player.width,
        collisionAtY =
          projectile.position.y + projectile.height >= player.position.y &&
          projectile.position.y + projectile.height + projectile.width <=
            player.position.y + player.height;

      if (collisionAtX && collisionAtY && !game.over) {
        if (game.health >= 1 && !interval) {
          heartsEl.children[game.health - 1].classList.add("hide");

          game.health--;
          setTimeout(() => invaderProjectiles.splice(i, 1), 0);
        }

        if (!interval) createParticles(player, "white");

        if (game.health >= 1 && !interval)
          interval = setInterval(() => {
            player.opacity -= 0.01;

            if (player.opacity <= 0.5) {
              clearInterval(interval);
              interval = setInterval(() => {
                player.opacity += 0.01;

                if (player.opacity >= 0.99) {
                  clearInterval(interval);

                  interval = setInterval(() => {
                    player.opacity -= 0.01;

                    if (player.opacity <= 0.5) {
                      clearInterval(interval);

                      interval = setInterval(() => {
                        player.opacity += 0.01;

                        if (player.opacity >= 0.99) {
                          clearInterval(interval);

                          interval = null;
                        }
                      }, OPACITY_INTERVAL_TIME_IN_MS);
                    }
                  }, OPACITY_INTERVAL_TIME_IN_MS);
                }
              }, OPACITY_INTERVAL_TIME_IN_MS);
            }
          }, OPACITY_INTERVAL_TIME_IN_MS);

        if (game.health <= 0) {
          player.opacity = 0;
          game.over = true;

          highestScoreEl.textContent = highestScore.toString();
          highestStrikeEl.textContent = highestStrike + "x";

          setTimeout(() => {
            game.active = false;
            gameOverEl.classList.add("block");
          }, 2000);
        }
      }
    }
  });

  const gridsLength = grids.length <= 5 ? grids.length : 5;
  if (!gridsLength) {
    clearInterval(intervalId);

    if (!game.over) grids.push(new Grid());

    intervalId = setInterval(() => {
      if (!game.over) grids.push(new Grid());
    }, 35000);
  }
  grids.forEach((grid, indexOfGrid) => {
    grid.update();

    const randomNum = Math.floor(Math.random() * 200 * gridsLength);
    if (randomNum === 45 || randomNum === 46) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    grid.invaders.forEach((invader, indexOfInvader) => {
      invader.update({ x: grid.velocity.x, y: grid.velocity.y });

      projectiles.forEach((projectile, indexOfProjectile) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => invader2 === invader),
              projectileFound = projectiles.find(
                (projectile2) => projectile2 === projectile
              );

            if (invaderFound && projectileFound) {
              score += 100;
              strike++;
              scoreNumEl.textContent = score.toString();
              strikeEl.textContent = strike + "x";

              if (score > highestScore) {
                localStorage.setItem("highestScore", score.toString());
                highestScore = score;
              }

              if (strike > highestStrike) {
                localStorage.setItem("highestStrike", strike.toString());
                highestStrike = strike;
              }

              createParticles(invader);
              createDeathStrike(invader);

              grid.invaders.splice(indexOfInvader, 1);
              projectiles.splice(indexOfProjectile, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else grids.splice(indexOfGrid, 1);
            }
          }, 0);
        }
      });
    });
  });

  player.update();
}

function createParticles(object: Invader | Player, color: string = "#BAA0DE") {
  const randomNumForParticles = Math.floor(Math.random() * 4) + 7;
  for (let i = 0; i < randomNumForParticles; i++)
    particles.push(
      new Particle(
        {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
        Math.random() * 5 + 1,
        color,
        true
      )
    );
}

function createDeathStrike(object: Invader) {
  strikeParticles.push(
    new StrikeParticle(
      { x: object.position.x, y: object.position.y },
      { x: Math.random() - 0.5, y: Math.random() * 2 },
      strike
    )
  );
}

function createBgParticles() {
  for (let i = 0; i < 60; i++)
    particles.push(
      new Particle(
        {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        },
        { x: 0, y: 0.25 },
        Math.random() * 2 + 1,
        "#FFFFFF9a"
      )
    );
}

function createHearts(heartsNum: number) {
  heartsEl.innerHTML = "";

  for (let i = 0; i < heartsNum; i++) {
    const img = document.createElement("img");
    img.src = "./img/heart.png";
    img.onload = () => heartsEl.appendChild(img);
  }
}

createHearts(DEFAULT_HEALTH);
createBgParticles();
animate();

let intervalId = setInterval(() => {
  if (!game.over) grids.push(new Grid());
}, 35000);
