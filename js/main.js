import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";


let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let planet_sun_label;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let tooltip = document.createElement("div");

let mercury_orbit_radius = 50;
let venus_orbit_radius = 60;
let earth_orbit_radius = 70;
let mars_orbit_radius = 80;
let jupiter_orbit_radius = 100;
let saturn_orbit_radius = 120;
let uranus_orbit_radius = 140;
let neptune_orbit_radius = 160;

let mercury_revolution_speed = 2;
let venus_revolution_speed = 1.5;
let earth_revolution_speed = 1;
let mars_revolution_speed = 0.8;
let jupiter_revolution_speed = 0.7;
let saturn_revolution_speed = 0.6;
let uranus_revolution_speed = 0.5;
let neptune_revolution_speed = 0.4;

function createMaterialArray() {
  const skyboxImagepaths = ['../img/skybox/space_ft.png', '../img/skybox/space_bk.png', '../img/skybox/space_up.png', '../img/skybox/space_dn.png', '../img/skybox/space_rt.png', '../img/skybox/space_lf.png'];
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function heading(text) {
  const headingElement = document.createElement("h1");
  headingElement.textContent = text;
  headingElement.style.position = "fixed";
  headingElement.style.top = "10px";
  headingElement.style.left = "50%";
  headingElement.style.transform = "translateX(-50%)";
  headingElement.style.color = "white";
  headingElement.style.zIndex = "1000";
  headingElement.style.fontFamily = "Arial, sans-serif";
  headingElement.style.fontSize = "26px";
  headingElement.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.7)";
  document.body.appendChild(headingElement);
  return headingElement;
}
heading("Solar System Simulation");


function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  const planetTexture = loader.load(texture);
  const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(geometry, material);
  return planet;
}

function createRing(innerRadius) {
  let outerRadius = innerRadius - 0.1;
  let thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

  setSkyBox();
  planet_earth = loadPlanetTexture("../img/earth_hd.jpg", 4, 100, 100, 'standard');
  planet_sun = loadPlanetTexture("../img/sun_hd.jpg", 20, 100, 100, 'basic');
  planet_mercury = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100, 'standard');
  planet_venus = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100, 'standard');
  planet_mars = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100, 'standard');
  planet_jupiter = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100, 'standard');
  planet_saturn = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100, 'standard');
  planet_uranus = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100, 'standard');
  planet_neptune = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100, 'standard');

  planet_mercury.name = "Mercury";
  planet_venus.name = "Venus";
  planet_earth.name = "Earth";
  planet_mars.name = "Mars";
  planet_jupiter.name = "Jupiter";
  planet_saturn.name = "Saturn";
  planet_uranus.name = "Uranus";
  planet_neptune.name = "Neptune";
  planet_sun.name = "Sun";

  scene.add(planet_earth);
  scene.add(planet_sun);
  scene.add(planet_mercury);
  scene.add(planet_venus);
  scene.add(planet_mars);
  scene.add(planet_jupiter);
  scene.add(planet_saturn);
  scene.add(planet_uranus);
  scene.add(planet_neptune);

  const sunLight = new THREE.PointLight(0xffffff, 1, 0);
  sunLight.position.copy(planet_sun.position);
  scene.add(sunLight);

  createRing(mercury_orbit_radius);
  createRing(venus_orbit_radius);
  createRing(earth_orbit_radius);
  createRing(mars_orbit_radius);
  createRing(jupiter_orbit_radius);
  createRing(saturn_orbit_radius);
  createRing(uranus_orbit_radius);
  createRing(neptune_orbit_radius);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;
  camera.position.z = 100;

  createSpeedControlUI();

  tooltip.style.position = "fixed";
  tooltip.style.color = "white";
  tooltip.style.background = "rgba(0, 0, 0, 0.7)";
  tooltip.style.padding = "4px 8px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  window.addEventListener("mousemove", onMouseMove, false);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0 && intersects[0].object.name) {
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
    tooltip.innerHTML = intersects[0].object.name;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
}

function planetRevolver(time, speed, planet, orbitRadius) {
  let orbitSpeedMultiplier = 0.001;
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}

let paused = false;
const toggleBtn = document.createElement("button");
toggleBtn.textContent = "Pause";
toggleBtn.className = "btn";
toggleBtn.style.position = "fixed";
toggleBtn.style.top = "20px";
toggleBtn.style.right = "20px";
toggleBtn.style.zIndex = "1000";
document.body.appendChild(toggleBtn);

toggleBtn.addEventListener("click", () => {
  paused = !paused;
  toggleBtn.textContent = paused ? "Resume" : "Pause";
  toggleBtn.style.backgroundColor = paused ? "red" : "white";
  toggleBtn.style.color = paused ? "white" : "black";
});

function createSpeedControlUI() {
  const speeds = {
    mercury: mercury_revolution_speed,
    venus: venus_revolution_speed,
    earth: earth_revolution_speed,
    mars: mars_revolution_speed,
    jupiter: jupiter_revolution_speed,
    saturn: saturn_revolution_speed,
    uranus: uranus_revolution_speed,
    neptune: neptune_revolution_speed,
  };

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.left = "20px";
  container.style.padding = "10px";
  container.style.background = "rgba(0,0,0,0.6)";
  container.style.color = "white";
  container.style.borderRadius = "8px";
  container.style.fontFamily = "sans-serif";
  document.body.appendChild(container);

  Object.keys(speeds).forEach((planet) => {
    const label = document.createElement("label");
    label.innerHTML = `<div style='margin-bottom:6px;'>${planet.charAt(0).toUpperCase() + planet.slice(1)} <input type='range' min='0' max='5' step='0.1' value='${speeds[planet]}' id='${planet}-slider'></div>`;
    container.appendChild(label);
    document.getElementById(`${planet}-slider`).addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      switch (planet) {
        case 'mercury': mercury_revolution_speed = value; break;
        case 'venus': venus_revolution_speed = value; break;
        case 'earth': earth_revolution_speed = value; break;
        case 'mars': mars_revolution_speed = value; break;
        case 'jupiter': jupiter_revolution_speed = value; break;
        case 'saturn': saturn_revolution_speed = value; break;
        case 'uranus': uranus_revolution_speed = value; break;
        case 'neptune': neptune_revolution_speed = value; break;
      }
    });
  });
}

function render(time) {
  requestAnimationFrame(render);
  if (paused) return;

  const rotationSpeed = 0.005;
  planet_earth.rotation.y += rotationSpeed;
  planet_sun.rotation.y += rotationSpeed;
  planet_mercury.rotation.y += rotationSpeed;
  planet_venus.rotation.y += rotationSpeed;
  planet_mars.rotation.y += rotationSpeed;
  planet_jupiter.rotation.y += rotationSpeed;
  planet_saturn.rotation.y += rotationSpeed;
  planet_uranus.rotation.y += rotationSpeed;
  planet_neptune.rotation.y += rotationSpeed;

  planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius);
  planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius);
  planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius);
  planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius);
  planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius);
  planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius);
  planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius);
  planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius);

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

init();
render(0);
