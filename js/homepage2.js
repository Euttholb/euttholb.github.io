const sleep = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};


async function typeWriter(
  element,
  text,
  speed = 110
) {

  for (const character of text) {

    element.textContent += character;

    await sleep(speed);

  }

}

function initParallax() {

  const background =
    document.querySelector(".hero-background");

  const hero =
    document.querySelector(".hero");

  if (!background || !hero) {
    return;
  }


  const maxMovement = 12;


  hero.addEventListener(
    "mousemove",
    (event) => {

      const rect =
        hero.getBoundingClientRect();

      const mouseX =
        (event.clientX - rect.left)
        / rect.width;

      const mouseY =
        (event.clientY - rect.top)
        / rect.height;

      const normalizedX =
        (mouseX - 0.5) * 2;

      const normalizedY =
        (mouseY - 0.5) * 2;

      const moveX =
        normalizedX
        * -maxMovement;

      const moveY =
        normalizedY
        * -maxMovement;


      background.style.setProperty(
        "--parallax-x",
        `${moveX}px`
      );

      background.style.setProperty(
        "--parallax-y",
        `${moveY}px`
      );

    }
  );

  hero.addEventListener(
    "mouseleave",
    () => {

      background.style.setProperty(
        "--parallax-x",
        "0px"
      );

      background.style.setProperty(
        "--parallax-y",
        "0px"
      );

    }
  );

}


async function animateHomepage() {

  const title =
    document.querySelector("#hero-title");

  const typewriter =
    document.querySelector("#typewriter");

  const cursor =
    document.querySelector(".cursor");

  const background =
    document.querySelector(".hero-background");

  const overlay =
    document.querySelector(".hero-overlay");

  const info =
    document.querySelector(".hero-info");

  const scrollIndicator =
    document.querySelector(".scroll-indicator");

  await sleep(600);


  await typeWriter(
    typewriter,
    "Kash Projects",
    150
  );
  await sleep(700);

  cursor.classList.add("hidden");

  title.classList.add(
    "title-positioned"
  );

  await sleep(1200);

  background.classList.add(
    "focused"
  );

  overlay.classList.add(
    "focused"
  );

  await sleep(1800);

  background.classList.add(
  "parallax-ready"
);

  info.classList.add(
    "visible"
  );

  await sleep(400);

  scrollIndicator.classList.add(
    "visible"
  );

}

window.addEventListener(
  "DOMContentLoaded",
  () => {

    animateHomepage();
    initParallax();

  }
);