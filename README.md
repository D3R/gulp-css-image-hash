gulp-css-image-hash appends a hash of the contents of images referenced in your
CSS. This means when an image is changed it will have a different URL and won't
be fetched from cache.

## Usage

```js
var imagehash = require('gulp-css-image-hash');
gulp.task('css', function() {
    return gulp.src('./css/*.css')
        .pipe(imagehash())
        .pipe(gulp.dest('./dist'));
});
```

`imagehash` takes an optional parameter to point to the root of your web
folder.

```js
var imagehash = require('gulp-css-image-hash');
gulp.task('css', function() {
    return gulp.src('./css/*.css')
        .pipe(imagehash('./web'))
        .pipe(gulp.dest('./dist'));
});
```
