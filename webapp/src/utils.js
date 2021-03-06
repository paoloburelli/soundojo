function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function secondsToString(seconds) {
	var minutes = zeroFill(Math.floor(seconds / 60), 2);
	var seconds = zeroFill(Math.floor(seconds) % 60, 2);
	return minutes + ':' + seconds;
}

jQuery.extend({
    toJSON  : function toJSON(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);
 
            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.toJSON(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

function refreshPage() {
	$('#main').page();
	$( "div[data-role=page]" ).page( "destroy" ).page();
}

var changeListViewElementTheme = function(selector, theme){
    try {
        $(selector).each(function(){
            try {
               $(this).buttonMarkup({theme: theme});
            }catch(exignore){
                //silent catch because this will fail for non initialized lists
                //but thats ok
            }
        });
    }
    catch (ex) {
        alert(ex);
    }
}

$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return undefined; }
	return results[1] || undefined;
}
