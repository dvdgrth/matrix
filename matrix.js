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
    constructor() {
        this.trails = [];
        this.lanesInUse = [];
        this.xGap = 15;
    }

    newTrail(trailSize) {
        let l;
        while (true) {
            const numberOfLanes = Math.floor(document.documentElement.scrollWidth / this.xGap);
            
            console.log(numberOfLanes);
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
    update() {
        console.log(this.lanesInUse);
        //TODO: replace magic numbers
        if (randomIntFromInterval(1, 10) === 1) {
            this.newTrail(randomIntFromInterval(10, 30));
        }

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
m = new Matrix();
let counter = 0;


initMatrixAnimation();



function initMatrixAnimation() { 
    window.addEventListener('resize', change_canvas_size);
    window.addEventListener('orientationchange', change_canvas_size);
    change_canvas_size();
    window.requestAnimationFrame(step);
}

function step() {
    // TODO: time
    counter++;
    if (counter >= 5) {
        counter = 0;
        m.update();
        m.draw();
    }
    
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