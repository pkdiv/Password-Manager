const fs = require('fs');
const sha1 = require('sha1');
const path = require('path');



const file = path.join(__dirname, '../credentials/credentials.txt')
var passPath
var usernames = []
var passwords = []



function signUp(){
  var username = document.getElementById("user-sgn").value
  var password = document.getElementById("pass-sgn").value
  var cfrmPass = document.getElementById("cfrm-pass-sgn").value
  var userfile = username + ".txt"
  unpack()
  for(var i=0; i<usernames.length; i++){
    if(username == usernames[i]){
      console.log("User exists");
      return
    }
  }

  if(password == cfrmPass){
    var buffer = username + "|" + sha1(password) + '\n'
    fs.appendFileSync(file, buffer, 'utf-8')
  }else{
    console.log("Password does not match");
  }
  passPath = path.join(__dirname, '../credentials/userfiles/' + userfile)
  fs.writeFileSync(passPath, "");


}


function unpack() {
  var buffer = fs.readFileSync(file, 'utf-8')
  var cred = buffer.split('\n')
  for(var record=0;record<cred.length - 1;record++){
    usernames[record] = cred[record].split('|')[0]
    passwords[record] = cred[record].split('|')[1].replace(/(\r?\n)|(\r)|(\n)/g, '');
  }
}
