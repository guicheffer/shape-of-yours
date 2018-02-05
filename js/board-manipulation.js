{
// Genetal vars
const board = document.querySelector('.board');
const resetbutton = document.querySelector('.button--reset');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const pointRadius = 7.5;
const textPos = 18;

const color = {
  blue: '#798BB5',
  pointer: 'red',
  yellow: '#BDAA20',
}

// Vars for calc
let centerX = null;
let centerY = null;
let base = null;
let AC = null;
let BD = null;
let area = null;
let height = null;
let radius = null;

//Var for info
const info = {
  points: []
};

let dragging = false;
let selection = null;
let dragoffx = 0;
let dragoffy = 0;
let updatePoint = null;

canvas.width = board.clientWidth || board.offsetWidth;
canvas.height = board.clientHeight || board.offsetHeight;

Object.prototype.contains = function(mx, my) {
  return (this.x <= mx) && (this.x + pointRadius*2 >= mx) && (this.y <= my) && (this.y + pointRadius*2 >= my);
};

// Call the mouse position, check many dots are in the screen, call the dots/parallelogram draw function. Manage events
const handleMouseClick = (e) => {
  const position = getMouse(e);
  info.points.push({
      x: position.x,
      y: position.y,
  });

  drawPoint(position.x, position.y, pointRadius, color.pointer);
  context.fillText(info.points.length, position.x, position.y - textPos, 80);

  if (info.points.length === 3) {
    drawParallelogram(info.points);
    canvas.removeEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mousemove', mouseMove, true);
    canvas.addEventListener('mouseup', mouseUp, true);
  }
};

// User Interaction
const getMouse = (e) => {
  let x = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
  let y = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  return { x, y };
};

// Get initial click and check it this click is a dot selection
const mouseDown = (e) => {
  var mouse = getMouse(e);
  var mx = mouse.x;
  var my = mouse.y;
  var shapes = info.points;
  var l = shapes.length;

  for (var i = l - 2; i >= 0; i--) {

    if (shapes[i].contains(mx, my)) {
      var mySel = shapes[i];
      updatePoint = i;
      dragoffx = mx - mySel.x;
      dragoffy = my - mySel.y;
      dragging = true;
      selection = mySel;
      return;
    }
  }

  if (selection) {
    selection = null;
  }
};

// Get the mouse movement and call function to update the coordinates
const mouseMove = (e) => {
  if (dragging) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    var mouse = getMouse(e);

    selection.x = mouse.x - dragoffx;
    selection.y = mouse.y - dragoffy;

    updateView(selection, updatePoint);
  }
};

// redraw everything into the canvas accordingly user's drag movement, clear and update the information
const updateView = (newPoint, index) => {
  clearinfo();
  info.points[index] = newPoint;

  for(let i = 0; i < info.points.length - 1; i++) {
      drawPoint(info.points[i].x, info.points[i].y, pointRadius, color.pointer);
      context.fillText(i + 1, info.points[i].x, info.points[i].y - textPos, 80);
  }

  context.strokeStyle = color.blue;
  context.beginPath();
  context.moveTo(info.points[0].x, info.points[0].y);
  context.lineTo(info.points[1].x, info.points[1].y);
  context.lineTo(info.points[2].x, info.points[2].y);
  context.lineTo(info.points[3].x, info.points[3].y);
  context.closePath();
  context.lineWidth=3;
  context.stroke();

  info.parallelogram = createinfo(info.points);
  drawCircle(info.parallelogram.centerX, info.parallelogram.centerY, info.parallelogram.radius, color.yellow);
};

// Draw it
const drawParallelogram = (points) => {
  points.push({
      x: points[0].x + points[2].x -points[1].x,
      y: points[0].y + points[2].y -points[1].y,
  });

  context.strokeStyle = color.blue;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  context.lineTo(points[1].x, points[1].y);
  context.lineTo(points[2].x, points[2].y);
  context.lineTo(points[3].x, points[3].y);
  context.closePath();
  context.lineWidth=3;
  context.stroke();

  info.parallelogram = createinfo(info.points);
  drawCircle(info.parallelogram.centerX, info.parallelogram.centerY, info.parallelogram.radius, color.yellow);
};

const mouseUp = (e) => {
  dragging = false;
};

const drawCircle = (cx, cy, radius, color) => {
  context.strokeStyle=color;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2, true);
  context.stroke();
  info.circle = {
      area: (Math.PI*Math.pow(radius, 2)).toFixed(),
  };

  showinfo(info);
};

const drawPoint = (cx, cy, radius, color) => {
  context.fillStyle = color;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2, true);
  context.fill();
};

// info
const createinfo = (points) => {
  centerX = (points[0].x + points[1].x  + points[2].x + points[3].x) / 4;
  centerY = (points[0].y + points[1].y  + points[2].y + points[3].y) / 4;
  base = Math.max(Math.sqrt(Math.pow((points[3].x - points[0].x), 2) + Math.pow((points[3].y - [points[0].y]), 2)), Math.sqrt(Math.pow((points[1].x - points[0].x), 2) + Math.pow((points[1].y - [points[0].y]), 2)));
  AC = Math.sqrt(Math.pow((points[3].x - points[0].x), 2) + Math.pow((points[3].y - [points[0].y]), 2));
  BD = Math.sqrt(Math.pow((points[2].x - points[1].x), 2) + Math.pow((points[2].y - [points[1].y]), 2));
  area = ((AC * BD)/2).toFixed();
  height = area/base;
  radius = (height/2).toFixed();
  return {
    centerX: centerX,
    centerY: centerY,
    base: base,
    AC: AC,
    BD: BD,
    area: area,
    height: height,
    radius: radius,
  };
};

const showinfo = () => {
  document.querySelector('.info-content--dot-1').textContent = `${info.points[0].x}, ${info.points[0].y}`;
  document.querySelector('.info-content--dot-2').textContent = `${info.points[1].x}, ${info.points[1].y}`;
  document.querySelector('.info-content--dot-3').textContent = `${info.points[2].x}, ${info.points[2].y}`;
  document.querySelector('.info-content--area--parallelogram').textContent += ` ${info.parallelogram.area}`;
  document.querySelector('.info-content--area--circle').textContent += ` ${info.circle.area}`;
  document.querySelector('.info-none').classList.add('hidden');
  document.querySelector('.info-content').classList.remove('hidden');
};

const clearinfo = () => {
  document.querySelector('.info-none').classList.remove('hidden');
  document.querySelector('.info-content').classList.add('hidden');
  document.querySelector('.info-content--dot-1').textContent = '';
  document.querySelector('.info-content--dot-2').textContent = '';
  document.querySelector('.info-content--dot-3').textContent = '';
  document.querySelector('.info-content--area--parallelogram').textContent = 'Parallelogram: ';
  document.querySelector('.info-content--area--circle').textContent = 'Circle: ';
};

// Reset
const resetboard = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  info.points.length = 0;
  delete info.parallelogram;
  delete info.circle;
  clearinfo();
  canvas.removeEventListener('mousedown', mouseDown, true);
  canvas.removeEventListener('mousemove', mouseMove, true);
  canvas.removeEventListener('mouseup', mouseUp, true);
  canvas.addEventListener('mousedown', handleMouseClick);
};

canvas.addEventListener('mousedown', handleMouseClick);
resetbutton.addEventListener('mousedown', resetboard);
}
