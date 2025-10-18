const express= require('express');
const app=express();
const mongoose=require('mongoose');
const registeruser=require('./model');
const cors=require('cors');
 
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');

mongoose.connect("mongodb+srv://veerendra:veerendra@cluster0.dkffdyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    ()=>console.log("db connected")
)

// app.get('/',(req,res)=>{
// res.send("Hello World");
// })

app.use(express.json());
app.use(cors({origin:'*'}))

app.post('/register',async(req,res)=>{

    try{
  const{username,email,password,confirmpassword}=req.body;
  const exist= await registeruser.findOne({email});
  if(exist){

    return res.status(400).send('user Already exists');
  }

  if( password !==confirmpassword){
    return res.status(400).send('password and confirm password are not same');
  }

  let newuser= new registeruser({
    username,
    email,
    password,
    confirmpassword

  })
  await newuser.save();
  res.status(200).send('Registered Successfully');
    }
    catch(err){
    console.log(err);
    return res.status(500).send('Internal server Error');

    }
})

app.post('/login',async(req,res)=>{

    try{
  const{email,password}=req.body;
  const exist= await registeruser.findOne({email});
  if(!exist){

    return res.status(400).send('user not exists');
  }

  if(exist.password !==password){
    return res.status(400).send('Invalid credentials');
  }

  let payload={
    user:{
    id:exist.id
    }
  }
  jwt.sign(payload,"securitykey",{expiresIn:3600000},
    (err,token)=>{
      if(err) throw error;
        
      return res.json({token});
      
    })
     }
     
    catch(err){
    console.log(err);
    return res.status(500).send('Login Failed');

    }
})

app.get('/myprofile',middleware, async(req, res)=>{

  try{

    let exist= await registeruser.findById(req.user.id);

    if(!exist){
      return res.status(500).send('User not found');
    }
    res.json(exist);
  }
  catch(err){
    console.log(err);
    return res.status(500).send('Invalid token');
  }
})

app.listen(5000,()=>{

    console.log("server is running");
})