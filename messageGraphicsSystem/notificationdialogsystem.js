function NotificationDialogSystem(params)
{
	this._notificationConsole = 0;
	this._dialogSystem = 0;

	this.constructor = function(params)
	{
		this._notificationConsole = new NotificationConsole();
		this._dialogSystem = new DialogSystem();
	};

	this.addNotification = function(notification)
	{
		this._notificationConsole.addNotification(notification);
		this._dialogSystem.displayMessage(noteToString(notification.type) 
			+ ":\n" + notification.message);
	}

	this.setConsoleCSS = function(css)
	{
		$(this._notificationConsole.getContainer()).css(css);
	}

	//css is an object containing css properties to be set by jquery.
	this.getConsole = function()
	{
		return this._notificationConsole.getContainer();
	}

	this.constructor(params);
}
