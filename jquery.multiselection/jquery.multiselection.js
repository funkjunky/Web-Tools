$(function() {
	$.fn.multiSelection = function(options) {
		//these methods rely on having the correct this context.
		var methods = {
			/*
			data: function(arr) {
				var $this = $(this).data("multiSelection");

				if(typeof arr == "undefined")
				{
					return $this.data;
				}
				else
				{
					$this.data = arr;
					//call functions to update changes.
					return $this;
				}
			},
			*/
			init: function() {
				var $this = $(this).data("multiSelection");
				//selection here is a quick hack, 'cause I'm too lazy
				//to remove selection. I should remove this at some point.
				var selection = $(this);

				if(count($this["data"]) <= 0)
					$this.options["errorCallback"].call(window,
					 "The data provided to multiSelection contains no elements.");
				//get the selectionCallback
				$this.selectionCallback = getSelectionCallback(selection);

				//create the div that contains the checkboxes.
				$this.cbContainer = $("<div />");
				//for each datum, create a label and checkbox and append it
				//If data is an array, then use the value for the value as well.
				if($.isArray($this["data"]))
					for(var i=0; i!=$this["data"].length; ++i)
						$this.cbContainer.append(
							_getCheckbox
								($this["data"][i], $this["data"][i]
									, $this["cbs"], $this["options"]["name"]
									, selection));
				//If the data is associative, then use the key as the value.
				else
					for(var i in $this["data"])
						$this.cbContainer
							.append(
								_getCheckbox(i, $this["data"][i]
									, $this["cbs"], $this["options"]["name"]
									, selection));
	
				$this.cbContainer.hide();
	
				if($this.options["hasButton"])
				{
					selection.after($this.cbButton = _createButton());
					$this.cbButton.click(function() {
						$this.cbContainer.toggle();
					});
					$this.cbButton.after($this.cbContainer);
				} else
					selection.after($this.cbContainer);
	
				selection.change(selectionOnChange);
	
				$this.autocomplete = new portableAutoComplete({
						  arr: $.makeArray($this["data"]), 
						  css: {
						  	position: "absolute", 
						  	top: selection.offset().top+selection.height()+6+"px",
						  	left: selection.offset().left+"px" },
						  selectionCallback: $this.selectionCallback
				});
				$(document.body).append($this.autocomplete.container);
	
				selection.focus(function(){
					$(this).keyup();
					$this.autocomplete.container.show();
				});
				
				$this.autocomplete.container.mousemove(function() { 
					$this.onMenu = true;	
				});
				$this.autocomplete.container.mouseout(function() {	
					$this.onMenu = false; 
				});
				selection.blur(function(){
					if(!$this.onMenu) {
						$this.autocomplete.container.hide();
						//TODO: this should go with a hide method that should be a member of autocomplete.
						$this.autocomplete.index = false;
					}
				});
	
				selection.keydown(keydown);
	
				selection.keyup(keyup);
			},
			getItemByCaret: function(jdom) {
				var startComma = getFirstCharBeforeCaret(jdom, ",");
				//I don't want to include the caret.
				if(startComma != 0) ++startComma;
				var endComma = getFirstCharAfterCaret(jdom, ",");
	
				//now we can grab the current item the user is typing.
				var currentItem = 
					$.trim(jdom.val().substring(startComma, endComma));
	
				return currentItem;
			}
		};

	if(methods[options]) {
		return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if(typeof options == "object") {

		return this.each(function() {
				  //I think i can just delete seletion here.
		var defaults =
		{
			data: [],
			name: $(this).attr("id"),
			hasButton: true,
			errorCallback: alert,
			canCancelSubmission: false,
			autoCorrect: false,
			hasFixInError: false
		};
		var onMenu = false;
		var selectionCallback = function(){};
		var autocomplete = 0;
		var cbContainer = 0;
		var cbButton = 0;
		var cbs = {};
		var l_options = $.extend(defaults, options);
		var data = l_options.data; delete l_options["data"];
		var dataObj = {
				  data: data, 
				  options: l_options,
				  
				  onMenu: onMenu, 
				  autocomplete: autocomplete,
				  cbContainer: cbContainer,
				  cbButton: cbButton,
				  cbs: cbs,
				  selectionCallback: selectionCallback
		};

			$(this).data("multiSelection", dataObj);
			var selection = $(this);
			var $this = $(this).data("multiSelection");

			var console = $("<div />");
			console.css({position: "fixed", bottom: "0px", right: "0px"});
			$(document.body).append(console);

			methods.init.call(this);
		}); //end this.each
	} 
	else 
		alert("incorrect use~!!!"); //I should use the errorCallback.
	}; //end multiselection
}); //end onload

////////multiSelection class methods///////////////
///////////////////////////////////////////////////
	
			function _getCheckbox(value, text, cbs, name, input) {
				//omg eww... $this is generally bad but necessary.
				//selection is me being lazy.
				var selection = input;
				var $this = input.data("multiSelection");
				var id = value + text;
				var checkbox = cbs[value] = $("<input />");
				checkbox.attr("type", "checkbox");
				checkbox.attr("id", id);
				checkbox.attr("name", name + "[]");
				checkbox.val(value);
				checkbox.change(function() {
					if($(this).attr("checked")) {
						var newInputStr = selection.val();
						if($.trim(selection.val()).length > 0)
							newInputStr += ", ";
						newInputStr += $(this).val();
		
						selection.val(newInputStr);
						$this.autocomplete.disable(this.value);
					}
					else{
						var inputValStr = selection.val();
						//search for the first occurance of value, then slice the 
						//string
						var indexOfVal = inputValStr.indexOf(this.value);
						//if(indexOfVal == -1)
						//	return options["errorCallback"].call(window,
						//		"The text input does not contain the options you 
						//unchecked. This is just a warning");
						//their are two cases. One is that it's the first string.
						if(indexOfVal == 0)
							//+2 is the comma and space.
							inputValStr = inputValStr.substring(0, indexOfVal)
								+ inputValStr.substring(indexOfVal 
																+ this.value.length + 2);
						//the second is any other space, including last.
						else
							//the -2 is the comma and space before the value.
							inputValStr = inputValStr.substring(0, indexOfVal-2)
								+ inputValStr.substring(indexOfVal + this.value.length)
			
						selection.val(inputValStr);
			
						$this.autocomplete.enable(this.value);
					}
				});
				var label = $("<label for='"+id+"'>"+text+"</label>");
				var container = $("<div />");
	
				return container.append(checkbox).append(label);
			};

			function keydown(e) {
				var $this = $(this).data("multiSelection");

				var code = e.keyCode || e.which;
				//these numbers should be enumerated somewhere.
				if(code ==38 || code == 40 || code == 9 || code == 13) {
					if(code == 38)	//up
						$this.autocomplete.indexUp();
					else if(code == 40) //down
						$this.autocomplete.indexDown();
					//TODO: I eventually want tab to guess the autocomplete, and enter to only work if something is selected, but that's later.
					else if(code == 9 || code == 13) { //tab
						if($this.autocomplete.index !== false)
							$this.selectionCallback.call($this.autocomplete, $this.autocomplete.index);
					}
					e.stopPropagation();
					return false;
				}
			};
	
			function keyup() {
				var $this = $(this).data("multiSelection");

				var item = $(this).multiSelection("getItemByCaret", $(this));
				$this.autocomplete.update(item);
			};

			//is this bad? How could I possibly avoid this =\
			function getSelectionCallback(selection) {
				return function(str) {
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
					this.container.hide();
					this.index = false;
					selection.change();
	
					selection.focus();
				};
			};
	
			function selectionOnChange() {
				$this = $(this).data("multiSelection");

				if($($this.autocomplete.container).is(":hidden") 
						  || !$this.onMenu)
				{
					//explode on comma
					var items = $(this).val().split(",");
	
					//clear checkboxes (their may be a more effecient way)
					for(var i in $this.cbs) { 
						if($this.cbs[i].attr("checked") == true) {	  
							$this.cbs[i].attr("checked", false);
							$this.cbs[i].change();
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
						if(item != "" && typeof $this.cbs[item] == "undefined") {
							hasFailed = true;
							var message = "item #" + i 
								+ " failed with text '"+ item 
								+ "' which is not a valid choice.";
							if($this.options["hasFixInError"])
								message += "<br />To correct this click "
									+ "<a onclick=''>here</a>.";
							$this.options["errorCallback"].call(window, message);
							if(!$this.options["autoCorrect"]) {
								if(i != 0)
									$(this).val($(this).val() + ", ");
								$(this).val($(this).val() + item);
							}
						}
						else if(item != "")
						{
							if($this.cbs[item].attr("checked") == false) {
								$this.cbs[item].attr("checked", true);
								$this.cbs[item].change();
							}
						}
					}
	
					if(hasFailed)
						$("form:has([name="+$this.options["name"]+"])").submit(function() {
							$this.options["errorCallback"].call(window,
								"The submission has been canceled, because the multi selection is invalid (I need to update this to somehow state which one, or provide a link to highlight, which one, or something...)");
						return $this.options["canCancelSubmission"];
					});
				}
			};
	
			function _createButton() {
				var button = $("<input />");
				button.attr("type", "button");
				button.attr("value", "=");

				return button;
			};
	
			function checkboxUnchecked() {
			};
	

///////////////////////////////////////////////////
///////////////////////////////////////////////////

//selectionCallback context: this = portableAutoComplete

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

			option.mousemove(function() { self.index = $(this).text(); });
			option.mouseout(function() { 
				if(self.index == $(this).text()) 
					self.index = false;
			});
		
			option.click(function() {
				self.options["selectionCallback"].call(self, $(this).text());
				//TODO: remove me and put me in a hide method.
				self.index = false;
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
