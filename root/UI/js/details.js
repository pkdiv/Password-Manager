const {appendFile, readFileSync, write, openSync, createWriteStream} = require('fs');
// const {createInterface} = require('readLine')
// const lineByLine = require('n-readlines');

var Details = class {
    constructor(url,username,password){
        this.url = url
        this.username = username
        this.password = password
        this.buffer = this.url + '|' + this.username + '|' + this.password + '\n';
    }
}

var Record = class {
    constructor(record) {
        this.record = record
    }
}

// Record Structure
// url|username|password$url|username|password\n
const file = '..\\Password-Manager\\datafile.txt'
// 1. Apply hashing function
// 2. Insert the record

// var r = [], d1 = []
var r = []

// TODO : Change the file path
var pack = () => {
    let writer = createWriteStream(file)

    for(let i=0;i<r.length;i++){
        if(!r[i])
            writer.write('\n')
        else
            writer.write(r[i].record+"\n")
    }
}

var unpack = () => {
    buffer = readFileSync(file,'utf-8')
    records = buffer.split('\n')
    for(var i=0; i<records.length-1; i++){
        // console.log(`Iteration-${i}`)
        r[i] = new Record(records[i]) // Add the whole line
        // record = records[i].split('$');
        // console.log(JSON.stringify(record))
        // for(var j=0; j<records.length-1; j++){
        //   item = record[j].split('|')
        //   d1[i][j] = new Details(item[0],item[1],item[2])
        // }
    }
}

var insertRecord = () => {
    // let url = document.getElementById("url").value
    // let username = document.getElementById("username").value
    // let password = document.getElementById("password").value
    // let recordPos = hash(url)
    let url = 'amazon.com'
    let username = 'abc@email.com'
    let password = '1234'
    let recordPos = 3
    // d1.push(new Details(url, username, password))
    var r_buf = new Record(url+'|'+username+'|'+password)

    unpack()
    // console.log("original - "+r[5].record)

    if(!r[recordPos]){
        r[recordPos] = new Record('$'+r_buf.record)
    }
    else {
        r[recordPos].record = r[recordPos].record.replace(/(\r?\n)|(\r)|(\n)/g, '');
        // console.log(JSON.stringify(r[recordPos].record))
        r[recordPos].record += '$'+r_buf.record
        // console.log(JSON.stringify(r[recordPos].record))
    }

    // console.log(d1[recordPos].buffer)
    pack()
}

// TODO : replace it with proper field
var displayRecords = () => {
    var d1 = unpack();
    // console.log('USN\tName\tBranch')
    // for(var i=0; i<s1.length; i++){
    //     console.log(s1[i].usn,'\t',s1[i].name,'\t', s1[i].branch)
    // }
}
