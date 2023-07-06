const router = require('express').Router();
const fs = require('fs');

router.all('*', (req, res) => {
    fs.readFile('views/img/'+ req.url, (error, data) => {
        // res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(data);
    })
});
module.exports = router;