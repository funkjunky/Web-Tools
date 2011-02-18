$(function() {
	$.fn.multiSelection = function(options) {
		var cbContainer = 0;
		var cbButton = 0;
		var cbs = {};

		var defaults =
		{
			data: [],
			name: $(this).attr("name"),
			hasButton: true,
			errorCallback: alert,
			canCancelSubmission: false
			//hasFixInError
		};
		var options = $.extend(defaults, options);
		var selection = $(this);

		var _init = function() {
			if(count(options["data"]) <= 0)
				options["errorCallback"].call(window,
				 "The data provided to multiSelection contains no elements.");
			//create the div that contains the checkboxes.
			cbContainer = $("<div />");

			//for each datum, create a label and checkbox and append it
			//If data is an array, then use the value for the value as well.
			if($.isArray(options["data"]))
				for(var i=0; i!=options["data"].length; ++i)
					cbContainer.append(
						_getCheckbox(options["data"][i], options["data"][i]));
			//If the data is associative, then use the key as the value.
			else
				for(var i in options["data"])
					cbContainer
						.append(_getCheckbox(i, options["data"][i]));

			cbContainer.hide();

			if(options["hasButton"])
			{
				cbButton = _createButton();
				cbButton.click(function() {
					cbContainer.toggle();
				});
				cbButton.after(cbContainer);
			} else
				selection.after(cbContainer);

			selection.change(selectionOnChange);
		};

		var selectionOnChange = function() {
			//clear checkboxes (their may be a more effecient way)
			for(var i in cbs) 
				cbs[i].attr("checked", false);
			//explode on comma
			var items = $(this).val().split(",");
			//clean up whitespace and check the boxes and if any failure,
			//then set an onsubmit on the form to warn the user.
			var hasFailed = false;
			var cleanedInput = "";
			for(var i=0; i != items.length; ++i)
			{
				var item = $.trim(items[i]);
				if(typeof cbs[item] == "undefined") {
					hasFailed = true;
					options["errorCallback"].call(window, "item #" + i 
						+ " failed with text '"+ item 
						+ "' which is not a valid choice.");
				}
				else
				{
					cbs[item].attr("checked", true);
					cleanedInput += item + ", ";
				}
			}
			cleanedInput = cleanedInput.substr(0,cleanedInput.length-2);

			if(hasFailed)
				$("form:has([name="+options["name"]+"])").submit(function() {
					options["errorCallback"].call(window,
						"The submission has been canceled, because the multi selection is invalid (I need to update this to somehow state which one, or provide a link to highlight, which one, or something...)");
					return options["canCancelSubmission"];
				});
			else
				$(this).val(cleanedInput);
		};

		var _getCheckbox = function(value, text) {
			var id = value + text;
			var checkbox = cbs[value] = $("<input />");
			checkbox.attr("type", "checkbox");
			checkbox.attr("id", id);
			checkbox.attr("name", options["name"]);
			checkbox.val(value);
			checkbox.change(function() {
				if($(this).attr("checked"))
					checkboxChecked.call(this);
				else
					checkboxUnchecked.call(this);
			});
			var label = $("<label for='"+id+"'>"+text+"</label>");
			var container = $("<div />");

			return container.append(checkbox).append(label);
		};

		var _createButton = function() {
			var button = $("<input />");
			button.attr("type", "button");
			button.attr("value", "=");
			selection.after(button);
			return button;
		};

		var checkboxChecked = function() {
			var newInputStr = selection.val();
			if($.trim(selection.val()).length > 0)
				newInputStr += ", ";
			newInputStr += this.value;
	
			selection.val(newInputStr);
		};
		var checkboxUnchecked = function() {
			var inputValStr = selection.val();
			//search for the first occurance of value, then slice the string
			var indexOfVal = inputValStr.indexOf(this.value);
			if(indexOfVal == -1)
				return options["errorCallback"].call(window,
					"The text input does not contain the options you unchecked. This is just a warning");
			//their are two cases. One is that it's the first string.
			if(indexOfVal == 0)
				//+2 is the comma and space.
				inputValStr = inputValStr.substring(0, indexOfVal)
					+ inputValStr.substring(indexOfVal + this.value.length + 2);
			//the second is any other space, including last.
			else
				//the -2 is the comma and space before the value.
				inputValStr = inputValStr.substring(0, indexOfVal-2)
					+ inputValStr.substring(indexOfVal + this.value.length)

			selection.val(inputValStr);
		};

		_init();
	};
});

function count(obj)
{var i=0; for(j in obj) ++i; return i;}
