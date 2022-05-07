const crypto =require('crypto');

let config=require('./configuration');



const helpers={};

helpers.hash =function(str){
    if(typeof(str)==="string" && str.length > 0){
let hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
return hash;
    }else{
        return false;
    }
}

helpers.parseJsonToObject = function(str){
    try{
        var obj =JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}
module.exports=helpers