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
  res.render('connect.ejs', {});
})
.post('/followme/create/',urlencodedParser, function (req, res) {
    req.session.username = req.body.username;
    req.session.fomeRoom = req.body.followuser || req.session.username;
    console.log("- User "+req.session.username + " created.");
    //If the room is not specified, we create his own room
    res.redirect('/followme/user/'+req.session.fomeRoom);

})
.get('/followme/user/:user', function (req, res) {
  console.log("- User "+req.session.username + " : accessing room.");
  res.render('room.ejs', {username: req.session.username, baseAddress:baseAddress, room:req.session.fomeRoom});
})
.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Hého c\'est privé par ici !');
});



// PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET 
// PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET PARTIE SOCKET 

// // Chargement de socket.io
var io = require('socket.io').listen(app.listen(8080));
var userNo = 1;
var masterId = '';
var buzzOrder = 0;
var teamList = [];


// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    
    function initOrder() {
        buzzOrder = 0;
        for (var i=0; i<teamList.length; i++){
            teamList[i].buzzOrder = 0;
        }
    }

    // Actions MASTER

    //Quand le serveur reçoit un message du master   
    // socket.on('message', function (message) {
    //     console.log('master : ' + message);
    //     socket.broadcast.emit('displayMessage',message);
    // });

    // Connexion du master
    socket.on('user-connection', function (username, room) {
        console.log(username + ' joins ' + room);
        socket.join(room);
    });

    socket.on('chat-message', function(username, message, room) {
        io.to(room).emit('receive-chat', username, message);
    })

    socket.on('position', function (longitude, latitude, username, room) {
        console.log(username+' sends position '+room);
        if (room) {
            //follower
            io.to(room).emit('position', longitude, latitude, username);
        } else {
            //leader
            io.to(socket.fomeRoome).emit('position', longitude, latitude, username);
        }
    });

    //Début du round
    // socket.on('start', function () {
    //     console.log('-- Round begins ');
    //     initOrder();
    //     io.to(masterId).emit('teamList',teamList);
    //     socket.broadcast.emit('start');
    // });

    // //Fin du round   
    // socket.on('stop', function () {
    //     console.log('-- Fin du round ');
    //     socket.broadcast.emit('stop');
    // });

    // Actions PARTICIPANTS
    // Quand un participant buzz
    // socket.on('buzz', function () {
    //     buzzOrder++;
    //     for (var i=0; i<teamList.length; i++){
    //         if (teamList[i].teamSocketId == socket.id){
    //             teamList[i].buzzOrder = buzzOrder;
    //             break;
    //         }
    //     }
    //     console.log(socket.teamName +' a buzzé ' + buzzOrder);
    //     io.to(masterId).emit('teamList',teamList);
    //     socket.emit('order', teamList);
    // });

        // Quand le serveur reçoit le login utilisateur
    // socket.on('team-connection', function (teamName) {
    //     if (teamName != null && teamName !=''){
    //         //On a le nom de l'équipe
    //         socket.teamName = teamName;
    //         socket.socketId = socket.id;
    //     } else {
    //         socket.teamName = 'team'+userNo;
    //         userNo++;
    //     }
    //     console.log("- Team "+socket.teamName+' connected, socketId :' +socket.id);
    //     teamList.push({teamName : socket.teamName , teamSocketId : socket.id, buzzOrder:0});
    //     io.to(masterId).emit('teamList',teamList);
    // });

     
    // socket.on('disconnect', function() {
    //   if (socket.id != masterId) {
    //     // a team disconnects
    //     console.log("- Team "+socket.teamName + ' is disconnected');
    //     teamList = teamList
    //            .filter(function (el) {
    //                     return el.teamSocketId !== socket.socketId;
    //                    });
    //     io.to(masterId).emit('teamList',teamList);
    //   } else {
    //     // the quizz master left 
    //     console.log("- Quiz Master is disconnected");
    //     socket.broadcast.emit('stop');
    //   }

    // });


});


