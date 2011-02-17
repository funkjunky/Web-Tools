var NDS = 0;
$(function() {
  NDS = new NotificationDialogSystem();
  $(document.body).append(NDS.getConsole());

  //This is most for the fun of it.
  $("img").error(function() {
    Warning("An Image failed to load.");
  });
});

function Error(message)
{
  NDS.addNotification(new Notification(NOTE_SYS_ERROR, message));
}

function Warning(message)
{
  NDS.addNotification(new Notification(NOTE_SYS_WARNING, message));
}

function Notify(message)
{
  NDS.addNotification(new Notification(NOTE_SYS_NOTIFY, message));
}

function UserError(message)
{
  NDS.addNotification(new Notification(NOTE_USR_ERROR, message));
}

function UserWarning(message)
{
  NDS.addNotification(new Notification(NOTE_USR_WARNING, message));
}

function UserNotify(message)
{
  NDS.addNotification(new Notification(NOTE_USR_NOTIFY, message));
}
