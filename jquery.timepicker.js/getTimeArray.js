//neat. Go more effecient javascript!
var getTimeArray48 = 
	function() {
		var timearray = getTimeArray(48);
		return function(){ return timearray; }
	}();

function getTimeArray(precision)
{
	var hourDivision = parseInt(precision / 24)
	//safe hourDivision, used for all features that need hourDivision
	//in either int form, or a used with minutesInDivision.
	var sHourDivision = Math.max(parseInt(precision / 24), 1);
	var minutesInDivision = 60 / sHourDivision;
	var timeArray = ["12:00am"];
	for(var i=1; i < hourDivision; ++i)
		timeArray.push("12:" + (minutesInDivision*i) + "am");
	for(var i=sHourDivision; i != precision; ++i)
		timeArray.push(Math.floor((i/hourDivision) 
								- (((i-1)>precision/2)?12:0)) + ":" 
							+ ((i%sHourDivision == 0)?"00"
									:(i%sHourDivision)*minutesInDivision) 
							+ ((i>=precision/2)?"pm":"am"));

	return timeArray;
}


