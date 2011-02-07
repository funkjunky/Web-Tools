function Dialog(params)
{this.message=0;this.class=0;this.css=0;this.priority=0;this.constructor=function(params)
{if(typeof params=="string")
this.setDefaults(params)
else
this.setParams(params);};this.setParams=function(params)
{if(params.message!==undefined)this.message=params.message;if(params.class!==undefined)this.class=params.class;if(params.css!==undefined)this.css=params.css;if(params.priority!==undefined)this.priority=params.priority;this.timeSet=new Date();};this.setDefaults=function(params)
{var theParams={message:params,css:{width:"200px",minHeight:"50px",backgroundColor:"#B4D7BF",border:"solid 1px black",fontSize:"12pt",whiteSpace:"pre-wrap"}};this.setParams(theParams);};this.getDOM=function()
{var div=$("<div />").get()[0];$(div).css(this.css);var close=$("<div />").get()[0];$(close).css({cursor:"pointer",marginRight:"0px",display:"block",textAlign:"right"});$(close).click(function(){$(div).hide();$(div).remove();});$(close).append("X");$(div).append(close);$(div).append(this.message);var header="nothing yet... I'll add this later...";return{dialogDiv:div,header:header,closeBtn:close};};this.constructor(params);}function DialogSystem(settings)
{this.timeDisplayed=0;this.cloggedTimeDisplayed=0;this.fadeTime=0;this.displaySync=0;this._css=0;this._dialogs=0;this._displaying=0;this._containingDiv=0;this.constructor=function(settings)
{this._dialogs=[];this.setDefaults();this.setupContainingDiv();this.setParams(settings);};this.setDefaults=function()
{var css={position:"fixed",top:"0px",right:"0px",};this._css=css;this.fadeTime=500;this.timeDisplayed=3000;this.cloggedTimeDisplayed=500;this.displaySync=false;};this.setParams=function(params)
{for(i in params)
this[i]=params[i];$(this._containingDiv).css(this._css);};this.setupContainingDiv=function()
{this._containingDiv=$("<div />").get()[0];$(document.body).append(this._containingDiv);};this.displayMessage=function(dialog)
{if(typeof dialog=="string")
this._dialogs.push(new Dialog(dialog));else{if(dialog.priority!=0){for(var i=0;i!=this._dialogs.length;++i)
if(this._dialogs[i].priority<dialog.priority)
break;this._dialogs.splice(i,0,dialog);}}
if(this.displaySync||!this._displaying)
this._displayMessage();};this._displayMessage=function()
{this._displaying=true;this._animateDialog(this._dialogs.shift());};this._animateDialog=function(dialog)
{var myself=this;var hideTimeout=0;var domObject=dialog.getDOM();var div=domObject["dialogDiv"];var header=domObject["header"];var close=domObject["closeBtn"];$(close).unbind("click");$(close).click(function(){myself.hideNot(div);if(hideTimeout)
clearTimeout(hideTimeout);});$(div).hide()
$(this._containingDiv).append(div);var myself=this;$(div).show(myself.fadeTime,function(){hideTimeout=setTimeout(function(){myself.hideNot(div);},myself.timeDisplayed);});};this.hideNot=function(div)
{var myself=this;$(div).hide(myself.fadeTime,function(){myself._displaying=false;if(!myself.displaySync&&myself._dialogs.length>0)
myself._displayMessage();});};this.constructor(settings);}function count(obj)
{var i=0;for(j in obj)++i;return i;}
function intersect(obj1,obj2)
{var newobj={};for(i in obj1)
newobj[i]=obj1[i];for(i in obj2)
newobj[i]=obj2[i]
return newobj;}var NDS=0;$(function(){NDS=new NotificationDialogSystem();$(document.body).append(NDS.getConsole());$("img").error(function(){Warning("An Image failed to load.");});});function Error(message)
{NDS.addNotification(new Notification(NOTE_SYS_ERROR,message));}
function Warning(message)
{NDS.addNotification(new Notification(NOTE_SYS_WARNING,message));}
function Notify(message)
{NDS.addNotification(new Notification(NOTE_SYS_NOTIFY,message));}
function UserError(message)
{NDS.addNotification(new Notification(NOTE_USR_ERROR,message));}
function UserWarning(message)
{NDS.addNotification(new Notification(NOTE_USR_WARNING,message));}
function UserNotify(message)
{NDS.addNotification(new Notification(NOTE_USR_NOTIFY,message));}function NotificationDialogSystem(params)
{this._notificationConsole=0;this._dialogSystem=0;this.constructor=function(params)
{this._notificationConsole=new NotificationConsole();this._dialogSystem=new DialogSystem();};this.addNotification=function(notification)
{this._notificationConsole.addNotification(notification);this._dialogSystem.displayMessage(noteToString(notification.type)
+":\n"+notification.message);}
this.setConsoleCSS=function(css)
{$(this._notificationConsole.getContainer()).css(css);}
this.getConsole=function()
{return this._notificationConsole.getContainer();}
this.constructor(params);}function Notification(type,message)
{this.message=message;this.type=type;}
var NOTE_SYS_ERROR=1;var NOTE_SYS_WARNING=2;var NOTE_SYS_NOTIFY=4;var NOTE_USR_ERROR=8;var NOTE_USR_WARNING=16;var NOTE_USR_NOTIFY=32;function noteToString(noteType)
{switch(noteType){case NOTE_SYS_ERROR:return"System Error";case NOTE_SYS_WARNING:return"System Warning";case NOTE_SYS_NOTIFY:return"System Notification";case NOTE_USR_ERROR:return"User Error";case NOTE_USR_WARNING:return"User Warning";case NOTE_USR_NOTIFY:return"User Notification";}
throw"Type Provided was not defined.";}
function NotificationConsole(params)
{this.notifications=0;this._notificationDOMS=0;this.notificationCSS=0;this.containerCSS=0;this._containingDiv=0;this.constructor=function(params)
{this.setDefaults();this.setParams(params);};this.setDefaults=function()
{this._containingDiv=$("<div />").get()[0];this._containingDiv.hide();this.notifications=[];this._notificationDOMS=[];this.containerCSS={};this.notificationCSS={};};this.setParams=function(params)
{for(i in params)
this[i]=params[i];$(this._containingDiv).css(this.containerCSS);};this.getContainer=function()
{return this._containingDiv;}
this.addNotification=function(notification)
{this.notifications.push(notification);this._addNotificationGraphics(notification);return this.notifications.length-1;};this._addNotificationGraphics=function(notification)
{var p=$("<p />").get()[0];$(p).css({marginTop:"0px",marginBottom:"0px"});$(p).css(this.notificationCSS);$(p).append(notification.message);p.title=noteToString(notification.type)+":\n"+notification.message;var defaultBGColor="rgb(255, 255, 255)";$(p).css("backgroundColor",defaultBGColor);$(p).hover(function(){if($(this).css("backgroundColor")==defaultBGColor)
$(this).css("backgroundColor","#AFEEEE");else
$(this).css("backgroundColor","white");});this._notificationDOMS.push(p);$(this._containingDiv).append(p);};this.removeNotification=function(key)
{this.notifications.splice(key,1);$(this._notificationDOMS[key]).remove();this._notificationDOMS.splice(key,1);};this.constructor(params);}