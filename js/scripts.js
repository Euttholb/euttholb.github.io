
/*
------------------------------------
PREPARE A PATH
------------------------------------
*/

function preparePath(path) {

  const length =
    path.getTotalLength();

  path.style.strokeDasharray =
    `${length} ${length}`;

  path.style.strokeDashoffset =
    length;

  path.style.opacity = 1;

  return length;
}


/*
------------------------------------
DRAW ONE PATH
------------------------------------
*/

function drawPath(
  path,
  duration = 150
) {

  return new Promise(resolve => {

    const length =
      path.getTotalLength();

    path.style.transition =
      `stroke-dashoffset
       ${duration}ms
       cubic-bezier(.65, 0, .35, 1)`;

    requestAnimationFrame(() => {

      path.style.strokeDashoffset =
        0;

    });


    setTimeout(
      resolve,
      duration
    );

  });

}


/*
------------------------------------
DRAW MULTIPLE PATHS
AT THE SAME TIME
------------------------------------
*/

function drawGroup(
  ids,
  duration = 150
) {

  const animations =
    ids.map(id => {

      const path =
        document.querySelector(
          `#${id}`
        );

      if (!path) {
        return Promise.resolve();
      }

      return drawPath(
        path,
        duration
      );

    });

  return Promise.all(
    animations
  );

}


/*
------------------------------------
YOSEMITE SEQUENCE
------------------------------------

The SVG was split where lines meet,
which gives us natural places to
branch the animation.

This can be tuned further once you
decide exactly how fast every ridge
should grow.
*/

async function animateYosemite() {

  /*
   ================================
   LEFT SIDE
   ================================
  */

  await drawGroup(
    [
      "line-01",
      "line-03"
    ],
    1700
  );


  /*
    line-03 reaches the large
    left cliff intersection.

    Two lines now continue from
    that area.
  */

  await Promise.all([

    drawGroup(
      [
        "line-04",
        "line-05"
      ],
      1800
    ),

    drawGroup(
      [
        "line-02"
      ],
      1800
    )

  ]);


  /*
   ================================
   CENTRAL VALLEY
   ================================
  */

  await Promise.all([

    drawGroup(
      [
        "line-06"
      ],
      1000
    ),

    drawGroup(
      [
        "line-07"
      ],
      1200
    )

  ]);


  /*
    The central mountain region
    contains several short,
    intersecting branches.
  */

  await drawGroup(
    [
      "line-11",
      "line-13",
      "line-14"
    ],
    900
  );


  await Promise.all([

    drawGroup(
      [
        "line-12",
        "line-15"
      ],
      700
    ),

    drawGroup(
      [
        "line-08"
      ],
      1500
    )

  ]);


  /*
   ================================
   LOWER CENTER
   ================================
  */

  await Promise.all([

    drawGroup(
      [
        "line-09"
      ],
      1700
    ),

    drawGroup(
      [
        "line-10"
      ],
      1100
    )

  ]);


  /*
   ================================
   RIGHT SIDE
   ================================
  */

  await Promise.all([

    drawGroup(
      [
        "line-16"
      ],
      2200
    ),

    drawGroup(
      [
        "line-17",
        "line-18"
      ],
      1200
    )

  ]);


  await drawGroup(
    [
      "line-19",
      "line-20"
    ],
    1100
  );


  /*
    Remaining right-side paths.

    Since the vectorizer created
    29 paths, these form the final
    right mountain / valley
    silhouettes.
  */

  await Promise.all([

    drawGroup(
      [
        "line-21"
      ],
      2700
    ),

    drawGroup(
      [
        "line-22",
        "line-23",
        "line-24"
      ],
      1800
    )

  ]);


  await Promise.all([

    drawGroup(
      [
        "line-25",
        "line-26"
      ],
      1400
    ),

    drawGroup(
      [
        "line-27",
        "line-28",
        "line-29"
      ],
      1900
    )

  ]);


  revealInterface();

}


/*
------------------------------------
TEXT REVEAL
------------------------------------
*/

function revealInterface() {

  const items = [

    document.querySelector(
      ".location"
    ),

    document.querySelector(
      "h1"
    ),

    ...document.querySelectorAll(
      ".intro"
    ),

    document.querySelector(
      ".scroll-indicator"
    )

  ];


  items.forEach(
    (item, index) => {

      if (!item) {
        return;
      }

      setTimeout(() => {

        item.classList.add(
          "text-visible"
        );

      }, index * 180);

    }
  );

}


/*
------------------------------------
START
------------------------------------
*/

function init() {

  const paths =
    document.querySelectorAll(
      ".yosemite-line"
    );

  paths.forEach(preparePath);

  /*
    Force the browser to render the
    hidden state before animation starts.
  */
  document.body.offsetHeight;

  setTimeout(
    animateYosemite,
    500
  );
}

window.addEventListener(
  "DOMContentLoaded",
  init
);

init();