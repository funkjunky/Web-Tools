function Notification(type, message)
{
	this.message = message;
	this.type = type;
}

//notification types:
//powers of 2, just in case we want to check against multiple types at the same time.
var NOTE_SYS_ERROR = 1;
var NOTE_SYS_WARNING = 2;
var NOTE_SYS_NOTIFY = 4;
var NOTE_USR_ERROR = 8;
var NOTE_USR_WARNING = 16;
var NOTE_USR_NOTIFY = 32;
function noteToString(noteType)
{
	switch(noteType) {
		case NOTE_SYS_ERROR:		return "System Error";
		case NOTE_SYS_WARNING:	return "System Warning";
		case NOTE_SYS_NOTIFY:	return "System Notification";
		case NOTE_USR_ERROR:		return "User Error";
		case NOTE_USR_WARNING:	return "User Warning";
		case NOTE_USR_NOTIFY:	return "User Notification";
	}
	throw "Type Provided was not defined.";
}

//a graphical console to view errors and highlight them.
//stores notifications, as well as storing them.
function NotificationConsole(params)
{
	this.notifications = 0;
	this._notificationDOMS = 0;
  this.notificationCSS = 0;
  this.containerCSS = 0;

	this._containingDiv = 0;

	this.constructor = function(params)
	{
		this.setDefaults();

    this.setParams(params);
	};

	this.setDefaults = function()
	{
		this._containingDiv = $("<div />").get()[0];
    this._containingDiv.hide(); //TODO: This is a hack. I'm not sure why it 
                                //shows up automatically...

		this.notifications = [];
		this._notificationDOMS = [];

    this.containerCSS = {};
    this.notificationCSS = {};
	};

  this.setParams = function(params)
  {
    for(i in params)
      this[i] = params[i];

    $(this._containingDiv).css(this.containerCSS);
  };

	this.getContainer = function()
	{
		return this._containingDiv;
	}

	//returns a key to the notification, in case someone wishes to remove it.
	this.addNotification = function(notification)
	{
		this.notifications.push(notification);
		this._addNotificationGraphics(notification);

		return this.notifications.length - 1;
	};

	this._addNotificationGraphics = function(notification)
	{
			var p = $("<p />").get()[0];
			$(p).css({marginTop: "0px", marginBottom: "0px"});
      $(p).css(this.notificationCSS);
			$(p).append(notification.message);
			p.title = noteToString(notification.type) + ":\n" + notification.message;
			var defaultBGColor = "rgb(255, 255, 255)";
			$(p).css("backgroundColor", defaultBGColor);
			$(p).hover(function(){ 
				if($(this).css("backgroundColor") == defaultBGColor)
					$(this).css("backgroundColor", "#AFEEEE");
				else
					$(this).css("backgroundColor", "white");
			});
			this._notificationDOMS.push(p);
			$(this._containingDiv).append(p);
	};

	this.removeNotification = function(key)
	{
		//remnove the notification from the array.
		this.notifications.splice(key, 1);
		//remove the notification div from the DOM, and from the array.
		$(this._notificationDOMS[key]).remove();
		this._notificationDOMS.splice(key, 1);
	};



	this.constructor(params);
}

