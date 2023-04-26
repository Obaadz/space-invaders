import Player from "./classes/Player.js";
import Projectile from "./classes/Projectile.js";
import Grid from "./classes/Grid.js";
import Particle from "./classes/Particle.js";
import StrikeParticle from "./classes/StrikeParticle.js";
const scoreNumEl = document.getElementById("score-number"), gameOverEl = document.getElementById("game-over"), highestScoreEl = document.getElementById("highest-score"), highestStrikeEl = document.getElementById("highest-strike"), heartsEl = document.getElementById("hearts"), strikeEl = document.getElementById("strike-number"), shopEl = document.getElementById("shop"), shopMenuEl = document.getElementById("shop-menu"), projectileReloadSpeedEl = document.getElementById("projectile-reload-speed"), scoreDiv = document.getElementById("score"), shopAnchors = document.querySelectorAll("item a");
let score = 0, highestScore = Number(localStorage.getItem("highestScore")) || 0, highestStrike = Number(localStorage.getItem("highestStrike")) || 1, strike = 1, projectileReloadSpeed = 0;
const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const arrows = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
}, PROJECTILE_DURATION_IN_MS = 500, MAX_PROJECTILE_RELOAD_SPEED = 7, GRID_SPEED = 2.5, DEFAULT_HEALTH = 3, OPACITY_INTERVAL_TIME_IN_MS = 2000, OPACITY_INTERVAL_SWITCH_IN_MS = 5, TOP_MARGIN_FOR_NEW_GRIDS = 30;
const game = {
    over: false,
    active: true,
    health: DEFAULT_HEALTH,
};
let interval;
window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && game.active === false && player) {
        player.position.x = canvas.width / 2 - player.width / 2;
        player.position.y = canvas.height - player.height - 20;
        player.opacity = 1;
        score = 0;
        strike = 1;
        projectileReloadSpeed = 0;
        scoreNumEl.textContent = "0";
        projectileReloadSpeedEl.textContent = "0";
        strikeEl.textContent = "1x";
        gameOverEl.classList.remove("block");
        shopEl.classList.remove("none");
        shopAnchors.forEach((anchor) => anchor.classList.remove("disable"));
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
const player = new Player(), projectiles = [], grids = [new Grid()], invaderProjectiles = [], particles = [], strikeParticles = [];
let inTimeout_flag = false;
function animate() {
    requestAnimationFrame(animate);
    if (!game.active)
        return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (arrows.space && !inTimeout_flag && !game.over) {
        inTimeout_flag = true;
        projectiles.push(new Projectile({ x: player.position.x + player.width / 2, y: player.position.y - 10 }, { x: 0, y: -5 }));
        setTimeout(() => {
            inTimeout_flag = false;
        }, PROJECTILE_DURATION_IN_MS - projectileReloadSpeed * 50);
    }
    particles.forEach((particle, indexOfParticle) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }
        if (particle.opacity <= 0)
            setTimeout(() => particles.splice(indexOfParticle, 1), 0);
        else
            particle.update();
    });
    strikeParticles.forEach((strikeParticle, indexOfStrikeParticle) => {
        if (strikeParticle.opacity <= 0)
            setTimeout(() => strikeParticles.splice(indexOfStrikeParticle, 1), 0);
        else
            strikeParticle.update();
    });
    projectiles.forEach((projectile, i) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => projectiles.splice(i, 1), 0);
            strike = 1;
            strikeEl.textContent = "1x";
        }
        else
            projectile.update();
    });
    invaderProjectiles.forEach((projectile, i) => {
        if (projectile.position.y >= canvas.height)
            setTimeout(() => invaderProjectiles.splice(i, 1), 0);
        else {
            projectile.update();
            const collisionAtX = projectile.position.x + projectile.height >= player.position.x &&
                projectile.position.x + projectile.height + projectile.width <=
                    player.position.x + player.width, collisionAtY = projectile.position.y + projectile.height >= player.position.y &&
                projectile.position.y + projectile.height + projectile.width <=
                    player.position.y + player.height;
            if (collisionAtX && collisionAtY && !game.over) {
                if (game.health >= 1 && !interval) {
                    heartsEl.children[game.health - 1].classList.add("hide");
                    game.health--;
                    setTimeout(() => invaderProjectiles.splice(i, 1), 0);
                }
                if (!interval)
                    createParticles(player, "white");
                if (game.health >= 1 && !interval) {
                    interval = animatePlayerOpacity();
                    setTimeout(() => {
                        clearInterval(interval);
                        player.opacity = 1;
                        interval = null;
                    }, OPACITY_INTERVAL_TIME_IN_MS);
                }
                if (game.health <= 0) {
                    player.opacity = 0;
                    game.over = true;
                    highestScoreEl.textContent = highestScore.toString();
                    highestStrikeEl.textContent = highestStrike + "x";
                    shopEl.classList.add("none");
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
        if (!game.over)
            grids.push(new Grid());
        intervalId = setInterval(() => {
            if (!game.over)
                grids.push(new Grid());
        }, 35000);
    }
    grids.forEach((grid, indexOfGrid) => {
        grid.update();
        const randomNum = Math.floor(Math.random() * 200 * gridsLength);
        if (randomNum === 45 || randomNum === 46) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
        grid.invaders.forEach((invader, indexOfInvader) => {
            invader.update({ x: grid.velocity.x, y: grid.velocity.y });
            projectiles.forEach((projectile, indexOfProjectile) => {
                if (projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <=
                        invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader), projectileFound = projectiles.find((projectile2) => projectile2 === projectile);
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
                            }
                            else
                                grids.splice(indexOfGrid, 1);
                        }
                    }, 0);
                }
            });
        });
    });
    player.update();
}
function createParticles(object, color = "#BAA0DE") {
    const randomNumForParticles = Math.floor(Math.random() * 4) + 7;
    for (let i = 0; i < randomNumForParticles; i++)
        particles.push(new Particle({
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2,
        }, { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }, Math.random() * 5 + 1, color, true));
}
function createDeathStrike(object) {
    strikeParticles.push(new StrikeParticle({ x: object.position.x, y: object.position.y }, { x: Math.random() - 0.5, y: Math.random() * 2 }, strike));
}
function createBgParticles() {
    for (let i = 0; i < 60; i++)
        particles.push(new Particle({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        }, { x: 0, y: 0.25 }, Math.random() * 2 + 1, "#FFFFFF9a"));
}
function createHearts(heartsNum) {
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
    if (!game.over)
        grids.push(new Grid());
}, 35000);
export { canvas, ctx, arrows, GRID_SPEED, TOP_MARGIN_FOR_NEW_GRIDS };
const animatePlayerOpacity = () => {
    let opacity = 0.9;
    let direction = -1;
    const intervalId = setInterval(() => {
        opacity += direction * 0.01;
        if (opacity < 0.5 || opacity >= 0.9)
            direction *= -1;
        player.opacity = opacity;
    }, OPACITY_INTERVAL_SWITCH_IN_MS);
    return intervalId;
};
shopEl.addEventListener("click", () => {
    game.active = !game.active;
    shopMenuEl.parentElement.classList.toggle("block");
});
shopMenuEl.addEventListener("click", (e) => {
    const targetEl = e.target;
    if (!targetEl.href)
        return;
    if (targetEl.href.includes("#plus_projectiles_reload_speed") &&
        projectileReloadSpeed < MAX_PROJECTILE_RELOAD_SPEED) {
        try {
            console.log(score);
            checkScoreIsNotLessThen(1000);
            score -= 1000;
            scoreNumEl.textContent = score.toString();
            projectileReloadSpeed++;
            projectileReloadSpeedEl.textContent = projectileReloadSpeed.toString();
            if (projectileReloadSpeed >= MAX_PROJECTILE_RELOAD_SPEED)
                targetEl.classList.add("disable");
        }
        catch (err) {
            shakeScoreEl();
        }
    }
});
function checkScoreIsNotLessThen(num) {
    if (score < num)
        throw new Error();
    return true;
}
function shakeScoreEl() {
    if (scoreDiv.classList.contains("animate__animated"))
        scoreDiv.classList.remove("animate__animated", "animate__headShake");
    setTimeout(() => scoreDiv.classList.add("animate__animated", "animate__headShake"), 0);
}
