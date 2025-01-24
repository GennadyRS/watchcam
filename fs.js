var fs = require( 'fs' );

let promisifyFs={}

promisifyFs.readwrite = function(method){
  return function(args,encoding){
    return new Promise( (resolve, reject) => {
      fs[method]( args, encoding,
      (err, result) => err ? console.log('file fs :',method,' rejected with error: ',err,'That was error') : resolve(result) );
    });
  }
}

promisifyFs.delFile = function(method){
  return function(path){
     return new Promise( (resolve,reject) => {
     fs[method](
     path,
     function(err) {if(err){console.log("error ",method,":",err)}else{resolve();} } )
     });
  }
}

promisifyFs.readDir = function(dirPath){
      return new Promise( (resolve,reject) => {fs.readdir(
        dirPath,
        function(err, result) { if(err){console.log("error",err)}else{ resolve(result); } } )
      })
    }

module.exports = promisifyFs;

