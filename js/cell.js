function Cell(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;

    this.checkNeighbors = function() {
        let neighbors = [];

        let top = grid[index(i, j - 1)];
        let right = grid[index(i + 1, j)];
        let bottom = grid[index(i, j + 1)];
        let left = grid[index(i - 1, j)];

        if (top && !top.visited) {
            neighbors.push(top);
        }

        if (right && !right.visited) {
            neighbors.push(right);
        }

        if (bottom && !bottom.visited) {
            neighbors.push(bottom);
        }

        if (left && !left.visited) {
            neighbors.push(left);
        }

        if (neighbors.length > 0) {
            let r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    };

    this.highlight = function() {
        let x = this.i * w;
        let y = this.j * w;

        console.log("Remove highlight function")
    }

    this.show = function() {
        let x = this.i * w;
        let y = this.j * w;
        if (this.walls[0]) {
            // bottom
        }
    }

}