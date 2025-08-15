class MapGenerator {
    constructor(tileSize) {
        this.tileSize = tileSize
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    carvePassage(map, direction, minIndex, maxIndex, count) {
        for (let j = 0; j < count; j++) {
            const idx = this.randomInt(minIndex, maxIndex);
            if (direction === "row") {
                for (let i = 0; i < map[0].length; i++) {
                    map[idx][i] = "F";
                }
            } else if (direction === "col") {
                for (let i = 0; i < map.length; i++) {
                    map[i][idx] = "F";
                }
            }
        }
    }

    takeRandomTiles(arr, count) {
        const result = [];
            for (let i = 0; i < count && arr.length > 0; i++) {
                const index = Math.floor(Math.random() * arr.length);
                result.push(arr.splice(index, 1)[0]);
            }
        return result;
    }

    generateMap(rows, cols, maxRooms = 10, minRooms = 5, maxSize = 8, minSize = 3, minPassage = 3, maxPassage = 5) {

        let map = Array.from({ length: rows }, () => Array(cols).fill("W"));

        const rooms = []
        const roomsCount = this.randomInt(minRooms, maxRooms)
        for (let i = 0; i <= roomsCount; i++){
            const width = this.randomInt(minSize, maxSize) // 4
            const height = this.randomInt(minSize, maxSize) // 4
            const cordX = this.randomInt(1, cols - width - 1) // 1 - (40 - 4 - 1) = 1-35
            const cordY = this.randomInt(1, rows - height - 1) // 1 - (24 - 4 - 1) = 1-19

            for (let j = cordY; j < cordY + height; j++){
                for (let i = cordX; i < cordX + width; i++){
                    map[j][i] = "F"
                }
            }

            rooms.push({cordX, cordY, height, width})
        }

        for (let i = 1; i < rooms.length; i++) {
            const r1 = rooms[i - 1];
            const r2 = rooms[i];
            const x1 = this.randomInt(r1.cordX, r1.cordX + r1.width - 1);
            const y1 = this.randomInt(r1.cordY, r1.cordY + r1.height - 1);
            const x2 = this.randomInt(r2.cordX, r2.cordX + r2.width - 1);
            const y2 = this.randomInt(r2.cordY, r2.cordY + r2.height - 1);

            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                map[y1][x] = "F";
            }
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                map[y][x2] = "F";
            }
        }

        const heightPassage = this.randomInt(minPassage, maxPassage);
        const widthPassage  = this.randomInt(minPassage, maxPassage);

        this.carvePassage(map, "row", 2, rows - 2, widthPassage);
        this.carvePassage(map, "col", 2, cols - 2, heightPassage);

        const floorTiles = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (map[y][x] === "F") {
                    floorTiles.push({ x, y });
                }
            }
        }

        const swordTiles = this.takeRandomTiles(floorTiles, 2);
        swordTiles.forEach(pos => {
            map[pos.y][pos.x] = "SW";
        });

        const potionTiles = this.takeRandomTiles(floorTiles, 10);
        potionTiles.forEach(pos => {
            map[pos.y][pos.x] = "HP";
        });

        return map
    }
}