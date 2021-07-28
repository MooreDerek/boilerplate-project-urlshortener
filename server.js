require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
let urlsArr = [];

// Basic Configuration
const port = process.env.PORT || 3000;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Retrieve the shortened URL
app.get('/api/shorturl/:idx', function(req, res) {
  let idx =  req.params.idx;
  console.log("Looking for:", idx);
  let origUrl = urlsArr[idx];
  console.log("Redirecting to:", origUrl);
  res.redirect(origUrl);
});

// Deal with posting a URL
app.post('/api/shorturl', urlencodedParser, function(req, res) {
  let origUrl = req.body.url;
  if( !origUrl.startsWith("http")){
    res.json({error: 'invalid url'});
  }
  let httpRegex = /^.*\/\//;
  let trailingRegex = /\/.*$/;
  let hostname = origUrl.replace(httpRegex,"");
  hostname = hostname.replace(trailingRegex,"");
  console.log("hostname",hostname);
  dns.lookup(hostname, (err, address) => {
    console.log( "address: %j, errr %j",address, err);
    if( err ){
      res.json({error: 'invalid url'});
    } else {
      // All good add to set 
      let idx = urlsArr.findIndex(element => element === origUrl);
      if(idx < 0){
        idx = urlsArr.push(origUrl) - 1;
        console.log("Pushed:", origUrl, idx);
      }
      res.json({ original_url: origUrl, short_url: idx });

    };
  });

 
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
