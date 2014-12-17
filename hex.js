/*jslint browser: true */
(function () {
  'use strict';

  var canvas = document.getElementById('Hex'),
      ctx = canvas.getContext('2d');

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

  var Hex = function (center, radius, rotation) {
    this.center = center;
    this.radius = radius;
    this.rotation = Vec2Math.deg2rad((rotation || 0) % 60);
    this.width = 2 * this.radius * Math.cos(this.rotation);
    this.height =
        2 * this.radius * Math.sin(Vec2Math.deg2rad(60) + this.rotation);
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
    ctx.stroke();
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

  var drawGrid = function (ctx, spacing) {
    var s = spacing || 10;
    var nx = canvas.width / s,
        ny = canvas.height / s;
    ctx.beginPath();
    for (var i = 0; i < nx; i++) {
      ctx.moveTo(i * s, 0);
      ctx.lineTo(i * s, canvas.height);
    }
    for (var i = 0; i < ny; i++) {
      ctx.moveTo(0, i * s);
      ctx.lineTo(canvas.width, i * s);
    }
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#CCCCCC';
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.0;
  };

  drawGrid(ctx);

  var h1 = new Hex(new Vec2(100, 100), 100, 0);
  h1.draw(ctx);
  h1.drawBounds(ctx);
  
  var h2 = new Hex(new Vec2(300, 300), 100, 30);
  h2.draw(ctx);
  h2.drawBounds(ctx);

  var h3 = new Hex(new Vec2(100, 300), 100, 15);
  h3.draw(ctx);
  h3.drawBounds(ctx);
}());
