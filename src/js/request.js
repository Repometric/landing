var $jsonp = (function() {
  var that = {};

  that.send = function(src, options) {
    var callback_name = options.callbackName || 'callback',
      on_success = options.onSuccess || function() {},
      on_timeout = options.onTimeout || function() {},
      timeout = options.timeout || 5;

    var timeout_trigger = window.setTimeout(function() {
      window[callback_name] = function() {};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function(data) {
      window.clearTimeout(timeout_trigger);
      on_success(data);
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    script.onload = function() { this.remove() };

    document.body.appendChild(script);
  };

  return that;
})();