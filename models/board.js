/*
* Board abstract data structure
*/
const ALIVE = true;
const DEAD = undefined;

// Board object constructor
function Board(width, height){
    this.width = width;
    this.height = height;
    this.state = [...Array(height)].map(e => Array(width));
    this.isCellAlive = function (x, y) { return this.state[y][x] == ALIVE; }
    this.cellKill = function (x, y) { this.state[y][x] = DEAD; }
    this.cellRevive = function (x, y) { this.state[y][x] = ALIVE; }
    this.generation = 0;
}

Board.prototype.clear =
function (){
    this.state = [...Array(this.height)].map(e => Array(this.width));
    this.generation = 0;
}

// Returns an array of alive cells (easier to send)
Board.prototype.getAliveCells =
function (){
    let alive = [];
    for (let y = 0; y <= this.height - 1; y++){
        for (let x = 0; x <= this.width - 1; x++){
            if (this.isCellAlive(x, y))
                alive.push([x, y]);
        }
    }
    return alive;
}

// Count the total number of neighbours around a particular cell on the board.
Board.prototype.cellNumberOfNeighbours =
function (x, y){
    let total = 0;
    let nbrs = [[x-1, y+1], [x, y+1], [x+1, y+1], [x-1, y],
                 [x+1, y], [x-1, y-1], [x, y-1], [x+1, y-1]];
    for (let i = 0; i <= nbrs.length - 1; i++){
        let nbrX = nbrs[i][0];
        let nbrY = nbrs[i][1];

        // Wrap back around the board
        nbrX = (nbrX < 0) ? this.width - 1 : nbrX % this.width;
        nbrY = (nbrY < 0) ? this.height - 1 : nbrY % this.height;
        // let valid = nbrX >= 0 && nbrY >= 0 && nbrX <= this.width-1 && nbrY <= this.height-1;
        if (this.isCellAlive(nbrX, nbrY))
            total += 1;
    }

    return total;
}

// Draw the cell's successor (next generation) on a new board
Board.prototype.cellUpdate =
function (x, y, newBoard){
    let numberOfNbrs = this.cellNumberOfNeighbours(x, y);   // Use the current board to count the neighbours and update newGen
    let alive = this.isCellAlive(x, y);

    // if (alive && numberOfNbrs <= 1) {cellDie(x, y, newGen)}
    // if (alive && numberOfNbrs >= 4) {cellDie(x, y, newGen)}
    if (alive && numberOfNbrs >= 2 && numberOfNbrs <= 3) { newBoard.cellRevive(x, y); }
    if (!alive && numberOfNbrs == 3) { newBoard.cellRevive(x, y) }
}

// Evolve the cells on the board
Board.prototype.update =
function (){
    let newBoard = new Board(this.width, this.height);

    // Update the newGen from the currentGen
    for (let y = 0; y <= this.height - 1; y++){
        for (let x = 0; x <= this.width - 1; x++){
            this.cellUpdate(x, y, newBoard);
        }
    }

    this.state = newBoard.state;
    this.generation++;
}

module.exports = Board;
