"use strict";

(function() {
  var REQUEST_FAILURE_TIMEOUT = 10000;

  var pictureTemplate = document.getElementById('picture-template');

  function supportsTemplate() {
    return 'content' in document.createElement('template');
  }

  function Picture(data, urlData) {
    this._data = data;
    this._urlData = urlData;
    this._element = null;

    this._onClick = this._onClick.bind(this);
  }

  Picture.prototype.render = function(container) {
    var newPictureElement;
    if (supportsTemplate()) {
      newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
      newPictureElement.querySelector('.picture-likes').textContent = this._data['likes'];
      newPictureElement.querySelector('.picture-comments').textContent = this._data['comments'];
      newPictureElement.querySelector('.picture img').src = this._data['url'];
    } else {
      newPictureElement = pictureTemplate.innerHTML;
    }

    container.appendChild(newPictureElement);

    var newPicture = new Image();
    newPicture.src = this._data['url'];

    var imageLoadTimeout = setTimeout(function() {
      newPictureElement.classList.add('picture-load-failure');
    }, REQUEST_FAILURE_TIMEOUT);

    newPicture.onload = function() {
      newPicture.style.height = '182px';
      newPicture.style.width = '182px';
      var oldPicture = newPictureElement.querySelector('.picture img');
      clearTimeout(imageLoadTimeout);
      newPictureElement.replaceChild(newPicture, oldPicture);
    };

    newPicture.onerror = function() {
      newPictureElement.classList.add('picture-load-failure');
    };

    this._element = newPictureElement;
    this._element.addEventListener('click', this._onClick);
  };

  Picture.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  Picture.prototype._onClick = function(evt) {
    evt.preventDefault();
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('galleryclick', { detail: { pictureElement: this }});
      window.dispatchEvent(galleryEvent);
    }
  };

  Picture.prototype.getPhotos = function() {
    return this._urlData;
  };

  Picture.prototype.getCurrentPhoto = function() {
    return this._data.url;
  };

  window.Picture = Picture;
})();
