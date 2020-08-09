// TODO: Look for divisions by zero.

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
            if (randomIntFromInterval(0, 8) == 0) {
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

        this.debugCounterTime = 0;
        this.debugCounterSpawns = 0;
    }

    set spawnRate(rate) {
        this.newPerSecond = rate;
        this.expected = Math.floor(1000/this.newPerSecond);
    }

    set speedRate(rate) {
        this.updatesPerSecond = rate;
        this.updateAfterMs = Math.floor(1000 / this.updatesPerSecond);
    }

    debugUpdate(delta) {
        this.debugCounterTime += delta;
        if(this.debugCounterTime >= 1000) {
            console.log(this.debugCounterSpawns);
            this.debugCounterTime = 0;
            this.debugCounterSpawns = 0;
        }
    }

    // TODO: Maybe change Algo (too much looping when near the max number of lanes?).
    newTrail(trailSize) {
        this.debugCounterSpawns += 1;
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
        this.createNewTrails(delta) 
        this.debugUpdate(delta);
        this.updateTrails(delta)
    }

    createNewTrails(delta) {
        // TODO: Double check for bugs. Especially the lower ranges. 
        if (( this.newPerSecond * delta) < 1000) {
            const threshold = delta * this.newPerSecond;
            if(randomIntFromInterval(1, 1000) <= threshold) {
                this.newTrail(randomIntFromInterval(this.minSize, this.maxSize));
            }
        } else {
            const howManyTries = 2 * Math.floor((this.newPerSecond * delta) / 1000);
            for (let i = 0; i < howManyTries; i++) {
                if(randomIntFromInterval(0, 1) === 1) {
                    this.newTrail(randomIntFromInterval(this.minSize, this.maxSize));
                }         
            }
        }
    }

    updateTrails(delta) {
        this.msSinceLastUpdate += delta;
        if(this.msSinceLastUpdate >= this.updateAfterMs) {
            const howManyUpdates = Math.floor(this.msSinceLastUpdate / this.updateAfterMs);
            this.msSinceLastUpdate = this.msSinceLastUpdate % this.updateAfterMs;
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
        ctx.font = "20px Arial";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const trail of this.trails) {
            trail.draw(ctx);
        }
    }
}

function initMatrixAnimation() { 
    window.addEventListener('resize', change_canvas_size);
    window.addEventListener('orientationchange', change_canvas_size);
    change_canvas_size();
    lastTime = Date.now();
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

function randomIntFromInterval(min, max) // Min and max included.
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
    var canvas = document.getElementById("matrix");
    canvas.width = 0;
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}

// TODO: Too much repetition here?
function initSliders() {
    const spawnSlider = document.getElementById("spawn-slider");
    spawnSlider.addEventListener("input", spawnSliderChange);
    spawnSlider.value = m.newPerSecond;
    document.getElementById("spawn-slider-label").innerHTML = `spawn rate: ${m.newPerSecond} per second`;

    const speedSlider = document.getElementById("speed-slider");
    speedSlider.addEventListener("input", speedSliderChange);
    speedSlider.value = m.updatesPerSecond;
    document.getElementById("speed-slider-label").innerHTML = `speed rate: ${m.updatesPerSecond} per second`;

    const minSlider = document.getElementById("min-slider");
    minSlider.addEventListener("input", minSliderChange);
    minSlider.value = m.minSize;
    document.getElementById("min-slider-label").innerHTML = `min length: ${m.minSize} chars`;

    const maxSlider = document.getElementById("max-slider");
    maxSlider.addEventListener("input", maxSliderChange);
    maxSlider.addEventListener("change", maxSliderChange);
    maxSlider.value = m.maxSize;
    document.getElementById("max-slider-label").innerHTML = `max length: ${m.maxSize} chars`;
}

function spawnSliderChange() {
    if (m) {
        m.spawnRate = parseInt(this.value);
        document.getElementById("spawn-slider-label").innerHTML = `spawn rate: ${m.newPerSecond} per second`;
    }
}

function speedSliderChange() {
    if (m) {
        m.speedRate = parseInt(this.value);
        document.getElementById("speed-slider-label").innerHTML = `speed rate: ${m.updatesPerSecond} per second`;
    }
}

function minSliderChange() {
    if (m) {
        let newMinValue = parseInt(this.value);
        if (newMinValue > document.getElementById("max-slider").value) {
            document.getElementById("min-slider-label").innerHTML = `min length: ${m.minSize} chars (MUST BE <= MAX VALUE)`;
            this.value = m.minSize;
            return;
        }
        m.minSize = parseInt(this.value);
        document.getElementById("min-slider-label").innerHTML = `min length: ${m.minSize} chars`;
    }
}

function maxSliderChange() {
    if (m) {
        let newMaxValue = parseInt(this.value);
        if (newMaxValue < document.getElementById("min-slider").value) {
            document.getElementById("max-slider-label").innerHTML = `max length: ${m.maxSize} chars (MUST BE >= MIN VALUE)`;
            this.value = m.maxSize;
            return;
        }
        m.maxSize = parseInt(this.value);
        document.getElementById("max-slider-label").innerHTML = `max length: ${m.maxSize} chars`;
    }
}

const m = new Matrix({newPerSecond:10, updatesPerSecond:40});
let lastTime;
let newTime;
initMatrixAnimation();
initSliders();