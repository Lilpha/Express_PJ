const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { render } = require('express/lib/response');
const Board = require("../Express_PJ/models/board.js")

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');

app.listen(8080, ()=>{
  console.log('8080 port is running')
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




app.post('/write', (요청, 응답)=>{ //post하는데 
  const date = new Date();
  //board.js의 date를 여기서 수정함
  const dateformat = date.toLocaleString();//이쁘게 날짜가 찍히는 함수 toLocaleString

  let board = new Board();
  board.title = 요청.body.title;//board스키마의 title == 요청.body.title
  board.contents = 요청.body.contents;
  board.author = 요청.body.author;
  board.board_date = dateformat; //요청이 들어온 시간은 위에서 만든 시간.

  board.save(function (에러) { //save는 db에 담는 함수
    if(에러){
      console.log(에러);
      응답.send(board)
    }
    응답.send(board)
  });
})

app.get('/detail/:id',(요청,응답)=>{
  Board.findOne({_id:요청.params.id}, (에러,결과)=>{
   응답.render('detail',{board:결과});
  })
})

app.get('/write', (요청, 응답)=>{
  응답.render('write');
})

app.get('/edit/:id', (요청, 응답)=>{
  Board.findOne({_id:요청.params.id}, (에러,결과)=>{
    응답.render('edit',{board:결과});
   })
})

app.delete('/delete', (요청, 결과)=>{
  console.log(요청.body)
  console.log(요청.params.id)
  Board.deleteOne({Boarde}, function(에러){
    console.log("삭제중 에러발생");
  })
  
  결과.redirect("/index");
  //삭제 버튼을 누르면 삭제 후 인덱스로
})

app.put('/edit', function(요청, 응답){
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

app.post('/board/write',(요청,응답)=>{
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

