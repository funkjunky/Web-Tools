
function count(obj)
{var i=0; for(j in obj) ++i; return i;}

function intersect(obj1, obj2)
{
	var newobj = {};
	for(i in obj1)
		newobj[i] = obj1[i];
	for(i in obj2)
		newobj[i] = obj2[i]

	return newobj;
}
