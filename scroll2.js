(function(window){
  config = undefined;
  window.wrap = (function(element, config) {

    this.config = config;

    element.style.position = 'relative';
    element.style.boxSizing = 'border-box';
    element.style.overflow = 'hidden';

    var newWrapper = document.createElement('div');
    newWrapper.setAttribute('class', 'custom_scroll_container');

    newWrapper.style.height = '100%';
    newWrapper.style.width = '100%';
    newWrapper.style.boxSizing = 'border-box';
    newWrapper.style.overflow = 'hidden';

    while (element.hasChildNodes()) {
      newWrapper.appendChild(element.removeChild(element.firstChild))
    }

    element.appendChild(newWrapper);
    appendScroll(element);
    emulateScrollEvent(element);
    dragThumbFunc(element);
  }).bind(this);

  var checkUsefulness = function (element) {
    var container = element.querySelector('.custom_scroll_container');
    if (!container) {
      return false
    } else {
      return container.offsetHeight >= container.scrollHeight;
    }
  }

  var appendScroll = function(element, scrollOptions){
      var scrollOverlay = document.createElement('div'),
        scroll = document.createElement('div'),
        thumb = document.createElement('div');

      scrollOverlay.setAttribute('class', 'scroll_overlay');
      scroll.setAttribute('class', 'scroll');
      thumb.setAttribute('class', 'thumb');

      scroll.appendChild(thumb);
      scrollOverlay.appendChild(scroll);

      element.appendChild(scrollOverlay);

      calcScrollAppearance(element);
  }

  var calcScrollAppearance = function (element) {
    var timer = undefined,
      cb = function(){
        if ( checkUsefulness(element) ) {
          return false;
        }

        calculateThumbsHeight(element);
        element.querySelector('.scroll_overlay').style.opacity = 1;

        if(timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function(){
          element.querySelector('.scroll_overlay').style.opacity = 0;
        }, 2000);
      };


    if (element.addEventListener) {
      // crossbrovser
      element.addEventListener("mousemove", cb)
      // IE9, Chrome, Safari, Opera
      element.addEventListener("mousewheel", cb, false);
      // Firefox
      element.addEventListener("DOMMouseScroll", cb, false);
    }
    // IE 6/7/8
    else {
      element.attachEvent("onmousewheel", cb);
      element.attachEvent("mousemove", cb);
    }
  }

  var calculateThumbsHeight = function(container) {
    var minThumbSize = config.thumbSize ? config.thumbSize : 30,
      scrollContainer = container.querySelector('.custom_scroll_container'),
      thumbHeight = scrollContainer.offsetHeight*(scrollContainer.offsetHeight/scrollContainer.scrollHeight);
    // TODO: add some min value property
    container.querySelector('.thumb').style.height = ((thumbHeight < minThumbSize ? minThumbSize : thumbHeight) | 0) + 'px';
    calcThumbPosition(container);
  }

  // Prevent parent scroll solution
  var emulateScrollEvent = function(element) {
    var scrollContainer = element.querySelector('.custom_scroll_container'),
      cb =  function (e) {

        var event = e.originalEvent || e,
          d = event.wheelDelta || -event.detail,
          scrollContainer = element.querySelector('.custom_scroll_container');

        scrollContainer.scrollTop += ( d < 0 ? 1 : -1 ) * 30;

        calcThumbPosition(element)

        if ( (scrollContainer.offsetHeight !== (scrollContainer.scrollHeight - scrollContainer.scrollTop ) && d < 0) || (scrollContainer.scrollTop !== 0 && d > 0) ) {
          e.preventDefault();
        }
      };
    if (scrollContainer.addEventListener) {
      // crossbrovser
      // IE9, Chrome, Safari, Opera
      scrollContainer.addEventListener("mousewheel", cb, false);
      // Firefox
      scrollContainer.addEventListener("DOMMouseScroll", cb, false);
    }
    // IE 6/7/8
    else {
      scrollContainer.attachEvent("onmousewheel", cb);
    }
  }

  var calcThumbPosition = function(element) {
    var customContainer = element.querySelector('.custom_scroll_container'),
      thumbHeightOriginal = customContainer.offsetHeight*(customContainer.offsetHeight/customContainer.scrollHeight) | 0,
      thumbHeight = element.querySelector('.thumb').offsetHeight,
      thumbHeightErr = (customContainer.clientHeight - thumbHeight)/(customContainer.clientHeight - thumbHeightOriginal);

    element.querySelector('.thumb').style.marginTop = ((customContainer.clientHeight*customContainer.scrollTop/customContainer.scrollHeight)* thumbHeightErr | 0) + 'px';
  }

  var dragThumbFunc = function(element) {
    cb = function(e){
      var thumbClickAllowance = e.clientY - (e.target.getBoundingClientRect().top - windowScrolltop());

      dragThumCB = (function(e){

        var windowScrollTop = windowScrolltop(),
          customContainer = element.querySelector('.custom_scroll_container'),
          thumbHeightOriginal = customContainer.offsetHeight*(customContainer.offsetHeight/customContainer.scrollHeight) | 0,
          thumbHeight = element.querySelector('.thumb').offsetHeight,
          thumbHeightErr = (customContainer.clientHeight - thumbHeightOriginal)/(customContainer.clientHeight - thumbHeight);


        if( (this.getBoundingClientRect().top - windowScrollTop) <= e.clientY && ( this.getBoundingClientRect().top - windowScrollTop + this.offsetHeight ) > e.clientY ){
          this.scrollTop = (((e.clientY - thumbClickAllowance) - (this.getBoundingClientRect().top - windowScrollTop))*(this.scrollHeight/this.offsetHeight)) * thumbHeightErr;
        }
      }).bind(element.querySelector('.custom_scroll_container'));

      var removeCB = function(){
        document.body.removeEventListener("mousemove", dragThumCB, false);
        document.body.removeEventListener("mouseup", removeCB, false);
      }

      document.body.addEventListener("mousemove", dragThumCB, false);
      document.body.addEventListener("mouseup", removeCB , false);

    }

    element.querySelector('.thumb').addEventListener("mousedown", cb, false);
  }

  function windowScrolltop() {
    return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
  }
})(window);