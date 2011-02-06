/// @brief This is an object that describes a dialog. It is very meta.
///dialog("message")
///dialog({message: "message", member: 55, member2: /sdfsdf/, ...});
function Dialog(params)
{
	this.message = 0;
	
	this.class = 0;
	
	this.css = 0;

	this.priority = 0;

		this.constructor = function(params)
		{
			if(typeof params == "string")
				this.setDefaults(params)
			else
				this.setParams(params);
		};

		/// @brief set the params in one go. Of course it includes a check.
		this.setParams = function(params)
		{
			if(params.message !== undefined) this.message	= 	params.message;
			if(params.class !== undefined)	this.class		= 	params.class;
			if(params.css !== undefined) 		this.css			= 	params.css;
			if(params.priority !== undefined)this.priority	=	params.priority;
			
			this.timeSet = new Date();
		};
		this.setDefaults = function(params)
		{
			var theParams = {
				message: params,
				css: {
						width: "200px",
						minHeight: "50px",
					  backgroundColor: "#B4D7BF", 
					  border: "solid 1px black", 
					  fontSize: "12pt",
					  whiteSpace: "pre-wrap"
				}
			};
			this.setParams(theParams);
		};

		this.getDOM = function()
		{
			var div = document.createElement("div");
			$(div).css(this.css);
			var close = document.createElement("span");
			$(close).css({cursor: "pointer", marginRight: "0px", display: "block", textAlign: "right"});
			$(close).click(function(){
				//simply hide the div.
				$(div).hide();
				//but then also remove it, lol.
				$(div).remove();
			});
			close.appendChild(document.createTextNode("X"));
			div.appendChild(close);
			div.appendChild(document.createTextNode(this.message));
			
			var header ="nothing yet... I'll add this later...";

			return {dialogDiv: div, header: header, closeBtn: close};
		};

		this.constructor(params);
}

