const fs = require('fs');

function replaceNl (msg) {
    return msg.replace(/(\r\n|\n|\r)/gm, "\\n");
}


let privateKey = String.fromCharCode.apply(null,fs.readFileSync('./qualichain.key'));
console.log(privateKey)
let publicKey = String.fromCharCode.apply(null,fs.readFileSync('./qualichain.key.pub'));

fs.writeFile('qualichain.key.convert',replaceNl(privateKey),()=>    {
    console.log('pk done')
})

fs.writeFile('qualichain.key.pub.convert',replaceNl(publicKey),()=>    {
    console.log('pk done')
})

