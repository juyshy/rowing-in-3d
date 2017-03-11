// Import Express and Router
var express = require('express');
var router = express.Router();

// Get
router.get('/', function(req, res) {
  res.render('index', {
	  title: 'Rowing in 3D'
 
  });
});

module.exports = router;
