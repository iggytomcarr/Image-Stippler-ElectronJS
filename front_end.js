console.log('Front End is working');


// const loadImageButton = document.getElementById('loadImageButton');
const hiddenFileInput = document.getElementById('hiddenFileInput');
const saveImageButton = document.getElementById('saveImageButton');

const imagePreview = document.getElementById('imagePreview');
const startButton = document.getElementById('startButton');

let imagePath =''
let imageToProcess;
let points = [];
let delaunay, voronoi;



startButton.addEventListener('click', () => {
    console.log('Start Button Clicked');

    /// Check to see if a file has been selected
    if (!imagePath || imagePath.length === 0) {
        // Show error to the user
        alert('No file selected! Please choose an image first.');
        return;
    }

    // If a file is selected, continue with your logic
    console.log('File is selected, proceeding...');


    processImage()

});



document.getElementById('loadImageButton').addEventListener('click', async () => {

    imagePath = await window.electronAPI.selectImage();
    if (imagePath) {
        console.log("Image path -> " + imagePath);
        imagePreview.src = imagePath;


    } else {
        console.log('No image selected.')
    }

});



saveImageButton.addEventListener('click', () => {
    console.log('Save Image Button Clicked');
});


function processImage() {
    console.log('Processing Image Function Called');

    setup()






}

function setup() {

    console.log('Image to process path:')
    console.log(imagePath)
    imageToProcess = loadImage(imagePath)

    // setup p5 canvas
    const canvas = createCanvas(400, 400); // Adjust dimensions as needed
    canvas.parent('imageOutput');

    for (let i = 0; i < 1000; i++) {
        let x = random(width);
        let y = random(height);
        let col = imageToProcess.get(x, y);
        if (random(100) > brightness(col)) {
            points.push(createVector(x, y));
        } else {
            i--;
        }
    }

    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);

}

function draw() {
    background(255);

    let polygons = voronoi.cellPolygons();
    let cells = Array.from(polygons);

    let centroids = new Array(cells.length);
    let weights = new Array(cells.length).fill(0);
    let counts = new Array(cells.length).fill(0);
    let avgWeights = new Array(cells.length).fill(0);
    for (let i = 0; i < centroids.length; i++) {
        centroids[i] = createVector(0, 0);
    }

    imageToProcess.loadPixels();
    let delaunayIndex = 0;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let index = (i + j * width) * 4;
            let r = imageToProcess.pixels[index + 0];
            let g = imageToProcess.pixels[index + 1];
            let b = imageToProcess.pixels[index + 2];
            let bright = (r + g + b) / 3;
            let weight = 1 - bright / 255;
            delaunayIndex = delaunay.find(i, j, delaunayIndex);
            centroids[delaunayIndex].x += i * weight;
            centroids[delaunayIndex].y += j * weight;
            weights[delaunayIndex] += weight;
            counts[delaunayIndex]++;
        }
    }

    let maxWeight = 0;
    for (let i = 0; i < centroids.length; i++) {
        if (weights[i] > 0) {
            centroids[i].div(weights[i]);
            avgWeights[i] = weights[i] / (counts[i] || 1);
            if (avgWeights[i] > maxWeight) {
                maxWeight = avgWeights[i];
            }
        } else {
            centroids[i] = points[i].copy();
        }
    }

    for (let i = 0; i < points.length; i++) {
        points[i].lerp(centroids[i], 0.5);
    }

    // for (let i = 0; i < cells.length; i++) {
    //   let poly = cells[i];
    //   let centroid = centroids[i];
    //   let col =gloria.get(centroid.x, centroid.y)
    //   stroke(0);
    //   strokeWeight(0.5);
    //   fill(col);
    //   beginShape();
    //   for (let i = 0; i < poly.length; i++) {
    //     vertex(poly[i][0], poly[i][1]);
    //   }
    //   endShape();
    // }

    for (let i = 0; i < points.length; i++) {
        let v = points[i];
        let col = imageToProcess.get(v.x, v.y);
        stroke(col);
        //stroke(0);
        let sw = map(avgWeights[i], 0, maxWeight, 1, 14, true);
        //sw = 4;
        strokeWeight(sw);
        point(v.x, v.y);
    }

    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);
}

function calculateDelaunay(points) {
    let pointsArray = [];
    for (let v of points) {
        pointsArray.push(v.x, v.y);
    }
    return new d3.Delaunay(pointsArray);
}