var express = require('express');
var mysql = require('mysql2')
var multer = require('multer');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');

upload = multer();
app = express(); 

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "akagami40.red92",
    database: "auth",
    insecureAuth : true
})



app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(upload.array()); 
app.use(express.static('public'));
///////========CREATE DATABASE========////////
// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("CREATE DATABASE auth", function (err, result) {
//         if (err) throw err;
//         console.log("Database created");
//     });
// });

///////=========CREATE TABLE=========////////
// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     var sql = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), password VARCHAR(30))";
//     con.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log("Table created");
//     });
// });
                
con.connect()

app.set('view engine', 'ejs');
app.set('views', './')

app.use(session({'secret': 'secret'}))

app.get('/', function(req, res){
    console.log('Redirected!')
    console.log(req.session.user_id)
    if(req.session.user_id == null) res.render("index")
    else res.render('loggedin', {
        name: req.session.name,
        email: req.session.email,
        password: req.session.password
    })
})

app.get('/login', (req, res) => {
    if(req.session.name == null) res.render("login")
    else res.redirect('/')
})

app.get('/register', (req, res) => {
    if(req.session.name == null) res.render("register")
    else res.redirect('/')
})

app.get('/logout', function(req, res){
    req.session.user_id = NaN
    req.session.name = NaN
    req.session.email = NaN
    req.session.password = NaN
    res.redirect('/')
})

app.post('/register', function(req, res){
    var name = req.body.name
    var email = req.body.register_email
    var password = req.body.register_password

    var sql = "INSERT INTO users (name, email, password) VALUES('"+ name +"', '"+ email +"', '"+ password +"');"
    con.query(sql, function (err, result) {
        if (err) throw err;
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200);
    res.end('Registered successfully! <br> <a href="/">Go back</a>')
})

app.post('/login', function(req, res){
    var email = req.body.login_email
    var password = req.body.login_password

    var sql = "SELECT * FROM users WHERE email='"+ email +"' AND password='"+ password +"'"
    con.query(sql, function (err, result) {
        if(result.length)
        {
            req.session.email = email
            req.session.password = password
            req.session.name = result[0].name
            req.session.user_id = result[0].id
            res.redirect('/')
        }
        else
        {    
            res.setHeader("Content-Type", "text/html");
            res.status(200);
            res.end('<h1>Email or password is incorrect</h1><a href="/login">Go back</a>')
        }
    });
    

})

app.get('/edit_profile', function(req, res){
    if(req.session.user_id == NaN || req.session.user_id == undefined)
    {
        res.redirect('/')
    }
    else
    {
        res.render('edit_profile', {
            name: req.session.name,
            email: req.session.email,
            password: req.session.password
        })
    }
})

app.post('/edit_profile', function(req, res){
    if(req.session.user_id == NaN || req.session.user_id == undefined)
    {
        res.redirect('/')
    }
    else
    {
        var name = req.body.edit_name,
            email = req.body.edit_email,
            password = req.body.edit_password;
        
        sql = 'UPDATE users SET name="'+ name +'", email="'+ email +'", password="'+ password +'" WHERE id="'+ req.session.user_id +'"'
        con.query(sql, function (err, result) {
            req.session.email = req.body.edit_email
            req.session.password = req.body.edit_password
            req.session.name = req.body.edit_name
            res.redirect('/')
        });
    }
})

app.post('/delete_account', function(req, res){
    if(req.session.user_id == undefined || req.session.user_id == NaN)
    {
        res.redirect('/')
    }
    else
    {
        console.log("Deleting account")
        sql = 'DELETE FROM users WHERE id="'+ req.session.user_id +'"'
        con.query(sql, function (err, result) {
            // req.session.email = NaN
            // req.session.password = NaN
            // req.session.name = NaN
            // req.session.user_id = NaN
            // console.log("After deleting: " + req.session.user_id)

            req.session.destroy();
        });
    }
    
})

app.listen(3000);