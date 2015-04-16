//var JaySchema = require('jayschema');
//var js = new JaySchema();
//var instance = 1111111;
//var schema = { "type": "integer", "multipleOf": 8 };
//
//// synchronous…
//console.log('synchronous result:', js.validate(instance, schema));
//
//// …or async
//js.validate(instance, schema, function (errs) {
//    if (errs) {
//        console.error(errs);
//    }
//    else {
//        console.log('async validation OK!');
//    }
//});

//var JaySchema = require('jayschema');
//var js = new JaySchema(JaySchema.loaders.http);     // we provide the HTTP loader here
//// you could load from a DB instead
//
//var instance = { "location": { "latitude": 48.8583, "longitude": 2.2945 } };
//var schema = {
//    "type": "object",
//    "properties": {
//        "location": { "$ref": "http://json-schema.org/geo" }
//    }
//};
//
//js.validate(instance, schema, function(errs) {
//    if (errs) { console.error(errs); }
//    else { console.log('validation OK!'); }
//});


var JaySchema = require('jayschema');
var js = new JaySchema(JaySchema.loaders.http);     // we provide the HTTP loader here
// you could load from a DB instead

var instance = false;
var schema = { "$ref": "http://localhost:3000/state/common.json#/definitions/boolean-state"};

js.validate(instance, schema, function (errs) {
    if (errs) {
        console.error(errs);
    }
    else {
        console.log('validation OK!');
    }
});