import './polyfill';
import layui from 'layui';
import Popper from 'popper.js';
import clickOutside from 'click-outside';
import { uid, whichAnimationEvent } from './util';
import { version, name } from '../package.json';
import './style.stylus';

layui.define(['jquery'], function(exports) {
  const $ = layui.jquery;

  const eventNamespace = `.${name}`;

  const ClassName = {
    DROPDOWN : 'layui-dropdown', // 容器
    DROPUP   : 'is-up', // 容器向上
    DROPLEFT : 'is-left', // 容器向左
    DROPRIGHT: 'is-right', // 容器靠右
    ANIMATED : 'has-animation', // 容器带动画
    TOGGLE   : 'layui-dropdown-toggle', // 触发器
    DISABLED : 'layui-disabled', // 触发器禁用
    MENU     : 'layui-dropdown-menu', // 下拉菜单
    MENURIGHT: 'is-right', // 下拉菜单靠右
    SHOW     : 'is-show', // 下拉菜单展示
    ANIMATION: 'layui-anim layui-anim-upbit' // 下拉菜单动画
  };

  const AttachmentMap = {
    TOP      : 'top-start',
    TOPEND   : 'top-end',
    BOTTOM   : 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT    : 'right-start',
    RIGHTEND : 'right-end',
    LEFT     : 'left-start',
    LEFTEND  : 'left-end'
  };

  const Default = {
    layFilter  : null,
    dropdown   : `.${ClassName.DROPDOWN}`,
    toggle     : `.${ClassName.TOGGLE}`,
    menu       : `.${ClassName.MENU}`,
    trigger    : 'hover',
    animate    : true,
    showTimeout: 150,
    hideTimeout: 100,
    className  : {
      showAnimation: ClassName.ANIMATION,
      hideAnimation: '',
      showDropdown : ClassName.SHOW,
      showToggle   : '',
      showMenu     : ClassName.SHOW
    }
  };

  let seed = 1000;

  function animateCss($target, animateName, callback) {
    if (!$target[0]) return;
    $target.addClass(animateName);

    function animationEndHandler() {
      $target.removeClass(animateName);
      $target.off(whichAnimationEvent + eventNamespace, animationEndHandler);

      $.isFunction(callback) && callback();
    }

    animateName && whichAnimationEvent // 如果不支持动画特性，则直接触发
      ? $target.on(whichAnimationEvent + eventNamespace, animationEndHandler)
      : animationEndHandler();
  }

  class Dropdown {
    constructor(options) {
      this.__VERSION__ = Dropdown.version;
      this._$dropdown = null;
      this._$toggle = null;
      this._$menu = null;
      this._popper = null; // Popper.js 实例
      this._config = null;
      this._visible = false;
      this.ON_SHOW = '';
      this.ON_SHOWED = '';
      this.ON_HIDE = '';
      this.ON_HIDED = '';
      this.LAY_FILTER = '';

      this._init(options);
      this._createPopper();
      this._addEventListeners();
    }

    static get version() {
      return version;
    }

    /**
     * @description 渲染，初始化所有的下拉框
     * @param {Object|HTMLElement|JQueryObject|String} config 参数，当使用 `jQuery` 检测无 `HTMLElement`，即开始作为普通对象处理
     * @param {String} config.layFilter `layui` 的 `filter` 属性，作为归类标识
     * @param {HTMLElement|JQueryObject|String} config.dropdown 容器，默认值 `ClassName.dropdown`
     * @param {HTMLElement|JQueryObject|String} config.toggle 触发器，默认值 `ClassName.toggle`
     * @param {HTMLElement|JQueryObject|String} config.menu 下拉框，默认值 `ClassName.menu`
     * @param {String} config.trigger 触发事件类型，默认 `hover`，可选值 [`hover`, `click`]
     * @param {Boolean} config.animate 是否开启动画，默认值 `true`
     * @param {Number} config.showTimeout 下拉框展示延迟时间（仅当 `trigger: hover` 有效），默认150
     * @param {Number} config.hideTimeout 下拉框隐藏延迟时间（仅当 `trigger: hover` 有效），默认100
     * @param {String} config.className.showAnimation 下拉框展示动画（仅当动画开启有效），默认值 `ClassName.ANIMATION`
     * @param {String} config.className.hideAnimation 下拉框隐藏动画（仅当动画开启有效），默认值 ''
     * @param {String} config.className.showDropdown 容器显示的类名，默认 `is-show`
     * @param {String} config.className.showToggle 触发器展示的类名，默认 ``
     * @param {String} config.className.showMenu 下拉框展示的类名，默认 `is-show`
     */
    _init(options) {
      this._config = $.extend(true, {}, Default, options);

      this._$dropdown = $(this._config.dropdown).first();
      this._$toggle = this._$dropdown.children(this._config.toggle).first();
      this._$menu = this._$dropdown.children(this._config.menu).first();

      this._$dropdown.addClass(ClassName.DROPDOWN);
      this._$toggle.addClass(ClassName.TOGGLE);
      this._$menu.addClass(ClassName.MENU);

      const filter = this._config.layFilter
        ? this._config.layFilter
        : this._$dropdown.attr('lay-filter')
          ? this._$dropdown.attr('lay-filter')
          : `lay-filter-${uid()}`;
      this._config.layFilter = filter;
      this._$dropdown.attr('lay-filter', filter);
      this.LAY_FILTER = filter;
      this.ON_SHOW = `show(${filter})`;
      this.ON_SHOWED = `showed(${filter})`;
      this.ON_HIDE = `hide(${filter})`;
      this.ON_HIDED = `hided(${filter})`;

      return this;
    }

    on(eventType, callback) {
      return layui.onevent.call(this, name, eventType, callback);
    }

    emit(eventType, params) {
      layui.event.call(this, name, eventType, params);
    }

    show() {
      const {
        showAnimation,
        hideAnimation,
        showDropdown,
        showToggle,
        showMenu
      } = this._config.className;

      this._$menu.off(whichAnimationEvent).removeClass(hideAnimation);

      if (this._$toggle[0].disabled || this._$toggle.hasClass(ClassName.DISABLED)) return;

      this._$dropdown.addClass(showDropdown);
      this._$toggle.addClass(showToggle);
      this._$menu.addClass(showMenu);
      this._$menu.css('z-index', seed++);
      this._popper && this._popper.update();
      this._visible = true;

      if (this._config.animate) {
        animateCss(this._$menu, showAnimation, () => {
          this.emit(this.ON_SHOWED);
        });
      }

      this.emit(this.ON_SHOW);
    }

    hide(e) {
      const {
        showAnimation,
        hideAnimation,
        showDropdown,
        showToggle,
        showMenu
      } = this._config.className;

      this._$menu.off(whichAnimationEvent).removeClass(showAnimation);

      const handler = () => {
        this._$dropdown.removeClass(showDropdown);
        this._$toggle.removeClass(showToggle);
        this._$menu.removeClass(showMenu);
        this._popper && this._popper.update();
        this._visible = false;
      };

      if (this._$toggle[0].disabled || this._$toggle.hasClass(ClassName.DISABLED)) return;

      if (this._config.animate) {
        animateCss(this._$menu, hideAnimation, () => {
          handler();
          this.emit(this.ON_HIDED);
        });
      } else {
        handler();
      }

      this.emit(this.ON_HIDE);
    }

    _addEventListeners() {
      const {
        showDropdown
      } = this._config.className;
      if (this._config.trigger === 'hover') {
        this._$dropdown.on('mouseenter' + eventNamespace, () => {
          clearTimeout(this.timer);
          if (this._$dropdown.hasClass(showDropdown)) return;
          this.timer = setTimeout($.proxy(this.show, this), this._config.showTimeout);
        });
        this._$dropdown.on('mouseleave' + eventNamespace, (e) => {
          clearTimeout(this.timer);
          if (this._$menu.is(e.relatedTarget) || this._$menu.has(e.relatedTarget).length) return;
          this.timer = setTimeout($.proxy(this.hide, this), this._config.hideTimeout);
        });

        this._$menu.on('mouseenter' + eventNamespace, (e) => {
          clearTimeout(this.timer);
          if (this._$dropdown.hasClass(showDropdown)) return;
          this.timer = setTimeout($.proxy(this.show, this), this._config.showTimeout);
        });

        this._$menu.on('mouseleave' + eventNamespace, (e) => {
          clearTimeout(this.timer);
          if (this._$dropdown.is(e.relatedTarget) || this._$dropdown.has(e.relatedTarget).length) return;
          this.timer = setTimeout($.proxy(this.hide, this), this._config.hideTimeout);
        });
        // this._$dropdown.on('mouseenter.dropdown', $.proxy(debounce(this.show, this._config.showTimeout), this));
        // this._$dropdown.on('mouseleave.dropdown', $.proxy(debounce(this.hide, this._config.hideTimeout), this));
      } else if (this._config.trigger === 'click') {
        this._$toggle.on('click', event => {
          event.preventDefault(); // 阻止本身事件
          this._visible ? this.hide() : this.show();
        });
        clickOutside(this._$toggle[0], e => {
          if (this._$menu.is(e.target) || this._$menu.has(e.target).length) return;
          this.hide();
        });
      }
    }

    _createPopper() {
      if (this._popper && $.isFunction(this._popper.destroy)) {
        this._popper.destroy();
      }
      this._popper = new Popper(this._$toggle, this._$menu, {
        placement: this._getPlacement(),
        modifiers: {
          computeStyle: {
            gpuAcceleration: false
          },
          preventOverflow: {
            boundariesElement: 'window' // 'scrollParent'
          }
        }
      });
    }

    _getPlacement() {
      const $dropdown = this._$dropdown;
      const $menu = this._$menu;
      let placement = AttachmentMap.BOTTOM;

      if ($dropdown.hasClass(ClassName.DROPUP)) {
        placement = AttachmentMap.TOP;
        if ($menu.hasClass(ClassName.MENURIGHT)) {
          placement = AttachmentMap.TOPEND;
        }
      } else if ($dropdown.hasClass(ClassName.DROPRIGHT)) {
        placement = AttachmentMap.RIGHT;
      } else if ($dropdown.hasClass(ClassName.DROPLEFT)) {
        placement = AttachmentMap.LEFT;
      } else if ($menu.hasClass(ClassName.MENURIGHT)) {
        placement = AttachmentMap.BOTTOMEND;
      }
      return placement;
    }
  }

  exports(name, Object.create(Dropdown, {
    'render': {
      value: function(options) {
        options = $.type(options) === 'object' ? options : { dropdown: options };
        return new Dropdown(options);
      },
      writable    : false,
      configurable: false,
      enumerable  : true
    }
  }));
});
