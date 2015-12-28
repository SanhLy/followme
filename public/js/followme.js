// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var socket = io.connect(window.baseUrl);
socket.emit('user-connection', window.myUsername, window.room);

function template(string, object) {
  for (var key in object) {
    string = string.replace('{{'+key+'}}', object[key]);
  }

  return string;
}

var marker = {};

function initMap() {
  // var map = new google.maps.Map(document.getElementById('map'), {
  //   center: {lat: -34.397, lng: 150.644},
  //   zoom: 6
  // });
  // var infoWindow = new google.maps.InfoWindow({map: map});

  function handlePositionChange(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      $('#idlat').html(pos.lat);
      $('#idlong').html(pos.lng);
      console.log('new position is : ' + pos.lat + ',' + pos.lng);
      socket.emit('position', pos.lng, pos.lat, window.myUsername, window.room);
      var center = new google.maps.LatLng(pos.lat, pos.lng);
    // using global variable:
    map.panTo(center);
  }

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handlePositionChange,handleLocationError);
      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      // map.setCenter(pos);

    /*if (navigator.geolocation.watchPosition) {
      navigator.geolocation.watchPosition(handlePositionChange,handleLocationError);
    }
    else {*/
      setInterval(function() {
        navigator.geolocation.getCurrentPosition(handlePositionChange,handleLocationError)
      }, 1000);
    //}
  } else {
    // Browser doesn't support Geolocation
     handleLocationError(false);
  }

  function addUser(username, lng, lat) {
    var userDiv = $(template('<div id="{{username}}">'+
        '<p>Name : <span class="name"></span></p>'+
        '<p>Lat : <span class="lat"></span></p>'+
        '<p>Long : <span class="long"></span></p>'+
      '</div>', 
      {
        username: username,
      }
    ));
    userDiv.append();
    $('#user').append(userDiv);

    marker[username] = 
    marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map,
            label: username,
            title: username
        });
  }

  function insertMessage(username, message) {
    return $(template('<div class="chat-message">'+
        '<div class="chat-username">{{username}}</div>'+
        '<div class="chat-text">{{message}}</div>'+
        '</div>', 
        {
          username: username,
          message: message
        }
      ));
  }

  socket.on('position',function(lng, lat, username) {
    var userDiv = $('#'+username);

    if (!userDiv[0]) {
      addUser(username, lng, lat);
    }

    $('.name',userDiv).text(username);
    $('.lat',userDiv).text(lat);
    $('.long',userDiv).text(lng);
  });

  socket.on('receive-chat', function(username, message) {
    $('#chat-messages').append(insertMessage(username, message));
  })

  $('#send-chat').click(function() {
      socket.emit('chat-message', window.myUsername, $('#chat-input').val(), window.room);
      $('#chat-input').val('');
  });

  $('#stupid-form').on('submit', function(e) {
    e.preventDefault();
  })

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  // infoWindow.setPosition(pos);
  // infoWindow.setContent(browserHasGeolocation ?
  //                       'Error: The Geolocation service failed.' :
  //                       'Error: Your browser doesn\'t support geolocation.');
  alert(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}




