class Item {
    constructor(x, y, type, value = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.value = value;
    }

    isAt(x, y) {
        return this.x === x && this.y === y;
    }
}
