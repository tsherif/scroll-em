///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2014 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

(function() {
  "use strict";

  var DIMENSIONS = {
    WINDOW_WIDTH: 0,
    WINDOW_HEIGHT: 0,
    CONTAINER_WIDTH: 0,
    MARGIN_LEFT: 0,
    MARGIN_RIGHT: 0
  };

  var DIMENSION_FUNCTIONS = {
    "WINDOW_WIDTH": function() {
      return DIMENSIONS.WINDOW_WIDTH;
    },
    "-WINDOW_WIDTH": function() {
      return -DIMENSIONS.WINDOW_WIDTH;
    },
    "WINDOW_HEIGHT": function() {
      return DIMENSIONS.WINDOW_HEIGHT;
    },
    "-WINDOW_HEIGHT": function() {
      return -DIMENSIONS.WINDOW_HEIGHT;
    },
    "CONTAINER_WIDTH": function() {
      return DIMENSIONS.CONTAINER_WIDTH;
    },
    "-CONTAINER_WIDTH": function() {
      return -DIMENSIONS.CONTAINER_WIDTH;
    },
    "MARGIN_LEFT": function() {
      return DIMENSIONS.MARGIN_LEFT;
    },
    "-MARGIN_LEFT": function() {
      return -DIMENSIONS.MARGIN_LEFT;
    },
    "MARGIN_RIGHT": function() {
      return DIMENSIONS.MARGIN_RIGHT;
    },
    "-MARGIN_RIGHT": function() {
      return -DIMENSIONS.MARGIN_RIGHT;
    }
  };

  var DIMENSION_REGEX = new RegExp(
    "(" + Object.keys(DIMENSIONS).join("|") + ")",
    "g"
  );

  function parseValue(value) {
    if (typeof value === "string") {
      if (typeof DIMENSION_FUNCTIONS[value] !== "function") {
        DIMENSION_FUNCTIONS[value] = new Function(
          "return " + value.replace(DIMENSION_REGEX, "ScrollEm.DIMENSIONS.$1") + ";"
        );
      }
      value = DIMENSION_FUNCTIONS[value]();
    }

    return  value;
  }

  // Hide scope from eval
  (function() {
    var HTML = document.documentElement;
    var BODY = document.body;
    var scroll_elements = [];
    var bookmarks = [];

    var scroll_range = 200;
    var recording_position = 0;
    var easing = 0;
    var container = null;
    var min_width = window.innerWidth;
    var css_page_height = window.innerHeight + "px";
    var default_css_page_height = document.documentElement.style.height;

    var default_css_page_overflow_x = HTML.style.overflowX;
    var default_css_body_overflow_x = BODY.style.overflowX;
    var default_css_body_position = BODY.style.position;
    var default_css_body_height = BODY.style.height;

    var TRANSFORM_PROPERTIES = ["-webkit-transform", "-ms-transform", "transform"];
    var transform_counter = 0;

    var TRANSFORMS = {
      "translateX": {
        wrapper: function(value) {
          return "translateX(" + value + "px)";
        }
      },
      "translateY": {
        wrapper: function(value) {
          return "translateY(" + value + "px)";
        }
      },
      "translateZ": {
        wrapper: function(value) {
          return "translateZ(" + value + "px)";
        }
      },
      "rotate": {
        wrapper: function(value) {
          return "rotate(" + value + "deg)";
        }
      },
      "scaleX": {
        wrapper: function(value) {
          return "scaleX(" + value + ")";
        }
      },
      "scaleY": {
        wrapper: function(value) {
          return "scaleY(" + value + ")";
        }
      },
      "scaleZ": {
        wrapper: function(value) {
          return "scaleZ(" + value + ")";
        }
      },
    };

    resetDimensions();

    window.ScrollEm = {
      DIMENSIONS: DIMENSIONS,
      add: function(element, options) {
        var scroll_element = { element: element };

        scroll_element.start = options.hasOwnProperty("start") ? options.start : recording_position;
        scroll_element.end = options.hasOwnProperty("end") ? options.end : scroll_element.start + scroll_range;


        scroll_element.css = {};
        
        options.css.forEach(function(property_options) {
          var property = property_options.property || property_options.properties;
          var property_list;

          if (TRANSFORMS[property]) {
            property_list = ["transform-" + transform_counter++];
            property_options.wrapper = property_options.wrapper || TRANSFORMS[property].wrapper;
            property_options.transform = true;
          } else {
            property_list = Array.isArray(property) ? property : [property];
          }

          property_list.forEach(function(property) {
            var property_settings = { transform: property_options.transform };

            var start = property_settings.start = property_options.start === undefined ? 0 : property_options.start;
            var units = property_settings.units = property_options.units === undefined ? "px" : property_options.units;
            var wrapper = property_settings.wrapper = property_options.wrapper;
            property_settings.end = property_options.end === undefined ? start : property_options.end;
            property_settings.current_value = start;

            scroll_element.css[property] = property_settings;

            if (property_settings.transform) {
              return;
            }

            property_settings.default = element.style[property];

            if (window.innerWidth >= min_width) {
              if (typeof wrapper === "function") {
                element.style[property] = property_settings.current_style = wrapper(parseValue(start));
              } else {
                element.style[property] = property_settings.current_style = parseValue(start) + units;
              }
            }

          });
        
        });

        scroll_elements.push(scroll_element);
      },

      forward: function(amount) {
        recording_position += amount;
      },

      back: function(amount) {
        recording_position -= amount;
      },

      recorderPosition: function() {
        return recording_position;
      },

      resetRecorder: function() {
        recording_position = 0;
      },

      setEasing: function(ease) {
        easing = ease;
      },

      setContainer: function(new_container) {
        container = new_container;

        resetDimensions();
      },

      setPageHeight: function(height, units) {
        css_page_height = height + (units || "px");

        resetDimensions();
      },

      setDefaultScrollRange: function(range) {
        scroll_range = range;
      },

      addBookmark: function(id, scroll_position, options) {
        options = options || {};
        scroll_position = scroll_position === undefined ? recording_position : scroll_position;

        var before = options.before;
        var offset = options.offset === undefined ? 0 : options.offset;
        var units = options.units === undefined ? "px" : units;


        var bookmark = document.createElement("div");

        bookmark.id = id;

        if (window.innerWidth < min_width) {
          bookmark.style.position = "relative";
          bookmark.style.top = offset + units;
        } else {
          bookmark.style.position = "absolute";
          bookmark.style.top = scroll_position + units;
        }

        bookmarks.push({
          element: bookmark,
          static_offset: offset,
          absolute_offset: scroll_position,
          units: units
        });

        if (before) {
          before.parentElement.insertBefore(bookmark, before);
        } else {
          BODY.appendChild(bookmark);
        }
      },

      setMinPageWidth: function(min) {
        min_width = min;

        resetDimensions();
      }
    };

    window.requestAnimationFrame(update);

    window.addEventListener("resize", resetDimensions);

    function update() {
      window.requestAnimationFrame(update);

      var position = window.pageYOffset;

      scroll_elements.forEach(function(scroll_element) {
        var proportion = (position - scroll_element.start) / (scroll_element.end - scroll_element.start);
        proportion = Math.max(0, Math.min(proportion, 1));
        var transform_list = [];

        Object.keys(scroll_element.css).forEach(function(property) {
          var property_settings = scroll_element.css[property];

          if (DIMENSIONS.WINDOW_WIDTH < min_width) {
            if (!property_settings.transform && property_settings.current_style !== property_settings.default) {
              scroll_element.element.style[property] = property_settings.current_style = property_settings.default;
            }
            return;
          }


          var start = parseValue(property_settings.start);
          var end = parseValue(property_settings.end);
          var units = property_settings.units;
          var wrapper = property_settings.wrapper;

          var target = start + proportion * (end - start);
          var delta = target - property_settings.current_value;
          var value, style;

          if (Math.abs(delta) > 1) {
            value = target - delta * easing;
          } else {
            value = target;
          }

          property_settings.current_value = value;

          if (typeof wrapper === "function") {
            style = wrapper(value);
          } else {
            style = value + units;
          }

          if (property_settings.transform) {
            transform_list.push(style);
          } else if (property_settings.current_style !== style) {
            scroll_element.element.style[property] = property_settings.current_style = style;
          }
        });
  
        
        if (DIMENSIONS.WINDOW_WIDTH < min_width) {
          TRANSFORM_PROPERTIES.forEach(function(property) {
            scroll_element.element.style[property] = "none";
          });
        } else if (transform_list.length > 0) {
          TRANSFORM_PROPERTIES.forEach(function(property) {
            var transform = transform_list.join(" ");

            if (!transform.match(/translateZ|translate3D/)) {
              transform += " translateZ(0)";
            }

            scroll_element.element.style[property] = transform;
          });
        }
  
      });

    }

    function resetDimensions() {
      DIMENSIONS.WINDOW_WIDTH = DIMENSIONS.CONTAINER_WIDTH = window.innerWidth;
      DIMENSIONS.WINDOW_HEIGHT = window.innerHeight;
      DIMENSIONS.MARGIN_LEFT = DIMENSIONS.MARGIN_RIGHT = 0;

      if (container) {
        DIMENSIONS.CONTAINER_WIDTH = container.offsetWidth;
        DIMENSIONS.MARGIN_LEFT = getLeftOffset(container);
        DIMENSIONS.MARGIN_RIGHT = DIMENSIONS.WINDOW_WIDTH - (DIMENSIONS.MARGIN_LEFT + DIMENSIONS.CONTAINER_WIDTH);
      }

      if (window.innerWidth < min_width) {
        HTML.style.height = default_css_page_height;
        HTML.style.overflowX = default_css_page_overflow_x;
        BODY.style.overflowX = default_css_body_overflow_x;
        BODY.style.position = default_css_body_position;
        BODY.style.height = default_css_body_height;

        bookmarks.forEach(function(bookmark) {
          bookmark.element.style.position = "relative";
          bookmark.element.style.top = bookmark.static_offset + bookmark.units;
        });
      } else {
        HTML.style.height = css_page_height;
        HTML.style.overflowX = "hidden";
        BODY.style.overflowX = "hidden";
        BODY.style.position = "relative";
        BODY.style.height = "100%";

        bookmarks.forEach(function(bookmark) {
          bookmark.element.style.position = "absolute";
          bookmark.element.style.top = bookmark.absolute_offset + bookmark.units;
        });
      }

    }

    function getLeftOffset(element) {
      var left = 0;
      
      while (element.offsetParent) {
        left += element.offsetLeft;

        element = element.offsetParent;
      }
      
      return left;
    }

  })();

})();