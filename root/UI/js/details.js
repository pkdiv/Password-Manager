const {
  appendFile,
  readFileSync,
  write,
  openSync,
  createWriteStream
} = require('fs');
const path = require('path');
const {dialog} = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const CryptoJS = require('crypto-js')

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
  var r_buf = new Bucket(url + '|' + username + '|' + CryptoJS.AES.encrypt(password, mainPassword))

  unpackBuckets()

  if (!fileDataline[recordPos]) {
    fileDataline[recordPos] = new Bucket(r_buf.bucket)
  } else {
    if (isDuplicate(r_buf, fileDataline[recordPos])) {
      options = {type: 'info',message:'Duplicate entries not allowed!',buttons: ['Okay'], title: 'Info'}
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
      return
    }
    fileDataline[recordPos].bucket = fileDataline[recordPos].bucket.replace(/(\r?\n)|(\r)|(\n)/g, '');
    if (fileDataline[recordPos].bucket == '')
      fileDataline[recordPos].bucket += r_buf.bucket
    else
      fileDataline[recordPos].bucket += '$' + r_buf.bucket
  }
  packBuckets()
  options = {type: 'info',message:'Record inserted!',buttons: ['Okay'], title: 'Info'}
  dialog.showMessageBox(null, options, (response) => {
    console.log(response);
  });

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
      var newRecord = new Record(fields[0], fields[1], CryptoJS.AES.decrypt(fields[2], mainPassword).toString(CryptoJS.enc.Utf8))
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
      bucketBuffer += records[i].url + '|' + records[i].username + '|' + CryptoJS.AES.encrypt(records[i].password, mainPassword).toString() + '$'
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
      // console.log(bucketBuffer)
      fileDataline[id] = new Bucket(bucketBuffer)
      packBuckets()
      options = {type: 'info',message:'Record deleted!',buttons: ['Okay'], title: 'Info'}
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
      return
    }
  }
  options = {type: 'info',message:'Username does not exist!',buttons: ['Okay'], title: 'Info'}
  dialog.showMessageBox(null, options, (response) => {
    console.log(response);
  });
}


function searchRecord() {
  let url = document.getElementById("search-query").value
  let id = hash(url)
  unpackBuckets()

  let bucket = fileDataline[id]
  if(!bucket || bucket.bucket === '\n'){
    options = {type: 'info',message:'URL not found!',buttons: ['Okay'], title: 'Info'}
    dialog.showMessageBox(null, options, (response) => {
      console.log(response);
    });
    return
  }
  let records = unpackFields(bucket)
  // console.log(records);
  if(records != ""){
      displaySearchResults(records)
  }else{
    document.getElementById('search').innerHTML = "<h1 style='text-align: center;'>Record not present</h1>"
  }




  // for (i = 0; i < records.length; i++) {
  //     if(records[i]) {
  //         console.log('Record found!')
  //         console.log(`Username: ${records[i].username}\nPassword: ${records[i].password}`)
  //     }
  // }
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
    options = {type: 'info',message:'Record not found!',buttons: ['Okay'], title: 'Info'}
    dialog.showMessageBox(null, options, (response) => {
      console.log(response);
    });
  } else {
    for(i=0; i < records.length; i++){
      // console.log(ousername);
      // console.log(records[i].username);
      if(oldName == records[i].username && url == records[i].url){
        records[i].username = newName
        records[i].password = pass
        // console.log(records);
        let bucketBuffer = packFields(records)
        fileDataline[recordPos] = new Bucket(bucketBuffer)
        packBuckets()
        options = {type: 'info',message:'Record modified!',buttons: ['Okay'], title: 'Info'}
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
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

function displaySearchResults(records){


var rowStart = `<div id="search-temp" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 search-results">`
var rowEnd = `</div>`
var columnStart = `<div class="col">
  <div class="card shadow-sm">
    <div class="card-body">
      <p class="card-text">`
var columnEnd = `</p>
</div>
</div>
</div>
`
var index = 0
var displayResults = ""
var numberOfRows = Math.ceil(records.length / 3)
for(row = 0 ; row < numberOfRows; row++){
  var element = rowStart
  for (var col = index; col < records.length; col++) {
    element += columnStart +  `Username: ${records[col].username} <br> Password: ${records[col].password}` + columnEnd
  }
  index = col
  element += rowEnd
  displayResults += element
}

document.getElementById('search').innerHTML = displayResults

}


module.exports = {searchRecord}
