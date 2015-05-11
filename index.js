'use strict';

var through = require('through2'),
    async   = require('async'),
    fs      = require('fs'),
    crypto  = require('crypto'),
    extname = require('path').extname;

var PLUGIN_NAME = 'gulp-css-image-hash';

function cssImageHash(webPath, includeFileExtensions) {
    var stream = through.obj(function(file, enc, cb) {
        var that = this;
        
        var regex = /url\(([^\)]+)\)/g,
            matches = null;

        var asString = '';
        
        if (file.isBuffer()) {
            asString = String(file.contents);
            
            matches = asString.match(regex);
        }
        
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        
        if (matches != null && matches.length) {
            var pairs = [];
            matches = matches.forEach(function(curValue) {
                // remove url()
                var path = curValue.slice(4).slice(0, -1);
                
                // Remove surrounding quotes
                if (path[0] == '"' || path[0] == "'") {
                    path = path.slice(1).slice(0, -1);
                }

                //If the path does not start with a '/', add it
                if (path[0] != '/') {
                    path = '/' + path;
                }
                
                pairs.push([curValue, path]);
            });
            
            async.eachSeries(pairs, function(tuple, callback) {
                var path = tuple[1];
                
                if (Array.isArray(includeFileExtensions)) {
                    var extension = extname(tuple[1]).slice(1);
                    
                    if(includeFileExtensions.indexOf(extension) < 0) {
                        return callback();   
                    }
                }
                
                if (typeof(webPath) == 'function') {
                    path = webPath(path);   
                } else if (typeof(webPath) != 'undefined') {
                    path = webPath + path;                   
                }
                
                if (!path) {
                    return callback();
                }

                var md5 = crypto.createHash('md5'),
                    file = fs.ReadStream(path),
                    hash = '';
                
                file.on('data', function(d) {
                    md5.update(d);
                });
                
                file.on('end', function() {
                    hash = md5.digest('hex');
                    asString = asString.replace(tuple[0], 'url(' + tuple[1] + '?h=' + hash + ')');
                    callback();
                });
                
                file.on('error', function(error) {
                    console.log(error.message);
                    callback();
                });
            }, function (err) {
                file.contents = new Buffer(asString);
                that.push(file);
                cb();
            });
        } else {
            this.push(file);
            cb(); 
        }
    });
    return stream;
};

module.exports = cssImageHash;
