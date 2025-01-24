const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const db = require('../db');
const promisFs = require('../fs');
const fsPromises = require('node:fs/promises');
const ensureLoggedIn = ensureLogIn();
/*
const multer  = require('multer')
const upload = multer({ dest: './files/' })
*/
function fetchPhotos(req, res, next) {
next();
}

var router = express.Router();

/* GET home page. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchPhotos, function(req, res, next) {
  res.locals.filter = null;
  res.render('viewUserMedia', { user: req.user });
});

router.post('/savefile', async function(req, res, next) {
  let filename = Date.now();
  filename = './files/'+req.user.username+"/"+filename;
  let promFs = promisFs.readwrite('writeFile');
  let result = await promFs(filename,req.file.buffer,'utf-8')
  .then( (r) => {return r;} )
  .catch( (e) => { console.log(e) } );
  res.send('200')
});

router.get('/getphotopage', ensureLoggedIn, async function(req, res, next) {
    let dirContent = await promisFs.readDir('./files/'+req.user.username);
    res.render("photos",{fileList:dirContent});
});

router.get('/getphotopage/:filename', ensureLoggedIn, async function(req, res, next){
    let promFs = promisFs.readwrite('readFile');
    let file = await promFs('./files/'+req.user.username+'/'+req.params.filename);
    res.send( file );
});

router.get('/help',ensureLoggedIn, (req,res,next)=>{res.render('help');});

router.post('/deletefiles', ensureLoggedIn, async function(req, res, next) {
  let response = {}
  let promFs = promisFs.readwrite('readdir');
  let result = await promFs('./files/'+req.user.username)
  .then( (r) => { return r; } )
  .catch( (e) => { console.log(e) } );
  promFs = promisFs.delFile('unlink');
  for(let i=0; i<result.length; i++){
    response[i] = await promFs( './files/'+req.user.username+'/'+result[i],(r)=>{console.log('cb, r',r)} ).then( (r) => {return r;} ).catch( (e) => {console.log('e',e)} );
  }
  res.render("photos",{"fileList":""});
  
});


module.exports = router;
