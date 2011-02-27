$(function() {
	getLooseKeyboardRegex("Jason");

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
			canCancelSubmission: false
			//hasFixInError
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
				autocomplete.container.show();
			});
			
			autocomplete.container.mousemove(function() {	console.text("true");onMenu = true;	});
			autocomplete.container.mouseout(function() {		console.text("false");onMenu = false; });
			selection.blur(function(){
				if(!onMenu)
					autocomplete.container.hide();
			});

			selection.keyup(keyup);
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
			selection.val(before + ", " + str + after);
			autocomplete.container.hide();
		};

		var selectionOnChange = function() {
			if(!onMenu)
			{
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
					if(item != "" && typeof cbs[item] == "undefined") {
						hasFailed = true;
						options["errorCallback"].call(window, "item #" + i 
							+ " failed with text '"+ item 
							+ "' which is not a valid choice.");
					}
					else if(item != "")
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

function portableAutoComplete(options)
{
	this.options = {};
	this.choices = {};
	this.container = 0;
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
			//more ewww hover code.
			var defaultBGColor = "rgb(255, 255, 255)";
			option.css("backgroundColor", defaultBGColor);
			option.hover(function() {
				if($(this).css("backgroundColor") == defaultBGColor)
					$(this).css("backgroundColor", "#AFEEEE");
				else
					$(this).css("backgroundColor", defaultBGColor);
			});
			//
		
			option.click(function() {
				self.options["selectionCallback"].call(window, $(this).text());
			});
	
			this.container.append(option);
		}
		this.container.hide();
	};

	this.update = function(str) {
		//test isLOose = true on very old devices like Steve's computer.
		//if it is still very responsive, then set this to true.
		//really their should be an option.
		var arrMatched = [];
		if($.trim(str) != "")
			arrMatched = matchedElements(getKeys(this.choices), str, false);

		//hide all choices. Clean slate.
		for(i in this.choices)
			this.choices[i].hide();

		//show only the matched elements.
		for(var i = 0; i != arrMatched.length; ++i)
			this.choices[arrMatched[i]].show();
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
		if(arr[i].indexOf(val) != -1)
			newarr.push(arr[i]);

	return newarr;
}

function _me_forObj(arr, val)
{
	var newarr = {};

	for(var i in arr)
		if(arr[i].indexOf(val) != -1)
			newarr[i] = arr[i];
	
	return newarr;
}

function _me_forArrL(arr, val, isLoose)
{
	var newarr = [];

	var rgx = getLooseKeyboardRegex(val);

	for(var i in arr)
		if(rgx.test(arr[i]))
			newarr.push(arr[i]);

	return newarr;
}

function _me_forObjL(arr, val)
{
	var newarr = {};

	var rgx = getLooseKeyboardRegex(val);

	for(var i in arr)
		if(rgx.test(arr[i]))
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
