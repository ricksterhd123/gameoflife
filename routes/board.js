var express = require('express');
var router = express.Router();
var Board = require('../models/board');

/*
==TODO: Game of life board API==
- POST: Turn dead cells into alive cells
- POST: Turn alive cells into dead cells
- GET: Board state
*/

router.get('/', function(req, res, next) {
  let b = new Board(100, 100);
  b.cellRevive(0,0);
  b.cellRevive(99,99);
  res.json(b.getAliveCells());
});

module.exports = router;
