/**
 * @file
 * Opeka nowjs integration code for the frontend.
 */
/*global iplocate, now, opeka */

(function ($) {
  "use strict";

/* Method used in order to print the final message when the chat room has been closed */
now.client_finalMessage = function(adminNick, finalMessage){
  $('#final-message').html("["+adminNick+"]: "+finalMessage);
  $('#final-message').dialog();
};

now.localMute = function(){
  if (!opeka.mute){
      $("#opeka-send-message").attr('disabled', 'disabled');
    opeka.mute = true;
  }
};

now.localUnmute = function(){
  if (opeka.mute){
    $("#opeka-send-message").removeAttr('disabled');
    opeka.mute = false;
  }
};

/* Display a warning message*/
now.displayWarning = function(warning){
  $('#warnings').html(warning);
  $('#warnings').dialog();
};


/**
 * Recieve the room list from the server.
 */
now.receiveRooms = function (rooms, roomOrder) {
  var roomList = $("#opeka-room-list");
  opeka.rooms = rooms;

  roomList.find('.room').remove();
  if (roomOrder.length > 0) {
    roomList.find('.placeholder').hide();
    $.each(roomOrder, function () {
      var roomId = this.toString();
      // Generate a list item with a link for each room.
      roomList.append($("#opeka_room_list_item_tmpl").tmpl({
        roomUrl: $.param({room: roomId}),
        roomName: rooms[roomId].name
      }));
    });
  }
  else {
    roomList.find('.placeholder').show();
  }
};

/**
 * Prepare the client, load templates, etc.
 */
opeka.prepare = function () {
  // Load the template file for rendering data from the server.
  $.get(Drupal.settings.opeka.path + '/templates/frontend.tmpl.html', function(templates) {
    // Inject all the loaded templates at the end of the document.
    $('body').append(templates);

    // Replace the placeholder with the frontend status interface.
    $("#opeka-placeholder").replaceWith($("#opeka_frontend_tmpl").tmpl());

    // Set up the admin interface.
    var frontendWrapper = $("#opeka-frontend"),
        connectForm = frontendWrapper.find('.connect-interface'),
        roomForm = frontendWrapper.find('.online-interface'),
        infoDiv = frontendWrapper.find('.contents-not-chatting');

  infoDiv.load("/Cyberhus.dk.html .hours", function(response, status, xhr) {
    if (status === "error") {
      var msg = "Sorry but there was an error retrieving opening hours: ";
      infoDiv.html(msg + xhr.status + " " + xhr.statusText);
    }
  });


    // Configure the connect button click event to make os ready to chat.
    connectForm.find('.connect').click(function (event) {

      // Disable the button to prevent multiple presses.
      $(this).attr("disabled", true);

    iplocate({
        ip: '',
        ipinfodbKey: '656fa6b8c899bdf780648c6a13696d07dbbbab8c37681428a5b6e489985493e9',
      }, function(address, latitude, longitude, errorCode, errorMessage) {
        if (errorCode === undefined && errorMessage === undefined ) {
          var clientData = {};

            // Pass along the location information of the client.
          clientData.address = address;
          clientData.latitude = latitude;
          clientData.longitude = longitude;

            // Pass along the nickname the user entered.
          clientData.nickname = connectForm.find('#nickname').val().trim() || 'Anonym';
          clientData.age = connectForm.find('#age').val().trim() || '0';
          clientData.gender = connectForm.find('#gender').val() || 'N';

          // When the connect button is pressed, mark the client as ready.
          // When we're done setting up, let the server know.
          now.clientReady(clientData, function () {
            // Hide the connect interface.
            connectForm.fadeOut();
            infoDiv.fadeOut();

            // Show the chat interface.
            roomForm.fadeIn();

            // Trigger the hashChange event, so if the user came to the page
            // with a room in the URL, it opens now.
            $(window).trigger('hashchange');
          });
        }
    });

      event.preventDefault();
    });
  });
};

/**
 * When the connection to Now.js is set up, prepare ourselves.
 */
now.ready(function() {
  opeka.prepare();
});

}(jQuery));

