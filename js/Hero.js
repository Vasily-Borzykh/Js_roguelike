class Hero extends Entity {
    constructor(x, y, hp = 100, attack = 10) {
        super(x, y, "hero", hp, attack)
        this.inventory = []
    }

    static isWalkable(map, x, y) {
        const row = map[y]
        if (!row) return false
        const cell = row[x]
        if (!cell) return false
        return cell !== "W"
    }

    static enemyAt(enemies, x, y) {
        return enemies.find(e => e.x === x && e.y === y);
    }

    move(dx, dy, map, enemies) {
        const newX = this.x + dx
        const newY = this.y + dy

        if (!Hero.isWalkable(map, newX, newY)) return false
        if (Hero.enemyAt(enemies, newX, newY)) return false

        const cell = map[newY][newX]
        if (cell === "HP") {
            // забираем зелье в инвентарь вместо мгновенного лечения
            this.inventory.push(new Item(newX, newY, "potion", 30))
            map[newY][newX] = "F"
        } else if (cell === "SW") {
            this.attack += 5
            map[newY][newX] = "F"
        }

        this.x = newX;
        this.y = newY;
        return true;
    }

    attackEnemies(enemies) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dx, dy] of dirs) {
            const ex = this.x + dx, ey = this.y + dy;
            const enemy = enemies.find(e => e.x === ex && e.y === ey);
            if (enemy) enemy.takeDamage(this.attack);
        }
    }

    usePotion() {
        const index = this.inventory.findIndex(i => i.type === "potion");
        if (index >= 0) {
            const potion = this.inventory.splice(index, 1)[0];
            this.hp = Math.min(this.hp + potion.value, this.maxHp);
        }
    }
}
