export const uid = () => Math.random().toString(36).slice(4);

export const whichAnimationEvent = (function() {
  let t;
  const el = document.createElement('layui-dropdown');
  const animations = {
    'animation'      : 'animationend', // ok
    'OAnimation'     : 'oAnimationEnd',
    'MozAnimation'   : 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd' // ok
  };

  for (t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
})();
