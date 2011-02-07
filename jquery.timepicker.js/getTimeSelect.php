<?php
  function getTimeSelect($name, $default="12:00pm", $id="")
  {
    $timeArray = array("12:00am"=>"00:00:00", "12:30am"=>"00:30:00");
    for($i = 2; $i != 48; ++$i)
      $timeArray
       [floor($i/2 - (($i>24)?12:0)) . ":" . (($i%2)?"30":"00") . (($i/24 < 1)?"am":"pm")]
          = floor($i/2) . ":" . (($i%2)?"30":"00") . ":00";

    if($id != "") $id = "id = \"$id\"";
    ob_start();
?>
  <select name="<?=$name?>" <?=$id?>>
<?
    foreach($timeArray as $text => $value)
    {
?>
     <option <? if($text==$default) echo "selected"; ?> value="<?=$value?>"><?=$text?></option>
<?
    }
?>
    </select>
<?
    $html = ob_get_contents();
    ob_end_clean();

    return $html;
  }


?>
