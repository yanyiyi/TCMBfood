if (typeof dwr == 'undefined' || dwr.engine == undefined) throw new Error('You must include DWR engine before including this file');

(function() {
if (dwr.engine._getObject("MediaRecordHandler") == undefined) {
var p;

p = {};





p.playMedia = function(p0, callback) {
return dwr.engine._execute(p._path, 'MediaRecordHandler', 'playMedia', arguments);
};

dwr.engine._setObject("MediaRecordHandler", p);
}
})();

