//prepares paths to draw
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


//draw function
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


//takes branching paths

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

//drawing yosemite

async function animateYosemite() {

  await drawGroup(
    [
      //top of el cap -> to bottom
      "line-01",
      "line-02",
      "line-03",
      "line-04",
      "line-05",
      "line-09",


      //start of havasu falls range
      "line-25",
      "line-26",
      "line-27",
      "line-28",
      "line-23",
      "line-24",
      "line-21",

    ],
    1400
  );

  /*
    The central mountain region
    contains several short,
    intersecting branches.
  */

  await drawGroup(
    [
      "line-11",
      "line-13",
      "line-14",
      "line-08",
      "line-16",
      "line-07",
      "line-12",
      "line-15"
    ],
    1200
  );

  //the middle midground

  await Promise.all([

    drawGroup(
      [

        
        "line-19",
        "line-20",
        "line-29",
        "line-22",
        "line-11",
        "line-13",
        "line-14",
        "line-10",
        "line-17",
        "line-18"
      ],
      1000
    ),
  ]);

  revealInterface();
}



//revealing messages

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


//starting functions

function init() {

  const paths =
    document.querySelectorAll(
      ".yosemite-line"
    );

  paths.forEach(preparePath);


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