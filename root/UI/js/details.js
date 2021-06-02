const {appendFileSync, readFileSync} = require('fs');

var Details = class {
    constructor(id,url,username,password){
        this.id = id
        this.url = url
        this.username = username
        this.password = password
        this.buffer = this.id + '|' + this.url + '|' + this.username + '|' + this.password + '\n';
    }
}

// Record Structure
// id | url | username | password

var pack = (s) => {
    appendFileSync('datafile.txt', s.buffer, (err)=>{
        if(err) throw err
    })
}

var unpack = () => {
    var s1 = []
    buffer = readFileSync('datafile.txt','utf-8')
    records = buffer.split('\n')
    for(var i=0; i<records.length-1; i++){
        // console.log(`Iteration-${i}`)
        record = records[i].split('|')
        s1[i] = new Details(record[0],record[1],record[2],record[3])
    }
    return s1
}

var insertRecord = () => {
    let id = "1";
    let url = document.getElementById("url").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value
    var d = new Details(id, url, username, password)

    pack(d)
    console.log('Inserted!')
}

// TODO : replace it with proper field
var displayRecords = () => {
    var s1 = unpack();
    console.log('USN\tName\tBranch')
    for(var i=0; i<s1.length; i++){
        console.log(s1[i].usn,'\t',s1[i].name,'\t', s1[i].branch)
    }
}

insertRecord();
