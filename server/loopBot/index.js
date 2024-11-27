const router = require('express').Router();
const commands = require('./commands');

router.use('/commands', commands);


module.exports = router;