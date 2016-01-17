var express = require('express'); 
var ejs = require('ejs');
var session = require('cookie-session');
var bodyParser = require('body-parser'); 
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();

//We use session
app.use(session({secret: 'fomesecret'}))

//access to static files
app.use(express.static('public'));

var baseAddress = "http://192.168.1.52:8080"

app.get('/', function (req, res) {
  res.render('connect.ejs', {room:req.session.room});
})
.post('/followme/create/',urlencodedParser, function (req, res) {
    ///////////////////
    //Inscription Form 
    //////////////////

    req.session.username = req.body.username;
    req.session.room = req.body.room || req.session.username;
    console.log("User "+req.session.username + " created.");
    //If the room is not specified, we create his own room
    res.redirect('/followme/user/'+req.session.room);

})
.get('/followme/user/:room', function (req, res) {
    ////////////////////
    //ROOM
    ////////////////////
    console.log("Connecting to : "+req.params.room);
    if (req.session.username == null) {
        //Someone tries to connect to an existing room without being identified.
        console.log("User unindentified");
        req.session.room = req.params.room;
        res.redirect('/');
    } else {
        //Everything's fine, accessing existing room or creating one.
        // console.log("User "+req.session.username + " accessing room "+req.session.room);
        res.render('room.ejs', {username: req.session.username, baseAddress:baseAddress, room:req.session.room});    
    }
})
.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Hého c\'est privé par ici !');
});



// PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET 
// PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET 

// // Chargement de socket.io
var io = require('socket.io').listen(app.listen(8080));
var util = require('util');

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    socket.on('user-connection', function (username, room) {
        console.log(username + ' joins ' + room);
        socket.user = username;
        socket.room = room;
        socket.join(room);
        io.to(room).emit('receive-chat', "admin", username + ' joined');
    });

    socket.on('chat-message', function(username, message, room) {
        io.to(room).emit('receive-chat', username, message);
    })

    socket.on('position', function (longitude, latitude, username, room) {
        //console.log(username+' sends position '+room);
        if (room) {
            //follower
            io.to(room).emit('position', longitude, latitude, username);
        } else {
            //leader
            io.to(socket.room).emit('position', longitude, latitude, username);
        }
    });

    socket.on('disconnect', function() {
      io.to(socket.room).emit('receive-chat', "admin", socket.user + ' has left');
    });




});

//divers
function findClientsSocket(roomId, namespace) {
    var res = []
    , ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}


