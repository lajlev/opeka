/**
 * @file
 * Opeka nowjs integration code for the frontend.
 */

(function ($) {

/**
 * Recieve the room list from the server.
 */
now.receivePrivateRooms = function (rooms, roomOrder) {
  var roomList = $("#opeka-trial-room-list");
  opeka.privateRooms = rooms;

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
  $.get(Drupal.settings.opeka.path + '/templates/backend.tmpl.html', function(templates) {
    // Inject all the loaded templates at the end of the document.
    $('body').append(templates);

    // Replace the placeholder with the backend interface.
    $("#opeka-placeholder").replaceWith($("#opeka_backend_tmpl").tmpl({
      user: Drupal.settings.opeka.user
    }));

    // Set up the admin interface.
    var backendWrapper = $("#opeka-backend");
        connectForm = backendWrapper.find('.connect-interface');
        roomForm = backendWrapper.find('.online-interface');

    // Configure the connect button click event to make os ready to chat.
    connectForm.find('.connect').click(function (event) {
      var user = Drupal.settings.opeka.user;

      // Disable the button to prevent multiple presses.
      $(this).attr("disabled", true);

      // Pass along the nickname the user entered.
      user.nickname = connectForm.find('#nickname').val().trim() || 'Anonym';

      // When the connect button is pressed, mark the client as ready.
      // When we're done setting up, let the server know.
      now.clientReady(user, function () {
        // Hide the connect interface.
        connectForm.fadeOut();

        // Show the chat interface.
        roomForm.fadeIn();
		roomForm.find('.delete-room').click(function (event) {
	      event.preventDefault();
		  var roomId = roomForm.find('#del-room').val().trim();
		  var finalMessage = roomForm.find('#del-room-final-message').val().trim();
		  if (roomId && finalMessage){
			now.deleteRoom(roomId, finalMessage);
			$('#del-room').val('');
			$('#del-room-final-message').val('');
 		  }
	    });

		roomForm.find('.delete-private-room').click(function (event) {
	      event.preventDefault();
		  var roomId = roomForm.find('#del-private-room').val().trim();
		  if (roomId){
			now.deletePrivateRoom(roomId);
			$('#del-private-room').val('');
 		  }
	    });
	  
  	  	// Define function that has to be executed when the whisper button
	  	// is pressed
	  	$("#opeka-send-whisper-message").live('click', function (event) {
		  var userid = $('#opeka-whisper-message-user').val().trim();
	      var message = $('#opeka-whisper-message').val().trim();

   	      if (userid && message) {
	        now.whisper(userid, message);
		    $('#opeka-whisper-message-user').val('');
		    $('#opeka-whisper-message').val('');
	      }

  	      event.preventDefault();
	    });
      
  	  	// Define function that has to be executed when the delete message button
	  	// is pressed
	  	$("#opeka-delete").live('click', function (event) {
	      var messageid = $('#opeka-delete-message').val().trim();

	      if (messageid) {
	        now.deleteMsg(messageid);
		    $('#opeka-delete-message').val('');
	      }

	      event.preventDefault();
	    });

  	  	// Define function that has to be executed when the delete all messages button
	    // is pressed
	  	$("#opeka-deleteall").live('click', function (event) {
	      var clientid = $('#opeka-deleteall-messages').val().trim();

	      if (clientid) {
	        now.deleteAllMsg(clientid);
		    $('#opeka-deleteall-messages').val('');
	      }

	      event.preventDefault();
	    });
	

        // Trigger the hashChange event, so if the user came to the page
        // with a room in the URL, it opens now.
        $(window).trigger('hashchange');
      });

      event.preventDefault();
    });

    // Configure the create room interface.
    roomForm.find('.create-room').click(function (event) {
      // When the room is created, show the chat interface.
      now.createRoom(roomForm.find('#room-name').val(), roomForm.find('#room-size').val(), function (err, room) {
        if (room) {
          now.changeRoom(room.id);
          $.bbq.pushState({room: room.id});
        }
      });
	  $('#room-name').val('');
      event.preventDefault();
    });

    // Configure the create private room interface.
    roomForm.find('.create-private-room').click(function (event) {
      // When the room is created, show the chat interface.
      now.createPrivateRoom(roomForm.find('#private-room-name').val(), roomForm.find('#private-room-size').val(), function (err, room) {
        if (room) {
          now.changeRoom(room.id);
          $.bbq.pushState({room: room.id});
        }
      });
	  $('#private-room-name').val('');
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

})(jQuery);

