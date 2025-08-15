class Entity {
    constructor(x, y, type, hp = 0, attack = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.attack = attack;
        this.hp = hp;
        this.maxHp = hp;
    }

    isAt(x, y) {
        return this.x === x && this.y === y;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
            if (this.type == "hero") {
                alert("Game Over!");
                game.init()
            }
        }
    }

    isAlive() {
        return this.hp > 0;
    }
}
