$(function(){$.fn.caret=function(pos){if(typeof pos!="undefined"){if($(this).get(0).setSelectionRange){$(this).get(0).setSelectionRange(pos,pos);}else if($(this).get(0).createTextRange){var range=$(this).get(0).createTextRange();range.collapse(true);range.moveEnd('character',pos);range.moveStart('character',pos);range.select();}}
else{var element=this;if(document.selection){var range=document.selection.createRange();var stored_range=range.duplicate();stored_range.moveToElementText(element);stored_range.setEndPoint('EndToEnd',range);element.selectionStart=stored_range.text.length-range.text.length;element.selectionEnd=element.selectionStart+range.text.length;}
return $(element).get(0).selectionStart;}}});// Copyright 2009 Ian McKellar <http://ian.mckellar.org/>
(function(){escape_re=/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/;jQuery.escape=function jQuery$escape(s){var left=s.split(escape_re,1)[0];if(left==s)return s;return left+'\\'+
s.substr(left.length,1)+
jQuery.escape(s.substr(left.length+1));}})();$(function(){$.fn.multiSelection=function(options){var methods={data:function(arr){if(typeof arr=="undefined")
{return this.data("multiSelection").data;}
else
{return this.each(function(){var $this=$(this).data("multiSelection");var newOptions=$this.options;newOptions["data"]=arr;$(this).multiSelection("destroy");$(this).multiSelection(newOptions);});}},validateData:function(){var $this=$(this).data("multiSelection");if(count($this["data"])<=0)
$this.options["errorCallback"].call(window,"The data provided to multiSelection contains no elements.");},getItemByCaret:function(jdom){var startComma=getFirstCharBeforeCaret(jdom,",");if(startComma!=0)++startComma;var endComma=getFirstCharAfterCaret(jdom,",");var currentItem=$.trim(jdom.val().substring(startComma,endComma));return currentItem;},disable:function(){this.attr("readonly",true);this.each(function(){var $this=$(this).data("multiSelection");$this.cbButton.attr("disabled",true);for(var i in $this.cbs)
$this.cbs[i].attr("readonly",true);});},enable:function(){this.attr("readonly",false);this.each(function(){var $this=$(this).data("multiSelection");$this.cbButton.attr("disabled",false);for(var i in $this.cbs)
$this.cbs[i].attr("readonly",false);});},destroy:function(){this.unbind(".multiSelection");this.each(function(){var $this=$(this).data("multiSelection");$this.cbContainer.remove();$this.cbContainer=0;$this.onMenu=false;$this.selectionCallback=function(){};$this.autocomplete.destroy();$this.autocomplete=0;$this.cbButton.remove();$this.cbButton=0;$this.cbs={};data=[];$(this).removeData("multiSelection");});}};if(methods[options]){return methods[options].apply(this,Array.prototype.slice.call(arguments,1));}else if(typeof options=="object"){var options_access=options;return this.each(function(){var defaults={data:[],name:$(this).attr("id"),hasButton:true,errorCallback:alert,canCancelSubmission:false,autoCorrect:false,hasFixInError:false,onAdd:function(){},onRemove:function(){}};var l_options=$.extend(defaults,options_access);if(typeof $(this).data("multiSelection")!="undefined"){alert("destroying instance of multiSelection to create a new one.");$(this).multiSelection("destroy");}
_init($(this),l_options);});}
else
alert("incorrect use. No method: '"+options+"'");};});function _init(self,options)
{_init_optionsAndData(self,options);self.multiSelection("validateData");_init_autocomplete(self);_init_inputSetup(self);_init_checkboxSetup(self);_init_buttonSetup(self);}
function _init_buttonSetup(self)
{var $this=self.data("multiSelection");if($this.options["hasButton"])
{self.after($this.cbButton=_createButton());$this.cbButton.bind("click.multiSelection",function(){$this.cbContainer.toggle();});$this.cbButton.after($this.cbContainer);}else
self.after($this.cbContainer);}
function _init_checkboxSetup(self)
{var $this=self.data("multiSelection");$this.cbContainer=$("<div />");if($.isArray($this["data"]))
for(var i=0;i!=$this["data"].length;++i)
$this.cbContainer.append(_getCheckbox
($this["data"][i],$this["data"][i],$this["cbs"],$this["options"]["name"],self));else
for(var i in $this["data"])
$this.cbContainer
.append(_getCheckbox(i,$this["data"][i],$this["cbs"],$this["options"]["name"],self));$this.cbContainer.hide();}
function _init_inputSetup(self)
{var $this=self.data("multiSelection");self.bind("change.multiSelection",selectionOnChange);self.bind("focus.multiSelection",function(){$(this).keyup();$this.autocomplete.container.css({top:self.offset().top+self.height()+6+"px",left:self.offset().left+"px"});$this.autocomplete.container.show();});self.bind("blur.multiSelection",function(){if(!$this.onMenu){$this.autocomplete.container.hide();$this.autocomplete.index=false;}});self.bind("keydown.multiSelection",keydown);self.bind("keyup.multiSelection",keyup);}
function _init_autocomplete(self)
{var $this=self.data("multiSelection");$this.selectionCallback=getSelectionCallback(self);$this.autocomplete=new portableAutoComplete({arr:$.makeArray($this["data"]),css:{position:"absolute",top:self.offset().top+self.height()+6+"px",left:self.offset().left+"px"},selectionCallback:$this.selectionCallback});$this.autocomplete.container.bind("mousemove.portableAutoComplete",function(){$this.onMenu=true;});$this.autocomplete.container.bind("mouseout.portableAutoComplete",function(){$this.onMenu=false;});$(document.body).append($this.autocomplete.container);}
function _init_optionsAndData(self,options)
{var onMenu=false;var selectionCallback=function(){};var autocomplete=0;var cbContainer=0;var cbButton=0;var cbs={};var data=options.data;delete options["data"];var dataObj={data:data,options:options,onMenu:onMenu,autocomplete:autocomplete,cbContainer:cbContainer,cbButton:cbButton,cbs:cbs,selectionCallback:selectionCallback};self.data("multiSelection",dataObj);}
function _getCheckbox(value,text,cbs,name,input){var selection=input;var $this=input.data("multiSelection");var id=value+text;var checkbox=cbs[value]=$("<input />");checkbox.attr("type","checkbox");checkbox.attr("id",id);checkbox.attr("name",name+"[]");checkbox.val(value);checkbox.bind("change.multiSelection",function(){if($(this).attr("checked")){var newInputStr=selection.val();if($.trim(selection.val()).length>0)
newInputStr+=", ";newInputStr+=$(this).val();selection.val(newInputStr);$this.autocomplete.disable(this.value);$this.options.onAdd.call(this);}
else{var inputValStr=selection.val();var indexOfVal=inputValStr.indexOf(this.value);if(indexOfVal==0)
inputValStr=inputValStr.substring(0,indexOfVal)
+inputValStr.substring(indexOfVal
+this.value.length+2);else
inputValStr=inputValStr.substring(0,indexOfVal-2)
+inputValStr.substring(indexOfVal+this.value.length)
selection.val(inputValStr);$this.autocomplete.enable(this.value);$this.options.onRemove.call(this);}});var label=$("<label for='"+id+"'>"+text+"</label>");var container=$("<div />");return container.append(checkbox).append(label);};function keydown(e){var $this=$(this).data("multiSelection");var code=e.keyCode||e.which;if(code==38||code==40||code==9||code==13){if(code==38)
$this.autocomplete.indexUp();else if(code==40)
$this.autocomplete.indexDown();else if(code==9||code==13){if($this.autocomplete.index!==false)
$this.selectionCallback.call($this.autocomplete,$this.autocomplete.index);}
e.stopPropagation();return false;}};function keyup(){var $this=$(this).data("multiSelection");var item=$(this).multiSelection("getItemByCaret",$(this));$this.autocomplete.update(item);};function getSelectionCallback(selection){return function(str){var startComma=getFirstCharBeforeCaret(selection,",");var before=selection.val().substring(0,startComma);var endComma=getFirstCharAfterCaret(selection,",");var after=selection.val()
.substring(endComma,selection.val().length);var seperator="";if(startComma!=0)
seperator=", ";selection.val(before+seperator+str+after);this.container.hide();this.index=false;selection.change();selection.focus();};};function selectionOnChange(){$this=$(this).data("multiSelection");if($($this.autocomplete.container).is(":hidden")||!$this.onMenu)
{var items=$(this).val().split(",");for(var i in $this.cbs){if($this.cbs[i].attr("checked")==true){$this.cbs[i].attr("checked",false);$this.cbs[i].change();}}
var hasFailed=false;$(this).val("");for(var i=0;i!=items.length;++i)
{var item=$.trim(items[i]);if(item!=""&&typeof $this.cbs[item]=="undefined"){hasFailed=true;var message="item #"+i
+" failed with text '"+item
+"' which is not a valid choice.";if($this.options["hasFixInError"])
message+="<br />To correct this click "
+"<a onclick=''>here</a>.";$this.options["errorCallback"].call(window,message);if(!$this.options["autoCorrect"]){if(i!=0)
$(this).val($(this).val()+", ");$(this).val($(this).val()+item);}}
else if(item!="")
{if($this.cbs[item].attr("checked")==false){$this.cbs[item].attr("checked",true);$this.cbs[item].change();}}}
if(hasFailed)
$("form:has([name="+$this.options["name"]+"])").submit(function(){$this.options["errorCallback"].call(window,"The submission has been canceled, because the multi selection is invalid (I need to update this to somehow state which one, or provide a link to highlight, which one, or something...)");return $this.options["canCancelSubmission"];});}};function _createButton(){var button=$("<input />");button.attr("type","button");button.attr("value","=");return button;};function checkboxUnchecked(){};function portableAutoComplete(options)
{this.options={};this.available={};this.choices={};this.currentChoices={};this.container=0;this.index=false;var defaultBGColor="rgb(255, 255, 255)";var self=this;var defaults={arr:[],css:{},selectionCallback:alert,errorCallback:alert};this.options=$.extend(defaults,options);this._init=function(options){this.container=$("<div />");this.container.css(options["css"]);for(var i=0;i!=options["arr"].length;++i)
{var option=$("<div />");option.append(options["arr"][i]);option.hide();if(typeof this.choices[options["arr"][i]]!="undefined")
this.options["errorCallback"].call(window,"You can not have identical choices in autocomplete.");this.choices[options["arr"][i]]=option;this.available[options["arr"][i]]=true;option.css("cursor","pointer");option.css("border","dotted 1px black");option.css("backgroundColor",defaultBGColor);option.bind("mouseenter.portableAutoComplete",function(){$(this).css("backgroundColor","#AFEEEE");});option.bind("mouseleave.portableAutoComplete",function(){$(this).css("backgroundColor",defaultBGColor);});option.bind("mousemove.portableAutoComplete",function(){self.index=$(this).text();});option.bind("mouseout.portableAutoComplete",function(){if(self.index==$(this).text())
self.index=false;});option.bind("click.portableAutoComplete",function(){self.options["selectionCallback"].call(self,$(this).text());self.index=false;});this.container.append(option);}
this.container.hide();};this.indexUp=function(){if(objLen(this.currentChoices)<=0)
return;var prev;for(var i in this.currentChoices){prev=i;break;}
if(this.index===false)
this.index=prev;else{this.currentChoices[this.index].css("backgroundColor",defaultBGColor);var isLast=false;var i;for(i in this.currentChoices){if(this.index==i&&i==prev)
isLast=true;if(!isLast&&i==this.index){this.index=prev;break;}else prev=i;}
if(isLast)
this.index=i;}
this.currentChoices[this.index].css("backgroundColor","#AFEEEE");};this.indexDown=function(){if(objLen(this.currentChoices)<=0)
return;var prev,first;for(var i in this.currentChoices){first=prev=i;break;}
if(this.index===false)
this.index=prev;else{this.currentChoices[this.index].css("backgroundColor",defaultBGColor);var wasFound=false;var i;for(i in this.currentChoices){if(wasFound){this.index=i;wasFound=false;break;}
if(i==this.index)
wasFound=true;}
if(wasFound)
this.index=first;}
this.currentChoices[this.index].css("backgroundColor","#AFEEEE");};this.disable=function(str){if(typeof this.available[str]=="undefined")
this.options["errorCallback"].call(window,"You cannot disable a choice that does not exist.");else{this.available[str]=false;if(typeof this.currentChoices[str]!="undefined")
this.currentChoices[str].hide();}};this.enable=function(str){if(typeof this.available[str]=="undefined")
this.options["errorCallback"].call(window,"You cannot enable a choice that does not exist. If you want to add a choice, then use the add function.");else
this.available[str]=true;};this.add=function(str){this.options["errorCallback"].call(window,"portableAutoComplete.add isn't implemented yet.");};this.remove=function(str){this.options["errorCallback"].call(window,"portableAutoComplete.remove isn't implemented yet.");};this.getChoices=function(){var choices={};for(var i in this.available)
if(this.available[i])
choices[i]=this.choices[i];return choices;};this.update=function(str){var arrMatched=[];var choices=this.getChoices();if($.trim(str)!="")
arrMatched=matchedElements(getKeys(choices),str,false);for(i in choices){choices[i].hide();}
this.currentChoices={};for(var i=0;i!=arrMatched.length;++i){choices[arrMatched[i]].show();this.currentChoices[arrMatched[i]]=choices[arrMatched[i]];}
if(typeof this.currentChoices[this.index]=="undefined")
this.index=false;};this.destroy=function(){this.container.remove();this.container=0;this.choices={};this.available={};this.currentChoices={};this.index=false;}
this._init(this.options);};function count(obj)
{var i=0;for(j in obj)++i;return i;}
function matchedElements(arr,val,isLoose)
{isLoose=(typeof isLoose=="undefined"||!isLoose)?false:true;if($.isArray(arr))
{if(isLoose)
return _me_forArrL(arr,val);else
return _me_forArr(arr,val);}
else
{if(isLoose)
return _me_forObjL(arr,val);else
return _me_forObj(arr,val);}}
function _me_forArr(arr,val,isLoose)
{var newarr=[];for(var i in arr)
if(arr[i].indexOf(val)!=-1&&arr[i]!=val)
newarr.push(arr[i]);return newarr;}
function _me_forObj(arr,val)
{var newarr={};for(var i in arr)
if(arr[i].indexOf(val)!=-1&&arr[i]!=val)
newarr[i]=arr[i];return newarr;}
function _me_forArrL(arr,val,isLoose)
{var newarr=[];var rgx=getLooseKeyboardRegex(val);for(var i in arr)
if(rgx.test(arr[i])&&arr[i]!=val)
newarr.push(arr[i]);return newarr;}
function _me_forObjL(arr,val)
{var newarr={};var rgx=getLooseKeyboardRegex(val);for(var i in arr)
if(rgx.test(arr[i])&&arr[i]!=val)
newarr[i]=arr[i];return newarr;}
function DoublyLinkedList(arr)
{function Node(val)
{this.prev=undefined;this.val=val;this.next=undefined;}
this.get=function(i){return this.list[i];}
this.getConcated=function(i){var node=this.list[i];var ret="";if(typeof node.prev!="undefined")
ret+=node.prev.val;ret+=node.val;if(typeof node.next!="undefined")
ret+=node.next.val;return ret;}
this.list={};if(arr.length<=0)
return;this.list[arr[0]]=new Node(arr[0]);for(var i=1;i!=arr.length;++i){this.list[arr[i]]=new Node(arr[i]);this.list[arr[i]].prev=this.list[arr[i-1]];this.list[arr[i-1]].next=this.list[arr[i]];}}
function getLooseKeyboardRegex(str)
{str=str.toLocaleLowerCase(str);var toprow=new DoublyLinkedList(['q','w','e','r','t','y','u','i','o','p','[',']']);var middlerow=new DoublyLinkedList(['a','s','d','f','g','h','j','k','l',';','\'']);var bottomrow=new DoublyLinkedList(['z','x','c','v','b','n','m',',','.','/']);var rgx=".?";for(var i=0;i!=str.length;++i)
{var chars;if(typeof toprow.get(str.charAt(i))!="undefined")
chars="["+toprow.getConcated(str.charAt(i))+"]";else if(typeof middlerow.get(str.charAt(i))!="undefined")
chars="["+middlerow.getConcated(str.charAt(i))+"]";else if(typeof bottomrow.get(str.charAt(i))!="undefined")
chars="["+bottomrow.getConcated(str.charAt(i))+"]";else
chars=str.charAt(i);rgx+=chars+".?";}
return new RegExp(rgx,"ig");}
function getKeys(obj)
{var keys=[];for(i in obj)
keys.push(i);return keys;}
function getFirstCharBeforeCaret(jobj,char)
{var val=jobj.val();var caretPos=jobj.caret();var startComma=val.lastIndexOf(",",caretPos-1);if(startComma==-1)startComma=0;return startComma;}
function getFirstCharAfterCaret(jobj,char)
{var val=jobj.val();var caretPos=jobj.caret();var endComma=val.indexOf(",",caretPos);if(endComma==-1)endComma=val.length;return endComma;}
function objLen(obj){var c=0;for(var i in obj)++c;return c;}