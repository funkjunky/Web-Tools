//source is required, selected is optional, but must be the value if stated.
//TODO: solve issue with name. Currently I remove the name from the original element, but that could mess with selecting the elements. Perhaps keep the name and rely on the post overwrite the named value.
$(function() {
	$.fn.combobox = function(options) {
		var defaults = 
		{
		};
		var options = $.extend(defaults, options);

		var focusedID;

		var dataFormats = formatForSearch(options['source']);
		
		//all the different data formats referenced.
		//I should make this more localized, but whatever.
		var labels = dataFormats['labels'];
		var values = dataFormats['values'];
		var labelHooks = dataFormats['labelHooks'];
		var valueHooks = dataFormats['valueHooks'];
		var labelHooksDOM = {};

		var valueInputs = [];
		var labelInputs = [];

		var gPassingLabels = [];
		var gFailingLabels = [];

		var listDom = createListDOM();
		//onList is used to let onblur leave the closing of the list to the list
		//if the cursor is currently over the list. This allows you to actually
		//click the list, rather than having it disappear before the click is
		//registered.
		var onList = false;
		listDom.mousemove(function() { onList=true;  });
		listDom.mouseout(function() {  onList=false; });  

		var selfCount = -1; //first will be 0
		return this.each(function() {
			var selfID = focusedID = ++selfCount;
			//clone the labels... we don't want to reference here.
			var passingLabels = gPassingLabels[selfID] = labels.slice(0);
			var failingLabels = gFailingLabels[selfID] = [];

			var self = $(this);

			var labelInput;
			var valueInput;

			//attach the list dom to this element
			self.data("listdom", listDom);		
			self.data("source", options['source']);

			//figured out what will be selected
			var selected = false; //to indicate there is no value... i unno
			if(self.attr("data-selected"))
				selected = self.attr("data-selected");
			else if(options['selected'])
				selected = options['selected'];
			self.data("selected", selected);

			function init()
			{
				createUniqueDOM();
				attachEvents();
				//select what is currently selected if anything.
				if(selected)
					selectByValue(selected);
			}

			function createUniqueDOM()
			{
				//hide original element
				self.css("display", "none");
				//show display input
				labelInputs[selfID] = labelInput = $("<input type='text' class='combobox_displayinput' />");
				self.after(labelInput);

				//create the input that will hold the actual selected value;
				//we are going to transfer the name, then wipe the name from our
				//original input.
				valueInputs[selfID] = valueInput = $("<input type='hidden' name='"+self.attr("name")+"'/>");
				//immediately insert it after our original input
				self.after(valueInput);
				//remove the name from the original input.
				self.removeAttr("name");
			}

			function attachEvents()
			{
				var lastValue = selected;
				labelInput.focus(function() {
					focusedID = selfID;
					console.log("FOCUS fid:" + focusedID);
					onList = false;
					updateVisualList();
					positionList();
					listDom.css("display", "block");
				});

				labelInput.blur(function() {
					console.log("BLUR fid:" + focusedID);
					if(!onList)
					{
						//if the input matches, then set selected, otherwise revert display
						if(labelHooks[labelInput.val()] && lastValue !== labelHooks[labelInput.val()])
						{
							console.log(lastValue)
							console.log(labelHooks[labelInput.val()]);
							console.log("new value? fid="+focusedID+", val="+labelInput.val()+", lastvalue="+lastValue+", hook="+labelHooks[labelInput.val()]);
							selectByValue(labelHooks[labelInput.val()]);
						}
						else
						{
							if(valueInput.val() !== "") //revert display
								labelInput.val(valueHooks[valueInput.val()]);
							else
								labelInput.val("");
						}
						listDom.css("display", "none");
					}
				});

				var oldLength = labelInput.val().length;
				labelInput.keyup(function() {
					if(labelInput.val().length > oldLength)	//added a char
						removeFromOptions();
					else	//removed a char, therefor expand list
						addToOptions();

					oldLength = labelInput.val().length;
				});

				labelInput.keydown(function(e) {
					var TABKEY = 9;
					var ENTERKEY = 13;
					if(e.which === TABKEY || e.which === ENTERKEY)
					{
						if(passingLabels.length === 1)
						{
							labelInput.val(passingLabels[0]);
							this.blur();
						}
					}
				});
			}

			function updateVisualList()
			{
				//for each label, if the label is in passing values,
				//then display block, otherwise display none.
				console.log("heyo:");
				console.log(passingLabels);
				for(key in labelHooksDOM)
				{
					console.log("key: "+key);
					console.log(passingLabels);
					if($.inArray(key, passingLabels) !== -1)
						labelHooksDOM[key].css("display", "block");
					else
						labelHooksDOM[key].css("display", "none");
				}
			}
			
			function positionList()
			{
				var pos = labelInput.offset();
				console.log("list pos: " + pos.left + " - " + pos.top);
				listDom.css({
					"left": pos.left + "px",
					"top": (pos.top + labelInput.height()) + "px"
				});
			}

			//so, the thing with passing and failing values:
			//I keep track of what values are currently passing and what ones
			//are failing, so I check less values and set less attributes.
			//if we add a character, then we only need to check passingvalues
			//to see if they now fail.
			//if we remove a character, then we only need to check failing values
			//to see if they now succeed.
			function addToOptions()
			{
				var toberemoved = [];
				for(var i=0; i != failingLabels.length; ++i)
				{
					if(failingLabels[i].indexOf(labelInput.val()) !== -1 || labelInput.val() === "")
					{
						labelHooksDOM[failingLabels[i]].css("display", "block");
						passingLabels.push(failingLabels[i]);
						toberemoved.push(i);
					}
				}

				//go backwards removing all to be removed values.
				for(var i=toberemoved.length - 1; i >= 0; --i)
					failingLabels.splice(toberemoved[i], 1);

				console.log("passing values:");
				console.log(passingLabels);
				console.log("failing values:");
				console.log(failingLabels);
			}

			init();
		});

			function selectByValue(value)
			{
				valueInputs[focusedID].val(value);
				labelInputs[focusedID].val(valueHooks[value]);
				removeFromOptions();
			}

			//see addToOptions for passing and failing values explanation
			function removeFromOptions()
			{
				var toberemoved = [];
				console.log("focusedID: " + focusedID);
				console.log("gPassingLabels[fid]:");
				console.log(gPassingLabels[focusedID]);
				for(var i=0; i != gPassingLabels[focusedID].length; ++i)
				{
					if(gPassingLabels[focusedID][i].indexOf(labelInputs[focusedID].val()) === -1)
					{
						labelHooksDOM[gPassingLabels[focusedID][i]].css("display", "none");
						gFailingLabels[focusedID].push(gPassingLabels[focusedID][i]);
						toberemoved.push(i);
					}
				}
				console.log("to be removed:");
				console.log(toberemoved);

				//go backwards removing all to be removed values.
				for(var i=toberemoved.length - 1; i >= 0; --i)
					gPassingLabels[focusedID].splice(toberemoved[i], 1);

				console.log("gPassing, then failing values:");
				console.log(gPassingLabels[focusedID]);
				console.log(gFailingLabels[focusedID]);
			}


		function formatForSearch(sourceData)
		{
			var ret = {};
			ret['labels'] = [];
			ret['values'] = [];
			ret['labelHooks'] = {};
			ret['valueHooks'] = {};
			for(var i = 0; i != sourceData.length; ++i)
			{
				ret['labels'].push(sourceData[i]['label']);
				ret['values'].push(sourceData[i]['value']);
				ret['labelHooks'][sourceData[i]['label']] = sourceData[i]['value'];
				ret['valueHooks'][sourceData[i]['value']] = sourceData[i]['label'];
			}

			return ret;
		}

		//this created the html list to be shared by all comboboxes.
		function createListDOM()
		{
			var div = $("<div class='combobox_list' />");
			div.css({position: "absolute"});
			div.css({display: "none"});
			for(var i=0; i != options['source'].length; ++i)
			{
				var oDiv = $("<div class='combobox_option' data-value='"+options['source'][i].value+"'>" + options['source'][i].label + "</div>");
				labelHooksDOM[options['source'][i].label] = oDiv;

				oDiv.data("value", options['source'][i].value);
				oDiv.bind("click", function() {
					console.log("attempted to set: " + $(this).data('value'));
					selectByValue($(this).data("value"));
					listDom.css("display", "none");
				});
				div.append(oDiv)
			}

			$("body").append(div);

			return div;
		} //createListDOM

	}; //end combobox
});
