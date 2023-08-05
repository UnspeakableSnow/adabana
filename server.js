var express = require('express');
var app = express();
var server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:8081",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});
app.use(express.static(__dirname+'/public'));
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
server.listen(8080, ()=>console.log(`Listening on port 8080`));

var PLs= new Map([]); // room,ID,type,actionMode,HP,positionList,rotationy
io.on('connection', function(socket){
  var ip= socket.handshake.address;
  console.log('connected',ip);
  if(! PLs.has(ip)){
    var loc= ["0",PLs.size,-1,-1,-1,null,null];
    PLs.set(ip,loc);
  }else var loc=PLs.get(ip);
  socket.join(loc[0]);
  if(loc[2]==-1) io.to(socket.id).emit('reqType', null);
  else io.to(socket.id).emit('adopt', [loc[1],Array.from(PLs.values())]);
  
  socket.on('setType',(type)=>{
    if(!type || type<0 || 3<type){
      type=-1;
      io.to(socket.id).emit('reqType', null);
    }
    loc[2]=type;
    PLs.set(ip,loc);
    io.to(loc[0]).emit('append', loc);
    io.to(socket.id).emit('adopt', [loc[1],Array.from(PLs.values())]);
  });

  socket.on('move', (data)=>{
    loc[5]=data[0];
    loc[6]=data[1];
    PLs.set(ip,loc);
    io.to(loc[0]).emit('downdate', loc);
    console.log("move",loc[1])
  });

  socket.on('modechange', (data)=>{
    loc[3]=data[0];
    loc[6]=data[1];
    PLs.set(ip,loc);
    io.to(loc[0]).emit('downdate', loc);
    console.log("mode",loc[1],loc[3])
  });
});