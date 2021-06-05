const {
  appendFile,
  readFileSync,
  write,
  openSync,
  createWriteStream
} = require('fs');

// Record Structure
// url|username|password$url|username|password$url|username|password\n
// UI/datafile.txt
const file = __dirname + 'datafile.txt'
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
  id = id % 1000
  return id
}

function insertRecord() {
  // let url = document.getElementById("url").value
  // let username = document.getElementById("username").value
  // let password = document.getElementById("password").value
  // let recordPos = hash(url)
  let url = 'www.amazon.com'
  let username = 'abcd@email.com'
  let password = '1234'
  let recordPos = 4
  var r_buf = new Bucket(url + '|' + username + '|' + password) // Converts user input into a bucket object

  unpackBuckets()

  if (!fileDataline[recordPos]) {
    fileDataline[recordPos] = new Bucket(r_buf.bucket)
  } else {
    if (isDuplicate(r_buf, fileDataline[recordPos])) {
      console.log('Duplicate entries not allowed.')
      return
    }
    fileDataline[recordPos].bucket = fileDataline[recordPos].bucket.replace(/(\r?\n)|(\r)|(\n)/g, ''); // Handles weird characters
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
  for (i = 0; i < n; i++) {
    if (records[i].username === '')
      continue
    bucketBuffer += records[i].url + '|' + records[i].username + '|' + records[i].password + '$'
  }
  return bucketBuffer.slice(0, -1)
}

function isDuplicate(r_buf, record){
  var recordObjects = unpackFields(record) // return of type Details
  var uname = r_buf.bucket.split('|')[1]

  for (let i = 0; i < recordObjects.length; i++) {
    if (uname === recordObjects[i].username)
      return true
  }
  return false
}

function deleteRecord = () => {
  let url = 'www.amazon.com'
  let username = 'abc@email.com'
  //displayRecords
  let id = hash(url)

  unpackBuckets()

  let bucket = fileDataline[id]
  let records = unpackFields(bucket)

  for (i = 0; i < records.length; i++) {
    if (username === records[i].username && url === records[i].url) {
      // delete record[i]
      records[i].username = ""
      // pack each detail object into one bucket
      packRecords()
    }
  }
}

function searchRecord(url, username) {
  let id = hash(url)
  unpackBuckets()

  let bucket = fileDataline[id]
  let records = unpackFields(bucket)

  for(i = 0; i < records.length; i++) {
    if(username === records[i].username) {
      console.log('Record found!')
      console.log(`Username: ${records[i].username}\nPassword: ${records[i].password}`)
      return
    }
  }
  console.log('Record does not exist!')
}

function modifyRecord() {

}

function displayRecords(bucket) {
  var records = unpackBuckets(bucket)

}
