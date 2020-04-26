import concaveman from 'concaveman';

var img = document.getElementById('body_eva');
img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
    console.log(img.width + " " + img.height + " " + pixelData.length);
    var points = [];
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var alpha = pixelData[4 * (y * img.width + x) + 3];
            if (alpha > 0) {
                points.push([x, y]);
            }
        }
    }

    var polygon = concaveman(points);

    // debug
    var sketchpad = document.createElement('canvas');
    sketchpad.width = img.width;
    sketchpad.height = img.height;
    var ctx = sketchpad.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    /*
    ctx.fillStyle = 'orange';
    for (var i = 0; i < points.length; i++) {
        ctx.fillRect(points[i][0], points[i][1], 1, 1);
    }
    */
    ctx.beginPath();
    ctx.moveTo(polygon[0][0], polygon[0][1]);
    for (var i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i][0], polygon[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
    document.body.appendChild(sketchpad);
}
img.src = "./images/eva.png";
