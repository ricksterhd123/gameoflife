const MAX_W = 50;
const MAX_H = 50;

let numberOfUsers = 0; // Number of users connected
let board = new (require('./models/board'))(MAX_W, MAX_H) // Board object

// TODO: Send message to all clients on canvas update
let onClick = function (point){
    console.log("User clicked cell: (" + point.x + ', ' + point.y + ")");
}

// Standard disconnect
let onDisconnect = function (){
    numberOfUsers--;
    console.log("User disconnected");
}

// Standard connect
let onConnect = function (socket){
    numberOfUsers++;
    socket.on('disconnect', onDisconnect)
          .on('clicked', onClick);
    //.on('clicked', (p) => { this.onClick(p); })
    console.log("User connected");
}

let GOLSocket = function (io){
    io.on('connection', onConnect);
}
module.exports = GOLSocket;
