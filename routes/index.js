const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const serviceAccount = require("../ia-pm-efd5e-firebase-adminsdk-ysrqn-445d159ed4.json");

admin.initializeApp({
  credential : admin.credential.cert(serviceAccount),
  databaseURL : 'https://ia-pm-efd5e-default-rtdb.firebaseio.com/'
});

const db = admin.database();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', (req,res)=>{
  let data = req.body;
  console.log(data);
  bcrypt.hash(data.pass, saltRounds, (err, hash)=> {
    if(err) res.status(500);
    let user = {
      name: data.name,
      email: data.email,
      password: hash,
    }
    console.log(user);
    db.ref('users').push(user);
    res.status(200).json('Usuario guardado!')
  });
});

router.post('/login', (req,res)=>{
  let data = req.body;
  let query = db.ref('users');
  if(data.email == null){
    data.email = 'Undefined'
  }
  query.orderByChild('email').equalTo(data.email).on('child_added', snapshot=>{
    console.log(snapshot)
    if(snapshot.val()){
      let user = snapshot.val();
      bcrypt.compare(data.pass, user.password, function(err, result) {
        if(err) res.status(500);
        else {
          console.log(result);
          res.status(200).json('Logged in!')
        }
      });
    }
    else if(data.email == 'Undefined'){
      res.status(500);
    }
  });
});

module.exports = router;
