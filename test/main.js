var imagehash = require('../'),
    assert    = require('assert'),
    File      = require('gulp-util').File;

describe('gulp-css-image-hash', function() {
    describe('imagehash()', function() {
        it('should ignore null files', function(done) {
            var fakeFile = new File({
                contents: new Buffer('')
            });
            
            var hasher = imagehash();
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), '');
                done();
            });
        });
        
        it('should not touch CSS with no images', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background:  red; }')
            });
            
            var hasher = imagehash();
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background:  red; }');
                done();
            });
        });
        
        it('should not touch external resources', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url("http://example.com/bg.jpg"); }')
            });
            
            var hasher = imagehash();
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url("http://example.com/bg.jpg"); }');
                done();
            });
        });
        
        it('should update resolvable resource', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url(a.png); }')
            });
            
            var hasher = imagehash('test/examples/');
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url(a.png?h=687d617708eef5770369b08eac3da5c3); }');
                done();
            });
        });
        
        it('should handle various quoting options', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url(a.png); } a { background: url("d3r-logo.png"); }')
            });
            
            var hasher = imagehash('test/examples/');
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url(a.png?h=687d617708eef5770369b08eac3da5c3); } a { background: url(d3r-logo.png?h=5124e60f5297d2951fec1c011b3fd891); }');
                done();
            });
        });
        
        it('should accept a modifying function as a parameter', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url(a.png); } a { background: url(d3r-logo.png); }')
            });
            
            var hasher = imagehash(function(path) {
                return 'test/examples/a.png';
            });
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url(a.png?h=687d617708eef5770369b08eac3da5c3); } a { background: url(d3r-logo.png?h=687d617708eef5770369b08eac3da5c3); }');
                done();
            });
        });
        
        it('should not update un-resolvable resources', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url(a.png); } a { background: url("d3r-logo.png"); }')
            });
            
            var hasher = imagehash('test/');
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url(a.png); } a { background: url("d3r-logo.png"); }');
                done();
            });
        });
        
        it('should only inspect paths with specified extensions', function(done) {
            var fakeFile = new File({
                contents: new Buffer('body { background: url(a.jpg); } a { background: url("d3r-logo.png"); }')
            });
            
            var hasher = imagehash(function(path) {
                assert.equal(path, 'a.jpg');
                return false;
            }, ['jpg']);
            hasher.write(fakeFile);
            
            hasher.once('data', function(file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), 'body { background: url(a.jpg); } a { background: url("d3r-logo.png"); }');
                done();
            });
        });
    });
});
