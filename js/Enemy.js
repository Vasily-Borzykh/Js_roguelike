class Enemy extends Entity {
    constructor(x, y, hp = 50, attack = 5) {
        super(x, y, "enemy", hp, attack);
    }

    static isWalkable(map, x, y) {
        const row = map[y];
        if (!row) return false;
        const cell = row[x];
        if (!cell) return false;
        return cell !== "W";
    }

    static occupiedByEnemy(enemies, x, y, self) {
        return enemies.some(e => e !== self && e.x === x && e.y === y);
    }

    // попытка сделать шаг
    tryStep(nx, ny, map, enemies, hero) {
        if (!Enemy.isWalkable(map, nx, ny)) return false;
        if (hero.x === nx && hero.y === ny) return false;
        if (Enemy.occupiedByEnemy(enemies, nx, ny, this)) return false;

        this.x = nx;
        this.y = ny;
        return true;
    }

    // Движение к герою: сначала по оси с большим дельта, потом по второй; если блок — пробуем случайный шаг
    moveToward(hero, map, enemies) {
        const dxSign = Math.sign(hero.x - this.x);
        const dySign = Math.sign(hero.y - this.y);
        const preferX = Math.abs(hero.x - this.x) >= Math.abs(hero.y - this.y);

        const tries = [];
        if (preferX) {
            tries.push([this.x + dxSign, this.y]);
            tries.push([this.x, this.y + dySign]);
        } else {
            tries.push([this.x, this.y + dySign]);
            tries.push([this.x + dxSign, this.y]);
        }

        // случайные запасные варианты
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
            tries.push([this.x + dx, this.y + dy]);
        });

        for (const [nx, ny] of tries) {
            if (this.tryStep(nx, ny, map, enemies, hero)) return;
        }
        // если не получилось — стоим
    }
}
