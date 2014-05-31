ScrollEm
========

ScrollEm is a JavaScript library for creating scrolling animations on a web page. ScrollEm allows the user to set numeric CSS properties to vary based on the current vertical scroll position of the page.

Basics
------

New scroll animations are added with the **ScrollEm.add()** method:

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

The **start** and **end** properties indicate the scroll positions at which to start and end the animation. The **css** option contains contains CSS properties to animate and the **start** and **end** values that CSS property will animate from and to. Optionally, a **units** option can be passed if the animation will be based on something other that *px* (e.g. *em* or *%*).

Instead of setting the **start** and **end** scroll positions directly, it is possible to set a default scroll range (i.e. distance between the scroll start and end positions) using **ScrollEm.setDefaultScrollRange()**, and then simply set the scrolling **start** option. Furthermore, for a series of animations, this functionality can be used with the built in position recorder to set new animation scroll positions relative to old ones. The current scroll position being recorded can be moved forwards or backwards using the **forwards()** or **back()**, and then both the scrolling **start** and **end** options can be omitted for **add()**.

```JavaScript
  ScrollEm.setDefaultScrollRange(175);

  ScrollEm.forward(200);

  ScrollEm.add(document.getElementById("scrolling-element1"), {
    css: {
      right: {
        start: -500,
        end: 400
      }
    }
  });

  ScrollEm.forward(200);

  ScrollEm.add(document.getElementById("scrolling-element2"), {
    css: {
      left: {
        start: -500,
        end: 400
      }
    }
  });
```

It is recommended to use a centered container element of fixed width to anchor most animations. This container can be set using **ScrollEm.setContainer**, which allows ScrollEm to base certain measurements off of it.

```JavaScript
  ScrollEm.setContainer(document.getElementById("container"));
```

Strings can be used to dynamically set CSS values based on page dimensions at the time of an update, and these strings can use special placeholders for key page measurments. These include:

* **WINDOW_WIDTH**: the current width of the window
* **WINDOW_HEIGHT**: the current height of the window
* **CONTAINER_WIDTH**: the current width of the container element
* **MARGIN_LEFT**: the distance between the window and container edges on the left
* **MARGIN_RIGHT**: the distance between the window and container edges on the right

```JavaScript
  ScrollEm.add(document.getElementById("scrolling-element2"), {
    css: {
      left: {
        start: "-WINDOW_WIDTH",
        end: "MARGIN_LEFT + CONTAINER_WIDTH - 100"
      }
    }
  });
```

The full height of the page can be set using **ScrollEm.setPageHeight()**.

```JavaScript
  ScrollEm.setPageHeight(5000);
```

For responsive designs, a minimum width can be set using **ScrollEm.setPageHeight()** at which the animations stop begin executed.

```JavaScript
  ScrollEm.setMinPageWidth(800);
```
