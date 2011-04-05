var getTimeArray48=function(){var timearray=getTimeArray(48);return function(){return timearray;}}();function getTimeArray(precision)
{var hourDivision=parseInt(precision/24)
var sHourDivision=Math.max(parseInt(precision/24),1);var minutesInDivision=60/sHourDivision;var timeArray=["12:00am"];for(var i=1;i<hourDivision;++i)
timeArray.push("12:"+(minutesInDivision*i)+"am");for(var i=sHourDivision;i!=precision;++i)
timeArray.push(Math.floor((i/hourDivision)
-(((i-1)>precision/2)?12:0))+":"
+((i%sHourDivision==0)?"00":(i%sHourDivision)*minutesInDivision)
+((i>=precision/2)?"pm":"am"));return timeArray;}$(function(){$.fn.timepicker=function(options){var onMenu=false;var defaults={precision:48,am_or_pm:"am",userErrorCallback:alert};var options=$.extend(defaults,options);return this.each(function(){var self=$(this);function init()
{createDOM();}
var toHandle=-1;function createDOM(){var listbox=getCustomListbox(self);listbox.mousemove(function(){onMenu=true;});listbox.mouseout(function(){onMenu=false;});listbox.hide();$(document.body).append(listbox);self.click(function(){listbox.show();});self.keypress(function(){listbox.hide();});self.blur(function(){if(""==$(this).val()||/^([1-9]|1[0-2])(:([0-5][0-9]?)?)?(am|pm)?$/
.test($(this).val()))
{if(!/^([1-9]|1[0-2]):[0-5][0-9](am|pm)$/
.test($(this).val()))
{var s=$(this).val();if(s.substr(-1,1)=="m")
s=s.substr(0,s.length-2);s=s.replace(/^([1-9]|1[0-2])$/,"$1:00"+options["am_or_pm"]);s=s.replace(/^((?:[1-9]|1[0-2]):)$/,"$100"+options["am_or_pm"]);s=s.replace(/^((?:[1-9]|1[0-2]):[0-5])$/,"$10"+options["am_or_pm"]);$(this).val(s);}}
else if(!onMenu)
options["userErrorCallback"].call(window,"Invalid time entered.");if(!onMenu)
$(listbox).hide();});};function getCustomListbox(){var times=getTimeArray(options["precision"]);var containingDiv=$("<div />");containingDiv.css({position:"absolute",top:self.offset().top+20+"px",left:self.offset().left+"px",height:"100px",width:"80px",cursor:"pointer",overflow:"scroll"});for(var i in times)
{var timeDiv=$("<div />");timeDiv.append(times[i]);var defaultBGColor="rgb(255, 255, 255)";timeDiv.css("backgroundColor",defaultBGColor);timeDiv.hover(function(){if($(this).css("backgroundColor")==defaultBGColor)
$(this).css("backgroundColor","#AFEEEE");else
$(this).css("backgroundColor",defaultBGColor);});timeDiv.click(function(){clearTimeout(toHandle);$(self).val($(this).text());containingDiv.hide();});containingDiv.append(timeDiv);}
return containingDiv;};init();});};});