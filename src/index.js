import convexHull from 'monotone-convex-hull-2d';
import decomp from 'poly-decomp';
import {
    Bodies,
    Engine,
    Mouse,
    MouseConstraint,
    Render,
    Runner,
    World,
} from 'matter-js';

window.decomp = decomp;

const WIDTH = 1400;
const HEIGHT = 800;
const SCALE = 0.4;
const WALL = 100; // thickness

let engine = Engine.create();

// render
let render = Render.create({
    element: document.getElementById('playground'),
    engine: engine,
    options: {
        width: WIDTH,
        height: HEIGHT,
        wireframes: false
    }
});
Render.run(render);

// objects
let ground = Bodies.rectangle(0, HEIGHT, 2 * WIDTH, WALL, { isStatic: true });
World.add(engine.world, ground);
let ceiling = Bodies.rectangle(0, 0, 2 * WIDTH, WALL, { isStatic: true });
World.add(engine.world, ceiling);
let leftWall = Bodies.rectangle(0, 0, WALL, 2 * HEIGHT, { isStatic: true });
World.add(engine.world, leftWall);
let rightWall = Bodies.rectangle(WIDTH, 0, WALL, 2 * HEIGHT, { isStatic: true });
World.add(engine.world, rightWall);

var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
render.mouse = mouse;
World.add(engine.world, mouseConstraint);

// runner
let runner = Runner.create();
Runner.run(runner, engine);

function addBody(src, startX, startY) {
    var img = document.createElement('img');
    img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

        var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
        let minX = img.width, maxX = 0, maxY = 0;
        var points = [];
        for (var x = 0; x < img.width; x++) {
            for (var y = 0; y < img.height; y++) {
                var alpha = pixelData[4 * (y * img.width + x) + 3];
                if (alpha > 0) {
                    points.push([x, y]);
                    if (x < minX) {
                        minX = x;
                    }
                    if (x > maxX) {
                        maxX = x;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                }
            }
        }
        points.push([minX, maxY]);
        points.push([maxX, maxY]);

        var indices = convexHull(points);
        let polygon = [];
        for (var i = 0; i < indices.length; i++) {
            polygon.push({ x: points[indices[i]][0] * SCALE, y: points[indices[i]][1] * SCALE });
        }

        let body = Bodies.fromVertices(startX, startY, polygon, {
            render: {
                sprite: {
                    texture: src,
                    xScale: SCALE,
                    yScale: SCALE,
                }
            }
        });
        World.add(engine.world, body);
    }
    img.src = src;
}

const START_X = 160;
const DIST = 175;
const START_Y = 630;

addBody('./images/eva.png', START_X, START_Y);
addBody('./images/natalle.png', START_X + DIST, START_Y);
addBody('./images/yishiuan.png', START_X + 2 * DIST, START_Y);
addBody('./images/becky.png', START_X + 3 * DIST, START_Y);
addBody('./images/kevin.png', START_X + 4 * DIST, START_Y);
addBody('./images/michael.png', START_X + 5 * DIST, START_Y);
addBody('./images/tommy.png', START_X + 6 * DIST, START_Y);
