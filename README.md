ScrollEm
========

ScrollEm is a JavaScript library for creating scrolling animations on a web page. ScrollEm allows the user to make numeric CSS properties vary based on the current vertical scroll position of the page.

ScrollEm was used to build [my personal website](http://tareksherif.ca/).

Usage
------

New scroll animations are added with **ScrollEm.add()**:

```JavaScript
  ScrollEm.add(document.getElementById("scrolling-element"), {
    start: 500,
    end: 700,
    css: {
      right: {
        start: -500,
        end: 400
      }
    }
  });
```

The **start** and **end** options indicate the scroll positions at which to start and end the animation. The **css** option contains the CSS properties to animate and the **start** and **end** values that the CSS property will animate from and to. Optionally, a **units** option can be passed if the animation will be based on something other than *px* (e.g. *em* or *%*).

Instead of setting the **start** and **end** scroll positions directly, it is possible to set a default scroll range (i.e. distance between the scroll start and end positions) using **ScrollEm.setDefaultScrollRange()**, and then only the **start** option is required. Furthermore, for a series of animations, this functionality can be used with ScrollEm's built in position recorder to set new animation scroll positions relative to old ones. The current scroll position being recorded can be moved forwards or backwards using **ScrollEm.forward()** and **ScrollEm.back()**. If the recorded scroll position is used, then both the scrolling **start** and **end** options can be omitted for **ScrollEm.add()**:

```JavaScript
  ScrollEm.setDefaultScrollRange(200);

  ScrollEm.forward(300);

  ScrollEm.add(document.getElementById("scrolling-element1"), {
    css: {
      right: {
        start: -500,
        end: 400
      }
    }
  });

  ScrollEm.forward(300);

  ScrollEm.add(document.getElementById("scrolling-element2"), {
    css: {
      left: {
        start: -500,
        end: 400
      }
    }
  });
```

It is recommended to use a centered container element of fixed width to anchor most animations. This container can be set using **ScrollEm.setContainer()**, which allows ScrollEm to calculate certain measurements relative to it:

```JavaScript
  ScrollEm.setContainer(document.getElementById("container"));
```

Strings can be used to dynamically set CSS values based on page dimensions at the time of an update, and these strings can use special placeholders for key page measurments. These placeholders consist of the following:

* **WINDOW_WIDTH**: the current width of the window
* **WINDOW_HEIGHT**: the current height of the window
* **CONTAINER_WIDTH**: the current width of the container element
* **MARGIN_LEFT**: the distance between the window and container edges on the left
* **MARGIN_RIGHT**: the distance between the window and container edges on the right

```JavaScript
  ScrollEm.add(document.getElementById("scrolling-element"), {
    css: {
      left: {
        start: "-WINDOW_WIDTH",
        end: "MARGIN_LEFT + CONTAINER_WIDTH - 100"
      }
    }
  });
```

The full height of the page can be set using **ScrollEm.setPageHeight()**:

```JavaScript
  ScrollEm.setPageHeight(5000);
```

For responsive designs, a minimum width at which the animations stop begin executed can be set using **ScrollEm.setMinPageWidth()**:

```JavaScript
  ScrollEm.setMinPageWidth(800);
```

To allow for navigation to arbitrary points in the page, **ScrollEm.addBookmark()** can be used with the bookmark element's id and y offset as arguments. A **before** option can be given to pass a reference element, before which the bookmark element will be inserted in the DOM. An **offset** option can also be given to indicate a relative offset from the reference element that is triggered when the page size fall below the minimum width. This can be useful for setting bookmark positions appropriately when ScrollEm falls back to non-animated mode:

```JavaScript
  ScrollEm.addBookmark("bookmark", 1200, {
    before: document.getElementById("reference-element"),
    offset: 100
  });
```

