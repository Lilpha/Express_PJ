const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { render } = require('express/lib/response');
const Board = require("../Express_PJ/models/board.js")
const User = require("./models/user");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.listen(8080, ()=>{
  console.log('8080 port is running')
})
/*회원가입*/
app.get('/register', (요청, 응답)=>{
  응답.render('register', {msg:'기본'});
})

app.post("/register", (요청, 응답)=>{
  User.findOne({userName:요청.body.userName}).then((user)=>{
    if(user){ //이미 있는 유저면
      응답.render('register',{msg:'사용중인 닉네임 입니다.'});
    } else{
      const newUser = new User({
        userName: 요청.body.userName,
        password: 요청.body.password,
      });
      newUser.save(function(에러){
        if(에러) {console.log(에러)}
        응답.redirect('/');
      })
      // return 응답.status(200).json({msg: newUser})
    }
  })
})
app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}),function(요청, 응답){
  응답.redirect('/index')
});

/*로그인 여부 체크하는 미들웨어 함수*/
function 로그인여부(요청, 응답, next){
  if(요청.user){
    next()
  } else{
    응답.redirect('/login')
  }
}

passport.use(new LocalStrategy({ //인증하는 방법
  usernameField: 'userName', //input의 name이 뭔지.
  passwordField: 'password',
  session: true,
  passReqToCallback: false, //true로 바꾸면 fucntion에 req를 넣어서 아디, 비번 외에 정보를 받기 가능
}, function (입력한이름, 입력한비번, done) {

  User.findOne({ userName: 입력한이름 }, function (에러, 결과) {
    if (에러) return done(에러)

    //일치하는 id가 없으면
    if (!결과) return done(null, false, { msg: '존재하지않는 아이디입니다.' })
    //일치하는 아디가 있고 패스워드도 같으면
    const validPassword = bcrypt.compare(입력한비번, 결과.password)
    if (validPassword) {
      return done(null, 결과) //결과를 담아서 serializeUser로 넘김
    } else {
      return done(null, false, { msg: '비번틀렸어요' })
    }
  })
}));

app.post('/check', (요청, 응답)=>{
  const name = 요청.body.name;
  let msg;
  User.findOne({userName:name}).then((user)=>{
    if(user){//유저가 있으면
      msg = 1 //
    }
    else {msg = 2} //사용가능한 닉네임일때
    응답.send({msg:msg})
  })
})


mongoose.connect(
  'mongodb+srv://sungho:sungho@cluster0.vdymj57.mongodb.net/?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  }
)


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(){
  console.log("Connected successfully");
});



app.get('/index', (요청, 응답)=>{
  Board.find({}, function(에러, 결과){
    응답.render('index', {board:결과}) //render은 표시하는 항목
  })
})




app.post('/write',로그인여부, (요청, 응답)=>{ //post하는데 
  const date = new Date();
  //board.js의 date를 여기서 수정함
  const dateformat = date.toLocaleString();//이쁘게 날짜가 찍히는 함수 toLocaleString

  let board = new Board();
  board.title = 요청.body.title;//board스키마의 title == 요청.body.title
  board.contents = 요청.body.contents;
  board.author = 요청.user.author;
  board.board_date = dateformat; //요청이 들어온 시간은 위에서 만든 시간.

  board.save(function (에러) { //save는 db에 담는 함수
    if(에러){
      console.log(에러);
      응답.send(board)
    }
    응답.send(board)
  });
})



app.get('/detail/:id',로그인여부,(요청,응답)=>{
  Board.findOne({_id:요청.params.id}, (에러,결과)=>{
   응답.render('detail',{board:결과});
  })
})

app.get('/write',로그인여부, (요청, 응답)=>{
  응답.render('write');
})

app.get('/edit/:id',로그인여부, (요청, 응답)=>{
  Board.findOne({_id:요청.params.id}, (에러,결과)=>{
    응답.render('edit',{board:결과});
   })
})

app.delete('/delete',로그인여부, (요청, 결과)=>{
  console.log(요청.body)
  console.log(요청.params.id)
  Board.deleteOne({Boarde}, function(에러){
    console.log("삭제중 에러발생");
  })
  
  결과.redirect("/index");
  //삭제 버튼을 누르면 삭제 후 인덱스로
})

app.put('/edit',로그인여부, function(요청, 응답){
  console.log(요청.body)
  const author = 요청.body.author
  const contents = 요청.body.contents
  const title = 요청.body.title
  const board_id = 요청.body.id

  Board.findOneAndUpdate({_id:board_id}, 
    { $set: {
      author : author,
      contents : contents,
      title : title
    }}, function(에러, 결과){
      if(에러){
        console.log(에러);
        응답.sendStatus(500);
      }
      응답.sendStatus(200);
      console.log(결과)
    })
})

app.post('/board/write',로그인여부,(요청,응답)=>{
  const date = new Date();
  // 데이터 = 새 데이터
  const dateformat = date.toLocaleString();//이쁘게 날짜가 찍히는 함수 toLocaleString

  let board = new Board(); //새 보드 생성
  board.title = 요청.body.title;//board스키마의 title == 요청.body.title
  board.contents = 요청.body.contents;
  board.author = 요청.body.author;
  board.board_date = dateformat; //요청이 들어온 시간은 위에서 만든 시간.

  board.save(function (에러) { //save는 db에 담는 함수
    if(에러){
      console.log(에러);
      응답.send(board)
    }
    응답.redirect("/index"); //저장 후 /index로 돌아감
  });
})

passport.serializeUser(function(user, done){
  done(null, user.userName); //id를 이용해서 세션을 저장시키는 코드
});

passport.deserializeUser(function(아이디, done){
  User.findOne({userName:아이디}, function(에러, 결과){
    done(null, 결과)
  })
})


/*모든 페이지요청이 있을때마다 로그인 여부 반환*/
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

/* 로그아웃 */
app.get('/logout',로그인여부, function(요청, 응답, next) {
  요청.logout(function(에러){
    if(에러) {return next(err);}
    응답.redirect('/');
  })
});

