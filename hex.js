/*jslint browser: true */
(function () {
  'use strict';

  var Vec2 = function (x, y) {
    this.x = x;
    this.y = y;
  };

  var Vec2Math = {
    add: function (v1, v2) {
      return new Vec2(v1.x + v2.x, v1.y + v2.y);
    },
    dot: function (v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    },
    scale: function (a, v) {
      return new Vec2(a * v.x, a * v.y);
    },
    fromAngle: function (phi) {
      return new Vec2(Math.cos(phi), Math.sin(phi));
    },
    deg2rad: function (deg) {
      return (deg % 360) * Math.PI / 180.0
    }
  };

  var pointOnCircle = function(center, radius, angle) {
    return Vec2Math.add(center,
                        Vec2Math.scale(radius, Vec2Math.fromAngle(angle)));
  };

  var Hex = function (center, radius, rotation, content) {
    this.center = center;
    this.radius = radius;
    this.rotation = Vec2Math.deg2rad((rotation || 0) % 60);
    this.width = 2 * this.radius * Math.cos(this.rotation);
    this.height =
        2 * this.radius * Math.sin(Vec2Math.deg2rad(60) + this.rotation);
    this.content = content || '';
    this.fillColor = null;
  };

  Hex.prototype.draw = function (ctx) {
    ctx.beginPath();
    var p = pointOnCircle(this.center, this.radius, this.rotation);
    ctx.moveTo(p.x, p.y);
    for (var i = 1; i <= 6; i++) {
      p = pointOnCircle(this.center, this.radius,
                        this.rotation + Vec2Math.deg2rad(i * 60));
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    if (this.fillColor) {
      var c = ctx.fillStyle;
      ctx.fillStyle = this.fillColor;
      ctx.fill();
      ctx.fillStyle = c;
    }
    if (this.content !== '') {
      if (typeof this.contentWidth === 'undefined') {
        this.contentWidth = ctx.measureText(this.content).width;
      }
      ctx.fillText(this.content, this.center.x - this.contentWidth / 2,
                     this.center.y);
    }
  };

  Hex.prototype.drawBounds = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = '#FF0000';
    ctx.stroke();

    var w2 = this.width / 2,
        h2 = this.height / 2;
    ctx.strokeStyle = '#00FF00';
    ctx.strokeRect(this.center.x - w2, this.center.y - h2, this.width,
                   this.height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.0;
  };

  var HexGrid = function (radius, nx, ny) {
    this.radius = radius;
    this.nx = nx;
    this.ny = ny;
    this.seedHex = new Hex(new Vec2(0, 0), radius, 60);
    var sx = this.seedHex.width,
        sy = this.seedHex.height;
    this.tiles = [];
    for (var x = 0; x < nx; x++) {
      var yoffset = (x % 2) * 0.5;
      for (var y = 0; y < ny; y++) {
        this.tiles.push(new Hex(new Vec2(x * 0.75 * sx, (y + yoffset) * sy),
                                radius, 60, '(' + x + ',' + y + ')'));
      }
    }
  };

  HexGrid.prototype.draw = function (ctx) {
    var lineWidth = ctx.lineWidth;
    ctx.lineWidth = 0.5;
    this.tiles.forEach(function (hex) {
      hex.draw(ctx);
    });
    ctx.lineWidth = lineWidth;
  };

  var HexDirections = {
    N: 0,               // 000
    S: 1,               // 001
    NE: 2,              // 010
    SE: 3,              // 011
    NW: 4,              // 100
    SW: 5,              // 101
    MaskS: 1,           // 001
    MaskE: 2,           // 010
    MaskW: 4,           // 100
    MaskHorizontal: 5,  // 110
    move: function(v, dir) {
      return Vec2Math.add(v, (function () {
        switch (dir) {
          case HexDirections.N:
            return new Vec2(0, -1);
          case HexDirections.S:
            return new Vec2(0, +1);
          case HexDirections.NE:
            return new Vec2(+1, -!(v.x % 2));
          case HexDirections.SE:
            return new Vec2(+1, (v.x % 2));
          case HexDirections.NW:
            return new Vec2(-1, -!(v.x % 2));
          case HexDirections.SW:
            return new Vec2(-1, (v.x % 2));
        }
      }()));
    }
    };

  var canvas = document.getElementById('Hex'),
      ctx = canvas.getContext('2d');

  var clear = function () {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  var hg = new HexGrid(30, 14, 9);
  ctx.translate(hg.seedHex.width / 2, hg.seedHex.height / 2);
  var gpR = 0,
      gpPhi = 0;
  var drawFn = function () {
    clear();
    hg.draw(ctx);
    window.setTimeout(function () {
      window.requestAnimationFrame(drawFn);
    }, 10);
  };
  window.requestAnimationFrame(drawFn);

  var highlight = {
    pos: new Vec2(4, 2),
    tile: hg.tiles[4 * hg.ny + 2]
  }
  highlight.tile.fillColor = '#ffff80';
  var setHighlight = function (v) {
    v.x = v.x < 0 ? hg.nx - 1 : v.x % hg.nx;
    v.y = v.y < 0 ? hg.ny - 1 : v.y % hg.ny;
    highlight.tile.fillColor = null;
    highlight.pos = v;
    highlight.tile = hg.tiles[v.x * hg.ny + v.y];
    highlight.tile.fillColor = '#ffff80';
  };
  var moveHighlight = function (dir) {
    setHighlight(HexDirections.move(highlight.pos, dir));
  };

  window.addEventListener('keypress', function (evt) {
    var which = evt.keyCode;
    switch (which) {
      case 113:  // q
        moveHighlight(HexDirections.NW);
        break;
      case 119:  // w
        moveHighlight(HexDirections.N);
        break;
      case 101:  // e
        moveHighlight(HexDirections.NE);
        break;
      case 97:  // a
        moveHighlight(HexDirections.SW);
        break;
      case 115:  // s
        moveHighlight(HexDirections.S);
        break;
      case 100:  // d
        moveHighlight(HexDirections.SE);
        break;
    };
  });


  var pollGP = function () {
    var gp = navigator.getGamepads()[0],
        axisEW = gp.axes[0],
        axisNS = gp.axes[1],
        dir = 0;
    if (axisNS !== 0) {
      var phi = Math.atan2(axisNS, axisEW),
          r = Math.sqrt(axisEW * axisEW + axisNS * axisNS);
      if (r > 0.1) {
        if (phi > 0) {
          dir |= HexDirections.MaskS;
        }
        if (Math.abs(phi) <= Math.PI / 6) {
          dir |= HexDirections.MaskE;
        } else if (Math.abs(phi) >= 3 * Math.PI / 6) {
          dir |= HexDirections.MaskW;
        }
        moveHighlight(dir);
      }
    }
  };

  var checkGP = window.setInterval(function () {
    console.log('checkGP');
    if (navigator.getGamepads()[0]) {
      document.getElementById('GamepadInfo').innerHTML =
          'Control the highlight with your gamepad\'s joystick.';
      window.setInterval(pollGP, 100);
      window.clearInterval(checkGP);
    }
  }, 500);

}());
