const {appendFile, readFileSync, write, openSync, createWriteStream} = require('fs');
// const {createInterface} = require('readLine')
// const lineByLine = require('n-readlines');

var Details = class {
    constructor(url,username,password){
        this.url = url
        this.username = username
        this.password = password
    }
}

var Record = class {
    constructor(record) {
        this.record = record
    }
}


var hash = (webLink) => {
  let id = 0;
  let arr = webLink.split(".")
  for(var i = 0; i < arr[1].length; i++){
    id += arr[1].charCodeAt(i)
  }
  id = id % 1000
  return id
}

// Record Structure
// url|username|password$url|username|password\n

const file = '..\\Password-Manager\\datafile.txt'
// 1. Apply hashing function
// 2. Insert the record

// var r = [], d1 = []
var r = []

// TODO : Change the file path
var packRecords = () => {
    let writer = createWriteStream(file)

    for(let i=0;i<r.length;i++){
        if(!r[i])
            writer.write('\n')
        else
            writer.write(r[i].record+"\n")
    }
}

var unpackRecords = () => {
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

var unpackFields = (r) => {
    // record is of type Record
    var r1 = []
    var records = r.record.split('$')
    // console.log(`Records: ${records}`)
    for (let i=0;i<records.length;i++) {
        // console.log(`Record: ${records[i]}`)
        var fields = records[i].split('|')
        // console.log(fields)
        var newRecord = new Details(fields[0],fields[1],fields[2])
        r1.push(newRecord)
    }
    return r1
}

var isDuplicate = (r_buf, record) => {
    var r1 = unpackFields(record) // return of type Details
    var uname = r_buf.record.split('|')[1]

    for(let i=0;i<r1.length;i++){
        if(uname===r1[i].username)
          return true
    }
    return false

}

var insertRecord = () => {
    // let url = document.getElementById("url").value
    // let username = document.getElementById("username").value
    // let password = document.getElementById("password").value
    // let recordPos = hash(url)
    let url = 'amazon.com'
    let username = 'abcd@email.com'
    let password = '1234'
    let recordPos = 4
    // d1.push(new Details(url, username, password))
    var r_buf = new Record(url+'|'+username+'|'+password)

    unpackRecords()
    // console.log("original - "+r[5].record)

    if(!r[recordPos]){
        r[recordPos] = new Record('$'+r_buf.record)
    }
    else {
        // check for duplicate entry
        if(isDuplicate(r_buf, r[recordPos])) {
            console.log('Duplicate entries not allowed.')
            return
        }
        r[recordPos].record = r[recordPos].record.replace(/(\r?\n)|(\r)|(\n)/g, '');
        // console.log(JSON.stringify(r[recordPos].record))
        r[recordPos].record += '$'+r_buf.record
        // console.log(JSON.stringify(r[recordPos].record))
    }

    // console.log(d1[recordPos].buffer)
    packRecords()
}

// TODO : replace it with proper field
var displayRecords = () => {
    var d1 = unpack();
    // console.log('USN\tName\tBranch')
    // for(var i=0; i<s1.length; i++){
    //     console.log(s1[i].usn,'\t',s1[i].name,'\t', s1[i].branch)
    // }
}
