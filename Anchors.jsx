/****/ (function(window) {
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  ank: __webpack_require__(2)
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

function refreshAnchor(global) {
  /** ***********************\u4f9d\u8d56\u5bf9\u8c61************************************************** **/
  var _require = __webpack_require__(0),
      ank = _require.ank;

  __webpack_require__(4);
  /** ***********************\u7ed1\u5b9a\u51fd\u6570************************************************** **/


  var BuildUI = __webpack_require__(6);
  /** ***********************\u5173\u95ed\u91cd\u590d\u7a97\u53e3************************************************** **/


  $.global.callbackBeforeWebpackBuild && $.global.callbackBeforeWebpackBuild();

  if (!(global instanceof Panel)) {
    $.global.callbackBeforeWebpackBuild = function () {
      win.close();
    };
  }

  var winOps = ank.winOps = BuildUI({
    scriptName: ank.scriptName,
    version: ank.version
  });
  var win = ank.win = global instanceof Panel ? global : winOps.window;
  /** ***********************\u9876\u5c42\u5de5\u5177\u680f************************************************** **/

  var panel = ank.panel = win.add("Panel{orientation:'stack',alignment:['fill','fill'],spacing:0,margins:0}");
  ank.addBtn(panel);
  winOps.open(win);
  app.onError && app.onError(function (err) {
    alert("\u8B66\u544A, Anchors\u68C0\u6D4B\u5230AE\u62A5\u9519, \u5185\u5BB9\u5982\u4E0B:\n  " + err.toString() + "\n  ");
  });
}

$.global.refreshAnchor = refreshAnchor;

try {
  refreshAnchor(window);
} catch (err) {
  alert('Line #' + err.line.toString() + '\r\n' + err.toString());
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Root = __webpack_require__(3);

var ank = new Root({
  scriptName: 'Anchors',
  version: "1.0.0",
  slash: '/'
});
ank.extend({
  scriptFile: new File($.fileName)
});
module.exports = $.global.yp.ank = ank;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var Root =
/*#__PURE__*/
function () {
  function Root(options) {
    this.extend(options);
    return this;
  }

  var _proto = Root.prototype;

  _proto.extend = function extend(source) {
    for (var i in source) {
      this[i] = source[i];
    }

    return this;
  };

  _proto.haveSetting = function haveSetting(keyName) {
    return app.settings.haveSetting(this.scriptName, keyName);
  };

  _proto.saveSetting = function saveSetting(keyName, value) {
    app.settings.saveSetting(this.scriptName, keyName, value);
  };

  _proto.getSetting = function getSetting(keyName) {
    return app.settings.getSetting(this.scriptName, keyName);
  };

  _proto.getSettingAsBool = function getSettingAsBool(keyName) {
    return app.settings.getSetting(this.scriptName, keyName) === 'true';
  };

  return Root;
}();

if (typeof $.global.yp !== 'object') {
  $.global.yp = {};
}

module.exports = $.global.yp.Root = Root;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(0),
    ank = _require.ank;

var utils = __webpack_require__(5);

ank.extend({
  reRow: function reRow(index) {
    switch (index) {
      case 0:
        return 'left';

      case 1:
        return 'center';

      case 2:
        return 'right';

      default:
    }
  },
  reColumn: function reColumn(index) {
    switch (index) {
      case 0:
        return 'top';

      case 1:
        return 'center';

      case 2:
        return 'bottom';

      default:
    }
  },
  reRect: function reRect(rect) {
    var h = ank.h;
    var v = ank.v;
    var result = [];

    switch (h) {
      case 'left':
        result[0] = rect.left;
        break;

      case 'center':
        result[0] = rect.left + rect.width / 2;
        break;

      case 'right':
        result[0] = rect.left + rect.width;
        break;
    }

    switch (v) {
      case 'top':
        result[1] = rect.top;
        break;

      case 'center':
        result[1] = rect.top + rect.height / 2;
        break;

      case 'bottom':
        result[1] = rect.top + rect.height;
        break;
    }

    return result;
  },
  addBtn: function addBtn(parent) {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var btn = utils.add(parent, {
          type: 'radiobutton',
          alignment: [ank.reRow(j), ank.reColumn(i)]
        });
        btn.onClick = ank.moveAnchor;
      }
    }
  },
  moveAnchor: function moveAnchor() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) return;
    var layers = comp.selectedLayers;
    if (layers.length < 1) return;
    ank.h = this.alignment[0];
    ank.v = this.alignment[1];

    for (var i = 0; i < layers.length; i += 1) {
      var l = layers[i];
      var rect = l.sourceRectAtTime(comp.time, true);
      var result = ank.reRect(rect);
      var scale = l('ADBE Transform Group')('ADBE Scale');
      var position = l('ADBE Transform Group')('ADBE Position');
      var positionx = l('ADBE Transform Group')('ADBE Position_0');
      var positiony = l('ADBE Transform Group')('ADBE Position_1');
      var anchor = l('ADBE Transform Group')('ADBE Anchor Point');
      var originAnk = [anchor.value[0] * scale.value[0] / 100, anchor.value[1] * scale.value[1] / 100];
      ank.setValue.call(anchor, result);
      result[0] *= scale.value[0] / 100;
      result[1] *= scale.value[1] / 100;

      if (l('ADBE Transform Group')('ADBE Position').dimensionsSeparated) {
        result[0] += positionx.value - originAnk[0];
        result[1] += positiony.value - originAnk[1];
        ank.setValue.call(positionx, result[0]);
        ank.setValue.call(positiony, result[1]);
      } else {
        result[0] += position.value[0] - originAnk[0];
        result[1] += position.value[1] - originAnk[1];
        ank.setValue.call(position, result);
      }
    }
  },
  setValue: function setValue(value) {
    var comp = app.project.activeItem;
    if (this.isTimeVarying) this.setValueAtTime(comp.time, value);else this.setValue(value);
  }
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var UtilsUI = function () {
  var _ = this;
  /** ***********************expand function************************************************** **/


  _.extend = function (target, source) {
    // give the source to target
    for (var i in source) {
      target[i] = source[i];
    }

    return target;
  };
  /** ***********************functions for createUtils************************************************** **/


  _.add = function (parent, json) {
    // \u4e3aparent\u6dfb\u52a0UI
    if (!json) return;
    if (!parent) parent = this; // create element

    var newUI;
    var s = json.type;
    if (json.properties) s += '{properties:' + JSON.stringify(json.properties) + '}';
    if (_.isWindow(json.type)) newUI = new Window(s);else newUI = parent.add(s); // add other properties for newElement

    for (var j in json) {
      if (j === 'type' || j === 'properties' || j === 'children') continue;
      newUI[j] = json[j];
    }

    if (json.children) arguments.callee(json.children, newUI);
    return newUI;
  };

  _.isWindow = function (type) {
    // \u5224\u65ad\u662f\u5426\u4e3awindow\u5143\u7d20
    var winType = ['window', 'palette', 'dialog', 'Window', 'Palette', 'Dialog'];
    var len = winType.length;

    for (var i = 0; i < len; i++) {
      if (type === winType[i]) return true;
    }

    return false;
  };

  return _;
}();

module.exports = $.global.yp.UtilsUI = UtilsUI;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var BuildUI = function () {
  function BuildUI(options) {
    if (!(this instanceof BuildUI)) {
      return new BuildUI(options);
    }

    this.options = {
      windowType: 'palette',
      // "dialog","palette" and the reference of Panel
      scriptName: 'baseUI',
      version: 'v1.0',
      resizeable: true
    };

    if (options && BuildUI.isType(options, 'Object')) {
      for (var i in options) {
        this.options[i] = options[i];
      }
    }

    this.initSetting();
    this.initWindow();
    return this;
  }

  BuildUI.isType = function (content, type) {
    return Object.prototype.toString.call(content) === '[object ' + type + ']';
  };

  BuildUI.prototype.open = function (win) {
    if (win instanceof Window) {
      this.refresh(win);

      if (this.haveSetting('Location')) {
        var location = this.getSetting('Location').split(',');
        win.location = [parseInt(location[0]), parseInt(location[1])];
      } else {
        win.center();
      }

      win.show();

      if (this.haveSetting('winSize')) {
        var size = this.getSetting('winSize').split(',');
        win.size = [parseInt(size[0]), parseInt(size[1])];
      }
    } else {
      win.onResize = win.onResizing = function () {
        this.layout.resize();
      };

      this.refresh(win);
    }

    return win;
  };

  BuildUI.prototype.refresh = function (win) {
    win.layout.layout(true);
  };

  BuildUI.prototype.initWindow = function () {
    var self = this;
    this.window = new Window(this.options['windowType'], this.options['scriptName'] + ' v' + this.options['version'], undefined, {
      resizeable: this.options['resizeable']
    });

    this.window.onClose = function () {
      var thisStr = this.size[0].toString() + ',' + this.size[1].toString();
      self.saveSetting('winSize', thisStr);
      thisStr = this.location[0].toString() + ',' + this.location[1].toString();
      self.saveSetting('Location', thisStr);
    };

    this.window.onResize = this.window.onResizing = function () {
      this.layout.resize();
    };
  };

  BuildUI.prototype.initSetting = function () {
    this.slash = '/';
    var targetFolder = new Folder(Folder.userData.fullName + this.slash + 'Aescripts' + this.slash + this.options['scriptName'] + this.slash + this.options['version']);
    !targetFolder.exists && targetFolder.create();
    this.settingFile = new File(targetFolder.fullName + this.slash + 'ui_setting.xml');

    if (!this.settingFile.exists) {
      this.settingFile.open('w');
      this.settingFile.write('<setting></setting>');
      this.settingFile.close();
    }

    this.haveSetting = function (name) {
      this.settingFile.open('r');
      var content = this.settingFile.read();
      this.settingFile.close();
      return content.toString().indexOf('<' + name + '>') !== -1;
    };

    this.getSetting = function (name) {
      this.settingFile.open('r');
      var xml = new XML(this.settingFile.read());
      this.settingFile.close();
      return xml[name].toString();
    };

    this.getSettingAsBool = function (name) {
      var result = this.getSetting(name);
      return result === 'true';
    };

    this.saveSetting = function (name, value) {
      this.settingFile.open('r');
      var xml = new XML(this.settingFile.read());
      this.settingFile.close();
      var isOk = true;

      try {
        xml[name] = value.toString();
      } catch (err) {
        isOk = false;
      }

      this.settingFile.open('w');
      this.settingFile.write(xml);
      this.settingFile.close();
      return isOk;
    };
  };

  return BuildUI;
}();

module.exports = $.global.yp.BuildUI = BuildUI;

/***/ })
/******/ ]);
/****/ })(this)