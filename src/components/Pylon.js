import { motion } from "framer-motion";
import chroma from "chroma-js";
import CryptoJS from "crypto-js";
// Function to generate SHA-256 hash synchronously using crypto-js
function sha256Sync(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex); // Generate SHA-256 hash and return as hex string
}

// Simple PRNG based on a numerical seed (derived from the SHA-256 hash)
function seededPRNG(seed) {
    let h = 1779033703 ^ seed;
    
    h = Math.imul(h, 3432918353);
    h = (h << 13) | (h >>> 19);

    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296; // Convert to a float between 0 and 1
    };
}

// Main function: it takes an `id` (a string), and returns a function that generates random numbers between `from` and `to`
function randomGenerator(id) {
    
    const hash = sha256Sync(id); // Synchronously get SHA-256 hash of the id
    const seed = parseInt(hash.slice(0, 8), 16); // Use first 8 characters of the hash as a seed
    const randomFunc = seededPRNG(seed); // Create PRNG using the seed

    // Return a function that generates random numbers between `from` and `to`
    return function (from, to) {
        return Math.floor(randomFunc() * (to - from + 1)) + from; // Generate random number in range [from, to]
    };
}


// List of 30 good color pairs (from, to)
const colorPairs = [
    ["#fafa6e", "#2A4858"],
    ["#ff6f61", "#6b5b95"],
    ["#92a8d1", "#f7cac9"],
    ["#88b04b", "#d65076"],
    ["#45b8ac", "#e94b3c"],
    ["#6b5b95", "#feb236"],
    ["#d64161", "#ff7b25"],
    ["#ffe382", "#92a8d1"],
    ["#034f84", "#f7786b"],
    ["#c94c4c", "#50394c"],
    ["#fad02e", "#d11141"],
    ["#00b159", "#00aedb"],
    ["#f37735", "#ffc425"],
    ["#7bc043", "#ee4035"],
    ["#0392cf", "#fdf498"],
    ["#6a0572", "#b1cbbb"],
    ["#ffb997", "#f67e7d"],
    ["#843b62", "#f08a5d"],
    ["#36486b", "#f18973"],
    ["#6c5b7b", "#c06c84"],
    ["#355c7d", "#6c5b7b"],
    ["#c06c84", "#f67280"],
    ["#f8b195", "#f67280"],
    ["#abebc6", "#5499c7"],
    ["#34495e", "#1abc9c"],
    ["#16a085", "#27ae60"],
    ["#2980b9", "#2ecc71"],
    ["#8e44ad", "#c0392b"],
    ["#e74c3c", "#ecf0f1"],
    ["#2c3e50", "#bdc3c7"]
];


export const FactoryTypeIcon = (p) => {

    const rng = randomGenerator(p.factory);
    const rng2 = randomGenerator(p.type_id);


    const outerColors = chroma.scale(colorPairs[rng(0, colorPairs.length)]).mode("lch").colors(6);


    return (
        <motion.svg
            width={p.width}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            {createHexagon(50, 50, outerColors, 50, 0.3, 30)}
            {createHexagon(50, 50, chroma.scale(colorPairs[rng2(0, colorPairs.length)]).mode("lch").colors(6), 30, 1)}
            

        </motion.svg>
    );
}


export const Nodeicon = (p) => {
    const rngf = randomGenerator(p.factory+"");
    const rngt = randomGenerator(p.type_id+"");

    const rng = randomGenerator(p.id+"");



    return (
        <motion.svg
            width={p.width}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            {createHexagon(50, 50, chroma.scale(colorPairs[rngf(0, colorPairs.length)]).mode("lch").colors(6), 50, 0.3, 30)}
   
            {createHexagon(50, 50, chroma.scale(colorPairs[rngt(0, colorPairs.length)]).mode("lch").colors(6), 40, 0.3)}
            {createHexagon(50, 50, chroma.scale(colorPairs[rng(0, colorPairs.length)]).mode("lch").colors(6), 30, 1, 30)}
            

        </motion.svg>
    );
}

export const Pylon = (p) => {

    const rng = randomGenerator(p.id);


    // Select random color pairs based on the hash for outer and inner hexagons
    const outerColorPair = colorPairs[rng(0, colorPairs.length)];
    const innerColorPair = colorPairs[rng(0, colorPairs.length)];

    // Create color scales using chroma.js
    const outerColors = chroma.scale(outerColorPair).mode("lch").colors(6);
    const innerColors = chroma.scale(innerColorPair).mode("lch").colors(6);


    return (
        <motion.svg
            width={p.width}
            viewBox="0 0 100 150"
            xmlns="http://www.w3.org/2000/svg"
        >
            {createHexagon(50, 100, outerColors, 50, 0.3)}
            {createHexagon(50, 50, outerColors, 50, 0.3)}
            {createHexagon(50, 50, innerColors, 25, 1)}
            {createHexagon(50, 75, innerColors, 25, 1)}
            {createHexagon(50, 100, innerColors, 25, 1)}

        </motion.svg>
    );
};


const createHexagon = (x, y, outerColors, radiusOuter, o, rotation=0) => {
    const rotationAngle = Math.PI / 6; // 30 degrees in radians

    // Function to calculate rotated points for the hexagon vertices
    const getHexagonPoints = (cx, cy, radius, rotation) => {
        const angle_deg = 60;
        const angle_rad = Math.PI / 180 * angle_deg;
        const points = [];

        for (let i = 0; i < 6; i++) {
            const angle = i * angle_rad + rotation;
            const px = cx + radius * Math.cos(angle);
            const py = cy + radius * Math.sin(angle);
            points.push({ x: px, y: py });
        }

        return points;
    };

    // Get the points for outer and inner hexagons, rotated by 30 degrees
    const outerPoints = getHexagonPoints(x, y, radiusOuter, rotationAngle);

    return (
        <>
            {/* Outer Hexagon Triangles */}
            <polygon
                points={`${x},${y} ${outerPoints[0].x},${outerPoints[0].y} ${outerPoints[1].x},${outerPoints[1].y}`}
                fill={outerColors[0]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />
            <polygon
                points={`${x},${y} ${outerPoints[1].x},${outerPoints[1].y} ${outerPoints[2].x},${outerPoints[2].y}`}
                fill={outerColors[1]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />
            <polygon
                points={`${x},${y} ${outerPoints[2].x},${outerPoints[2].y} ${outerPoints[3].x},${outerPoints[3].y}`}
                fill={outerColors[2]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />
            <polygon
                points={`${x},${y} ${outerPoints[3].x},${outerPoints[3].y} ${outerPoints[4].x},${outerPoints[4].y}`}
                fill={outerColors[3]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />
            <polygon
                points={`${x},${y} ${outerPoints[4].x},${outerPoints[4].y} ${outerPoints[5].x},${outerPoints[5].y}`}
                fill={outerColors[4]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />
            <polygon
                points={`${x},${y} ${outerPoints[5].x},${outerPoints[5].y} ${outerPoints[0].x},${outerPoints[0].y}`}
                fill={outerColors[5]}
                opacity={o}
                transform={rotation?`rotate(${rotation}, ${x}, ${y})`:""}  // Apply the rotation
                />

        </>
    );
};

