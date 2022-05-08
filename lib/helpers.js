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
helpers.createRandomString=function(strLength){
    strLength = typeof(strLength)=='number'&&strLength>0?strLength:false;
    if(strLength){
        let possibleCharacters='azertyuiopqsdfghjklmwxcvbn0123456789'
        let str='';
        for(let i=1;i<=strLength;i++){
            var randomCharacters=possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length))
        str+=randomCharacters;
        }
        return str
    }else{return false}
}
module.exports=helpers