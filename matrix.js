class CharTrail {
    constructor(x, trailSize=20) {
        this.x = x;
        this.y = 0;
        this.chars = [];
        this.gap = 25;
        this.trailSize = trailSize;
        this.age = 0;
    }

    createNewChar() {
        return get_random_char();
    }

    mature() {
        return (this.age > this.trailSize);
    }

    dead() {
        return (this.chars.length === 0 && this.mature());
    }

    update() {
        if(this.chars.length <= this.trailSize) {
            this.chars.push(this.createNewChar());
            this.y += this.gap;
            this.age += 1;
        }
        if(this.y - this.gap > document.documentElement.scrollHeight) {
            this.chars.pop();
            this.y -= this.gap;
        }
        if(this.mature()) {
            this.chars.shift();
        }

        for (let i = 0; i < this.chars.length; i++) {
            if (randomIntFromInterval(0, 10) == 0) {
                this.chars[i] = this.createNewChar();
            }
        }
    }

    draw(ctx) {
        let yy = this.y - this.gap;
        for (let i = this.chars.length - 1; i > 0; i--) {
            ctx.globalAlpha = (i + 1) * (1 / (this.chars.length + 1));
            ctx.fillText(this.chars[i], this.x, yy);
            yy -= this.gap;
        }
    }
}

class Matrix {
    constructor(options = {})
    {
        this.xGap = options.xGap || 20;
        this.newPerSecond =  options.newPerSecond || 2;
        this.minSize =  options.minSize || 15;
        this.maxSize =  options.maxSize || 30;
        this.updatesPerSecond = options.updatesPerSecond || 50;

        this.trails = [];
        this.lanesInUse = [];
        this.expected = Math.floor(1000/this.newPerSecond); // Expected ms until new trail.
        this.updateAfterMs = Math.floor(1000 / this.updatesPerSecond);
        this.msSinceLastUpdate = 0;
    }

    set spawnRate(rate) {
        this.newPerSecond = rate;
        this.expected = Math.floor(1000/this.newPerSecond);
    }

    set speedRate(rate) {
        this.updatesPerSecond = rate;
        this.updateAfterMs = Math.floor(1000 / this.updatesPerSecond);
    }

    // TODO: Maybe change Algo (too much looping when near the max number of lanes?).
    newTrail(trailSize) {
        let l;
        while (true) {
            const numberOfLanes = Math.floor(document.documentElement.scrollWidth / this.xGap);
            
            l = randomIntFromInterval(0, numberOfLanes);

            if(!(this.lanesInUse.includes(l))) {
                this.trails.push(new CharTrail(l * this.xGap, trailSize));
                this.lanesInUse.push(l);
                break;
            }
            if (this.lanesInUse.length >= numberOfLanes) {
                break;
            }
        }
    }
    update(delta) {
        //TODO: BUG: add another counter for creation.
        if (randomIntFromInterval(0, this.expected) <= delta) {
            this.newTrail(randomIntFromInterval(this.minSize, this.maxSize));
        }
        // console.log(this.msSinceLastUpdate += delta); // Test.
        this.msSinceLastUpdate += delta;
        if(this.msSinceLastUpdate >= this.updateAfterMs) {
            // how many?
            const howManyUpdates = Math.floor(this.msSinceLastUpdate / this.updateAfterMs)
            this.msSinceLastUpdate = this.msSinceLastUpdate % this.updateAfterMs;
            console.log(this.msSinceLastUpdate);
            for (let i = 0; i < howManyUpdates; i++) {
                for (const trail of this.trails) {
                    trail.update();
        
                    if(trail.dead()) {
                        let index = this.trails.indexOf(trail);
                        if (index > -1) {
                            this.trails.splice(index, 1);
                            index = this.lanesInUse.indexOf(trail.x / this.xGap);
                            if (index > -1) {
                                this.lanesInUse.splice(index, 1);
                            } 
                        }
                    }
                }
            }
        }
    }
    draw() {
        let canvas = document.querySelector("canvas");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FF8717";
        //   ctx.fillStyle = "#FD5F00";
        ctx.font = "20px Arial";
        // ctx.shadowColor = "#ffc19b";
        // ctx.shadowBlur = 50;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const trail of this.trails) {
            trail.draw(ctx);
        }
    }
}

let c = new CharTrail(100);
m = new Matrix({newPerSecond:10, updatesPerSecond:40});
let counter = 0;
let lastTime = Date.now();
let newTime = Date.now();


initMatrixAnimation();
initSliders();


function initMatrixAnimation() { 
    window.addEventListener('resize', change_canvas_size);
    window.addEventListener('orientationchange', change_canvas_size);
    change_canvas_size();
    window.requestAnimationFrame(step);
}

function step() {
    newTime = Date.now();
    delta = newTime-lastTime
    lastTime = newTime;
    m.update(delta);
    m.draw();
    
    window.requestAnimationFrame(step);
}

function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function get_random_index() {
    return randomIntFromInterval(0, char_list.length - 1);
}

function get_random_char() {
    // return String.fromCharCode(randomIntFromInterval(33, 126)); // ascii
    // return String.fromCharCode(randomIntFromInterval(48, 57)); // 0-9
    return String.fromCharCode(randomIntFromInterval(48, 49)); // 0,1
    // return String.fromCharCode(randomIntFromInterval(0, 10000)); // unicode
    // return String.fromCharCode(randomIntFromInterval(65, 90)); // A-Z
}

function change_canvas_size() {
    var canvas = document.querySelector("canvas");
    canvas.width = 0;
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}

function initSliders() {
    const spawnSlider = document.getElementById("spawn-slider");
    spawnSlider.addEventListener("input", spawnSliderChange);
    spawnSlider.value = m.newPerSecond;
    document.getElementById("spawn-slider-label").innerHTML = `spawn rate: ${m.newPerSecond} per second`;

    const speedSlider = document.getElementById("speed-slider");
    speedSlider.addEventListener("input", speedSliderChange);
    speedSlider.value = m.updatesPerSecond;
    document.getElementById("speed-slider-label").innerHTML = `speed rate: ${m.updatesPerSecond} per second`;
}

function spawnSliderChange() {
    if (m) {
        m.spawnRate = parseInt(this.value);
        const spawnSlider = document.getElementById("spawn-slider");
        document.getElementById("spawn-slider-label").innerHTML = `spawn rate: ${spawnSlider.value} per second`;
    }
}

function speedSliderChange() {
    if (m) {
        m.speedRate = parseInt(this.value);
        const speedSlider = document.getElementById("speed-slider");
        document.getElementById("speed-slider-label").innerHTML = `speed rate: ${speedSlider.value} per second`;
    }
}