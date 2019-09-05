let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Api Running. Authenticate with SSK' });
});

module.exports = router;
