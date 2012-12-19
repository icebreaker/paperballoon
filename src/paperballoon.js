//
// PaperBalloon v0.1
// Copyright (c) 2012, Mihail Szabolcs
// MIT license, for more information see LICENSE.
//
if(typeof require == "function")
  require("src/papergame.js");

var PaperBalloon = 
{ 
  w: 1102, 
  h: 620,
  States: 
  { 
    INTRO : 0, 
    GAME  : 1, 
    OVER  : 2, 
    WIN   : 3
  }
};

/*************************** Cloud Entity *************************/
PaperBalloon.Cloud = _(PaperGame.Entity,
{
  speed: 31,
  update: function(dt)
  {
      if(this.position.x > PaperBalloon.w)
      {
        this.spawn(-180, this.origin.y);
        this.speed = PaperGame.random(31, 35);
      }
      else
      {
        this.translate(this.speed * dt * 0.001, 0);
      }
  }
});

/*************************** Balloon Entity *************************/
PaperBalloon.Balloon = _(PaperGame.Entity,
{
  girl: null,
  boy: null,
  girlY: 0,
  boyY: 0,
  speed: 40,
  mode: 0,
  initialize: function(x, y, image, girl, boy)
  {
    this.girl = girl;
    this.boy = boy;
    this.super('initialize', [x, y, image]);
  },
  render: function(dt, graphics)
  {
    graphics.drawImage(this.boy, this.position.x + 70, this.position.y + this.position.h - this.boy.height - this.boyY);
    graphics.drawImage(this.girl, this.position.x + 110, this.position.y + this.position.h - this.girl.height - this.girlY);
    this.super('render', arguments);
  },
  update: function(dt)
  {
    switch(this.mode)
    {
      case 0: // init
      {
        if(this.girlY > 60 && this.boyY > 60)
          this.mode++; 
        else
        {
          if(this.girlY < 60)
            this.girlY += dt * 0.001 * 30;

          if(this.boyY < 60)
            this.boyY += dt * 0.001 * 40;
        }
      }
      break;
      case 1: // idle
        break;
      case 2: // launch
      {
        if(this.position.x < -this.position.h)
          this.mode = 5;
        else
          this.translate(0, dt * 0.001 * -40);
      }
      break;
      case 3: // kill / hide
      {
        if(this.girlY < 0 && this.boyY < 0)
        {
          this.girlY = this.boyY = 0;
          this.mode++;
        }
        else
        {
          if(this.girlY > 0)
            this.girlY -= dt * 0.001 * 40;

          if(this.boyY > 0)
            this.boyY -= dt * 0.001 * 20;
        }
      }
      break;
      case 4: // fail / dead
        break;
      case 5: // win
        break;
    }
  },
  launch: function()
  {
    this.mode = 2; // launch
  },
  kill: function()
  {
    this.mode = 3; // hide
  }
});

/*************************** Mummy Entity *************************/
PaperBalloon.Mummy = _(PaperGame.Entity,
{
  smoke: null,
  sound: null,
  lifes: 1,
  speed: 60,
  boss: false,
  initialize: function(x, y, image, smoke, sound, boss)
  {
    this.boss = boss || false;
    this.smoke = new PaperGame.Entity(0, 0, smoke, 5);
    this.smoke.solid = false;
    this.smoke.delay -= 100;
    this.smoke.visible = false;

    this.sound = sound;
    this.super('initialize', [x, y, image, 4, true]);
  },
  update: function(dt)
  {
    if(this.smoke.visible)
      this.smoke.update(dt);

    if(this.position.x > PaperBalloon.w)
      this.spawn();
    else
      this.translate(this.speed * dt * 0.001, 0);

    this.super('update', arguments);
  },
  render: function(dt, graphics)
  {
    if(this.smoke.visible)
      this.smoke.render(dt, graphics);

    this.super('render', arguments);
  },
  spawn: function()
  {
    this.lifes = this.boss ? 10 : 1;
    this.speed = PaperGame.randomEven(80, 100);
    return this.super('spawn', [-180, this.origin.y]);
  },
  kill: function()
  {
    if(--this.lifes == 0)
    {
      this.smoke.spawn(this.position.x, this.position.y).play();
      this.sound.play2();
      return this.spawn();
    }

    return this;
  }
});

/*************************** Cannon Ball Entity *************************/
PaperBalloon.CannonBall = _(PaperGame.Entity,
{
  xi: 5.0,
  yi: 1.0,
  initialize: function(x, y, image, smoke, sound)
  {
    this.sound = sound;
    this.smoke = new PaperGame.Entity(0, 0, smoke, 5);
    this.smoke.solid = false;
    this.smoke.visible = false;
    this.smoke.delay -= 100;
    this.super('initialize', [x, y, image]);
  },
  update: function(dt)
  {
    var dx = this.xi * (dt * 0.05);
    var dy = this.yi * (dt * 0.05);
    this.translate(-dx, -dy);
    this.yi -= 0.05; // decrease this with 'dt'
  },
  spawn: function(x, y)
  {
    this.super('spawn', arguments);
    this.smoke.spawn(this.position.x, this.position.y).play();
    this.sound.play2();
  },
  kill: function()
  {
    this.smoke.spawn(this.position.x, this.position.y).play();
    this.sound.play2();
    this.super('kill', arguments);
  },
  afterAdd: function(group)
  {
    group.add(this.smoke);
  }
});

/*************************** Cannon Entity *************************/
PaperBalloon.Cannon = _(PaperGame.Entity,
{
  speed: 22,
  destroyable: false,
  initialize: function(x, y, image, pipe, smoke2, ball, smoke, smoke_ball, sound)
  {
    this.pipe = new PaperGame.Entity(x + 35, y - 2, pipe);
    this.pipe.rotation = 0.1;
    this.ball = new PaperBalloon.CannonBall(x - 29, y - 19, ball, smoke_ball, sound);
    this.ball.visible = false;
    this.ball.alive = false;
    this.fake_ball = new PaperBalloon.CannonBall(x - 29, y - 19, ball, smoke_ball, sound);
    this.fake_ball.alive = false;
    this.smoke = new PaperGame.Entity(0, 0, smoke2, 5);
    this.smoke.solid = false;
    this.smoke.delay -= 100;
    this.smoke.visible = false;
    this.super('initialize', [x, y, image]);
  },
  handle: function(d1, d2, d3)
  {
    // TODO: implement handling here, do not use fake_ball
  },
  launch: function()
  {
    if(this.ball.alive)
      return false;

    this.ball.spawn(this.fake_ball.position.x, this.fake_ball.position.y);
    this.ball.yi = this.pipe.rotation * 6;

    this.fake_ball.visible = false;
    return true;
  },
  reload: function()
  {
    this.fake_ball.visible = true;
  },
  kill: function()
  {
    this.ball.kill();
    this.fake_ball.kill();
    this.pipe.kill();
    this.smoke.spawn(this.position.x - 10, this.position.y - 40).play();
    this.super('kill', arguments);
  },
  beforeAdd: function(group)
  {
    group.add(this.ball);
    group.add(this.fake_ball);
    group.add(this.pipe);
  },
  afterAdd: function(group)
  {
    group.add(this.smoke);
  }
});

PaperBalloon.Game = _(PaperGame.Base, 
{
  gfx:
  { 
    sky: {},
    intro: {},
    game: {}
  },
  sounds: 
  {
    intro: {},
    game: {}
  },
  buffer: null,
  state: PaperBalloon.States.INTRO,
  sky: null,
  mummies: null,
  intro: null,
  game: null,
  ground: null,
  cannons: null,
  ended: 0,
  load: function()
  {
    // SOUND AND MUSIC
    this.sounds.intro.loop = this.resources.loadAudio("lost_in_egypt", true, 90);
    this.sounds.game.loop = this.resources.loadAudio("the_gathering_of_spirits_beyond", true, 90);
    this.sounds.game.end = this.resources.loadAudio("the_crescent", true, 90);
    this.sounds.game.cannon_fire = this.resources.loadAudio("cannon_fire", false, 50);
    this.sounds.game.mummy_die = this.resources.loadAudio("mummy_die", false, 60);
    this.sounds.game.mummy_win_one = this.resources.loadAudio("mummy_win_one");
    this.sounds.game.mummy_win_two = this.resources.loadAudio("mummy_win_two");
    this.sounds.game.mummy_fail = this.resources.loadAudio("mummy_fail");
    this.sounds.game.boy_arr = this.resources.loadAudio("boy_arr");
    this.sounds.game.girl_scream = this.resources.loadAudio("girl_scream");

    // GRAPHICS
    this.gfx.background = this.resources.loadImage("background_b");

    // SKY
    this.gfx.sky.sun     = this.resources.loadImage("sun");
    this.gfx.sky.cloud_1 = this.resources.loadImage("cloud_one");
    this.gfx.sky.cloud_2 = this.resources.loadImage("cloud_two");
    this.gfx.sky.cloud_3 = this.resources.loadImage("cloud_three");

    // INTRO
    this.gfx.intro.board  = this.resources.loadImage("intro");
    this.gfx.intro.name   = this.resources.loadImage("name");

    // GAME
    this.gfx.game.balloon = this.resources.loadImage("balloon");
    this.gfx.game.cannon_mount = this.resources.loadImage("cannon_mount");
    this.gfx.game.cannon_pipe = this.resources.loadImage("cannon_pipe");
    this.gfx.game.cannon_ball = this.resources.loadImage("cannon_ball");

    this.gfx.game.mummy = this.resources.loadImage("mummy");
    this.gfx.game.mummy2= this.resources.loadImage("mummy_two");

    this.gfx.game.smoke = this.resources.loadImage("smoke");
    this.gfx.game.smoke2= this.resources.loadImage("smoke2");
    this.gfx.game.smoke_ball = this.resources.loadImage("smoke_ball");

    this.gfx.game.font = this.resources.loadImage("font");

    this.gfx.game.win = this.resources.loadImage("win");
    this.gfx.game.fail= this.resources.loadImage("fail");

    this.gfx.game.girl = this.resources.loadImage("girl");
    this.gfx.game.boy = this.resources.loadImage("boy");
  },
  ready: function()
  {
    this.ground = new PaperGame.Rect(-200, this.h - 50, this.w + 200, 50);

    this.sky = new PaperGame.EntityGroup();
    this.sky.add(new PaperGame.Entity(this.w - 300, 50, this.gfx.sky.sun));
    this.sky.add(new PaperBalloon.Cloud(100, 50, this.gfx.sky.cloud_1));
    this.sky.add(new PaperBalloon.Cloud(200, 150, this.gfx.sky.cloud_3));
    this.sky.add(new PaperBalloon.Cloud(400, 30, this.gfx.sky.cloud_2));

    this.balloon = new PaperBalloon.Balloon(this.w - 230, 180, this.gfx.game.balloon, this.gfx.game.girl, this.gfx.game.boy);

    this.intro = new PaperGame.EntityGroup();
    this.intro.add(this.sky);
    this.intro.add(this.balloon);
    this.intro.add(new PaperGame.Entity(this.w - 560, 180, this.gfx.intro.name));
    this.intro.add(new PaperGame.Entity(90, 280, this.gfx.intro.board));

    this.game = new PaperGame.EntityGroup();
    this.game.add(this.sky);
    this.game.add(this.balloon);

    // cannon on the roof
    this.cannon_one = new PaperBalloon.Cannon(
      760, 348,
      this.gfx.game.cannon_mount, 
      this.gfx.game.cannon_pipe,
      this.gfx.game.smoke2,
      this.gfx.game.cannon_ball,
      this.gfx.game.smoke,
      this.gfx.game.smoke_ball,
      this.sounds.game.cannon_fire
    );
    this.game.add(this.cannon_one);

    // cannon on the floor
    this.cannon_two = new PaperBalloon.Cannon(
      680, 535,
      this.gfx.game.cannon_mount, 
      this.gfx.game.cannon_pipe,
      this.gfx.game.smoke2,
      this.gfx.game.cannon_ball,
      this.gfx.game.smoke,
      this.gfx.game.smoke_ball,
      this.sounds.game.cannon_fire
    );
    this.cannon_two.destroyable = true;
    this.game.add(this.cannon_two);

    // FIXME: make this a group
    this.cannons = [];
    this.cannons.push(this.cannon_one);
    this.cannons.push(this.cannon_two);

    this.mummies = new PaperGame.EntityGroup();
    for(var i=0; i<30; i++)
    {
      var m = new PaperBalloon.Mummy(-180*i, 480, this.gfx.game.mummy, this.gfx.game.smoke, this.sounds.game.mummy_die);
      this.mummies.add(m);
    }
    for(var i=30; i<41; i++)
    {
      var m = new PaperBalloon.Mummy(-180*i, 480, this.gfx.game.mummy2, this.gfx.game.smoke, this.sounds.game.mummy_die, true);
      this.mummies.add(m);
    }
    this.game.add(this.mummies);

    this.score = new PaperGame.Label("0", 50, 50, this.gfx.game.font, 11);

    this.time = new PaperGame.Timer(240);
    this.time_label = new PaperGame.Label("", this.w - 180, 50, this.gfx.game.font, 11);

    this.game.add(this.time_label);
    this.game.add(this.score);

    this.win = new PaperGame.Entity(90, 280, this.gfx.game.win);
    this.win.visible = false;
    this.game.add(this.win);

    this.fail = new PaperGame.Entity(90, 280, this.gfx.game.fail);
    this.fail.visible = false;
    this.game.add(this.fail);

    this.sounds.intro.loop.play2();
  },
  restart: function()
  {
    this.sounds.game.end.pause();
    this.state = PaperBalloon.States.INTRO;
    this.ready();
  },
  render: function(dt)
  {
    this.graphics.clear();
    this.graphics.drawImage(this.gfx.background, 0, 0);
//    this.graphics.drawBound(this.ground.x, this.ground.y, this.ground.w, this.ground.h);

    if(this.state == PaperBalloon.States.INTRO)
        this.intro.render(dt, this.graphics);
    else
        this.game.render(dt, this.graphics);

//    if(this.variable("fps"))
//      this.graphics.drawText('fps ' + this.fps, 10, 10, "#FFFFFF");
  },
  update: function(dt)
  {
    if(this.state == PaperBalloon.States.INTRO)
    {
      this.intro.update(dt);

      if(this.input.isMouseDown(PaperGame.Input.Buttons.LEFT))
      {
        this.sounds.intro.loop.pause();
        this.sounds.game.loop.play2();
        this.state = PaperBalloon.States.GAME;
        this.input.clear();
      }
    }
    else
    {
      if(this.state == PaperBalloon.States.GAME)
      {
        this.time.update(dt);
        this.time_label.text = this.time.toString();

        if(this.time.countdown < 0)
        {
          this.ended = 0;
          this.win.visible = true;
          this.state = PaperBalloon.States.WIN;
          this.balloon.launch();
          this.sounds.game.loop.pause();
          this.sounds.game.end.play2(130);
          this.sounds.game.mummy_fail.play2();
          return;
        }
        else if(this.balloon.collide(this.mummies))
        {
          this.ended = 0;
          this.balloon.kill();
          this.fail.visible = true;
          this.state = PaperBalloon.States.FAIL;
          this.sounds.game.loop.pause();
          this.sounds.game.end.play2();
          this.sounds.game.boy_arr.play2();
          this.sounds.game.girl_scream.play2();
          if(PaperGame.random(2) == 0)
            this.sounds.game.mummy_win_one.play2();
          else
            this.sounds.game.mummy_win_two.play2();
          return;
        }

        // FIXME:
        //
        // This is hacky, we should implement a 2D Matrix
        // abstraction layer and rotate, translate,
        // etc. then read back the position of the ball.
        // 
        // Right now we just use a cheap 'aproximation' 
        // hack and move it with the pipe.
        //
        // Too bad it's not possible to read back the
        // current transfrom the from the canvas context.
        //
        var d1 = dt * 0.001 * 70;
        var d2 = dt * 0.001 * 15;
        var d3 = dt * 0.001 * 80;

        for(var i in this.cannons)
        {
          var cannon = this.cannons[i];
          if(!cannon.alive) continue;

          if(this.input.dy > 0 && cannon.pipe.rotation >= 0.1)
          {
            cannon.fake_ball.translate(-d2, d1);
            cannon.pipe.rotate(-d3);
          }
          else if(this.input.dy < 0 && cannon.pipe.rotation <= 0.4)
          {
            cannon.fake_ball.translate(d2, -d1);
            cannon.pipe.rotate(d3);
          }

          if(this.input.isMouseDown(PaperGame.Input.Buttons.LEFT))
            cannon.launch();

          if(cannon.ball.alive)
          {
            var _mummies = cannon.ball.collide(this.mummies);
            if(_mummies)
            {
              cannon.ball.kill();
              cannon.reload();
              _mummies.kill();
              this.score.text = '' + (parseInt(this.score.text) + _mummies.length);
            }
            else if(cannon.ball.collide(this.ground))
            {
              cannon.ball.kill();
              cannon.reload();
            }
          }
        
          if(cannon.destroyable)
          {
            var _mummies = cannon.collide(this.mummies);
            if(_mummies)
            {
              cannon.kill();
              _mummies.kill();
            }
          }
        }
      }
      else
      {
        this.ended += dt;
        if(this.ended > 3000 && this.input.isMouseDown(PaperGame.Input.Buttons.LEFT))
          this.restart();
      }

      this.game.update(dt);
    }
  }
}, [PaperBalloon.w, PaperBalloon.h]);
