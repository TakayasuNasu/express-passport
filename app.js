'use strict';

var express      = require('express');
var http         = require('http');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser   = require('body-parser');

// ハッシュ値を求めるために必要なもの
var crypto    = require("crypto");
var secretKey = "some_random_secret";

var getHash   = function(target){
        var sha = crypto.createHmac("sha256", secretKey);
            sha.update(target);
                return sha.digest("hex");
};

var flash         = require("connect-flash"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

// MongoDBを使うのに必要なもの
var mongoose = require("mongoose");

var db = mongoose.createConnection("mongodb://localhost/passporttest", function(error, res){});

var UserSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, requird: true}
});

var User = db.model("User", UserSchema);

// サーバー起動時にユーザーが無ければ、テスト用のデータを投入します。
// 間違っても本番用のサーバーにこんなコードを入れちゃ駄目です。
User.find({}, function(err, docs) {
    if (Object.keys(docs).length === 0) {
        var aaaUser = new User();
        aaaUser.email = "test@test.com";
        aaaUser.password = getHash("aaa");
        aaaUser.save();
    };

    for (var i=0, size=docs.length; i<size; ++i) {
      console.log(docs[i].email);
    }
});

passport.serializeUser(function(user, done){
    done(null, {email: user.email, _id: user._id});
});

passport.deserializeUser(function(serializedUser, done){
    User.findById(serializedUser._id, function(err, user){
        done(err, user);
    });
});

// LocalStrategyを使う設定
passport.use(new LocalStrategy(
  // フォームの名前をオプションとして渡す。
  // 今回はusernameの代わりにemailを使っているので、指定が必要
  {usernameField: "email", passwordField: "password"},
  function(email, password, done){
    // 非同期で処理させるといいらしいです
    process.nextTick(function(){
        User.findOne({email: email}, function(err, user){
            console.log(user)
            if(err)
                return done(err);
            if(!user)
                return done(null, false, {message: "ユーザーが見つかりませんでした。"});
            var hashedPassword = getHash(password);
            if(user.password !== hashedPassword)
                return done(null, false, {message: "パスワードが間違っています。"});
            return done(null, user);
        });
    });
}));

// リクエストがあったとき、ログイン済みかどうか確認する関数
var isLogined = function(req, res, next){
    if(req.isAuthenticated())
        return next();  // ログイン済み
    // ログインしてなかったらログイン画面に飛ばす
    res.redirect("/login");
};

var routes = require('./routes/index');
var users  = require('./routes/users');
var login  = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: "another_random_sevret_again",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/',      routes);
app.use('/users', users);
app.use('/login', login);

app.post("/login", passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res){
    // ログインに成功したらトップへリダイレクト
    res.redirect("/");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.get("/member_only", isLogined, function(req, res){
    res.render("member_only", {user: req.user});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
