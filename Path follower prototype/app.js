//selects canvas
var canvas = document.getElementById('canvas');
//gets canvas context (what is going on in the canvas)
var ctx = canvas.getContext('2d');

//saves each path to the route
class path{
    constructor(start, end, radius){
        this.start = start;
        this.end = end;
        this.radius = radius;
    }
    draw(){
        ctx.beginPath();
        ctx.moveTo(this.start.x,this.start.y);
        ctx.lineTo(this.end.x ,this.end.y);
        ctx.strokeStyle = 'rgb(187, 188, 191)';
        ctx.lineWidth = this.radius * 2;
        ctx.stroke();
    }
    values(){
        return{
            start: this.start,
            end: this.end
        }
    }
}


//background class - saves the path for boids to follow
class bg{
    constructor(color, width, height, pColor, pathArr, pathComp){
        this.color = color;
        this.height = height;
        this.width = width;
        this.pColor = pColor;
        this.pathArr = pathArr;
        this.pathComp = pathComp;
    }
 
    //clears the canvas
    clear(){
        //if the path is complete it will redraw the path aswell as the background
        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill(); 
    }

}

//boid class
class boid{
    constructor(boidX, boidY, velocity, acceleration, maxVel){
        this.x = boidX;
        this.y = boidY;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxVel = maxVel;
    }

    // adds steering force
    steering(coords){
        this.desired  = coords;
        this.desired = this.desired.subtract(new Victor(this.x, this.y));
        let steer = this.desired.normalize();
        steer = steer.multiply(new Victor(this.maxVel, this.maxVel));
        let newVel = this.velocity;
        steer = steer.subtract(newVel);
        steer = steer.limit(0.07, 0.01);
        //steer = steer.limit(0.04, 0.5);
        steer = steer.limit(0.02, 0.66);
        if(this.velocity.magnitude() >= this.maxVel){
            this.acceleration = steer;
        }else{
            this.acceleration = this.acceleration.add(steer);
        }
        //console.log(steer.magnitude())
    }

    follow(start, end){
        let future  = this.velocity.clone();
        future.normalize()
        future.multiply(new Victor(40,40));
        let location = new Victor(this.x, this.y);
        location.add(future);
    
        
        ctx.beginPath();
        //creates circle at mouse pos so the path is rounded
        ctx.arc(location.x, location.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fill();
       

        let a = start.clone();
        let b = end.clone();

        let ap = location.clone();
        let ab = b.clone();

        ap.subtract(a);
        ab.subtract(a);

        ab.normalize();
        let dotAp = ap.dot(ab);
        ab.multiply(new Victor(dotAp, dotAp));

        let normalPoint = a.clone()
        normalPoint.add(ab);

        let dir = b.clone()
        dir.subtract(a);
        dir.normalize();
        dir.multiply(new Victor(100,100))


        let target = normalPoint.clone();
        target.add(dir);

        
        ctx.beginPath();
        //creates circle at mouse pos so the path is rounded
        ctx.arc(target.x, target.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fill();
        
        
        let distance = normalPoint.clone()
        distance = distance.distance(location);
        if (distance > 10) {
            this.steering(target);
            //console.log("steering...")
        }

    }

    // updates the boids co-ords
    move(){
        if(this.velocity.magnitude() == 0){
            this.velocity.x = this.velocity.x + Math.floor(Math.random() * 0.7 +1);
            this.velocity.y = this.velocity.y + Math.floor(Math.random() * 0.7 +1);
        }else{
            this.velocity.x = this.velocity.x;
            this.velocity.y = this.velocity.y;
        }
        if(this.x > 1280){
            this.x = -20
            this.y = this.y + 240
        }

        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxVel, 0.8);
        
        
        this.x = this.x + this.velocity.x 
        this.y = this.y + this.velocity.y 
    }
    //draws the boids
    draw(){
        ctx.beginPath();
        //creates circle at mouse pos so the path is rounded
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.fill();
    }
}


// calculate mouse postion
function calcMousePos(evt) {
    //co-ordinates of the canvas
    var rect = canvas.getBoundingClientRect();
    //co-ordinates of the whole page
    var root = document.documentElement;
    //values are taken away so the mouse is restricted to the canvas
	var mouseX = evt.clientX - rect.left - root.scrollLeft;
	var mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
        //returns the value for the mouse co-ords
		x:mouseX,
		y:mouseY
	};
}

// runs when the window is fully loaded
window.onload = function(){
    var pathData = [[new Victor(-40, 500), new Victor(1320, 200), 50]];
    var x1;
    var y1;
    var fps = 50;
    var boids = [];    
    //creates new background
    var route = new path(pathData[0][0],pathData[0][1],pathData[0][2])
    var background = new bg('rgb(16, 120, 47)', 1280, 720, 'rgb(187, 188, 191)', pathData, false);
    //draws new background
    background.clear();

    canvas.onmousedown = function(evt){
        //appends new boid to boids
        var velocity = new Victor(Math.floor((Math.random() * 2)-1), Math.floor((Math.random() * 2)-1));
        var acceleration = new Victor((Math.random() * 0.2) + 0.1, (Math.random() * 0.2) + 0.1);
        var maxVel = Math.random() * 3 + 2;
        //var desired = new Victor(1300 ,236);
        var item = new boid(x1, y1, velocity, acceleration, maxVel);
        boids.push(item);
        
    }

    canvas.onmousemove = function(evt){
        mousePos = calcMousePos(evt);
        //gets the current pos of mouse
        x1 = mousePos.x;
        y1 = mousePos.y;
    }
    // gameloop
    setInterval(function(){
        //checks if there are any boids
        route.draw();
        if(boids.length >= 1){
            background.clear();
            route.draw();
            //draws the boids
            for(var i = 0; i < boids.length; i++){
                boids[i].move();
                boids[i].draw();
                //boids[i].steering(new Victor(x1, y1));
                boids[i].follow(new Victor(-40, 500), new Victor(1320, 200));
                //console.log(boids[i].x, boids[i].y)
            }
        }


    }, 1000/fps);
}