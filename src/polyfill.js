// poyfill requestAnimationFrame
// reference: https://github.com/darius/requestAnimationFrame
if (!Date.now) { Date.now = () => new Date().getTime() }

(function(window) {
  'use strict';

  const vendors = ['webkit', 'moz'];

  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    const vp = vendors[i];

    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame']);
  }

  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
        !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    let lastTime = 0;

    window.requestAnimationFrame = function(callback) {
      const now = Date.now();
      const nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() { callback(lastTime = nextTime) }, nextTime - now);
    };

    window.cancelAnimationFrame = clearTimeout;
  }
}(window));
