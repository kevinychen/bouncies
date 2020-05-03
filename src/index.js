import convexHull from 'monotone-convex-hull-2d';
import decomp from 'poly-decomp';
import {
    Bodies,
    Engine,
    Events,
    Mouse,
    MouseConstraint,
    Render,
    Runner,
    World,
} from 'matter-js';

window.decomp = decomp;

const WIDTH = 1800;
const HEIGHT = 800;
const SCALE = 0.4;
const WALL = 100; // thickness

const PEOPLE = ['eva', 'natalle', 'yishiuan', 'becky', 'kevin', 'michael', 'tommy'];

let engine = Engine.create();

// render
let render = Render.create({
    element: document.getElementById('playground'),
    engine: engine,
    options: {
        width: WIDTH,
        height: HEIGHT,
        wireframes: false,
        background: '#c9e0e1',
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

let rock = Bodies.rectangle(WIDTH - 100, HEIGHT / 2, 50, 50);
World.add(engine.world, rock);

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

// play sounds when people get hit
const audios = PEOPLE.map(_ => new Audio());
Events.on(engine, 'collisionStart', function(event) {
    const { bodyA, bodyB } = event.pairs[0];
    // assume slower body is the one that gets hit
    const slowerBody = bodyA.speed < bodyB.speed ? bodyA : bodyB;
    const index = PEOPLE.indexOf(slowerBody.label);
    if (index != -1) {
        const audio = audios[index];
        if (audio.paused) {
            audio.src = `./audio/${PEOPLE[index]}.mp3`;
            audio.currentTime = 0;
            audio.play();
        }
    }
});

// runner
let runner = Runner.create();
Runner.run(runner, engine);

function addBody(name, startX, startY) {
    const src = `./images/${name}.png`;
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
            label: name,
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

for (var i = 0; i < PEOPLE.length; i++) {
    addBody(PEOPLE[i], 160 + i * 235, 630);
}
