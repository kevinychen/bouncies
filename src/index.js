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

let engine = Engine.create();

// render
let render = Render.create({
    element: document.getElementById('playground'),
    engine: engine,
    options: {
        width: 1400,
        height: 900,
        wireframes: false
    }
});
Render.run(render);

// objects
let ground = Bodies.rectangle(0, 900, 2800, 100, { isStatic: true });
World.add(engine.world, ground);
let ceiling = Bodies.rectangle(0, 0, 2800, 100, { isStatic: true });
World.add(engine.world, ceiling);
let leftWall = Bodies.rectangle(0, 0, 100, 1800, { isStatic: true });
World.add(engine.world, leftWall);
let rightWall = Bodies.rectangle(1400, 0, 100, 1800, { isStatic: true });
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
            polygon.push({ x: points[indices[i]][0], y: points[indices[i]][1] });
        }

        let body = Bodies.fromVertices(startX, startY, polygon, {
            render: {
                sprite: {
                    texture: src,
                }
            }
        });
        World.add(engine.world, body);
    }
    img.src = src;
}

addBody('./images/eva.png', 300, 500);
addBody('./images/natalle.png', 700, 500);
