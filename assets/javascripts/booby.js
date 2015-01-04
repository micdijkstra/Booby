var Booby = new function() {
  var assetPath = 'http://dijkstra.io/Booby/assets';
  var worldRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  var canvas;
  var context;
  var blobRadius = 0.4;
  var environment;
  var scaleFactor = 400.0; // Overridden based on window size
  var boob;
  var gravity;
  var stopped;
  var savedMouseCoords = null;
  var selectOffset = null;

  var boing1;
  var boing2;
  var boing3;

  var fullscreen = false;

  var boingSound = new Audio(assetPath + '/audio/boing.wav');

  this.init = function() {
    canvas = document.getElementById( 'booby' );
    context = canvas.getContext('2d');

    initEvents();

    setScaleFactor();

    environment = new Environment();
    boob = new Boob((worldRect.width/2) / scaleFactor, 0.0, 1, 200);
    gravity = new Vector(0.0, 10.0);
    stopped = false;

    sizeWorld();

    setTimeout(function(){ boingSound.play(); }, 200);
    setTimeout(function(){ $('#nav').fadeIn(); }, 500);

    this.timeout();

    setupBoing();
  }

  function initEvents() {
    window.addEventListener('resize', sizeWorld, false);

    $('#booby').click(function(event) {
      sizeWorld();
    });

    $('#nav-home').click(function(event) {
      $('#signature').fadeOut();
      $('#nav').removeClass('invert');
      fullscreen = false;
      setScaleFactor();
      sizeWorld();
      return false;
    });

    $('#nav-about').click(function(event) {
      $('#signature').fadeIn();
      $('#nav').addClass('invert');
      fullscreen = true;
      sizeWorld();
      return false;
    });

    document.onkeydown = function(event)
    {
      var keyCode;

      if(event == null)
      {
        keyCode = window.event.keyCode;
      }
      else
      {
        keyCode = event.keyCode;
      }

      switch(keyCode)
      {
        // left
        case 37:
          boob.addForce(new Vector(-50.0, 0.0));
          break;

        // up
        case 38:
          boob.addForce(new Vector(0.0, -50.0));
          break;

        // right
        case 39:
          boob.addForce(new Vector(50.0, 0.0));
          break;

        // down
        case 40:
          boob.addForce(new Vector(0.0, 50.0));
          break;

        // join 'j'
        case 74:
          boob.join();
          break;

        // split 'h'
        case 72:
          boob.split();
          break;

        // toggle gravity 'g'
        case 71:
          toggleGravity();
          break;

        default:
          break;
      }
    }


    function getMouseCoords(event)
    {
      if(event == null)
      {
        event = window.event;
      }
      if(event == null)
      {
        return null;
      }

      if (event.type == 'touchstart' || event.type == 'touchmove') {
        event = event.originalEvent.touches[0];
      }

      if(event.pageX || event.pageY){
        return {x:event.pageX / scaleFactor, y:event.pageY / scaleFactor};
      }
      return null;
    }

    $('#booby').on( "mousedown touchstart", function(event)
    {
      event.preventDefault();
      var mouseCoords;

      if(stopped == true)
      {
        return;
      }
      mouseCoords = getMouseCoords(event);
      if(mouseCoords == null)
      {
        return;
      }
      selectOffset = boob.selectBlob(mouseCoords.x, mouseCoords.y);

      if (selectOffset == null && event.type == 'mousedown') {
        scaleFactor += 20;
        boingSound.play();
      }
    });

    $('#booby').on( "gesturestart gestureend", function(event)
    {
      event.preventDefault();
    });

    $('#booby').on( "gesturechange", function(event)
    {
      event.preventDefault();

      if (event.originalEvent.scale < 1.0) {
        scaleFactor -= 1;
      } else {
        scaleFactor += 1;
      }

      clearTimeout(this.id);
      this.id = setTimeout(sizeWorld, 100);
    });

    $('#booby').on( "mouseup touchend", function(event)
    {
      event.preventDefault();
      boob.unselectBlob();
      savedMouseCoords = null;
      selectOffset = null;
    });

    $('#booby').on( "mousemove touchmove", function(event)
    {
      event.preventDefault();
      var mouseCoords;

      if(stopped == true)
      {
        return;
      }
      if(selectOffset == null)
      {
        return;
      }
      mouseCoords = getMouseCoords(event);
      if(mouseCoords == null)
      {
        return;
      }
      boob.selectedBlobMoveTo(mouseCoords.x - selectOffset.x, mouseCoords.y - selectOffset.y);

      savedMouseCoords = mouseCoords;
    });
  }

  function setScaleFactor() {
    if (window.innerWidth > 1200) {
      scaleFactor = 400;
    } else if (window.innerWidth > 640) {
      scaleFactor = 300;
    } else {
      scaleFactor = 200;
    }
  }

  function sizeWorld() {
    worldRect.width = $(window).width();
    worldRect.height = $(window).height();

    canvas.width = worldRect.width;
    canvas.height = worldRect.height;

    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;

    if (fullscreen) {
      context.fillStyle = "#f1a8a9";
    } else {
      context.fillStyle = "#322d7a";
    }
    context.fillRect(0, 0, worldRect.width, worldRect.height);

    environment.setEnvironment();
  }

  function setupBoing() {
    img = new Image;
    img.src = assetPath + '/images/boing1.png';

    boing1 = {
      img: img,
      sound: new Audio(assetPath + '/audio/boing.wav'),
      pos: {
        x: null,
        y: null
      },
      vel: {
        x: 8,
        y: 8
      }
    };

    img = new Image;
    img.src = assetPath + '/images/boing2.png';

    boing2 = {
      img: img,
      sound: new Audio(assetPath + '/audio/boing.wav'),
      pos: {
        x: null,
        y: null
      },
      vel: {
        x: 10,
        y: 10
      }
    };

    img = new Image;
    img.src = assetPath + '/images/boing3.png';

    boing3 = {
      img: img,
      sound: new Audio(assetPath + '/audio/boing.wav'),
      pos: {
        x: null,
        y: null
      },
      vel: {
        x: 12,
        y: 12
      }
    };
  }

  function Vector(x, y)
  {
    this.x = x;
    this.y = y;

    this.equal = function(v)
    {
      return this.x == v.getX() && this.y == v.getY();
    }
    this.getX = function()
    {
      return this.x;
    }
    this.getY = function()
    {
      return this.y;
    }
    this.setX = function(x)
    {
      this.x = x;
    }
    this.setY = function(y)
    {
      this.y = y;
    }
    this.addX = function(x)
    {
      this.x += x;
    }
    this.addY = function(y)
    {
      this.y += y;
    }
    this.set = function(v)
    {
      this.x = v.getX();
      this.y = v.getY();
    }
    this.add = function(v)
    {
      this.x += v.getX();
      this.y += v.getY();
    }
    this.sub = function(v)
    {
      this.x -= v.getX();
      this.y -= v.getY();
    }
    this.dotProd = function(v)
    {
      return this.x * v.getX() + this.y * v.getY();
    }
    this.length = function()
    {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.scale = function(scaleFactor)
    {
      this.x *= scaleFactor;
      this.y *= scaleFactor;
    }
    this.toString = function()
    {
      return " X: " + this.x + " Y: " + this.y;
    }
  }

  function Environment()
  {
    this.setEnvironment = function() {
      this.left = worldRect.x;
      this.right = worldRect.x + (worldRect.width / scaleFactor);
      this.top = worldRect.y;
      this.bottom = worldRect.y + ((worldRect.height - 100) / scaleFactor);
      this.r = new Vector(0.0, 0.0);
    }

    this.collision = function(curPos, prevPos)
    {
      var collide = false;
      var i;

      if(curPos.getX() < this.left)
      {
        curPos.setX(this.left);
        collide = true;
        boingSound.play();
        boob.unselectBlob();
      }
      else if(curPos.getX() > this.right)
      {
        curPos.setX(this.right);
        collide = true;
        boingSound.play();
        boob.unselectBlob();
      }
      if(curPos.getY() < this.top)
      {
        curPos.setY(this.top);
        collide = true;
        boingSound.play();
        boob.unselectBlob();
      }
      else if(curPos.getY() > this.bottom)
      {
        curPos.setY(this.bottom);
        collide = true;
      }
      return collide;
    }
  }

  function PointMass(cx, cy, mass)
  {
    this.cur = new Vector(cx, cy);
    this.prev = new Vector(cx, cy);
    this.mass = mass;
    this.force = new Vector(0.0, 0.0);
    this.result = new Vector(0.0, 0.0);
    this.friction = 0.01;

    this.getXPos = function()
    {
      return this.cur.getX();
    }
    this.getYPos = function()
    {
      return this.cur.getY();
    }
    this.getPos = function()
    {
      return this.cur;
    }
    this.getXPrevPos = function()
    {
      return this.prev.getX();
    }
    this.getYPrevPos = function()
    {
      return this.prev.getY();
    }
    this.getPrevPos = function()
    {
      return this.prev;
    }
    this.addXPos = function(dx)
    {
      this.cur.addX(dx);
    }
    this.addYPos = function(dy)
    {
      this.cur.addY(dy);
    }
    this.setForce = function(force)
    {
      this.force.set(force);
    }
    this.addForce = function(force)
    {
      this.force.add(force);
    }
    this.getMass = function()
    {
      return this.mass;
    }
    this.setMass = function(mass)
    {
      this.mass = mass;
    }
    this.move = function(dt)
    {
      var t, a, c, dtdt;

      dtdt = dt * dt;

      a = this.force.getX() / this.mass;
      c = this.cur.getX();
      t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getX() + a * dtdt;
      this.prev.setX(c);
      this.cur.setX(t);

      a = this.force.getY() / this.mass;
      c = this.cur.getY();
      t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getY() + a * dtdt;
      this.prev.setY(c);
      this.cur.setY(t);
    }
    this.setFriction = function(friction)
    {
      this.friction = friction;
    }
    this.getVelocity = function()
    {
      var cXpX, cYpY;

      cXpX = this.cur.getX() - this.prev.getX();
      cYpY = this.cur.getY() - this.prev.getY();

      return cXpX * cXpX + cYpY * cYpY;
    }
    this.draw = function(context, scaleFactor)
    {
      context.lineWidth = 2;
      context.fillStyle = '#000000';
      context.strokeStyle = '#000000';
      context.beginPath();
      context.arc(this.cur.getX() * scaleFactor,
              this.cur.getY() * scaleFactor,
              4.0, 0.0, Math.PI * 2.0, true);
      context.fill();
    }
  }

  function ConstraintY(pointMass, y, shortConst, longConst)
  {
    this.pointMass = pointMass;
    this.y = y;
    this.delta = new Vector(0.0, 0.0);
    this.shortConst = shortConst;
    this.longConst = longConst;

    this.sc = function()
    {
      var dist;

      dist = Math.abs(this.pointMass.getYPos() - this.y);
      this.delta.setY(-dist);

      if(this.shortConst != 0.0 && dist < this.shortConst)
      {
        var scaleFactor;

        scaleFactor = this.shortConst / dist;
        this.delta.scale(scaleFactor);
        pointMass.getPos().sub(this.delta);
      }
      else if(this.longConst != 0.0 && dist > this.longConst)
      {
        var scaleFactor;

        scaleFactor = this.longConst / dist;
        this.delta.scale(scaleFactor);
        pointMass.getPos().sub(this.delta);
      }
    }
  }


  function Joint(pointMassA, pointMassB, shortConst, longConst)
  {
    this.pointMassA = pointMassA;
    this.pointMassB = pointMassB;
    this.delta = new Vector(0.0, 0.0);
    this.pointMassAPos = pointMassA.getPos();
    this.pointMassBPos = pointMassB.getPos();

    this.delta.set(this.pointMassBPos);
    this.delta.sub(this.pointMassAPos);

    this.shortConst = this.delta.length() * shortConst;
    this.longConst = this.delta.length() * longConst;
    this.scSquared = this.shortConst * this.shortConst;
    this.lcSquared = this.longConst * this.longConst;

    this.setDist = function(shortConst, longConst)
    {
      this.shortConst = shortConst;
      this.longConst = longConst;
      this.scSquared = this.shortConst * this.shortConst;
      this.lcSquared = this.longConst * this.longConst;
    }
    this.scale = function(scaleFactor)
    {
      this.shortConst = this.shortConst * scaleFactor;
      this.longConst = this.longConst * scaleFactor;
      this.scSquared = this.shortConst * this.shortConst;
      this.lcSquared = this.longConst * this.longConst;
    }
    this.sc = function()
    {
      this.delta.set(this.pointMassBPos);
      this.delta.sub(this.pointMassAPos);

      var dp = this.delta.dotProd(this.delta);

      if(this.shortConst != 0.0 && dp < this.scSquared)
      {
        var scaleFactor;

        scaleFactor = this.scSquared / (dp + this.scSquared) - 0.5;

        this.delta.scale(scaleFactor);

        this.pointMassAPos.sub(this.delta);
        this.pointMassBPos.add(this.delta);
      }
      else if(this.longConst != 0.0 && dp > this.lcSquared)
      {
        var scaleFactor;

        scaleFactor = this.lcSquared / (dp + this.lcSquared) - 0.5;

        this.delta.scale(scaleFactor);

        this.pointMassAPos.sub(this.delta);
        this.pointMassBPos.add(this.delta);
      }
    }
  }

  function Stick(pointMassA, pointMassB)
  {
    function pointMassDist(pointMassA, pointMassB)
    {
      var aXbX, aYbY;

      aXbX = pointMassA.getXPos() - pointMassB.getXPos();
      aYbY = pointMassA.getYPos() - pointMassB.getYPos();

      return Math.sqrt(aXbX * aXbX + aYbY * aYbY);
    }

    this.length = pointMassDist(pointMassA, pointMassB);
    this.lengthSquared = this.length * this.length;
    this.pointMassA = pointMassA;
    this.pointMassB = pointMassB;
    this.delta = new Vector(0.0, 0.0);

    this.getPointMassA = function()
    {
      return this.pointMassA;
    }
    this.getPointMassB = function()
    {
      return this.pointMassB;
    }
    this.scale = function(scaleFactor)
    {
      this.length *= scaleFactor;
      this.lengthSquared = this.length * this.length;
    }
    this.sc = function(environment)
    {
      var dotProd, scaleFactor;
      var pointMassAPos, pointMassBPos;

      pointMassAPos = this.pointMassA.getPos();
      pointMassBPos = this.pointMassB.getPos();

      this.delta.set(pointMassBPos);
      this.delta.sub(pointMassAPos);

      dotProd = this.delta.dotProd(this.delta);

      scaleFactor = this.lengthSquared / (dotProd + this.lengthSquared) - 0.5;
      this.delta.scale(scaleFactor);

      pointMassAPos.sub(this.delta);
      pointMassBPos.add(this.delta);
    }
    this.setForce = function(force)
    {
      this.pointMassA.setForce(force);
      this.pointMassB.setForce(force);
    }
    this.addForce = function(force)
    {
      this.pointMassA.addForce(force);
      this.pointMassB.addForce(force);
    }
    this.move = function(dt)
    {
      this.pointMassA.move(dt);
      this.pointMassB.move(dt);
    }
    this.draw = function(context, scaleFactor)
    {
      this.pointMassA.draw(context, scaleFactor);
      this.pointMassB.draw(context, scaleFactor);

      context.lineWidth = 3;
      context.fillStyle = '#000000';
      context.strokeStyle = '#000000';
      context.beginPath();
      context.moveTo(this.pointMassA.getXPos() * scaleFactor,
                 this.pointMassA.getYPos() * scaleFactor);
      context.lineTo(this.pointMassB.getXPos() * scaleFactor,
                 this.pointMassB.getYPos() * scaleFactor);
      context.stroke();
    }
  }

  function Spring(restLength, stiffness, damper, pointMassA, pointMassB)
  {
    this.restLength = restLength;
    this.stiffness = stiffness;
    this.damper = damper;
    this.pointMassA = pointMassA;
    this.pointMassB = pointMassB;
    this.tmp = Vector(0.0, 0.0);

    /*this.sc = function(environment)
    {
      environment.collistion(this.pointMassA.getPos(), this.pointMassA.getPrevPos());
      environment.collistion(this.pointMassB.getPos(), this.pointMassB.getPrevPos());
    }*/

    this.move = function(dt)
    {
      var aXbX;
      var aYbY;
      var springForce;
      var length;

      aXbX = this.pointMassA.getXPos() - this.pointMassB.getXPos();
      aYbY = this.pointMassA.getYPos() - this.pointMassB.getYPos();

      length = Math.sqrt(aXbX * aXbX + aYbY * aYbY);
      springForce = this.stiffness * (length / this.restLength - 1.0);

      var avXbvX;
      var avYbvY;
      var damperForce;

      avXbvX = this.pointMassA.getXVel() - this.pointMassB.getXVel();
      avYbvY = this.pointMassA.getYVel() - this.pointMassB.getYVel();

      damperForce = avXbvX * aXbX + avYbvY * aYbY;
      damperForce *= this.damper;

      var fx;
      var fy;

      fx = (springForce + damperForce) * aXbX;
      fy = (springForce + damperForce) * aYbY;

      this.tmp.setX(-fx);
      this.tmp.setY(-ft);
      this.pointMassA.addForce(this.tmp);

      this.tmp.setX(fx);
      this.tmp.setY(ft);
      this.pointMassB.addForce(this.tmp);

      this.pointMassA.move(dt);
      this.pointMassB.move(dt);
    }
    this.addForce = function(force)
    {
      this.pointMassA.addForce(force);
      this.pointMassB.addForce(force);
    }
    this.draw = function(context, scaleFactor)
    {
      this.pointMassA.draw(context, scaleFactor);
      this.pointMassB.draw(context, scaleFactor);

      context.fillStyle = '#000000';
      context.strokeStyle = '#000000';
      context.beginPath();
      context.moveTo(this.pointMassA.getXPos() * scaleFactor,
                 this.pointMassA.getYPos() * scaleFactor);
      context.lineTo(this.pointMassB.getXPos() * scaleFactor,
                 this.pointMassB.getXPos() * scaleFactor);
      context.stroke();
    }
  }

  function Blob(x, y, radius, numPointMasses) {
    this.x = x;
    this.y = y;
    this.sticks = new Array();
    this.pointMasses = new Array();
    this.joints = new Array();
    this.middlePointMass;
    this.radius = radius;
    this.selected = false;

    numPointMasses = 8;

    var f = 0.1;
    var low = 0.95, high = 1.05;
    var t, i, p;

    function clampIndex(index, maxIndex)
    {
      index += maxIndex;
      return index % maxIndex;
    }

    for(i = 0, t = 0.0; i < numPointMasses; i++)
    {
      this.pointMasses[i] = new PointMass(Math.cos(t) * radius + x, Math.sin(t) * radius + y, 1.0);
      t += 2.0 * Math.PI / numPointMasses;
    }

    this.middlePointMass = new PointMass(x, y, 1.0);

    this.pointMasses[0].setMass(4.0);
    this.pointMasses[1].setMass(4.0);

    for(i = 0; i < numPointMasses; i++)
    {
      this.sticks[i] = new Stick(this.pointMasses[i], this.pointMasses[clampIndex(i + 1, numPointMasses)]);
    }

    for(i = 0, p = 0; i < numPointMasses; i++)
    {
      this.joints[p++] = new Joint(this.pointMasses[i], this.pointMasses[clampIndex(i + numPointMasses / 2 + 1, numPointMasses)], low, high);
      this.joints[p++] = new Joint(this.pointMasses[i], this.middlePointMass, high * 0.95, low * 1.05); // 0.8, 1.2 works
    }

    this.addBlob = function(blob)
    {
      var index = this.joints.length;
      var dist;

      this.joints[index] = new Joint(this.middlePointMass, blob.getMiddlePointMass(), 0.0, 0.0);
      dist = this.radius + blob.getRadius();
      this.joints[index].setDist(dist * 0.95, 0.0);
    }
    this.getMiddlePointMass = function()
    {
      return this.middlePointMass;
    }
    this.getRadius = function()
    {
      return this.radius;
    }
    this.getXPos = function()
    {
      return this.middlePointMass.getXPos();
    }
    this.getYPos = function()
    {
      return this.middlePointMass.getYPos();
    }
    this.scale = function(scaleFactor)
    {
      var i;

      for(i = 0; i < this.joints.length; i++)
      {
        this.joints[i].scale(scaleFactor);
      }
      for(i = 0; i < this.sticks.length; i++)
      {
        this.sticks[i].scale(scaleFactor);
      }
      this.radius *= scaleFactor;
    }

    this.move = function(dt)
    {
      var i;

      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].move(dt);
      }
      this.middlePointMass.move(dt);
    }
    this.sc = function(environment)
    {
      var i, j;

      for(j = 0; j < 4; j++)
      {
        for(i = 0; i < this.pointMasses.length; i++)
        {
          if(environment.collision(this.pointMasses[i].getPos(), this.pointMasses[i].getPrevPos()) == true)
          {
            this.pointMasses[i].setFriction(0.75);
          }
          else
          {
            this.pointMasses[i].setFriction(0.01);
          }
        }
        for(i = 0; i < this.sticks.length; i++)
        {
          this.sticks[i].sc(environment);
        }
        for(i = 0; i < this.joints.length; i++)
        {
          this.joints[i].sc();
        }
      }
    }
    this.setForce = function(force)
    {
      var i;

      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].setForce(force);
      }
      this.middlePointMass.setForce(force);
    }
    this.addForce = function(force)
    {
      var i;

      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].addForce(force);
      }
      this.middlePointMass.addForce(force);
      this.pointMasses[0].addForce(force);
      this.pointMasses[0].addForce(force);
      this.pointMasses[0].addForce(force);
      this.pointMasses[0].addForce(force);
    }
    this.moveTo = function(x, y)
    {
      var i, blobPos;

      blobPos = this.middlePointMass.getPos();
      x -= blobPos.getX(x);
      y -= blobPos.getY(y);

      for(i = 0; i < this.pointMasses.length; i++)
      {
        blobPos = this.pointMasses[i].getPos();
        blobPos.addX(x);
        blobPos.addY(y);
      }
      blobPos = this.middlePointMass.getPos();
      blobPos.addX(x);
      blobPos.addY(y);
    }
    this.setSelected = function(selected)
    {
      this.selected = selected;
    }

    this.getPointMass = function(index)
    {
      index += this.pointMasses.length;
      index = index % this.pointMasses.length;
      return this.pointMasses[index];
    }

    this.drawBody = function(context, scaleFactor)
    {
      var i;

      context.strokeStyle = "#f1a8a9";
      context.fillStyle = "#f1a8a9";
      context.lineWidth = 0;
      context.beginPath();
      context.moveTo(this.pointMasses[0].getXPos() * scaleFactor,
        this.pointMasses[0].getYPos() * scaleFactor);

      for(i = 0; i < this.pointMasses.length; i++)
      {
        var px, py, nx, ny, tx, ty, cx, cy;
        var prevPointMass, currentPointMass, nextPointMass, nextNextPointMass;

        prevPointMass = this.getPointMass(i - 1);
        currentPointMass = this.pointMasses[i];
        nextPointMass = this.getPointMass(i + 1);
        nextNextPointMass = this.getPointMass(i + 2);

        tx = nextPointMass.getXPos();
        ty = nextPointMass.getYPos();

        cx = currentPointMass.getXPos();
        cy = currentPointMass.getYPos();

        px = cx * 0.5 + tx * 0.5;
        py = cy * 0.5 + ty * 0.5;

        nx = cx - prevPointMass.getXPos() + tx - nextNextPointMass.getXPos();
        ny = cy - prevPointMass.getYPos() + ty - nextNextPointMass.getYPos();

        px += nx * 0.16;
        py += ny * 0.16;

        px = px * scaleFactor;
        py = py * scaleFactor;

        tx = tx * scaleFactor;
        ty = ty * scaleFactor;

        context.bezierCurveTo(px, py, tx, ty, tx, ty);
      }

      context.closePath();
      context.stroke();
      context.fill();
    }

    this.drawShadow = function()
    {
      cy = (worldRect.height - 75);
      w = (blobRadius * 2) * scaleFactor;
      cx = (this.middlePointMass.getXPos() * scaleFactor) - (w/2);
      h = 50 * this.middlePointMass.getYPos();
      if (h < 0) { h = 0 }

      drawEllipseWithBezier(cx, cy, w, h, "rgba(0,0,0, 0.2)")
    }

    this.drawNipple = function(ctx, scaleFactor)
    {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#EF96A0";
      ctx.fillStyle = "#EF96A0";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.4 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.shadowColor = "rgba(187, 189, 192, 0.6)";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#EC708E";
      ctx.fillStyle = "#EC708E";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.14 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.shadowColor = "rgba(187, 189, 192, 0.6)";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fill();
    }

    this.drawBoing = function(boing) {
      img = boing['img'];
      boingPos = boing['pos'];
      boingVel = boing['vel'];
      boingSound = boing['sound'];

      if ($(window).width() >= 768) {
        imgHeight = img.height/2;
        imgWidth = img.width/2;
      } else {
        imgHeight = img.height/4;
        imgWidth = img.width/4;
      }

      if (boingPos.x == null) {
        boingPos.x = imgWidth + 10
      } else {
        boingPos.x += boingVel.x;
      }

      if (boingPos.y == null) {
        boingPos.y = imgHeight + 10
      } else {
        boingPos.y += boingVel.y;
      }

      if (boingPos.x < imgWidth || boingPos.x >= canvas.width) {
        boingVel.x *= -1;
        boingSound.play();
      }

      if (boingPos.y < imgHeight || boingPos.y > canvas.height) {
        boingVel.y *= -1;
        boingSound.play();
      }

      context.drawImage(img, boingPos.x - imgWidth, boingPos.y - imgHeight, imgWidth, imgHeight)
    };

    this.draw = function(context, scaleFactor)
    {
      var i;
      var up, ori, ang;

     if (!fullscreen) {
        this.drawShadow();

        this.drawBody(context, scaleFactor);
      }

      context.strokeStyle = "#000000";
      context.fillStyle = "#000000"

      context.save();

      if (fullscreen) {
        context.translate($(window).width()/2, $(window).height()/2)
      } else {
        context.translate(this.middlePointMass.getXPos() * scaleFactor,
          (this.middlePointMass.getYPos()) * scaleFactor);
      }

      up = new Vector(0.0, -1.0);
      ori = new Vector(0.0, 0.0);
      ori.set(this.pointMasses[0].getPos());
      ori.sub(this.middlePointMass.getPos());
      ang = Math.acos(ori.dotProd(up) / ori.length());
      if(ori.getX() < 0.0)
      {
        context.rotate(-ang);
      }
      else
      {
        context.rotate(ang);
      }

      this.drawNipple(context, scaleFactor);

      context.restore();

      if (fullscreen) {
        this.drawBoing(boing1);
      }

      context.save();
      context.restore();
    }
  }

  function Boob(x, y, startNum, maxNum)
  {
    this.maxNum = maxNum;
    this.numActive = 1;
    this.blobs = new Array();
    this.tmpForce = new Vector(0.0, 0.0);
    this.selectedBlob = null;

    this.blobs[0] = new Blob(x, y, blobRadius, 8);

    this.findSmallest = function(exclude)
    {
      var minRadius = 1000.0, minIndex;
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(i == exclude || this.blobs[i] == null)
        {
          continue;
        }
        if(this.blobs[i].getRadius() < minRadius)
        {
          minIndex = i;
          minRadius = this.blobs[i].getRadius();
        }
      }
      return minIndex;
    }
    this.findClosest = function(exclude)
    {
      var minDist = 1000.0, foundIndex, dist, aXbX, aYbY;
      var i;
      var myPointMass, otherPointMass;

      myPointMass = this.blobs[exclude].getMiddlePointMass();
      for(i = 0; i < this.blobs.length; i++)
      {
        if(i == exclude || this.blobs[i] == null)
        {
          continue;
        }

        otherPointMass = this.blobs[i].getMiddlePointMass();
        aXbX = myPointMass.getXPos() - otherPointMass.getXPos();
        aYbY = myPointMass.getYPos() - otherPointMass.getYPos();
        dist = aXbX * aXbX + aYbY * aYbY;
        if(dist < minDist)
        {
          minDist = dist;
          foundIndex = i;
        }
      }
      return foundIndex;
    }
    this.join = function()
    {
      var blob1Index, blob2Index, blob1, blob2;
      var r1, r2, r3;

      if(this.numActive == 1)
      {
        return;
      }

      blob1Index = this.findSmallest(-1);
      blob2Index = this.findClosest(blob1Index);

      r1 = this.blobs[blob1Index].getRadius();
      r2 = this.blobs[blob2Index].getRadius();
      r3 = Math.sqrt(r1 * r1 + r2 * r2);

      this.blobs[blob1Index] = null;
      this.blobs[blob2Index].scale(0.945 * r3 / r2);

      this.numActive--;
    }

    this.selectBlob = function(x, y)
    {
      var i, minDist = 10000.0;
      var otherPointMass;
      var selectedBlob;
      var selectOffset = null;

      if(this.selectedBlob != null)
      {
        return;
      }

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }

        otherPointMass = this.blobs[i].getMiddlePointMass();
        aXbX = x - otherPointMass.getXPos();
        aYbY = y - otherPointMass.getYPos();
        dist = aXbX * aXbX + aYbY * aYbY;
        if(dist < minDist)
        {
          minDist = dist;
          if(dist < this.blobs[i].getRadius() * 0.5)
          {
            this.selectedBlob = this.blobs[i];
            selectOffset = { x : aXbX, y : aYbY };
          }
        }
      }

      if(this.selectedBlob != null)
      {
        this.selectedBlob.setSelected(true);
      }
      return selectOffset;
    }
    this.unselectBlob = function()
    {
      if(this.selectedBlob == null)
      {
        return;
      }
      this.selectedBlob.setSelected(false);
      this.selectedBlob = null;
    }
    this.selectedBlobMoveTo = function(x, y)
    {
      if(this.selectedBlob == null)
      {
        return;
      }
      this.selectedBlob.moveTo(x, y);
    }

    this.move = function(dt)
    {
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }
        this.blobs[i].move(dt);
      }
    }
    this.sc = function(environment)
    {
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }
        this.blobs[i].sc(environment);
      }
      if(this.blobAnchor != null)
      {
        this.blobAnchor.sc();
      }
    }
    this.setForce = function(force)
    {
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }
        if(this.blobs[i] == this.selectedBlob)
        {
          this.blobs[i].setForce(new Vector(0.0, 0.0));
          continue;
        }
        this.blobs[i].setForce(force);
      }
    }
    this.addForce = function(force)
    {
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }
        if(this.blobs[i] == this.selectedBlob)
        {
          continue;
        }
        this.tmpForce.setX(force.getX() * (Math.random() * 0.75 + 0.25));
        this.tmpForce.setY(force.getY() * (Math.random() * 0.75 + 0.25));
        this.blobs[i].addForce(this.tmpForce);
      }
    }
    this.draw = function(context, ncaleFactor)
    {
      var i;

      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue;
        }
        this.blobs[i].draw(context, scaleFactor);
      }
    }
  }

  function debug(msg, okFunc, cancelFunc)
  {
    if(confirm(msg) == true && okFunc != null)
    {
      okFunc();
    }
    else if(cancelFunc != null)
    {
      cancelFunc();
    }
  }

  function update()
  {
    var dt = 0.05;

    if(savedMouseCoords != null && selectOffset != null)
    {
      boob.selectedBlobMoveTo(savedMouseCoords.x - selectOffset.x,
        savedMouseCoords.y - selectOffset.y);
    }

    boob.move(dt);
    boob.sc(environment);
    boob.setForce(gravity);
  }

  function draw()
  {
    if(canvas.getContext == null)
    {
      return;
    }

    if (fullscreen) {
      context.fillStyle = "#f1a8a9";
    } else {
      context.fillStyle = "#322d7a";
    }
    context.fillRect(worldRect.x, worldRect.y, worldRect.width, worldRect.height);

    boob.draw(context, scaleFactor);
  }

  this.timeout = function() {
    draw();
    update();

    if(stopped == false)
    {
      setTimeout('Booby.timeout()', 30);
    }
  }

  function drawEllipseWithBezier(x, y, w, h, style) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    context.save();
    context.beginPath();
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    context.fillStyle = style;
    context.fill();
    context.restore();
  }
}

Booby.init();
