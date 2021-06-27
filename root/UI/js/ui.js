const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const sha1 = require('sha1');

var usernames = []
var passwords = []
const filename = "..\\Password-Manager\\credentials.txt"



// ipcRenderer.send("msg-1", 'hello')

function checkCred(){
  var logUsername = document.getElementById("user").value
  var logPassword = document.getElementById("pass").value
  var passHash = sha1(logPassword)
  var flag = 0;
  unpack()

  for(var i = 0 ; i< usernames.length; i++){
    if (logUsername == usernames[i] && passHash == passwords[i] ){
      ipcRenderer.send("passwordHash", logPassword)
      flag = 1
      break
    }
  }
  if(flag == 0){
    console.log("Password not found");
  }
}



function unpack() {
  var buffer = fs.readFileSync(filename, 'utf-8')
  var cred = buffer.split('\n')
  for(var record=0;record<cred.length - 1;record++){
    usernames[record] = cred[record].split('|')[0]
    passwords[record] = cred[record].split('|')[1].replace(/(\r?\n)|(\r)|(\n)/g, '');
  }
}
