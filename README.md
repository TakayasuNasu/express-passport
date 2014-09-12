expressでpassportとmongooseを使ってみる
===

MEAN stackでアプリを開発するにあたって、angular-fullstackを使ってみることにした
- [angular-fullstack@github](https://github.com/DaftMonk/generator-angular-fullstack)

angular-fullstackでは、始めから認証機能がついていたが、その使い方が不明でした
どうやら認証機能はpassportを使ってて、mongoDBの操作にはmongooseを使っていました。

ひとまず[こちらを参考](http://kikuchy.hatenablog.com/entry/2013/07/03/042221)にpassportの基本的な使い方を学ぶ

##### 事前準備

1. nodejsのインストール
1. mongoDBのインストール
1. express-generatorのインストール

ほとんど参考サイトとおりのすれば問題ありませんが、いくつか補足

1. express-generatorで雛形を作成した場合、expressのバージョンが4になるため、参考サイトとバージョンに差異があります
1. express-sessionが別モジュールのため、packege.jsonに追加して、`npm install` する必要がある
1. 起動時のユーザー未登録状態を判定する条件が異なる
before
```javascript
if(User.count({) == 0){
    var aaaUser = new User(;
    aaaUser.email = "aaa@example.com";
    aaaUser.password = getHash("aaa");
    aaaUser.save(;
}
```
after
```javascript
User.find({, function(err, docs) {
    if (Object.keys(docs).length === 0) {
        var aaaUser = new User(;
        aaaUser.email = "test@test.com";
        aaaUser.password = getHash("aaa");
        aaaUser.save(;
    };

    for (var i=0, size=docs.length; i<size; ++i) {
      console.log(docs[i].email);
    }
});
```

1. 以下の`app,usr` が抜けている
```javascript
app.use(flash();
app.use(passport.initialize();
app.use(passport.session();
```

#### 参考
[Express + Passport でお手軽ユーザー認証](http://kikuchy.hatenablog.com/entry/2013/07/03/042221)
[node.js から MongoDB にアクセス (Mongoose の紹介)](http://krdlab.hatenablog.com/entry/20110317/1300367785)
