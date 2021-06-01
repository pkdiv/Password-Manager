var Student = class {
    constructor(usn,name,branch){
        this.usn = usn
        this.name = name
        this.branch = branch
        this.buffer = this.usn + '|' + this.name + '|' + this.branch + '\n'
    }
}

var pack = (s) => {
    appendFileSync('student.txt', s.buffer, (err)=>{
        if(err) throw err
    })
}

var unpack = () => {
    var s1 = []
    buffer = readFileSync('student.txt','utf-8')
    records = buffer.split('\n')
    for(var i=0; i<records.length-1; i++){
        // console.log(`Iteration-${i}`)
        record = records[i].split('|')
        s1[i] = new Student(record[0],record[1],record[2])
    }
    return s1
}

var insertRecord = () => {
    var s = new Student('31','Prateek','ISE')
    pack(s)
    console.log('Inserted!')
}

var displayRecords = () => {
    var s1 = unpack();
    console.log('USN\tName\tBranch')
    for(var i=0; i<s1.length; i++){
        console.log(s1[i].usn,'\t',s1[i].name,'\t', s1[i].branch)
    }
}
