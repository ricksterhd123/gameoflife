const MAX_W = 50; // Board width
const MAX_H = 50; // Board height
const updateInterval = 30; // Timer interval(ms)

let io = null; // socket.io object
let numberOfUsers = 0; // Number of users connected
let board = new (require('./models/board'))(MAX_W, MAX_H) // Board object
let timer = null;

let onStart = function (){
    console.log("User has clicked start")
    timer = setInterval(function (){
        board.update();
        io.emit('canvas update', board.getAliveCells());
    }, updateInterval);
}

let onStop = function (){
    console.log("User has clicked stop");
    if (timer){
        clearTimeout(timer);
        timer = null;
        io.emit('canvas update', board.getAliveCells());
    }
}

let onReset = function (){
    console.log("User has clicked reset");
    board.clear();
    // DRY
    if (timer){
        clearTimeout(timer);
        timer = null;
        io.emit('canvas update', board.getAliveCells());
    }
}

let onCanvasClick = function (point){
    console.log("User has clicked cell: (" + point.x + ', ' + point.y + ")");

    // Update board state
    // TODO: Create method Board.cellToggle(x, y)
    if (board.isCellAlive(point.x, point.y)){
        board.cellKill(point.x, point.y)
    }else {
        board.cellRevive(point.x, point.y)
    }

    // Send alive cells
    io.emit('canvas update', board.getAliveCells());
}

// Standard disconnect
let onDisconnect = function (){
    numberOfUsers--;
    console.log("User disconnected");
}

// Standard connect
let onConnect = function (socket){
    numberOfUsers++;
    socket.emit("canvas update", board.getAliveCells());
    socket.on('disconnect', onDisconnect)
          .on('clicked', onCanvasClick)
          .on('start', onStart)
          .on('stop', onStop)
          .on('reset', onReset);
    //.on('clicked', (p) => { this.onClick(p); })
    console.log("User connected");
}

let GOLSocket = function (ioObject){
    io = ioObject;
    io.on('connection', onConnect);
}
module.exports = GOLSocket;
