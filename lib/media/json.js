/**
 * Registers JSON media type handling
 */
var JSONExt = require("commonjs-utils/json-ext"),
	Media = require("../media").Media,
	forEachableToString = require("../media").forEachableToString;

Media({
	mediaType:"application/json",
	getQuality: function(object){
		return 0.8;
	},
	serialize: StreamingSerializer(JSON.stringify),
	deserialize: function(inputStream, request){
		return JSONExt.parse(forEachableToString(inputStream));
	}
});

exports.StreamingSerializer = StreamingSerializer; 
function StreamingSerializer(stringify){
	return function(object, request){
		return {
			forEach:function(write){
				if(object instanceof Array){
					// this is a CSRF protection mechanism to guard against JSON hijacking
					if(request.crossSiteForgeable){
						write("{}&&");
					}
					// progressively stream arrays for better performance and memory
					write("[")
					var first = true;
					object.forEach(function(item){
						if(first){
							first = false;
						}
						else{
							write(",");
						}
						write(stringify(item));
					});
					write("]");
				}
				else {
					write(stringify(object));
				}
			}
		};
	}
}
