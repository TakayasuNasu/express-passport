var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render("login", {user: req.user, message: req.flash("error")});
});

module.exports = router;
