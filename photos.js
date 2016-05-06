/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function updateFav(icon,img) {
      if (localStorage.getItem(img.src)) {
        localStorage.removeItem(img.src)
        icon.className = 'fa fa-heart-o fa-5x';
      }else{
        localStorage.setItem(img.src,'fav');
        icon.className = 'fa fa-heart fa-5x';
      }
    };

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
          var elm = document.createElement('div');
          var divIconContainer = document.createElement('div');
          var icon = document.createElement('i');
          if (localStorage.getItem(img.src)) {
            icon.className = 'fa fa-heart fa-5x';
          }else{
            icon.className = 'fa fa-heart-o fa-5x';
          }
          divIconContainer.addEventListener('click', function(event) {
            updateFav(event.target,img);
          });
          divIconContainer.appendChild(icon);
          elm.appendChild(divIconContainer);
          elm.className = 'photo';
          elm.appendChild(img);
          holder.appendChild(elm);
        };
    }

    // ----

    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));
