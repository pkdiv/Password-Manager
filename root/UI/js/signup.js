const fs = require('fs');
const sha1 = require('sha1');
const path = require('path');
const {dialog} = require('electron').remote


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
      options = {type: 'info',message:'User already exists!',buttons: ['Okay']}
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
      return
    }
  }

  if(password == cfrmPass){
    var buffer = username + "|" + sha1(password) + '\n'
    fs.appendFileSync(file, buffer, 'utf-8')
  }else{
    options = {type: 'info',message:'Passwords do not match!',buttons: ['Okay']}
    dialog.showMessageBox(null, options, (response) => {
      console.log(response);
    });
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
