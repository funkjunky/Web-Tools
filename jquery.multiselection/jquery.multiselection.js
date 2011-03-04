$(function() {
	$.fn.multiSelection = function(options) {
		var autocomplete = 0;
		var cbContainer = 0;
		var cbButton = 0;
		var cbs = {};
		
		var onMenu = false;

		var defaults =
		{
			data: [],
			name: $(this).attr("name"),
			hasButton: true,
			errorCallback: alert,
			canCancelSubmission: false,
			autoCorrect: false,
			hasFixInError: false
		};
		var options = $.extend(defaults, options);
		var selection = $(this);

			var console = $("<div />");
			console.css({position: "fixed", bottom: "0px", right: "0px"});
			$(document.body).append(console);

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

			autocomplete = new portableAutoComplete({
					  arr: $.makeArray(options["data"]), 
					  css: {
							position: "absolute", 
					  		top: selection.offset().top+selection.height()+6+"px",
							left: selection.offset().left+"px"},
						selectionCallback: selectionCallback
			});
			$(document.body).append(autocomplete.container);

			selection.focus(function(){
				selection.keyup();
				autocomplete.container.show();
			});
			
			autocomplete.container.mousemove(function() { onMenu = true;	});
			autocomplete.container.mouseout(function() {	onMenu = false; });
			selection.blur(function(){
				if(!onMenu) {
					autocomplete.container.hide();
					//TODO: this should go with a hide method that should be a member of autocomplete.
					autocomplete.index = false;
				}
			});

			selection.keydown(keydown);

			selection.keyup(keyup);
		};

		var keydown = function(e) {
			var code = e.keyCode || e.which;
			//these numbers should be enumerated somewhere.
			if(code ==38 || code == 40 || code == 9 || code == 13) {
				if(code == 38)	//up
					autocomplete.indexUp();
				else if(code == 40) //down
					autocomplete.indexDown();
				//TODO: I eventually want tab to guess the autocomplete, and enter to only work if something is selected, but that's later.
				else if(code == 9 || code == 13) { //tab
					if(autocomplete.index !== false)
						selectionCallback(autocomplete.index);
				}
				e.stopPropagation();
				return false;
			}
		};

		var keyup = function() {
			var item = getItemByCaret();
			autocomplete.update(item);
		};
		var getItemByCaret = function() {
			var startComma = getFirstCharBeforeCaret(selection, ",");
			//I don't want to include the caret.
			if(startComma != 0) ++startComma;
			var endComma = getFirstCharAfterCaret(selection, ",");

			//now we can grab the current item the user is typing.
			var currentItem = 
				$.trim(selection.val().substring(startComma, endComma));

			return currentItem;
		};

		var selectionCallback = function(str) {
			//get substr before comma
			var startComma = getFirstCharBeforeCaret(selection, ",");
			var before = selection.val().substring(0, startComma);
			//get substr after comma
			var endComma = getFirstCharAfterCaret(selection, ",");
			var after = selection.val()
								.substring(endComma, selection.val().length);
			//before + " " + str + after
			var seperator = "";
			if(startComma != 0)
				seperator = ", ";
			selection.val(before + seperator + str + after);
			autocomplete.container.hide();
			autocomplete.index = false;
			selection.change();

			selection.focus();
		};

		var selectionOnChange = function() {
			if($(autocomplete.container).is(":hidden") || !onMenu)
			{
				//explode on comma
				var items = $(this).val().split(",");

				//clear checkboxes (their may be a more effecient way)
				for(var i in cbs) { 
					if(cbs[i].attr("checked") == true) {	  
						cbs[i].attr("checked", false);
						cbs[i].change();
					}
				}
				//clean up whitespace and check the boxes and if any failure,
				//then set an onsubmit on the form to warn the user.
				var hasFailed = false;
				//clear the input. Checking the boxes will fill it in again.
				$(this).val("");
				for(var i=0; i != items.length; ++i)
				{
					var item = $.trim(items[i]);
					if(item != "" && typeof cbs[item] == "undefined") {
						hasFailed = true;
						var message = "item #" + i 
							+ " failed with text '"+ item 
							+ "' which is not a valid choice.";
						if(options["hasFixInError"])
							message += "<br />To correct this click "
								+ "<a onclick=''>here</a>.";
						options["errorCallback"].call(window, message);
						if(!options["autoCorrect"]) {
							if(i != 0)
								$(this).val($(this).val() + ", ");
							$(this).val($(this).val() + item);
						}
					}
					else if(item != "")
					{
						if(cbs[item].attr("checked") == false) {
							cbs[item].attr("checked", true);
							cbs[item].change();
						}
					}
				}

				if(hasFailed)
					$("form:has([name="+options["name"]+"])").submit(function() {
						options["errorCallback"].call(window,
							"The submission has been canceled, because the multi selection is invalid (I need to update this to somehow state which one, or provide a link to highlight, which one, or something...)");
					return options["canCancelSubmission"];
				});
			}
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
			autocomplete.disable(this.value);
		};
		var checkboxUnchecked = function() {
			var inputValStr = selection.val();
			//search for the first occurance of value, then slice the string
			var indexOfVal = inputValStr.indexOf(this.value);
			//if(indexOfVal == -1)
			//	return options["errorCallback"].call(window,
			//		"The text input does not contain the options you unchecked. This is just a warning");
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

			autocomplete.enable(this.value);
		};

		_init();
	};
});

function portableAutoComplete(options)
{
	this.options = {};
	//permenant choices
	this.available = {};
	//restricted choices
	this.choices = {};
	//choices that can be chosen accoridng to latest update.
	this.currentChoices = {};
	//internal variables.
	this.container = 0;
	//index contains what the current selection is.
	this.index = false;
	var defaultBGColor = "rgb(255, 255, 255)";
	var self = this;

	var defaults =
	{
		arr: [],
		css: {},
		selectionCallback: alert,
		errorCallback: alert
	};
	this.options = $.extend(defaults, options);

	this._init = function(options) {
		this.container = $("<div />");
		this.container.css(options["css"]);	
		for(var i=0; i != options["arr"].length; ++i)
		{
			var option = $("<div />");
			option.append(options["arr"][i]);
			option.hide();
			if(typeof this.choices[options["arr"][i]] != "undefined")
				this.options["errorCallback"].call(window
					, "You can not have identical choices in autocomplete.");
			this.choices[options["arr"][i]] = option;
			this.available[options["arr"][i]] = true;
			option.css("cursor", "pointer");
			option.css("border", "dotted 1px black");
			//more ewww hover code.
			option.css("backgroundColor", defaultBGColor);
			option.hover(function() {
				if($(this).css("backgroundColor") == defaultBGColor)
					$(this).css("backgroundColor", "#AFEEEE");
				else
					$(this).css("backgroundColor", defaultBGColor);
			});
			//

			option.mousemove(function() { $(this).index = $(this).text(); });
			option.mouseout(function() { 
				if(this.index == $(this).text()) 
					this.index = false;
			});
		
			option.click(function() {
				self.options["selectionCallback"].call(window, $(this).text());
				//TODO: remove me and put me in a hide method.
				autocomplete.index = false;
			});
	
			this.container.append(option);
		}

		this.container.hide();
	};

	//I do the index by searching through the avialable array, till I find
	//where the previous index was and then i use the index before or after
	//that.
	this.indexUp = function() {
		if(objLen(this.currentChoices) <= 0)
			return;
		var prev;
		//set prev to initially be the first element.
		for(var i in this.currentChoices) { prev = i; break; }

		//if no element selected yet.
		if(this.index === false)
			//select the first element.
			this.index = prev;
		else {
			//set the choice BG to it's default colour.
			this.currentChoices[this.index].css("backgroundColor", defaultBGColor);
			var isLast = false;
			var i;
			for(i in this.currentChoices) {
				//if the first element matches, then prepare to set as last ele
				if(this.index == i && i == prev)
					isLast = true;
	
				//if we have found the index, then moving up, will select
				//the 'prev'ious element.
				if(!isLast && i == this.index) {
					this.index = prev;
					//if we found the element, then we are done.
					break;
				} else prev = i;
			}
			if(isLast)
				this.index = i;
		}
		this.currentChoices[this.index].css("backgroundColor", "#AFEEEE");
	};
	this.indexDown = function() {
		if(objLen(this.currentChoices) <= 0)
			return;
		var prev, first;
		//set prev to initially be the first element.
		for(var i in this.currentChoices) { first = prev = i; break; }

		//if no element selected yet.
		if(this.index === false) 
			//select the first element.
			this.index = prev;
		else {
			//set the previous element to it's default BG Colour.
			this.currentChoices[this.index].css("backgroundColor", defaultBGColor);
			var wasFound = false;
			var i;
			for(i in this.currentChoices) {
				if(wasFound) {
					this.index = i;
					//resolve "wasFound"
					wasFound = false;
					break;
				}
				if(i == this.index)
					wasFound = true;
			}
			//if this.index was found last and not yet resolved, then loop it to first.
			if(wasFound)
				this.index = first;
		}
		this.currentChoices[this.index].css("backgroundColor", "#AFEEEE");
	};

	this.disable = function(str) {
		if(typeof this.available[str] == "undefined")
			this.options["errorCallback"].call(window,
				"You cannot disable a choice that does not exist.");
		else {
			this.available[str] = false;
			//if it is unavailable, then it should be hidden, because it can't be chosen.
			if(typeof this.currentChoices[str] != "undefined")
				this.currentChoices[str].hide();
		}
	};

	this.enable = function(str) {
		if(typeof this.available[str] == "undefined")
			this.options["errorCallback"].call(window,
				"You cannot enable a choice that does not exist. If you want to add a choice, then use the add function.");
		else //just because it is available, doesn't mean it is shown.
			this.available[str] = true;
	};

	this.add = function(str) {
		//TODO: write code for adding choices.
		this.options["errorCallback"].call(window, "portableAutoComplete.add isn't implemented yet.");
	};

	this.remove = function(str) {
		//TODO: write code for removing choices.
		this.options["errorCallback"].call(window, "portableAutoComplete.remove isn't implemented yet.");
	};

	this.getChoices = function() {
		var choices = {};
		//only add to the returning array, if it is "available"
		for(var i in this.available)
			if(this.available[i])
				choices[i] = this.choices[i];

		return choices;
	};

	this.update = function(str) {
		//test isLOose = true on very old devices like Steve's computer.
		//if it is still very responsive, then set this to true.
		//really their should be an option.
		var arrMatched = [];
		var choices = this.getChoices();
		if($.trim(str) != "")
			arrMatched = matchedElements(getKeys(choices), str, false);

		//hide all choices. Clean slate.
		for(i in choices) {
			choices[i].hide();
		}
		this.currentChoices = {};

		//show only the matched elements.
		for(var i = 0; i != arrMatched.length; ++i) {
			choices[arrMatched[i]].show();
			this.currentChoices[arrMatched[i]] = choices[arrMatched[i]];
		}
		if(typeof this.currentChoices[this.index] == "undefined")
			this.index = false;
	};

	this._init(this.options);
};

function count(obj)
{var i=0; for(j in obj) ++i; return i;}

function matchedElements(arr, val, isLoose)
{
	isLoose = (typeof isLoose == "undefined" || !isLoose)?false:true;
	if($.isArray(arr))
	{
		if(isLoose)
			return _me_forArrL(arr, val);
		else
			return _me_forArr(arr, val);
	}
	else
	{
		if(isLoose)
			return _me_forObjL(arr, val);
		else
			return _me_forObj(arr, val);
	}
}

function _me_forArr(arr, val, isLoose)
{
	var newarr = [];

	for(var i in arr)
		if(arr[i].indexOf(val) != -1 && arr[i] != val)
			newarr.push(arr[i]);

	return newarr;
}

function _me_forObj(arr, val)
{
	var newarr = {};

	for(var i in arr)
		if(arr[i].indexOf(val) != -1 && arr[i] != val)
			newarr[i] = arr[i];
	
	return newarr;
}

function _me_forArrL(arr, val, isLoose)
{
	var newarr = [];

	var rgx = getLooseKeyboardRegex(val);

	for(var i in arr)
		if(rgx.test(arr[i]) && arr[i] != val)
			newarr.push(arr[i]);

	return newarr;
}

function _me_forObjL(arr, val)
{
	var newarr = {};

	var rgx = getLooseKeyboardRegex(val);

	for(var i in arr)
		if(rgx.test(arr[i]) && arr[i] != val)
			newarr[i] = arr[i];
	
	return newarr;
}

function DoublyLinkedList(arr)
{
	function Node(val)
	{
		this.prev = undefined;
		this.val = val;
		this.next = undefined;
	}
	
	this.get = function(i) {
		return this.list[i];
	}
	//only for strings.
	this.getConcated = function(i) {
		var node = this.list[i];
		var ret = "";
		if(typeof node.prev != "undefined")
			ret += node.prev.val;
		ret += node.val;
		if(typeof node.next != "undefined")
			ret += node.next.val;

		return ret;
	}

	this.list = {};
	if(arr.length <= 0)
		return;
		
	this.list[arr[0]] = new Node(arr[0]);
	for(var i=1; i != arr.length; ++i) {
		//create the node
		this.list[arr[i]] = new Node(arr[i]);
		//link this node to the previous node.
		this.list[arr[i]].prev = this.list[arr[i-1]];
		//link the previous node to this node.
		this.list[arr[i-1]].next = this.list[arr[i]];
	}
}

function getLooseKeyboardRegex(str)
{
	str = str.toLocaleLowerCase(str);

	var toprow = new DoublyLinkedList(
		['q','w','e','r','t','y','u','i','o','p','[',']']);
	var middlerow = new DoublyLinkedList(
		['a','s','d','f','g','h','j','k','l',';','\'']);
	var bottomrow = new DoublyLinkedList(
		['z','x','c','v','b','n','m',',','.','/']);

	var rgx = ".?";
	for(var i = 0; i != str.length; ++i)
	{
		var chars;
		if(typeof toprow.get(str.charAt(i)) != "undefined")
			chars = "[" + toprow.getConcated(str.charAt(i)) + "]";
		else if (typeof middlerow.get(str.charAt(i)) != "undefined")
			chars = "[" + middlerow.getConcated(str.charAt(i)) + "]";
		else if (typeof bottomrow.get(str.charAt(i)) != "undefined")
			chars = "[" + bottomrow.getConcated(str.charAt(i)) + "]";
		else
			chars = str.charAt(i);

		rgx += chars + ".?";
	}

	return new RegExp(rgx, "ig");
}

function getKeys(obj)
{
	var keys = [];
	for(i in obj)
		keys.push(i);

	return keys;
}

//This actually grabs the first character exclusive of the caret.
//This may seems inconsistant, but it works more naturally.
//Later I may add an offset parameter.
function getFirstCharBeforeCaret(jobj, char)
{
	var val = jobj.val();
	var caretPos = jobj.caret();

	//get the comma before where the cursor is.
	var startComma = val.lastIndexOf(",", caretPos-1);
	//--startComma to disclude the comma itsself
	if(startComma == -1) startComma = 0;

	return startComma;
}

function getFirstCharAfterCaret(jobj, char)
{
	var val = jobj.val();
	var caretPos = jobj.caret();

 	//get the comma after where the cursor is.
 	var endComma = val.indexOf(",", caretPos);
 	//++endcomma to disclude the comma itsself
 	if(endComma == -1) endComma = val.length;

	return endComma;
}

function objLen(obj) { var c = 0; for(var i in obj) ++c; return c;}
