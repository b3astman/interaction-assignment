function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.count = 0;
    this.reproduce = 0;
    this.timeHungry = 0;
    this.it = true;
    this.colors = ["Red", "Green", "Blue", "Cyan", "Orange", "Fuchsia", "Lime", 
    "Coral", "Pink", "Gray", "Indigo", "Purple"];
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), 
        this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y 
        * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};
Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};
Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};
Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};
Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    // if hungry for a few cycles , it dies
    if (this.timeHungry > 10) {
        // console.log('hungry');
        this.removeFromWorld = true;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    // collision with wall
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    // collision with wall
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    // check collision with other entities
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        // if there is a collision with another entity
        if (ent !== this && this.collide(ent)) {
            // should start following the it
            if (ent.color != this.color) {
                if (this.radius <= ent.radius) {
                    this.removeFromWorld = true;
                    ent.radius += 1;
                    ent.count++;
                    killed++;
                    // this.timeHungry += this.game.clockTick;
                } else {
                    this.timeHungry = 0;
                    this.reproduce++;
                    ent.removeFromWorld;
                    killed++;

                    if (this.reproduce > 2) {
                        var child = new Circle(gameEngine);
                        child.color = this.color;
                        child.radius = 4;
                        gameEngine.addEntity(child);
                        it.push(child);
                        console.log('spawn new');
                        spawned++;
                    }
                }
            // collsion occurs
            } else { 
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x)/dist;
                var difY = (this.y - ent.y)/dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
        }
    }
    this.timeHungry += this.game.clockTick;
    // console.log(this.timeHungry);
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    Entity.prototype.update.call(this);

    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

    var canvas = document.getElementById('gameWorld');
    var opacity = 20;

    it.sort(function(a, b) {
        var size1 = a.radius, size2 = b.radius;
        return size2 - size1;
    });

// display radius sizes
    for (var i = 0; i <= 3; i++) {
        var enemy = document.getElementById('enemy' + (i + 1));
        enemy.innerHTML = this.colors[it[i].color] + " Size: " 
            + it[i].radius;
    }

// display most kills counts
    it.sort(function(a, b) {
        var size1 = a.count, size2 = b.count;
        return size2 - size1;
    });
    for (var i = 0; i <= 3; i++) {
        var enemy = document.getElementById('kills' + (i + 1));
        enemy.innerHTML = this.colors[it[i].color] + " Count: " 
            + it[i].count;
    }

    document.getElementById('spawned').innerHTML = "<b>Creatures Spawned</b> " + spawned;
    document.getElementById('killed').innerHTML = "<b>Creatures Killed</b> " + killed;

};

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var spawned = 0;
var killed = 0;

var refresh = 0;
var it = [];
var ASSET_MANAGER = new AssetManager();
var gameEngine = new GameEngine();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < 60; i++) {
        var circle = new Circle(gameEngine);
        circle.color =  3;
        circle.radius = 4;
        gameEngine.addEntity(circle);
        it.push(circle);
        spawned++;
    }

    for (var i = 0; i < 60; i++) {
        var circle2 = new Circle(gameEngine);
        circle2.radius = 4;
        circle2.color = 11;
        gameEngine.addEntity(circle2);
        it.push(circle2);
        spawned++;
    }

    for (var i = 0; i < 60; i++) {
        var circle3 = new Circle(gameEngine);
        circle3.radius = 4;
        circle3.color = 10;
        gameEngine.addEntity(circle3);
        it.push(circle3);
        spawned++;
    }

    for (var i = 0; i < 100; i++) {
        var circle4 = new Circle(gameEngine);
        circle4.radius = 4;
        circle4.color = 9;
        gameEngine.addEntity(circle4);
        it.push(circle4);
        spawned++;
    }

    gameEngine.init(ctx);
    gameEngine.start();
});
