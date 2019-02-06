var express = require('express');
var router = express.Router();

/*
==TODO: Game of life board API==
- POST: Turn dead cells into alive cells
- POST: Turn alive cells into dead cells
- GET: Board state
*/

router.get('/', function(req, res, next) {
  res.json();
});

module.exports = router;
