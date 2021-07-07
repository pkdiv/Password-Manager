const {
  appendFile,
  readFileSync,
  write,
  openSync,
  createWriteStream
} = require('fs');
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer

// Record Structure
// url|username|password$url|username|password$url|username|password\n
// UI/datafile.txt

// encrypt password -> using Hash(mainPassword)

var mainCreds = ipcRenderer.sendSync('pass', "send me the password")
var userfileName = mainCreds.split("|")[0]
var mainPassword = mainCreds.split("|")[1]


const file = path.join(__dirname, '../credentials/userfiles/' + userfileName + '.txt')
var fileDataline = []

var Record = class {
  constructor(url, username, password) {
    this.url = url
    this.username = username
    this.password = password
  }
}

var Bucket = class {
  constructor(bucket) {
    this.bucket = bucket
  }
}


function hash(webLink) {
  let id = 0;
  let arr = webLink.split(".")
  for (var i = 0; i < arr[1].length; i++) {
    id += arr[1].charCodeAt(i)
  }
  id = id % 100
  return id
}

function insertRecord() {
  let url = document.getElementById("url").value
  let username = document.getElementById("iusername").value
  let password = document.getElementById("ipassword").value
  let recordPos = hash(url)
  var r_buf = new Bucket(url + '|' + username + '|' + password)

  unpackBuckets()

  if (!fileDataline[recordPos]) {
    fileDataline[recordPos] = new Bucket(r_buf.bucket)
  } else {
    if (isDuplicate(r_buf, fileDataline[recordPos])) {
      console.log('Duplicate entries not allowed.')
      return
    }
    fileDataline[recordPos].bucket = fileDataline[recordPos].bucket.replace(/(\r?\n)|(\r)|(\n)/g, '');
    if (fileDataline[recordPos].bucket == '')
      fileDataline[recordPos].bucket += r_buf.bucket
    else
      fileDataline[recordPos].bucket += '$' + r_buf.bucket
  }
  packBuckets()

}

function unpackBuckets() {
  buffer = readFileSync(file, 'utf-8')
  buckets = buffer.split('\n')
  for (i = 0; i < buckets.length - 1; i++) {
    fileDataline[i] = new Bucket(buckets[i])
  }
}

function unpackFields(bkt) {
  var recObjectArray = []
  var rawRecords = bkt.bucket.split('$')

  for (let i = 0; i < rawRecords.length; i++) {
    var fields = rawRecords[i].split('|')
    // console.log(fields)
    if(fields.length<3)
      var newRecord = ''
    else
      var newRecord = new Record(fields[0], fields[1], fields[2])
    recObjectArray.push(newRecord) // Array of json objects(Record class objects)
  }
  return recObjectArray
}

function packBuckets() {
  // Uses Global r Array
  let writer = createWriteStream(file)
  for (let i = 0; i < fileDataline.length; i++) {
    if (!fileDataline[i])
      writer.write('\n')
    else
      writer.write(fileDataline[i].bucket + "\n")
  }
}

function packFields(records) {
  let bucketBuffer = ''
  for (i = 0; i < records.length; i++) {
    if (records[i].username != '') {
      bucketBuffer += records[i].url + '|' + records[i].username + '|' + records[i].password + '$'
    }
  }
  return bucketBuffer.slice(0, -1)
}

function isDuplicate(r_buf, record) {
  var recordObjects = unpackFields(record) // return of type Details
  var uname = r_buf.bucket.split('|')[1]

  for (let i = 0; i < recordObjects.length; i++) {
    if (uname === recordObjects[i].username)
      return true
  }
  return false
}

function deleteRecord() {
  let url = document.getElementById('url').value
  let username = document.getElementById('dusername').value
  let id = hash(url)

  unpackBuckets()

  let bucket = fileDataline[id]
  let records = unpackFields(bucket)

  for (i = 0; i < records.length; i++) {
    if (username === records[i].username && url === records[i].url) {
      records[i].username = ""
      let bucketBuffer = packFields(records)
      console.log(bucketBuffer)
      fileDataline[id] = new Bucket(bucketBuffer)
      packBuckets()
      console.log('Record deleted.')
      return
    }
  }
  console.log('Username does not exist.')
}


function searchRecord() {
  let url = document.getElementById("search-query").value
  let id = hash(url)
  unpackBuckets()

  let bucket = fileDataline[id]
  if(!bucket || bucket.bucket === '\n'){
    console.log("URL not found");
    return
  }
  let records = unpackFields(bucket)
  console.log(records.length);

  for (i = 0; i < records.length; i++) {
      if(records[i]) {
          console.log('Record found!')
          console.log(`Username: ${records[i].username}\nPassword: ${records[i].password}`)
      }
  }
}

function modifyRecord() {
  let url = document.getElementById('url').value
  let oldName = document.getElementById('ousername').value
  let newName = document.getElementById('nusername').value
  let pass = document.getElementById('password').value
  let recordPos = hash(url)
  unpackBuckets()
  let bucket = fileDataline[recordPos]
  let records = unpackFields(bucket)

  if (!bucket) {
    console.log("Record not found");
  } else {
    for(i=0; i < records.length; i++){
      // console.log(ousername);
      // console.log(records[i].username);
      if(oldName == records[i].username && url == records[i].url){
        records[i].username = newName
        records[i].password = pass
        console.log(records);
        let bucketBuffer = packFields(records)
        fileDataline[recordPos] = new Bucket(bucketBuffer)
        packBuckets()
        console.log('Record Modified.')
        return
      }

    }
  }

}

function displayRecords() {
  unpackBuckets()
  var buckets = fileDataline
  for (i = 0; i < buckets.length; i++) {
    var record = unpackFields(buckets[i])
    for (j = 0; j < record.length; j++) {
      if (record[j].password) {
        console.log(record[j].url + "\t" + record[j].username + "\t" + record[j].password);
      }
    }
  }
}

function disTable(records){
  var columnHeader = ['username', 'Password']
  var table = document.createElement("table")
  var tableRow = document.createElement("tr")
  var tableheader = document.createElement("th")

for(i=0; i < columnHeader.length; i++){
  tableheader.value = columnHeader[i]
  tableRow.appendChild(tablehaeder)
}

table.appendChild(tableRow)


}
