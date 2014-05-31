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

  var WINDOW_WIDTH, WINDOW_HEIGHT;
  var CONTAINER_WIDTH, MARGIN_LEFT, MARGIN_RIGHT;

  function parseValue(value) {
    return typeof value === "string" ? eval(value) : value;
  }

  // Hide scope from eval
  (function() {
    var HTML = document.documentElement;
    var BODY = document.body;
    var scroll_elements = [];
    var scroll_range = 200;
    var recording_position = 0;
    var container = null;
    var min_width = window.innerWidth;
    var css_page_height = window.innerHeight + "px";
    var default_css_page_height = document.documentElement.style.height;

    var default_css_page_overflow_x = HTML.style.overflowX;
    var default_css_body_overflow_x = BODY.style.overflowX;
    var default_css_body_position = BODY.style.position;
    var default_css_body_height = BODY.style.height;

    resetDimensions();

    window.ScrollEm = {
      add: function(element, options) {
        var scroll_element = { element: element };

        scroll_element.start = options.hasOwnProperty("start") ? options.start : recording_position;
        scroll_element.end = options.hasOwnProperty("end") ? options.end : scroll_element.start + scroll_range;


        scroll_element.css = options.css || {};
        
        Object.keys(scroll_element.css).forEach(function(property) {
          var start = scroll_element.css[property].start = scroll_element.css[property].start === undefined ? 0 : scroll_element.css[property].start;
          var units = scroll_element.css[property].units = scroll_element.css[property].units === undefined ? "px" : scroll_element.css[property].units;
          scroll_element.css[property].end = scroll_element.css[property].end === undefined ? start : scroll_element.css[property].end;

          scroll_element.css[property].default = element.style[property];

          if (window.innerWidth >= min_width) {
            element.style[property] = parseValue(start) + units;
          }
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

      addAnchor: function(id, scroll_position, units) {
        scroll_position = scroll_position === undefined ? recording_position : scroll_position;
        units =  units === undefined ? "px" : units;

        var anchor = document.createElement("div");

        anchor.id = id;
        anchor.style.position = "absolute";
        anchor.style.top = scroll_position + units;

        BODY.appendChild(anchor);
      },

      setMinWidth: function(min) {
        min_width = min;

        resetDimensions();
      }
    };


    window.addEventListener("scroll", update);

    window.addEventListener("resize", resetDimensions);

    function update() {
      var position = window.pageYOffset;
      scroll_elements.forEach(function(scroll_element) {
        var proportion = (position - scroll_element.start) / (scroll_element.end - scroll_element.start);
        proportion = Math.max(0, Math.min(proportion, 1));

        Object.keys(scroll_element.css).forEach(function(property) {
          if (window.innerWidth < min_width) {
            scroll_element.element.style[property] = scroll_element.css[property].default;
            return;
          }

          var start = parseValue(scroll_element.css[property].start);
          var end = parseValue(scroll_element.css[property].end);
          var units = scroll_element.css[property].units;

          var value = start + proportion * (end - start);
          scroll_element.element.style[property] = value + units;
        });
      });

    }

    function resetDimensions() {
      WINDOW_WIDTH = CONTAINER_WIDTH = window.innerWidth;
      WINDOW_HEIGHT = window.innerHeight;
      MARGIN_LEFT = MARGIN_RIGHT = 0;

      if (container) {
        CONTAINER_WIDTH = container.offsetWidth;
        MARGIN_LEFT = getLeftOffset(container);
        MARGIN_RIGHT = WINDOW_WIDTH - (MARGIN_LEFT + CONTAINER_WIDTH);
      }

      if (window.innerWidth < min_width) {
        HTML.style.height = default_css_page_height;
        HTML.style.overflowX = default_css_page_overflow_x;
        BODY.style.overflowX = default_css_body_overflow_x;
        BODY.style.position = default_css_body_position;
        BODY.style.height = default_css_body_height;
      } else {
        HTML.style.height = css_page_height;
        HTML.style.overflowX = "hidden";
        BODY.style.overflowX = "hidden";
        BODY.style.position = "relative";
        BODY.style.height = "100%";
      }

      update();
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