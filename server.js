var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port=8080;
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
server.listen(port, ()=>console.log(`Listening on port`,port));

var PLs= new Map([]); // room,ID,type,HP,moveList
const PLstartPositions=[[0,-7,0],[0,7,0],[0,0,7],[0,0,-7],[0,7,14],[0,7,-14],[0,-7,14],[0,-7,-14]];
io.on('connection', function(socket){
  var ip= socket.handshake.address;
  if(ip=="::ffff:127.0.0.1")ip=="::1";
  console.log('connected',ip);
  if(! PLs.has(ip)){
    var loc= ["0",PLs.size,-1,-1,null,null];
    loc[4]=PLstartPositions[loc[1]%PLstartPositions.length]
    PLs.set(ip,loc);
    io.to(loc[0]).emit('PLnull', loc);
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
    loc[4]=data[1];
    PLs.set(ip,loc);
    console.log("move",loc[1]);
    io.to(loc[0]).emit('move', data);
  });

  socket.on('attack', (data)=>{
    loc[4][0]=data[1];
    PLs.set(ip,loc);
    console.log("attack",loc[1]);
    io.to(loc[0]).emit('attack', data);
  });
});