'use strict';

(function() {

  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECIEVED': 2,
    'LOADING': 3,
    'DONE': 4
  };

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 19;

  var PICTURE_RELEVANCE_TIME = 80 * 24 * 60 * 60 * 1000;

  var filtersMenu = document.querySelector('.filters');
  filtersMenu.classList.add('hidden');

  var picturesContainer = document.getElementsByClassName('pictures')[0];
  var pictures;
  var currentPictures;
  var currentPage = 0;

  function supportsTemplate() {
    return 'content' in document.createElement('template');
  }

  function renderPictures(picturesToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      picturesContainer.innerHTML = '';
      picturesContainer.classList.remove('picture-load-failure');
    }

    var pictureTemplate = document.getElementById('picture-template');
    var picturesFragment = document.createDocumentFragment();

    var picturesFrom = pageNumber * PAGE_SIZE;
    var picturesTo = picturesFrom + PAGE_SIZE;

    picturesToRender = picturesToRender.slice(picturesFrom, picturesTo);

    picturesToRender.forEach(function(picture) {
      var newPictureElement;
      if (supportsTemplate()) {
        newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
        newPictureElement.querySelector('.picture-likes').textContent = picture['likes'];
        newPictureElement.querySelector('.picture-comments').textContent = picture['comments'];
        newPictureElement.querySelector('.picture img').src = picture['url'];
      } else {
        newPictureElement = pictureTemplate.innerHTML;
      }

      picturesFragment.appendChild(newPictureElement);

      var newPicture = new Image();
      newPicture.src = picture['url'];

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

    });

    picturesContainer.appendChild(picturesFragment);
    filtersMenu.classList.remove('hidden');
  }

  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  function loadPictures(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/pictures.json', true);
    xhr.send();

    xhr.onreadystatechange = function(evt) {
      var loadedXhr = evt.target;

      switch (loadedXhr.readyState) {
        case ReadyState.OPENED:
        case ReadyState.HEADERS_RECIEVED:
        case ReadyState.LOADING:
          picturesContainer.classList.add('pictures-loading');
          break;
        case ReadyState.DONE:
        default:
          if (loadedXhr.status === 200) {
            var data = loadedXhr.response;
            picturesContainer.classList.remove('pictures-loading');
            callback(JSON.parse(data));
          }

          if (loadedXhr.status > 400) {
            showLoadFailure();
          }
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };
  }

  function filterPictures(picturesToFilter, filterValue) {
    var filteredPictures = picturesToFilter.slice(0);
    switch (filterValue) {
      case 'new':
        var now = new Date();
        var latestPictureRelevantDate = +now - PICTURE_RELEVANCE_TIME;
        filteredPictures = filteredPictures.filter(function(elem) {
          if (Date.parse(elem.date) > latestPictureRelevantDate) {
            return elem;
          }
        }).sort(function(a, b) {
          if (a.date < b.date) {
            return 1;
          }
          if (a.date > b.date) {
            return -1;
          }
          if (a.date === b.date) {
            return 0;
          }
        });

        break;
      case 'discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          if (a.comments < b.comments) {
            return 1;
          }
          if (a.comments > b.comments) {
            return -1;
          }
          if (a.comments === b.comments) {
            return 0;
          }
        });
        break;
      case 'popular':
      default:
        filteredPictures = picturesToFilter.slice(0);
        break;
    }

    localStorage.setItem('filterValue',filterValue);
    return filteredPictures;
  }

  function setActiveFilter(filterValue) {
    currentPictures = filterPictures(pictures, filterValue);
    currentPage = 0;
    var filterID = '#filter-' + filterValue;
    document.querySelector(filterID).checked = true;
    renderPictures(currentPictures, currentPage, true);
  }

  function initFilters() {
    var filtersContainer = document.querySelector('.filters');
    filtersContainer.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;
      if (clickedFilter.value) {
        setActiveFilter(clickedFilter.value);
      }
    });
  }

  function isNextPageAvailable() {
    return currentPage < Math.ceil(pictures.length / PAGE_SIZE);
  }

  function isAtTheBottom() {
    var GAP = 150;
    console.log((picturesContainer.getBoundingClientRect().bottom), window.innerHeight);
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  function checkNextPage() {
    console.log('hello');
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  function initScroll() {
    var scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderPictures(currentPictures, currentPage++, false);
    });
  }

  initFilters();
  initScroll();

  loadPictures(function(loadedPictures) {
    pictures = loadedPictures;
    setActiveFilter(localStorage.getItem('filterValue') || 'new');
  });

})();
