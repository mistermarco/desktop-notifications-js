function notify(interval) {

  // check to see if notifications are supported
  if (window.Notification) {
  console.log(Notification.permissionLevel());
    $('#status').html('<p>Yay! Notifications are supported in this browser.</p>');

    // check to see what the permissions status is
    // if the app has not asked yet, add a button
	if (Notification.permissionLevel() === 'default') {
	  $('body').append('<button id="show_button" class="btn btn-success" href="#">Enable notifications</button>');
	  $('#show_button').click(function() {
        if ($.browser.safari) {
          window.Notification.requestPermission( function() {
		    notifications_requested();
		  });
	    }
		else {
		  // need to use this for Chrome, the above crashes it
		  // http://code.google.com/p/chromium/issues/detail?id=139594
          window.webkitNotifications.requestPermission( function () {
		    notifications_requested();
		  });
	    }
      });
    }

	if (Notification.permissionLevel() === 'denied') {
      $('#status').append('<p>But, you denied this app access. <strong>Why</strong> would you do that?</p>');
	}

    if (Notification.permissionLevel() === 'granted') {
      show_notification('WebAuth', 'Notifications Started');
	  start_notifications(interval);
    }
  } else {
    $('#status').html('<p>Boo hoo. Notifications are not supported in this browser.</p>');
  }
}

/*
 *  Start the notifications using the specified interval
 */

function start_notifications(interval) {
  // log this information
  console.log('Starting notifications with interval of ' + interval + 'ms.');

  // We keep track of the timeoutID so we can stop the next notification
  // if needed
  timeoutID = window.setTimeout(check_token, interval);

  // Update the button so that it can stop notifications
  $('#button').show();
  $('#button').html('Stop Notifications');
  $('#button').removeClass('btn-success');
  $('#button').addClass('btn-danger');
  $('#button').unbind('click');
  $('#button').click(function() { stop_notifications(); });

  // Update the status message
  interval_in_minutes = interval / 60000;
  if (interval_in_minutes < 1) {
    interval_in_minutes_text = "less than a minute";
  }
  else {
    interval_in_minutes_text = interval_in_minutes + ' minutes';
  }
  $('#status').html('<p>Notifications are running. Next check in ' + interval_in_minutes_text + '.</p>');

  if (interval_in_minutes > 60) { 
    $('#status').append('<p>Enough time to get coffee!</p>');
  }
  if (interval_in_minutes > 60 * 4) { 
    $('#status').append('<p>(In San Francisco)</p>');
  }
}

/* 
 *  Stop the notifications
 */ 

function stop_notifications() {
  // log this information
  console.log('Stopping notifications.'); 
  show_notification('WebAuth', 'Notifications Stopped');

  // clear the timeout, so the next notification does not trigger
  window.clearTimeout(timeoutID);

  // update the button so that it can be used to restart notifications
  $('#button').html('Start Notifications');
  $('#button').removeClass('btn-danger');
  $('#button').addClass('btn-success');
  $('#button').unbind('click');
  $('#button').click(function() { show_notification('WebAuth', 'Notifications Started'); start_notifications(interval); });

  // update the status message
  $('#status').html('<p>Notifications stopped.</p>');
}


/*
 *  Handle the response to requesting the permissions
 */

function notifications_requested() {
  // log the new permissions level
  console.log(Notification.permissionLevel());

  // Hide the button that requests permissions
  $('#show_button').remove();

  // If the user has granted permissions, start the notifications
  if (Notification.permissionLevel() === 'granted') {
     start_notifications(interval);
  }
  else if (Notification.permissionLevel() === 'denied') {
    $('#status').append('<p>But, you denied this app access. <strong>Why</strong> would you do that?</p>');
  }
}

function check_token() {
  $.get('token.cgi', function(data) {
    console.log('Expiration is in ' + data + ' minutes');
	if (data > 30) {
	  newinterval = data - 30;
	  console.log('Expiration in more than 30 minutes. Not showing notification. Checking again in ' + newinterval + ' minutes.');
	  start_notifications(newinterval * 60000);
    }
	else {
      show_notification('WebAuth', 'Your token will expire in ' + data + ' minutes' );
	  start_notifications(60000);
    }
  });
}

function show_notification(title, body) {
  console.log('Notification shown.');
  notification = new Notification(title, { 'body':  body, 'tag': body });
  notification.show();
}
