import Enemy from "./Enemy.mjs";

function spawnEnemy(e) {
    const enemy = new Enemy(e.radius, e.distance, e.angle);
    enemy.angularVelocity = e.av;
    enemy.inwardsVelocity = e.iv;
    enemy.deathBulletCount = e.dbc;
    enemy.cashValue = e.cash;
    enemy.bulletNumber = e.bulletNumber;
    enemy.maxHealth = e.health;
    enemy.health = e.health;
    enemy.timeUntilBulletSpawn = e.bulletTime;
    enemy.lastSpawnBullet = enemy.timeUntilBulletSpawn;

    top.world.add(enemy);
}

export default function (wave, time) {
    let anyLeft = false;
    for (const enemy of wave.enemies) {
        if (time >= enemy.spawnTime && !enemy.hasAlreadySpawned) {
            enemy.hasAlreadySpawned = true;
            spawnEnemy(enemy);
        }
        if (!enemy.hasAlreadySpawned) {
            anyLeft = true;
        }
    }
    return anyLeft;
}