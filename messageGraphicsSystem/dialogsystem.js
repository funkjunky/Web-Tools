///
///settings is an associative array of settings for the system.
function DialogSystem(settings)
{
	this.timeDisplayed = 0;
	this.cloggedTimeDisplayed = 0;
	this.fadeTime = 0;
	this.displaySync = 0;

	this._css = 0;
	this._dialogs = 0;
	this._displaying = 0;
	this._containingDiv = 0;

	this.constructor = function(settings)
	{
		this._dialogs = [];

		this.setDefaults();

		if(count(settings))
			this.setParams(params);

		this.setupContainingDiv();
	};
	this.setDefaults = function()
	{
		var css = {
			position: "fixed",
			top: "0px",
			right: "0px",
		};

		this._css = css;
		this.fadeTime = 500;
		this.timeDisplayed = 3000;
		this.cloggedTimeDisplayed = 500;
		this.displaySync = false;
	};

	this.setupContainingDiv = function()
	{
		this._containingDiv = document.createElement("div");
		$(this._containingDiv).css(this._css);
		document.body.appendChild(this._containingDiv);
	};

	this.displayMessage = function(dialog)
	{
		if(typeof dialog == "string")
			this._dialogs.push(new Dialog(dialog));
		else {
			if(dialog.priority != 0) {
				//find where the entry belongs.
				for(var i=0; i != this._dialogs.length; ++i)
					if(this._dialogs[i].priority < dialog.priority)
						break;

				//insert into the array at the appropriate priority location..
				this._dialogs.splice(i, 0, dialog);
			}
		}

		if(this.displaySync || !this._displaying)
			this._displayMessage();
	};
	
	this._displayMessage = function()
	{
		this._displaying = true;
		this._animateDialog(this._dialogs.shift());
	};

	this._animateDialog = function(dialog)
	{
		var myself = this;
		var hideTimeout = 0;
		var domObject = dialog.getDOM();
		var div = domObject["dialogDiv"];
		var header = domObject["header"];	//TODO: currently incomplete.
		var close = domObject["closeBtn"];

		$(close).unbind("click");
		$(close).click(function(){
			myself.hideNot(div);
			if(hideTimeout)
				clearTimeout(hideTimeout);
		});
		$(div).hide()
		$(this._containingDiv).append(div);
		
		var myself = this;
		$(div).show(myself.fadeTime, function(){
			hideTimeout = setTimeout(function(){
				myself.hideNot(div);
			}, myself.timeDisplayed);
		});
	};
	this.hideNot = function(div)
	{
		var myself = this;
		$(div).hide(myself.fadeTime, function() {
			myself._displaying = false;
			//if we are doing async displaying, and we still have dialogs
			//then process the next dialog.
			if(!myself.displaySync && myself._dialogs.length > 0)
					myself._displayMessage();
		});
	};

	this.constructor(settings);
}
