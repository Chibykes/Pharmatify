var genFunctions = {
    genUpperCase: function (){
        return String.fromCharCode(Math.floor((Math.random() * 26) + 65));
    },
    genLowerCase: function (){
        return String.fromCharCode(Math.floor((Math.random() * 26) + 97));
    },
    genNumber: function (){
        return String.fromCharCode(Math.floor((Math.random() * 10) + 48));
    },
    genSymbol: function (){
        let symbols = '!@#$%&*()-_+=|{}[].,;:'
        return symbols.charAt(Math.floor((Math.random() * 22)));
        // return String.fromCharCode(Math.floor((Math.random() * 15) + 33));
    }
}


module.exports = function genRandomString(genFunctionsArray, length){
    genFunctionsArray = ["genUpperCase", "genNumber"];
    if (!length){ length = 10; }
    var genString = '';
    for(i=0; i<length; i++){
        genString = genString.concat(genFunctions[genFunctionsArray[Math.floor(Math.random() * genFunctionsArray.length)]]());
    }
    return genString;
}