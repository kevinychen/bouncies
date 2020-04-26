import convexHull from 'monotone-convex-hull-2d';
import decomp from 'poly-decomp';
import Matter from 'matter-js';

window.decomp = decomp;

var img = document.getElementById('body_eva');
img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
    var points = [];
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var alpha = pixelData[4 * (y * img.width + x) + 3];
            if (alpha > 0) {
                points.push([x, y]);
            }
        }
    }

    var indices = convexHull(points);
    let polygon = [];
    for (var i = 0; i < indices.length; i++) {
        polygon.push({ x: points[indices[i]][0], y: points[indices[i]][1] });
    }

    let engine = Matter.Engine.create();

    // render
    let render = Matter.Render.create({
        element: document.getElementById('playground'),
        engine: engine,
        options: {
            width: 1000,
            height: 800,
            wireframes: false
        }
    });
    Matter.Render.run(render);

    // runner
    let runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let body = Matter.Bodies.fromVertices(100, 100, polygon, {
        render: {
            sprite: {
                texture: './images/eva.png'
            }
        }
    });
    Matter.World.add(engine.world, body);
}
img.src = "./images/eva.png";
