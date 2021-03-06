//note for our health thing. use am_or_pm to set the default to am for "from" and pm for "to" when entering a time availability.
//TODO: turn the grabbing of html into a function literal and use jquery's clone method to create new instances.
$(function() {
	$.fn.timepicker = function(options) {
		var onMenu = false;

		var defaults = 
		{
			precision: 48, //24 * 2 (2 halfs to an hour, 1:30, 2:00, 2:30, etc.)
			am_or_pm: "am",
			userErrorCallback: alert
		};
		var options = $.extend(defaults, options);

		return this.each(function() {
			var self = $(this);

			function init()
			{
				createDOM();
			}

			var toHandle = -1;
	 		function createDOM() {
				var listbox = getCustomListbox(self);
				listbox.mousemove(function() {	onMenu = true;		});
				listbox.mouseout(function() { 	onMenu = false;	});
				listbox.hide();
				$(document.body).append(listbox);
				self.click(function() { 
					listbox.show();
				});
				self.keypress(function() {
					listbox.hide();
				});
				self.blur(function() {
					//test to see if the format is correct.
					if("" == $(this).val() 
						|| /^([1-9]|1[0-2])(:([0-5][0-9]?)?)?(am|pm)?$/
								.test($(this).val()))
					{
						//if the format is correct, but doesn't exactly match the 
						//template, then...
						if(!/^([1-9]|1[0-2]):[0-5][0-9](am|pm)$/
								.test($(this).val()))
						{
							//apply auto correction.
							//TODO: consider making this more effecient.
							//			currently it does 4 regexs everytime.
							var s = $(this).val();
							//cut out the am or pm if it exists, because it 
							//complicates the regex.
							//TODO: don't do this and use regex properly instead.
							if(s.substr(-1,1) == "m")
								s = s.substr(0,s.length-2);
	
							s = s.replace(/^([1-9]|1[0-2])$/
															, "$1:00"+options["am_or_pm"]);
							s = s.replace(/^((?:[1-9]|1[0-2]):)$/
															, "$100"+options["am_or_pm"]);
							s = s.replace(/^((?:[1-9]|1[0-2]):[0-5])$/
															, "$10"+options["am_or_pm"]);
	
							$(this).val(s);
						}
					}
					else if(!onMenu)
						options["userErrorCallback"].call(window, "Invalid time entered.");

					if(!onMenu)
						$(listbox).hide();
				});
			}; //createDOM

			function getCustomListbox () {
				var times = getTimeArray(options["precision"]);
				var containingDiv = $("<div />");
	
				//set the height to be small, position to be absolute.
				//also set the top and left to be where the input is.
				containingDiv.css({position: "absolute", 
					top: self.offset().top + 20 + "px", 
					left: self.offset().left + "px",
					height: "100px",
					width: "80px",
					cursor: "pointer",
					overflow: "scroll"});
	
				//add each single time peice.
				for(var i in times)
				{
					var timeDiv = $("<div />");
					timeDiv.append(times[i]);
	
					//hover highlight... eww code
					var defaultBGColor = "rgb(255, 255, 255)";
					timeDiv.css("backgroundColor", defaultBGColor);
					timeDiv.hover(function() {
						if($(this).css("backgroundColor") == defaultBGColor)
							$(this).css("backgroundColor", "#AFEEEE");
						else
							$(this).css("backgroundColor", defaultBGColor);
					});
					//
	
					timeDiv.click(function() {
						clearTimeout(toHandle);
						$(self).val($(this).text());
						containingDiv.hide();
					});
	
					containingDiv.append(timeDiv);
				}
	
				return containingDiv;
			};	//getCustomListbox

			init();
		});
	}; //end timepicker
});
