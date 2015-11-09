"use strict";

(function() {
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };

  var picturesContainer = document.querySelector('.pictures');
  var galleryElement = document.querySelector('.gallery-overlay');
  var closeButton = galleryElement.querySelector('.gallery-overlay-close');

  console.log('gallery');

  function doesHaveParent(target, classname) {
    do {
      if (target.classList.contains(classname)) {
        console.log('true');
        return true;
      }
      console.log('iteration, element is ' + target);
      target = target.parentElement;
    } while (target);
    console.log('false');
    return false;
  }

  function hideGallery() {
    galleryElement.classList.add('invisible');
    closeButton.removeEventListener('click', closeHandler);
    document.body.removeEventListener('keydown', keyHandler);
  }

  function closeHandler(evt) {
    evt.preventDefault();
    hideGallery();
  }

  function keyHandler(evt) {
    switch(evt.keyCode) {
      case Key.LEFT:
        console.log('show previous photo');
        break;
      case Key.RIGHT:
        console.log('show next photo');
        break;
      case Key.ESC:
      default:
        hideGallery();
        break;
    }
  }

  function showGallery() {
    galleryElement.classList.remove('invisible');
    closeButton.addEventListener('click', closeHandler);
    document.body.addEventListener('keydown', keyHandler);
  }


  picturesContainer.addEventListener('click', function(evt) {
    evt.preventDefault();
    if (doesHaveParent(evt.target, 'picture')) {
      showGallery();
    }
  });

})();
