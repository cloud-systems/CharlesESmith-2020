const express    = require('express');
const path       = require('path');
const app        = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const csvtojson  = require('csvtojson');
const firebase   = require('firebase');
const replace    = require('replace');

//Initialize Firebase
/*
var firebaseConfig = {
  apiKey: "AIzaSyD_QmbqHXzHiqm0Gq0zUVDXikVvWHjja5c",
  authDomain: "student-data-1100a.firebaseapp.com",
  databaseURL: "https://student-data-1100a.firebaseio.com",
                
  projectId: "student-data-1100a",
  storageBucket: "student-data-1100a.appspot.com",
  messagingSenderId: "877464925347",
  appId: "1:877464925347:web:38cab379e9670791"
};
*/

var firebaseConfig = {
  apiKey: "AIzaSyCCgoy1_bJzrruepLYIWBbrIUIGxM-p2CQ",
  authDomain: "signup-form-e4c78.firebaseapp.com",
  databaseURL: "https://signup-form-e4c78.firebaseio.com",
  projectId: "signup-form-e4c78",
  storageBucket: "signup-form-e4c78.appspot.com",
  messagingSenderId: "1000336889334",
  appId: "1:1000336889334:web:f5099e3a8ecc1584"
};
firebase.initializeApp(firebaseConfig);

//write data to Firebase
function writeFirebase(jsonData, collection) {
  var database = firebase.database();
  var ref = firebase.database().ref(collection);

  jsonData.forEach(item => {
    ref.child(item.ID).set(item);
  });
}

function readFirebaseStudents() {
  return firebase.database().ref('students').once('value').then(function(snapshot) {
    var jsonData = [];
    snapshot.forEach(function(child) {

        var info = {
        "LAST" :  child.child("LAST").val(),
        "FIRST" : child.child("FIRST").val(),
        "MI": child.child("MI").val(),
        "ID": child.key,
        "GR" : child.child("GR").val()
        }
        jsonData.push(info);
        
    });
    return jsonData;
  }); 
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/search-student', function(req, res) {
  res.render('search-student', { 
    firebaseConfig: JSON.stringify(firebaseConfig, null, '\t')
  });
})

app.get('/ticket-entry', function(req, res) {
  res.render('ticket-entry');
})

app.get('/upload', function (req, res) {
  res.render('upload');
})

app.get('/display-student-data', function (req, res) {
  readFirebaseStudents().then(function(data){
    console.log(data)
    res.render('display-student-data', 
    {
      studentsData: data
    }
    );
  })
})

app.get('/settings', function(req, res) {
  res.render('settings');
})

app.post('/', function(req, res){
  let city = req.body.city;
  console.log(city)
  res.render('index')
})



app.post('/upload', function(req, res){
  if (!req.files || Object.keys(req.files).length == 0) {
    return res.render('msg', {
      msg: 'Please choose a file to upload',
      styleClass: 'alert error'
    });
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let csvFile = req.files.csvFile;
  let collectionName = req.body.collectionName;
  let str = csvFile.data.toString('utf8');
  console.log(str)

  csvtojson().fromString(str).then(jsonData => {
    //console.log(jsonData);
    jsonString = JSON.stringify(jsonData, null, "\t");
    writeFirebase(jsonData, collectionName);
  });

  res.render('msg', {
    msg: 'Your file has been uploaded.',
    styleClass: 'alert success'
  });
})

 
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})