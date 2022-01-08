const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const {sha256} = require('crypto-hash')
const mongoose = require('mongoose')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const auth = require('../src/middleware/auth')
const cookieParser = require('cookie-parser')
const Note = require('./models/Note')


const app = express()
app.use(cookieParser())
const server = require('http').Server(app)
const port = process.env.PORT
const path = require('path')
app.set('view engine', 'ejs')
console.log(path.join(__dirname, "../public"))
app.use(express.static(path.join(__dirname, "../public")));

app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// token generator

const generateAuthToken = async (user)=>{
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET_CODE, {expiresIn: '10h'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}
// login

app.get('/', auth, (req, res)=>{
    // console.log('user validated')
    let result = req.user.notes || []
    res.render('home', { result: result});
})

app.get('/login', (req, res)=>{
    res.render('login', {message: ''})
})

app.post('/login', async(req, res)=>{
    let email = req.body.email
    email = email.toLowerCase()
    let password = await sha256(req.body.password)
    try{
        const user = await User.findOne({email: email})
        if(!user){
            return res.render('login', {message: 'Email ID not register. Please sign up using a valid email.'})
        }
        if(user.password !== password){
            return res.render('login', {message: 'Incorrect password'})
        }
        const token = await generateAuthToken(user)
        res.cookie('token', token)
        res.redirect('/')
    }catch(error){
        console.log(error.message)
        res.render('login', {message: error.message})
    }
})

// signup

app.get('/signup', (req, res)=>{
    res.render('signup', {message: ''})
})

app.post('/signup', async(req, res)=>{
    let email = req.body.email
    email = email.toLowerCase()
    let password = await sha256(req.body.password)
    let newUser = new User({
        email,
        password
    })
    try{
        await newUser.save()
        const token = await generateAuthToken(newUser)
        console.log(token)
        res.cookie('token', token)
        res.render('home', {result: []})
    }catch(error){
        res.render('signup', {message: error.message})
    }

})

app.get('/logout', (req, res)=>{
    // res.send('logout successfully')
    res.clearCookie('token')
    res.render('login', {message:'Logged out successfully'})
})



app.post('/addNote',auth, async(req, res) => {
    console.log(req.user)
    const input = req.body.textbox;
    try{
        if (!(input === null || input === "")) {
            req.user.notes = req.user.notes.concat({note: input})
            await req.user.save()
        }
        res.redirect("/");
    }catch(err){
        console.log(err.message)
    }
});

app.post('/deleteNote',auth, async(req, res) => {
    try{
        for(let i = req.user.notes.length-1;i>=0;i--){
            if(req.user.notes[i].note === req.body.submit){
                req.user.notes.splice(i, 1);
            }
        }
        await req.user.save()
        res.redirect('/')
    }catch(err){
        console.log(err.message)
    }
});

app.get('/:dest', (req, res)=>{
    res.render('login', {message: ''})
})





server.listen(port, ()=>{
    console.log(`Server is running at port ${port}`)
})

