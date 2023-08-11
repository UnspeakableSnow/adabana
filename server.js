var express = require('express');
const { start } = require('repl');
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

var PLs= [];
var IPs= new Map([]); // room,ID,type,HP,moveList
const PLstartPositions=[[0,-7,0],[0,7,0],[0,0,7],[0,0,-7],[0,7,14],[0,7,-14],[0,-7,14],[0,-7,-14]];
const PLHPs=[7,5,5,3,2];
var mapblock=[];
const mapsize=6;
for(var i=0;i<mapsize;i++){
  mapblock.push([]);
for(var j=0;j<mapsize;j++){
  var maptype= Math.floor(Math.random()*(2**4));
  maptype= maptype& Math.floor(Math.random()*(2**4));
  maptype= maptype& Math.floor(Math.random()*(2**4));
  if(i==0)maptype=maptype|0b1;
  if(j==mapsize-1)maptype=maptype|0b10;
  if(i==mapsize-1)maptype=maptype|0b100;
  if(j==0)maptype=maptype|0b1000;
  mapblock[i].push(maptype);
}}

io.on('connection', function(socket){
  var ip= socket.handshake.address;
  if(ip=="::ffff:127.0.0.1")ip="::1";
  console.log('connected',ip);
  var room="0";
  if(! IPs.has(ip)){
    IPs.set(ip,PLs.length);
    var startposi=PLstartPositions[PLs.length%PLstartPositions.length];
    startposi[1]+=50*Math.trunc(mapsize/2);
    startposi[2]+=50*Math.trunc(mapsize/2);
    PLs.push([room,PLs.length,-1,-1,startposi,null]);
    io.to(room).emit('PLnull', PLs[IPs.get(ip)]);
  }
  var ID= IPs.get(ip);
  socket.join(room);
  if(PLs[ID][2]==-1) io.to(socket.id).emit('reqType', null);
  else io.to(socket.id).emit('adopt', [ID, PLs, mapblock]);
  
  socket.on('setType',(type)=>{
    if(type!=null && type>=0 && 3>type){
      PLs[ID][2]=type;
      PLs[ID][3]=PLHPs[type];
      console.log(ip,"selected",type);
      io.to(room).emit('append', PLs[ID]);
      io.to(socket.id).emit('adopt', [ID,PLs, mapblock]);
    }else io.to(socket.id).emit('reqType', null);
  });

  socket.on('move', (data)=>{
    PLs[ID][4]=data[1];
    io.to(room).emit('move', data);
  });

  socket.on('attack', (data)=>{
    PLs[ID][4][0]=data[1];
    io.to(room).emit('attack', data);
  });
  
  socket.on("updateHP", (data)=>{
    PLs[data[0]][3]=data[1];
    io.to(room).emit('updateHP', data);
  });
});