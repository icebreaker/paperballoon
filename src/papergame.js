//
// PaperGame v0.1
// Copyright (c) 2012, Mihail Szabolcs
// MIT license, for more information see LICENSE.
//
if(!window.requestAnimationFrame)
{
  window.requestAnimationFrame = (function()
  {
      return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) { window.setTimeout(callback, 1000 / 60); };
  })();
}
var PaperGame = {};
PaperGame.Class = function()
{
  this.initialize.apply(this, arguments);
}
PaperGame.Class.prototype =
{
  initialize: function()
  {
    // empty
  }
};

PaperGame.extend = function(klass, superklass, ext) 
{
  var cc = function() {};
  cc.prototype = superklass.prototype; 

  klass.superclass = superklass.prototype;
  klass.prototype = new cc();

  for (var m in ext)
    klass.prototype[m] = ext[m];

  return klass;
}
PaperGame.extend2 = function(superklass, ext, args)
{
    if(arguments.length == 1)
    {
      ext         = superklass;
      superklass  = PaperGame.Class;
    }

    var klass = function() { this.initialize.apply(this, args || arguments); }
    ext.super = function(func, args) { return klass.superclass[func].apply(this, args); }
    return PaperGame.extend(klass, superklass, ext);
}
/*
 *  PaperGame.MyClass = _(
 *  {
 *    meh: function()
 *    {
 *      alert('boo');
 *    }
 *  });
 *
 *  PaperGame.MyClass2 = _(PaperGame.MyClass, 
 *  {
 *    meh: function()
 *    {
 *      this.super('meh', arguments);
 *      alert('boo2');
 *    }
 *  });
 *
 */
_ = PaperGame.extend2;
PaperGame.getEl = function(el) 
{ 
  return document.getElementById(el); 
}
$ = PaperGame.getEl;
PaperGame.createEl = function(el) 
{ 
  return document.createElement(el);
}
PaperGame.appendChild = function(el, child)
{
  if(typeof(el) == "object")
    el.appendChild(child);
  else if(typeof(el) == "string")
    PaperGame.getEl(el).appendChild(child);
}
PaperGame.log = function(message)
{
  console.log(message);
}
PaperGame.random = function(min, max)
{
  if(max)
    return Math.floor((Math.random() * (max - min)) + min);

  return Math.floor(Math.random() * min);
}
PaperGame.randomEven = function(min, max)
{
  var rand = PaperGame.random(min, max);
  return rand % 2 == 0 ? rand : ++rand;
}
PaperGame.RAD2DEG = 180 / Math.PI;
PaperGame.DEG2RAD = Math.PI / 180;
PaperGame.rotate = function(x, y, deg)
{
  var de = deg; //* PaperGame.DEG2RAD;
  var xx = x * Math.cos(de);
  var yy = y * Math.sin(de);
  return { x: xx, y: yy };
}
PaperGame.rotateAround = function(x, y, xx, yy, deg)
{
  var pp = PaperGame.rotate(x-xx, y-yy, deg);
//  pp.x += xx;
//  pp.y += yy;
  return pp;
}
PaperGame.isChrome  = navigator.userAgent.match(/chrome/i)  != null;
PaperGame.isSafari  = navigator.userAgent.match(/safari/i)  != null;
PaperGame.isFirefox = navigator.userAgent.match(/firefox/i) != null;

PaperGame.Graphics = _( 
{
  w: null,
  h: null,
  canvas: null,
  ctx: null,
  initialize : function(w, h, buffer)
  {
    this.w = w;
    this.h = h;
    this.canvas = PaperGame.createEl("canvas");
    this.canvas.width = w;
    this.canvas.height= h;
    this.canvas.style.backgroundColor = "#000000";
    this.ctx = this.canvas.getContext("2d");
  
    if(!buffer)
      PaperGame.appendChild(document.body, this.canvas); // remove this non-sense!
  },
  push: function()
  {
    this.ctx.save();
  },
  pop: function()
  {
    this.ctx.restore();
  },
  rotate: function(deg)
  {
    this.ctx.rotate.apply(this.ctx, arguments);
  },
  translate: function(x, y)
  {
    this.ctx.translate.apply(this.ctx, arguments);
  },
  drawText: function(text, x, y, color)
  {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = "24px Verdana";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  },
  drawImage: function()
  {
    this.ctx.drawImage.apply(this.ctx, arguments);
  },
  drawBound: function(x, y, w, h, color)
  {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = color || "#EAEAEA";
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();
  },
  drawRect: function(x, y, w, h, color)
  {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  },
  clear: function(color)
  {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //this.ctx.save();
    //this.drawRect(0, 0, this.canvas.width, this.canvas.height, color || "#FFFFFF");
    //this.ctx.restore();
  },
  setPixels: function(pixels)
  {
    this.ctx.putImageData(pixels, 0, 0);
  },
  pixels: function()
  {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
});

PaperGame.Effects = {};
PaperGame.Effects.blendMultiply = function(src, dst)
{
  var pixels = dst.pixels();
  var src = src.pixels().data;
  var data = pixels.data;
  var n = data.length;

  for(var i=0; i<n; i+=4)
  {
    data[i+0] *= src[i+0] * 0.0039;
    data[i+1] *= src[i+1] * 0.0039;
    data[i+2] *= src[i+2] * 0.0039;
  }

  dst.setPixels(pixels);
}
PaperGame.Effects.blendAdd = function(src, dst)
{
  var pixels = dst.pixels();
  var src = src.pixels().data;
  var data = pixels.data;
  var n = data.length;

  for(var i=0; i<n; i+=4)
  {
    data[i+0] += src[i+0];
    data[i+1] += src[i+1];
    data[i+2] += src[i+2];
  }

  dst.setPixels(pixels);
}

// TODO: Web Audio API
PaperGame.Audio = _(
{
});

// TODO: 
// setVersion()
// setPath()
// setImageType()
// setAudioType()
PaperGame.Resources = _( 
{
  loading: 0,
  count: 0,
  version: 1,
  imagePath: 'data/gfx',
  imageType: 'png',
  audioPath: 'data/sfx',
  audioType: 'mp3',
  noAudio: false,
  supports: {},
  initialize: function(version)
  {
    this.version = version || 1;
    this.supports.mp3 = new Audio().canPlayType('audio/mp3');
    this.supports.ogg = new Audio().canPlayType('audio/ogg');
    this.supports.audio = this.supports.mp3 || this.supports.ogg;
    this.audioType = this.supports.ogg && !this.supports.mp3 ? 'ogg' : this.audioType;
  },
  loadAudio: function(src, loop, volume)
  {
    if(this.noAudio) // return dummy audio object if audio has been disabled
    {
      var audio = new Audio();
      audio.play2 = function() { /* empty */ }
      return audio;
    }

    this.loading++;
    this.count++;

    var self = this;

    var audio = new Audio();
    // FIXME: BUGGGGGGYYY BUGGGYYY BUGGGYYYY .... YUCK!!!
    audio.addEventListener('loadedmetadata', function()
    {
      PaperGame.log('Loaded audio: ' + this.src);
      this.loaded = true;
      self.loading--;
    }, false);
    audio.onerror = function() 
    {
      PaperGame.log('Cannot load audio: ' + this.src);
      self.loading--;
    };
    audio.setVolume = function(volume)
    {
        if(volume)
          this.volume = parseFloat(volume / 100);
        else
          this.volume = 1.0;
    };
    audio.play2 = function(currentTime)
    {
        this.currentTime = currentTime || 0;
        this.play();
    };

    audio.loop = loop || false;
    audio.loaded = false;
    audio.src = this.audioPath + '/' + src + '.' + this.audioType + '?v' + this.version;
    audio.setVolume(volume);

    return audio;
  },
  loadImage: function(src)
  {
    this.loading++;
    this.count++;

    var self = this;

    var image = new Image();
    image.onload = function()
    {
      PaperGame.log('Loaded image: ' + this.src);
      this.loaded = true;
      self.loading--;
    };
    image.onerror = function()
    {
      PaperGame.log('Cannot load image: ' + this.src);
      self.loading--;
    };
    image.loaded = false;
    image.src = this.imagePath + '/' + src + '.' + this.imageType + '?v' + this.version;

    return image;
  }
});

PaperGame.Input = _( 
{
  canvas: null,
  keys: {},
  buttons: {},
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  initialize: function(graphics)
  {
    var self = this;
    this.canvas = graphics.canvas;
    this.canvas.onmousedown = function(e) { self.buttons[e.button] = true; return false; };
    this.canvas.onmouseup = function(e) { self.buttons[e.button] = false; return false; };
    if(PaperGame.isFirefox)
    {
      this.canvas.onmousemove = function(e)
      {
        if(e.layerX || e.layerX == 0)
        {
          self.dx = e.layerX - self.x;
          self.dy = e.layerY - self.y;
          self.x = e.layerX;
          self.y = e.layerY;
        }
      };
    }
    else
    {
      this.canvas.onmousemove = function(e)
      {
        if(e.offsetX || e.offsetX == 0)
        {
          self.dx = e.offsetX - self.x;
          self.dy = e.offsetY - self.y;
          self.x = e.offsetX;
          self.y = e.offsetY;
        }
      };
    }
    this.canvas.oncontextmenu = function(e) { return false; };

    window.onkeydown = function(e) { self.keys[e.keyCode] = true;  };
    window.onkeyup  = function(e) { self.keys[e.keyCode] = false; };
  },
  update: function(dt)
  {
    this.dx = 0;
    this.dy = 0;
  },
  isMouseDown: function(button)
  {
    return this.buttons[button] == true;
  },
  isMouseUp: function(button)
  {
    return this.buttons[button] == false;
  },
  isKeyDown: function(key)
  {
    return this.keys[key] == true;
  },
  isKeyUp: function(key)
  {
    return this.keys[key] == false;
  },
  clear: function()
  {
    for(var i=0; i<3; i++)
      this.buttons[i] = false;

    // TODO
  }
});
PaperGame.Input.Keys = { SPACE: 32, BACKSPACE: 8, ENTER: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
PaperGame.Input.Buttons = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

PaperGame.Rect = _( 
{
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  initialize: function(x, y, w, h)
  {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
  },
  contains: function()
  {
    switch(arguments.length)
    {
      case 1:
      {
        var rect = arguments[0];
        return this.contains(rect.x, rect.y)              ||
               this.contains(rect.x, rect.y + rect.h)     ||
               this.contains(rect.x + rect.w, rect.y)     ||
               this.contains(rect.x + rect.w, rect.y + rect.h);
      }

      case 2:
      {
        var x = arguments[0];
        var y = arguments[1];
        return (x >= this.x && x <= this.x + this.w &&
                y >= this.y && y <= this.y + this.h);
      }
    }

    return false;
  },
  equals: function(rect)
  {
    return (this.x == rect.x && 
            this.y == rect.y && 
            this.w == rect.w &&
            this.h == rect.h);
  },
  translate: function(dx, dy)
  {
    this.x += dx;
    this.y += dy;
  },
  moveTo: function(x, y)
  {
    this.x = x;
    this.y = y;
  },
  update: function(src)
  {
    this.x = src.x;
    this.y = src.y;
    this.w = src.w;
    this.h = src.h;
  }
});

PaperGame.Entity = _( 
{
  image: null,
  half: null,
  position: null,
  origin: null,
  rotation: 0,
  alive: false,
  visible: false,
  solid: true,
  debug: false,
  frames: [],
  frame: 0,
  stopped: false,
  loop: false,
  time: 0,
  initialize: function(x, y, image, count, loop)
  {
    var count = count || 1;

    this.image = image;
    this.loop = loop || false;
    this.alive = true;
    this.visible = true;
    this.solid = true;
    this.rotation = 0;
    this.frames = [];
    this.frame = 0;
    this.stopped = false;
    this.time = 0;
    this.delay = 1000 / count;
    this.frameW = this.image.width / count;
    this.frameH = this.image.height;

    for(var i=0; i<count; i++)
      this.frames.push(new PaperGame.Rect(i*this.frameW, 0, this.frameW, this.frameH));

    this.half = new PaperGame.Rect(x / 2, y / 2, this.frameW / 2, this.frameH / 2);
    this.position = new PaperGame.Rect(x, y, this.frameW, this.frameH);
    this.origin = new PaperGame.Rect(x, y, this.frameW, this.frameH);
  },
  play: function()
  {
    this.frame = 0;
    this.stopped = false;
  },
  stop: function()
  {
    this.frame = 0;
    this.stopped = true;
  },
  moveTo: function(x, y)
  {
    this.position.moveTo(x, y);
  },
  translate: function(x, y)
  {
    this.position.translate(x, y);
  },
  rotate: function(deg)
  {
    this.rotation += deg * PaperGame.DEG2RAD;
  },
  kill: function()
  {
    this.alive = false;
    this.visible = false;

    return this;
  },
  spawn: function(x, y)
  {
    if(x && y)
      this.moveTo(x, y);

    this.alive = true;
    this.visible = true;

    return this;
  },
  update: function(dt)
  {
    if(!this.stopped && this.frames.length > 1)
    {
      this.time += dt;
      if(this.time > this.delay)
      {
        if(++this.frame == this.frames.length)
        {
            if(this.loop)
            {
              this.frame = 0;
              this.stopped = false;
            }
            else
            {
              this.frame--;
              this.stopped = true;
            }
        }

        this.time = 0;
      }
    }
  },
  render: function(dt, graphics)
  {
    var frame = this.frames[this.frame];

    if(this.rotation > 0)
    {
      // replace this with our own PaperGame.rotate() code??!
      graphics.push();

      graphics.translate(this.position.x, this.position.y);
      graphics.rotate(this.rotation);
      graphics.drawImage(
          this.image,
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          -this.half.w, 
          -this.half.h,
          this.position.w,
          this.position.h);

      if(this.debug)
        graphics.drawBound(-this.half.w, -this.half.h, this.position.w, this.position.h);

      graphics.pop();
    }
    else
    {
      graphics.drawImage(
          this.image, 
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          this.position.x, 
          this.position.y,
          this.position.w,
          this.position.h);

      if(this.debug)
        graphics.drawBound(this.position.x, this.position.y, this.position.w, this.position.h);
    }
  },
  collide: function(entity)
  {
    if(entity.image) // Entity
      return entity.position.contains(this.position);
    
    if(entity.list) // EntityGroup
      return entity.collide(this);

    // Rect
    return entity.contains(this.position);
  },
  beforeAdd: function(group)
  {
    // empty
  },
  afterAdd: function(group)
  {
    // empty
  }
});

PaperGame.EntityGroup = _( 
{
  list: [],
  alive: true,
  visible: true,
  initialize: function()
  {
    this.list = [];
    this.alive = true;
    this.visible = true;
  },
  kill: function()
  {
    for(var i in this.list)
    {
       var _entity = this.list[i];
       if(_entity.alive)
        _entity.kill();
    }
  },
  update: function(dt)
  {
    for(var i in this.list)
    {
      var _entity = this.list[i];
      if(_entity.alive)
        _entity.update(dt);
    }
  },
  render: function(dt, graphics)
  {
    for(var i in this.list)
    {
      var _entity = this.list[i];
      if(_entity.visible)
        _entity.render(dt, graphics);
    }
  },
  collide: function(entity)
  {
    var list = [];
    list.kill = function()
    {
      for(var i=0; i<list.length; i++)
        list[i].kill();
    };

    for(var i in this.list)
    {
      var _entity = this.list[i];
      if( _entity.alive  && 
          _entity.visible && 
          _entity.solid   && 
          entity.collide(_entity))
        list.push(_entity);
    }

    return list.length > 0 ? list : null;
  },
  add: function(entity)
  {
    entity.beforeAdd(this);
    this.list.push(entity);
    entity.afterAdd(this);
  },
  beforeAdd: function(group)
  {
    // empty
  },
  afterAdd: function(group)
  {
    // empty
  }
});

// FIXME: this is a hack and it's not
// useful nor generic; we should add
// generic 'bitmap' font support that
// can be then used to render any text
PaperGame.Label = _(PaperGame.Entity,
{
  text: null,
  initialize: function(text, x, y, font, chars)
  {
    this.text = text;
    this.super('initialize', [x, y, font, chars]);

    if(this.frames.length == 11)
    {
      this.frames[1].w -= 8;
      this.frames[2].x -= 6;
      this.frames[3].x -= 6;
    }
  },
  update: function(dt)
  {
    // empty
  },
  render: function(dt, graphics)
  {
    for(var i=0; i<this.text.length; i++)
    {
      var c = this.text[i];
      if(c < '0' || (c > '9' && c != ':'))
        continue;

      if(c == ':')
        var frame = this.frames[this.frames.length-1];
      else
        var frame = this.frames[parseInt(c)];

      graphics.drawImage(
          this.image, 
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          this.position.x + i*this.frameW, 
          this.position.y,
          this.position.w,
          this.position.h);
    }
  },
  collide: function()
  {
    return false;
  }
});

PaperGame.Timer = _(
{
  time: 0,
  seconds: 0,
  minutes: 0,
  countdown: -1,
  initialize: function(countdown)
  {
    if(countdown) 
      this.countdown = countdown;
  },
  update: function(dt)
  {
    if(this.countdown < 0)
      return;

    if(this.time >= 1000)
    {
      this.minutes = Math.floor(this.countdown / 60);
      this.seconds = this.countdown % 60;

      this.time = 0;
      this.countdown--;
    }

    this.time += dt;
  },
  toString: function()
  {
    var str = '';

    if(this.minutes <= 9)
      str += '0';

    str += this.minutes;

    str += ':';

    if(this.seconds <= 9)
      str += '0';

    str += this.seconds;

    return str;
  }
});

PaperGame.Base = _( 
{
  variables: {},
  w: 0,
  h: 0,
  last: Date.now(),
  frameTime: 0,
  frames: 0,
  fps: 0,
  loaded: false,
  screen: null,
  initialize: function(w, h)
  {  
    // extract and store URL paramaters
    // useful when turning on / off stuff
    // dynamically from within the URL without
    // any changes to the actual code ...
    //
    // i.e HD vs SD quality
    var url = window.location.href.split('?');
    if(url.length == 2)
    {
      var chunks = url[1].split('&');
      for(var i in chunks)
      {
        var kv = chunks[i].split('=');
        if(kv.length == 2)
          this.variables[kv[0]] = kv[1];
      }
    }

    this.w = w || 1280;
    this.h = h || 720;

    this.resources = new PaperGame.Resources();
    this.resources.noAudio = this.variable("noaudio") || false;
   
    if(!this.resources.noAudio && !this.resources.supports.audio)
      throw("Sorry, your browser doesn't support MP3/OGG via the <audio> tag, and I'm too lazy to provide a fallback.");

    this.graphics = new PaperGame.Graphics(this.w, this.h);
    this.input = new PaperGame.Input(this.graphics);
    this.screen = new PaperGame.Rect(0, 0, this.w, this.h);
  },
  variable: function(name, value)
  {
    return this.variables[name] || (value || false);
  },
  exec: function()
  {
    this.tick();
    return this.load();
  },
  load: function()
  { 
    // empty
  },
  ready: function()
  {
    // empty
  },
  render: function(dt)
  {
    // empty
  },
  preProcess: function(dt)
  {
    // empty
  },
  postProcess: function(dt)
  {
    // empty
  },
  update: function(dt)
  {
    // empty
  },
  renderLoading: function(dt)
  {
    var size = 400;
    var loaded = this.resources.count - this.resources.loading;
    var percent = (loaded * 100) / this.resources.count;
    var pixels = (percent * size) / 100;

    var x = (this.w - size) / 2;
    var y = (this.h - 30) / 2;

    this.graphics.drawBound(x, y, size, 30, "#FFFFFF");

    if(pixels > 0)
      this.graphics.drawRect(x + 4, y + 4, pixels - 8, 22, "#FFFFFF");
  },
  tick: function()
  {
    this.now = Date.now();
    var dt = this.now - this.last;

    if(this.loaded == false)
    {
      this.renderLoading(dt);

      if(this.resources.loading == 0 && this.resources.count > 0)
      {
        this.ready();
        this.loaded = true;
      }
    }
    else
    {
      this.update(dt);
      this.input.update(dt);
      this.preProcess(dt);
      this.render(dt);
      this.postProcess(dt);
    }

    if(this.now - this.frameTime >= 1000)
    {
      this.fps = this.frames;
      this.frames = 0;
      this.frameTime = this.now;
    }
    else
    {
      this.frames++;
    }

    this.last = this.now;

    var self = this;
    requestAnimationFrame(function() { self.tick(); });
  }
});

window.onload = function() 
{
  var game = null;

  for(var i in window)
  {
    var c = window[i];
    if(typeof(c) == 'object' && c && 'Game' in c)
    {
      game = c;
      break;
    }
  }

  if(game == null)
  {
    alert('Game not found!');
    return;
  }

  try
  {
    PaperGame.instance = new game.Game();
    game.instance = PaperGame.instance;
    game.instance.exec();
  }
  catch(err)
  {
    alert(err);
  }
};
