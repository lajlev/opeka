/**
 * @file
 * Opeka nowjs integration code shared between backend and frontend.
 */

var opeka = {};

(function ($) {

  /* Method used in order to print the final message when the chat room has been closed */
  now.displayError = function(error){
	$('#errors').html(error);
	$('#errors').dialog();
  };


  /* Method used in order to print the final message when the chat room has been closed */
  now.finalMessage = function(adminNick, finalMessage){
	$('#final-message').html("["+adminNick+"]: "+finalMessage);
	$('#final-message').dialog();
  };

  /* Method used in order to effect a local removal of all the messages of a single user*/
  now.localDeleteAllMsg = function(clientId){
	$('#chat-message-list').find("."+clientId).html('');
  };
  
  /* Method used in order to effect a local removal of a single message*/
  now.localDeleteMsg = function(msgId){
	$('#chat-message-list').find("#"+msgId).html('');
  };

  /* This method is used in order to update the active room of the users 
   * in case a counselor have deleted it
   */
  now.updateActiveRoom = function(){
	if (!opeka.rooms[opeka.activeRoomId]){
        now.changeRoom(null);
        opeka.activeRoomId = null;
        opeka.closeChat();
	}
  };

  /**
   * For when the server updates the online counts.
   */
  now.updateOnlineCount = function (guests, councellors) {
    $('#opeka-online-status')
      .find('.guests').text(guests).end()
      .find('.councellors').text(councellors).end();
  };

  /**
   * Receive message from the server.
   */
  now.receiveMessage = function (message) {
    $('#opeka_chat_message_tmpl')
      .tmpl({message: message})
      .prependTo('#chat-message-list');
  };

  /**
   * Open the chat interface, if not open already.
   */
  opeka.openChat = function (roomId) {
    // If the chat is open already or room was not found, do nothing.
    if (opeka.chatIsOpen || !opeka.rooms || !opeka.rooms[roomId]) { return; }

    var room = opeka.rooms[roomId];

    $('#chat-message-list')
      // Remove the existing chat messages.
      .children().remove().end();

    $('#opeka-chat').fadeIn();

    opeka.chatIsOpen = true;
	$('#opeka-chat').find('#th-room').html('Opeka Chat - Room: '+room.name)
  };

  /**
   * Open the chat interface, if not open already.
   */
  opeka.closeChat = function (room) {
    $('#opeka-chat').fadeOut();
    opeka.chatIsOpen = false;
  };

  // When the history state changes, check if we need to open/close a
  // room or similar changes.
  $(window).bind('hashchange', function(event) {
    var roomId = $.bbq.getState('room');

    // We have change to a chat room.
    if (roomId) {
	  now.changeRoom(roomId, function(full){
		if (!full){
          opeka.closeChat();
          opeka.activeRoomId = roomId;
          opeka.openChat(roomId);
	    }else{
		  now.displayError('This room is full');
        }
	  });
    }
    else {
      if (opeka.activeRoomId) {
        now.changeRoom(null);
        opeka.activeRoomId = null;
        opeka.closeChat();
      }
    }
  });

  // Handle the send chat message for both admins and guests.
  $("#opeka-send-message").live('click', function (event) {
    var message = $('#opeka-chat-message').val().trim();

    if (opeka.activeRoomId && message) {
      now.sendMessageToRoom(opeka.activeRoomId, message);
	  $('#opeka-chat-message').val('');
    }

    event.preventDefault();
  });

})(jQuery);

