class Game {
    constructor(tileSize = 25) {
        this.tileSize = tileSize;
        this.map = [];        
        this.hero = null;     
        this.enemies = [];    
        this.rows = 0;        
        this.cols = 0;
        this.field = null;
        this.portal = null;
    }

    init(){
        this.map = [];
        this.hero = null;
        this.enemies = [];
        
        this.field = document.querySelector(".field");
        const rows = Math.floor(this.field.clientHeight / this.tileSize);
        const cols = Math.floor(this.field.clientWidth / this.tileSize);

        const genMap = new MapGenerator(this.tileSize);
        this.map = genMap.generateMap(rows, cols);
        this.rows = this.map.length;
        this.cols = this.map[0].length;

        this.spawnHero();
        this.spawnEnemies(5);

        this.render();

        window.removeEventListener("keydown", this._keyHandler);
        this._keyHandler = (e) => this.handleKey(e);
        window.addEventListener("keydown", this._keyHandler);
    }

    // все пустые клетки 'F'
    getEmptyCells() {
        const cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.map[y][x] === "F") cells.push({x, y});
            }
        }
        return cells;
    }

    takeRandomCell(cells) {
        const i = Math.floor(Math.random() * cells.length);
        return cells.splice(i, 1)[0];
    }

    spawnHero() {
        const cells = this.getEmptyCells();
        const pos = this.takeRandomCell(cells);
        this.hero = new Hero(pos.x, pos.y, 100, 10);
    }

    spawnEnemies(count = 10) {
        const cells = this.getEmptyCells();
        for (let i = 0; i < count && cells.length > 0; i++) {
            const pos = this.takeRandomCell(cells);
            this.enemies.push(new Enemy(pos.x, pos.y, 50, 5));
        }
    }

    handleKey(e) {
        let acted = false;

        switch (e.key.toLowerCase()) {
            case "w": acted = this.hero.move(0, -1, this.map, this.enemies); break;
            case "s": acted = this.hero.move(0, 1, this.map, this.enemies); break;
            case "a": acted = this.hero.move(-1, 0, this.map, this.enemies); break;
            case "d": acted = this.hero.move(1, 0, this.map, this.enemies); break;
            case " ":
                this.hero.attackEnemies(this.enemies);
                this.enemies = this.enemies.filter(e => e.isAlive());
                acted = true;
                break;
            case "h":
                this.hero.usePotion();
                acted = true;
                break;
        }

        if (acted) {
            this.checkItems();
            this.enemyTurn();
            this.render();
            this.renderInventory()
        }
    }

    // ход врагов и атака, если рядом с героем
    enemyTurn() {
        for (const enemy of this.enemies) {
            // если враг в соседней клетке — бьёт героя
            if (Math.abs(enemy.x - this.hero.x) + Math.abs(enemy.y - this.hero.y) === 1) {
                this.hero.takeDamage(enemy.attack);
                continue;
            }
            enemy.moveToward(this.hero, this.map, this.enemies);
            // после движения — если подошёл вплотную, удар
            if (Math.abs(enemy.x - this.hero.x) + Math.abs(enemy.y - this.hero.y) === 1) {
                this.hero.takeDamage(enemy.attack);
            }
        }
        // удаляем мёртвых врагов
        this.enemies = this.enemies.filter(e => e.isAlive());
        this.checkPortal();
    }

    render() {
        this.field.innerHTML = "";

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.style.left = `${x * this.tileSize}px`;
                tile.style.top = `${y * this.tileSize}px`;

                let bg = "tile-W.png";
                const cell = this.map[y][x];
                if (cell === "F") bg = "tile-.png";
                if (cell === "HP") bg = "tile-HP.png";
                if (cell === "SW") bg = "tile-SW.png";
                if (cell === "PT") bg = "tile-PT.png";

                // сущности — приоритет поверх тайла
                let entity = null;
                if (this.hero && this.hero.isAt(x, y)) {
                    bg = "tile-P.png";
                    entity = this.hero;
                } else {
                    const enemy = this.enemies.find(e => e.x === x && e.y === y);
                    if (enemy) {
                        bg = "tile-E.png";
                        entity = enemy;
                    }
                }

                tile.style.backgroundImage = `url(images/${bg})`;

                if (entity && entity.maxHp > 0) {
                    const percent = Math.max(0, Math.min(100, Math.round((entity.hp / entity.maxHp) * 100)));
                    const hpBar = document.createElement("div");
                    hpBar.classList.add("health");

                    if (entity.type === "hero") {
                        hpBar.style.backgroundColor = "#00ff00";
                    } else {
                        hpBar.style.backgroundColor = "#ff0000";
                    }

                    hpBar.style.width = percent + "%";
                    tile.appendChild(hpBar);
                }

                this.field.appendChild(tile);
            }
        }
        this.updateHeroStats();
        if (this.portal && this.hero.isAt(this.portal.x, this.portal.y)) {
            alert("Вы перешли на следующий уровень!");
            this.nextLevel();
        }
    }

    checkItems() {
        const cell = this.map[this.hero.y][this.hero.x];
        if (cell === "HP") {
            const item = new Item(this.hero.x, this.hero.y, "potion", 20); // 20 HP
            this.hero.pickItem(item);
            this.map[this.hero.y][this.hero.x] = "F"; // убираем зелье с карты
            this.render();
        }
    }

    renderInventory() {
        const invDiv = document.querySelector(".inventory");
        invDiv.innerHTML = "";

        this.hero.inventory.forEach(item => {
            const div = document.createElement("div");
            div.style.width = "25px";
            div.style.height = "25px";
            div.style.display = "inline-block";
            div.style.borderRight = "2px solid #ffffffff";
            div.style.backgroundSize = "100% 100%";

            if (item.type === "potion") {
                div.style.backgroundImage = "url(images/tile-HP.png)";
            }

            invDiv.appendChild(div);
        });
    }

    updateHeroStats() {
        if (!this.hero) return;
        document.getElementById("hero-hp").textContent = this.hero.hp;
        document.getElementById("hero-attack").textContent = this.hero.attack;
    }

    checkPortal() {
        if (this.enemies.length === 0 && !this.portal) {
            const empty = [];
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    if (this.map[y][x] === "F") empty.push({x, y});
                }
            }
            if (empty.length > 0) {
                const idx = Math.floor(Math.random() * empty.length);
                const pos = empty[idx];
                this.map[pos.y][pos.x] = "PT";
                this.portal = pos;
            }
        }
    }

    nextLevel() {
        this.portal = null;
        this.enemies = [];
        const genMap = new MapGenerator(this.tileSize);
        this.map = genMap.generateMap(this.rows, this.cols);
        
        this.spawnHero();
        this.spawnEnemies(10);
        
        this.render();
    }
}
