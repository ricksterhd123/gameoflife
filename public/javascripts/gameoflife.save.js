
// Utility function for getting accurate mouse coordinates relative to canvas position.
function relMouseCoords(event){
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let canvasX = 0;
    let canvasY = 0;
    let currentElement = this;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    } while(currentElement = currentElement.offsetParent)
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");
let startBtn = document.createElement("button");
let stopBtn = document.createElement("button");
let genCounter = document.createElement("p");
let resetBtn = document.createElement("button");

genCounter.innerHTML = "";
startBtn.appendChild(document.createTextNode("Start!"));
resetBtn.appendChild(document.createTextNode("Reset"));
stopBtn.appendChild(document.createTextNode("Stop!"));

document.body.appendChild(startBtn);
document.body.appendChild(stopBtn);
document.body.appendChild(resetBtn);
document.body.appendChild(genCounter);

const padding = 100;
// Board width/height in cells.
const MAX_W = 50;
const MAX_H = 50;

// Symbols for each cell board
const ALIVE = true;
const DEAD = undefined;

/*
* Game logic
*/
function getEmptyBoard(width, height) { return [...Array(height)].map(e => Array(width)); }
let numberOfGenerations = 0;
let currentGen = getEmptyBoard(MAX_W, MAX_H);

/*
* Cell logic
*/

function isCellAlive(x, y, board) { return board[y][x] == ALIVE; }
function isCellDead(x, y, board) { return board[y][x] == DEAD; }
function cellDie(x, y, board){ board[y][x] = ((isCellAlive(x, y, board)) ? DEAD : ALIVE); }
function cellRevive(x, y, board){ board[y][x] = ((isCellDead(x, y, board)) ? ALIVE : DEAD); }

// Get the number of neighbours around the cell.
function cellNumberOfNeighbours(x, y, board){
    let total = 0;
    let nbrs = [[x-1, y+1], [x, y+1], [x+1, y+1], [x-1, y],
                 [x+1, y], [x-1, y-1], [x, y-1], [x+1, y-1]];
    for (let i = 0; i <= nbrs.length - 1; i++){
        let nbrX = nbrs[i][0];
        let nbrY = nbrs[i][1];

        // // Wrap back around the board
        nbrX = (nbrX < 0) ? MAX_W - 1 : nbrX % MAX_W;
        nbrY = (nbrY < 0) ? MAX_H - 1 : nbrY % MAX_H;
        //let valid = nbrX >= 0 && nbrY >= 0 && nbrX <= MAX_W-1 && nbrY <= MAX_H-1;
        if (isCellAlive(nbrX, nbrY, board))
            total += 1;
    }

    return total;
}

// Update the cell state
function cellUpdate(x, y, currGen, newGen){
    let numberOfNbrs = cellNumberOfNeighbours(x, y, currGen);   // Use the currGen to count the neighbours and update newGen
    let alive = isCellAlive(x, y, currGen);
    // if (alive && numberOfNbrs <= 1) {cellDie(x, y, newGen)}
    // if (alive && numberOfNbrs >= 4) {cellDie(x, y, newGen)}
    if (alive && numberOfNbrs >= 2 && numberOfNbrs <= 3) { cellRevive(x, y, newGen); }
    if (!alive && numberOfNbrs == 3) {cellRevive(x, y, newGen)}
}

/*
* Automata
*/
function boardUpdate(){
    let newGen = getEmptyBoard(MAX_W, MAX_H);   // Copy the current generation

    // Update the newGen from the currentGen
    for (let y = 0; y <= MAX_H - 1; y++){
        for (let x = 0; x <= MAX_W - 1; x++){
            cellUpdate(x, y, currentGen, newGen);
        }
    }

    // update the current generation
    currentGen = newGen.slice();
    genCounter.innerHTML = "Gen: " + (numberOfGenerations++).toString();
}

function boardClear(){
    currentGen = [...Array(MAX_H)].map(e => Array(MAX_W));
}
/*
* Drawing
*/

// Set canvas size to window size
function canvasSetFullscreen(ctx){
    let width = $(window).width() - padding;
    let height = $(window).height() - padding;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}

// Draw canvas grid
function canvasDrawGrid(ctx){
    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth

    for (let y = 0; y <= MAX_H; y++)
    {
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(ctx.canvas.width, y * cellHeight)
        ctx.stroke();
    }

    for (let x = 0; x <= MAX_W; x++)
    {
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, ctx.canvas.height)
        ctx.stroke();
    }
}

// TODO: Draw a cell at x, y on the board.
function canvasDrawCell(ctx, x, y){
    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth

    let startX = cellWidth * x;
    let startY = cellHeight * y;
    ctx.fillRect(startX, startY, cellWidth, cellHeight);
}

function canvasDrawBoard(ctx, board, width, height){
    for (let y = 0; y <= height - 1; y++){
        for (let x = 0; x <= width - 1; x++){
            if (isCellAlive(x, y, board))
                canvasDrawCell(ctx, x, y);
        }
    }
}

// TODO: Draw game of life on canvas
function canvasDrawGame(ctx, board){
    // Set to fullscreen
    canvasSetFullscreen(ctx);
    // Draw grid
    //canvasDrawGrid(ctx);
    // Draw cells from current state
    canvasDrawBoard(ctx, board, MAX_W, MAX_H);
}

function canvasUpdate()
{
    canvasDrawGame(ctx, currentGen);
}

/*
* Events
*/

// Window resize event
function onWindowResize(){
    canvasSetFullscreen(ctx);
    // canvasDrawGame(ctx);
}
$(window).on('resize', onWindowResize);

// Canvas click event
function onCanvasClick(e){

    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth

    console.log('Position: ('+ e.clientX +', ' + e.clientY + ')');


    let coords = this.relMouseCoords(e)
    let cellX = parseInt(coords.x / cellWidth);
    let cellY = parseInt(coords.y / cellHeight);
    console.log('Cell: ('+ cellX +', '+ cellY +')');
    cellRevive(cellX, cellY, currentGen);
    socket.emit('clicked', {x:cellX, y:cellY});
}
$(canvas).on('click', onCanvasClick);

let drawTimer = setInterval(canvasUpdate, 20);
let logicTimer = false;

// Start button click event
function start(){
    if (!logicTimer)
        logicTimer = setInterval(boardUpdate, 20);
}
$(startBtn).on("click", start);

function stop(){
    if (logicTimer){
        clearInterval(logicTimer);
        logicTimer = false;
    }
}
$(stopBtn).on("click", stop);

function reset(){
    stop();
    boardClear();
    numberOfGenerations = 0;
    genCounter.innerHTML = "";
}
$(resetBtn).on("click", reset);
/*
*   Main
*/
// Start canvas update timer
