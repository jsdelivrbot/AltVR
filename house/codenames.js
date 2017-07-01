<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Codenames 2</title>
  <script src="https://aframe.io/releases/0.3.0/aframe.js"></script>
  <script src="https://sdk.altvr.com/libs/altspace.js/2.4.0/altspace.min.js"></script>
  <script src="https://tweenjs.github.io/tween.js/src/Tween.js"></script>
</head>
<body>
  <a-scene altspace='fullspace: true' sync-system='author: BenG; app: Codenames; refUrl: https://altvr-apps.firebaseio.com/'>
    <a-assets>
      <a-mixin id='redhat' geometry='primitive: sphere; radius: 0.15' material='color: red' position='0 .02 0' n-skeleton-parent='part: head' sync sync-n-skeleton-parent></a-mixin>
      <a-mixin id='bluehat' geometry='primitive: sphere; radius: 0.15' material='color: blue' position='0 .02 0' n-skeleton-parent='part: head' sync sync-n-skeleton-parent></a-mixin>
      <a-mixin id='redhat2' geometry='primitive: torus; radius: 0.1; radius-tubular: 0.01' material='color: red' position='0 .2 0'  rotation='90 0 0' n-skeleton-parent='part: head' sync sync-n-skeleton-parent></a-mixin>
      <a-mixin id='bluehat2' geometry='primitive: torus; radius: 0.1; radius-tubular: 0.01' material='color: blue' position='0 .2 0' rotation='90 0 0' n-skeleton-parent='part: head' sync sync-n-skeleton-parent></a-mixin>
    </a-assets>
    
    <a-entity id='cont' scale='.5 .5 .5'>
      <a-image id='border' scale='4.55 3.05 .01' position='0 0 -.01' src='https://bengarfield.github.io/AltVR/codenames/border.png' n-box-collider='type: environment; convex: false' altspace-cursor-collider='enabled: false'></a-image>
      <a-plane id='bluePanel' position='2.8 .6 .25' rotation='0 -30 0' material='side: double; color: darkblue'>
        <a-entity id=bluename position='0 0 .01' scale='.5 .5 .5' n-text='fontSize: 2; text: Blue'></a-entity>
      </a-plane>
      <a-plane id='redPanel' position='-2.8 .6 .25' rotation='0 30 0' material='side: double; color: darkred'>
        <a-entity id='redname' position='0 0 .01' scale='.5 .5 .5' n-text='fontSize: 2; text: Red'></a-entity>
      </a-plane>
      <a-box id='shuf' position='1.7 -1.7 0' scale='.8 .3 .05' color='black'></a-box>
      <a-entity position='1.7 -1.7 .03' scale='.5 .5 .5' n-text='fontSize: 2; text: Shuffle'></a-entity>
      <a-box id='switchT' position='.8 -1.7 0' scale='.8 .3 .05' color='black'></a-box>
      <a-entity id='switchT2' position='.8 -1.7 .03' scale='.5 .5 .5' n-text='fontSize: 2; text: End Turn'></a-entity>
      
      <a-entity id='clickSound'></a-entity><a-entity id='failSound'></a-entity><a-entity id='bystanderSound'></a-entity>
      <a-entity id='assassinSound'></a-entity><a-entity id='winSound'></a-entity><a-entity id='redSound'></a-entity>
      <a-entity id='blueSound'></a-entity>      
    </a-entity>
    
    <a-entity id='party' position='0 -1000 0'>
      <a-plane id='poolcover' scale='10 15 .01' position='5 -.1 14' rotation='-90 0 0' material='visible: false' n-box-collider='type: environment; convex: false'></a-plane>
      <a-box id='roof' scale='2 .7 .8' position='-6.2 6 2.85' rotation='45 0 0' material='visible: false' n-box-collider='type: environment; convex: false'></a-box>
      <a-plane id='tv' scale='.6 .5 1' position='7.5 -1.32 1.47' rotation='0 -120 0'></a-plane>
    </a-entity>
  </a-scene>
<script>
  var scene = document.querySelector('a-scene');
  scene.addEventListener('connected', function() {
    var sync = scene.systems['sync-system'].connection;
    altspace.getUser().then(function(user){
      if (user.isModerator) {
        //switchT.setAttribute('position', '0 -1000 0');
        //switchT2.setAttribute('position', '0 -1000 0');
        //createModControls();
      }
      
      altspace.getSpace().then(function(space){
        if (space.templateSid.includes('house-party')) {
          party.setAttribute('position', '0 0 0');
        }
      });

      var words = sync.instance.child('words');
      var key = sync.instance.child('key');
      var revealed = sync.instance.child('revealed');
      var spyMR = sync.instance.child('red');
      var spyMB = sync.instance.child('blue');
      var currTeam = sync.instance.child('current');
      var syncGO = sync.instance.child('gameover');
      var syncSound = sync.instance.child('sound');
      var syncPos = sync.instance.child('location');
      var syncTV = sync.instance.child('tv');

      syncTV.on('value', function(data){
        if (data.val() == null) {
          tv.setAttribute('position', '7.5 -1.32 1.47');
        } else {
          tv.setAttribute('position', '7.5 1.32 1.47');
          tv.setAttribute('src', data.val());
        }
      });
      
      var isSM = false;
      var team = '';
      var red = false;
      var blue = false;
      var redName = '';
      var blueName = '';
      var currentTeam = '';
      var gameOver = true;

      var currWords = [];
      var rev = [];

      var list = ['Hollywood','Well','Foot','New York','Spring','Court','Tube','Point','Tablet','Slip','Date','Drill','Lemon','Bell',
      'Screen','Fair','Torch','State','Match','Iron','Block','France','Australia','Limousine','Stream','Glove','Nurse','Leprechaun',
      'Play','Tooth','Arm','Bermuda','Diamond','Whale','Comic','Mammoth','Green','Pass','Missile','Paste','Drop','Phoenix',
      'Marble','Staff','Figure','Park','Centaur','Shadow','Fish','Cotton','Egypt','Theater','Scale','Fall','Track','Force',
      'Dinosaur','Bill','Mine','Turkey','March','Contract','Bridge','Robin','Line','Plate','Band','Fire','Bank','Boom',
      'Cat','Shot','Suit','Chocolate','Roulette','Mercury','Moon','Net','Lawyer','Satellite','Angel','Spider','Germany','Fork',
      'Pitch','King','Crane','Trip','Dog','Conductor','Part','Bugle','Witch','Ketchup','Press','Spine','Worm','Alps',
      'Bond','Pan','Beijing','Racket','Cross','Seal','Aztec','Maple','Parachute','Hotel','Berry','Soldier','Ray','Post',
      'Greece','Square','Mass','Bat','Wave','Car','Smuggler','England','Crash','Tail','Card','Horn','Capital','Fence',
      'Deck','Buffalo','Microscope','Jet','Duck','Ring','Train','Field','Gold','Tick','Check','Queen','Strike','Kangaroo',
      'Spike','Scientist','Engine','Shakespeare','Wind','Kid','Embassy','Robot','Note','Ground','Draft','Ham','War','Mouse',
      'Center','Chick','China','Bolt','Spot','Piano','Pupil','Plot','Lion','Police','Head','Litter','Concert','Mug',
      'Vacuum','Atlantis','Straw','Switch','Skyscraper','Laser','Scuba Diver','Africa','Plastic','Dwarf','Lap','Life','Honey','Horseshoe',
      'Unicorn','Spy','Pants','Wall','Paper','Sound','Ice','Tag','Web','Fan','Orange','Temple','Canada','Scorpion',
      'Undertaker','Mail','Europe','Soul','Apple','Pole','Tap','Mouth','Ambulance','Dress','Ice Cream','Rabbit','Buck','Agent',
      'Sock','Nut','Boot','Ghost','Oil','Superhero','Code','Kiwi','Hospital','Saturn','Film','Button','Snowman','Helicopter',
      'Loch Ness','Log','Princess','Time','Cook','Revolution','Shoe','Mole','Spell','Grass','Washer','Game','Beat','Hole',
      'Horse','Pirate','Link','Dance','Fly','Pit','Server','School','Lock','Brush','Pool','Star','Jam','Organ',
      'Berlin','Face','Luck','Amazon','Cast','Gas','Club','Sink','Water','Chair','Shark','Jupiter','Copper','Jack',
      'Platypus','Stick','Olive','Grace','Bear','Glass','Row','Pistol','London','Rock','Van','Vet','Beach','Charge',
      'Port','Disease','Palm','Moscow','Pin','Washington','Pyramid','Opera','Casino','Pilot','String','Night',
      'Chest','Yard','Teacher','Pumpkin','Thief','Bark','Bug','Mint','Cycle','Telescope','Calf','Air',
      'Box','Mount','Thumb','Antarctica','Trunk','Snow','Penguin','Root','Bar','File','Hawk','Battery',
      'Compound','Slug','Octopus','Whip','America','Ivory','Pound','Sub','Cliff','Lab','Eagle','Genius',
      'Ship','Dice','Hood','Heart','Novel','Pipe','Himalayas','Crown','Round','India','Needle','Shop',
      'Watch','Lead','Tie','Table','Cell','Cover','Czech','Back','Bomb','Ruler','Forest','Bottle',
      'Space','Hook','Doctor','Ball','Bow','Degree','Rome','Plane','Giant','Nail','Dragon','Stadium',
      'Flute','Carrot','Wake','Fighter','Model','Tokyo','Eye','Mexico','Hand','Swing','Key','Alien',
      'Tower','Poison','Cricket','Cold','Knife','Church','Board','Cloak','Ninja','Olympus','Belt','Light',
      'Death','Stock','Millionaire','Day','Knight','Pie','Bed','Circle','Rose','Change','Cap','Triangle'];
      var colors = ['darkred','darkred','darkred','darkred','darkred','darkred','darkred','darkred','darkred','darkblue','darkblue','darkblue','darkblue','darkblue','darkblue','darkblue','darkblue','wheat','wheat','wheat','wheat','wheat','wheat','wheat','black'];

      for (var i = 0; i < 25; i++) {
        var x = -1.8 + (i * .9);
        var y = 1.2;

        if (i > 4) {
          y = y - .6;
          x = -1.8 + ((i - 5) * .9);
        }
        if (i > 9) {
          y = y - .6;
          x = -1.8 + ((i - 10) * .9);
        }
        if (i > 14) {
          y = y - .6;
          x = -1.8 + ((i - 15) * .9);
        }
        if (i > 19) {
          y = y - .6;
          x = -1.8 + ((i - 20) * .9);
        }

        var c = document.createElement('a-entity');
        c.setAttribute('id', 'card' + i);
        c.setAttribute('position', {x:x,y:y,z:0});
        cont.appendChild(c);

        var t = document.createElement('a-entity');
        t.setAttribute('id', 'text' + i);
        t.setAttribute('n-text', 'fontSize: 1; text: ' + (i + 1));
        //t.setAttribute('n-object', 'res: effects/fire-trail');
        t.setAttribute('position', {x:0,y:0,z:.03});
        c.appendChild(t);

        var c1 = document.createElement('a-plane');
        c1.setAttribute('id', 'cardFront' + i);
        c1.setAttribute('scale', '.8 .5 .01');
        c1.setAttribute('transparent', 'true');
        c1.setAttribute('src', 'https://bengarfield.github.io/AltVR/codenames/card.png');
        c1.setAttribute('n-box-collider', 'type: hologram');
        c1.setAttribute('position', {x:0,y:0,z:0});
        c.appendChild(c1);

        var c2 = document.createElement('a-plane');
        c2.setAttribute('id', 'cardBack' + i);
        c2.setAttribute('scale', '.8 .5 .01');
        c2.setAttribute('rotation', '0 180 0');
        c2.setAttribute('src', 'https://bengarfield.github.io/AltVR/codenames/cardCovered.png');
        c2.setAttribute('transparent', 'true');
        c2.setAttribute('color', 'black');
        //c2.setAttribute('n-box-collider', 'type: hologram');
        c2.setAttribute('position', {x:0,y:0,z:0});
        c.appendChild(c2);

        c1.addEventListener('mouseup', function(e){
          if (isSM) {
            var id = Number(e.target.id.slice(9,e.target.id.length));
            if (rev.indexOf(id) == -1 && !gameOver) {
              revealed.push('a' + (id + 1));
              if (colors[id] == 'black') {
                syncSound.set('assassin');
                if (currentTeam == 'red') {
                  setTimeout(function(){syncSound.set('blue');}, 3000);
                  setTimeout(function(){syncSound.set(null);}, 3500);
                  currTeam.set('bluewins');
                } else {
                  setTimeout(function(){syncSound.set('red');}, 3000);
                  setTimeout(function(){syncSound.set(null);}, 3500);
                  currTeam.set('redwins');
                }
                syncGO.set(true);
              } else {
                if (currentTeam == 'red') {
                  if (colors[id] == 'darkred') {
                    syncSound.set('win');
                  } else {
                    if (colors[id] == 'darkblue') {
                      syncSound.set('fail');
                    } else {
                      syncSound.set('bystander');
                    }
                    currTeam.set('blue');
                  }
                } else {
                  if (colors[id] == 'darkblue') {
                    syncSound.set('win');
                  } else  {
                    if (colors[id] == 'darkred') {
                      syncSound.set('fail');
                    } else {
                      syncSound.set('bystander');
                    }
                    currTeam.set('red');
                  }
                }
                if (countColors2().darkred == countColors().darkred) {
                  setTimeout(function(){syncSound.set('red');}, 2000);
                  setTimeout(function(){syncSound.set(null);}, 2500);
                  currTeam.set('redwins');
                  syncGO.set(true);
                } else if (countColors2().darkblue == countColors().darkblue) {
                  setTimeout(function(){syncSound.set('blue');}, 2000);
                  setTimeout(function(){syncSound.set(null);}, 2500);
                  currTeam.set('bluewins');
                  syncGO.set(true);
                } else {
                  setTimeout(function(){syncSound.set(null);}, 500);
                }
              }
            }
          }
        });
      }

      setupSounds();

      function black(id) {
        var dirs = [];
        var dirs2 = [];
        for (var i = 0; i < 25; i++) {
          var v = new THREE.Vector3().subVectors(document.querySelector('#card' + i).object3D.position,
                                  document.querySelector('#card' + id).object3D.position).normalize().clone()
          dirs.push({x:v.x,y:v.y,z:v.z});
          dirs2.push({x:v.x,y:v.y,z:v.z});
        }
        var x = {x:0.0};
        new TWEEN.Tween(x).to({x:1.0}, 2000).onUpdate(function(){
          for (var i = 0; i < 25; i++) {
            document.querySelector('#card' + i).object3D.position.add(new THREE.Vector3(dirs[i].x,dirs[i].y,dirs[i].z).divideScalar(10));
            var rot = document.querySelector('#card' + i).object3D.rotation;
            document.querySelector('#card' + i).object3D.quaternion.setFromEuler(
              new THREE.Euler(rot.x + (dirs2[i].y / -10),rot.y + (dirs2[i].x / 10),rot.z + (dirs2[i].z / 10)));
            if (i != id){
              dirs[i].y -= .05;
            }
          }
        }).onComplete(function(){
          for (var i = 0; i < 25; i++) {
            if (i != id) {
              /*document.querySelector('#cardFront' + i).setAttribute('opacity', '0');
              document.querySelector('#cardBack' + i).setAttribute('opacity', '0');
              document.querySelector('#text' + i).setAttribute('n-text', 'fontSize: 1; text: <alpha=#00>' + currWords[i]);*/
              if (rev.indexOf(i) != -1){
                document.querySelector('#card' + i).setAttribute('rotation', '0 180 0');
              } else {
                document.querySelector('#card' + i).setAttribute('rotation', '0 0 0');
              }
              /*var x = -1.8 + (i * .9);
              var y = 1.2;
              if (i > 4) {
                y = y - .6;
                x = -1.8 + ((i - 5) * .9);
              }
              if (i > 9) {
                y = y - .6;
                x = -1.8 + ((i - 10) * .9);
              }
              if (i > 14) {
                y = y - .6;
                x = -1.8 + ((i - 15) * .9);
              }
              if (i > 19) {
                y = y - .6;
                x = -1.8 + ((i - 20) * .9);
              }
              document.querySelector('#card' + i).setAttribute('position', {x:x,y:y,z:0});
              
              new TWEEN.Tween(document.querySelector('#cardFront' + i).object3D.children[0].material).to({opacity: 1}, 1000).start();
              new TWEEN.Tween(document.querySelector('#cardBack' + i).object3D.children[0].material).to({opacity: 1}, 1000).start();*/
            }
          }
          /*var trans = {a:0}
          new TWEEN.Tween(trans).to({a: 255}, 1000).onUpdate(function(){
            for (var j = 0; j < 25; j++) {
              var t = Math.round(trans.a).toString(16);
              if (t.length == 1) {
                t = '0' + t;
              }
              document.querySelector('#text' + j).setAttribute('n-text', 'fontSize: 1; text: <alpha=#' + t + '>' + currWords[j]);
            }
          }).start()*/
        }).start();
      }

      words.on('value', function(data){
        console.log(data.val());
        if (data.val() != null) {
          currWords = data.val();
          for (var i = 0; i < 25; i++) {
            document.querySelector('#text' + i).setAttribute('n-text', 'fontSize: 1; text: ' + data.val()[i]);
            var x = -1.8 + (i * .9);
            var y = 1.2;
            if (i > 4) {
              y = y - .6;
              x = -1.8 + ((i - 5) * .9);
            }
            if (i > 9) {
              y = y - .6;
              x = -1.8 + ((i - 10) * .9);
            }
            if (i > 14) {
              y = y - .6;
              x = -1.8 + ((i - 15) * .9);
            }
            if (i > 19) {
              y = y - .6;
              x = -1.8 + ((i - 20) * .9);
            }
            document.querySelector('#card' + i).setAttribute('position', {x:x,y:y,z:0});
          }
        } else {
          shuffle();
        }
      });

      key.on('value', function(data){
        if (data.val() != null) {
          colors = data.val();
          if (isSM) {
            for (var i = 0; i < 25; i++) {
              document.querySelector('#cardFront' + i).setAttribute('color', '' + data.val()[i]);
            }
          }
          updateNames();
        }
      });

      revealed.on('child_added', function(childSnapshot, prevChildKey){
        var id = Number(childSnapshot.val().slice(1,childSnapshot.val().length)) - 1;
        rev.push(id);
        if (colors[id] == 'black' && !gameOver) {
          black(id);
        }
        new TWEEN.Tween(document.querySelector('#card' + id).object3D.rotation).to({x:0,y:Math.PI,z:0}, 500).start();
        document.querySelector('#cardBack' + id).setAttribute('color', colors[id]);
        updateNames()
      });
      revealed.on('child_removed', function(oldChildSnapshot) {
        rev = [];
        TWEEN.removeAll();

        if (currentTeam == 'red') {
          new TWEEN.Tween(redPanel.object3D.children[1].material.color).to({r:0.897,g:0,b:0}, 500).start();
          new TWEEN.Tween(bluePanel.object3D.children[1].material.color).to({r:0,g:0,b:0.153}, 500).start();
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0.897,g:0,b:0}, 500).start();
        } else if (currentTeam == 'blue') {
          new TWEEN.Tween(redPanel.object3D.children[1].material.color).to({r:0.153,g:0,b:0}, 500).start();
          new TWEEN.Tween(bluePanel.object3D.children[1].material.color).to({r:0,g:0,b:0.897}, 500).start();
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0,g:0,b:0.897}, 500).start();
        }

        for (var i = 0; i < 25; i++) {
          document.querySelector('#cardBack' + i).setAttribute('color', 'black');
          new TWEEN.Tween(document.querySelector('#card' + i).object3D.rotation).to({x:0,y:0,z:0}, 500).start();
        }
        updateNames()
      });

      spyMR.on('value', function(data){
          if (data.val() == null) {
            red = false;
            redName = 'Click to join';
            scene.systems['sync-system'].removeLast('red');
            if (team == 'red') {
              isSM = false;
              team = '';
              red = false;
              if (!gameOver){
                hideColors();
              }
              spyMR.onDisconnect().cancel();
            }
          } else {
            red = true;
            redName = data.val();
          }
          updateNames();
        });
        spyMB.on('value', function(data){
          if (data.val() == null) {
            blue = false;
            blueName = 'Click to join';
            scene.systems['sync-system'].removeLast('blue');
            if (team == 'blue') {
              isSM = false;
              team = '';
              blue = false;
              if (!gameOver){
                hideColors();
              }
              spyMB.onDisconnect().cancel();
            }
          } else {
            blue = true;
            blueName = data.val();
          }
          updateNames();
        });

      currTeam.on('value', function(data){
        currentTeam = data.val();
        redname.removeAttribute('n-object');
        bluename.removeAttribute('n-object');
        if (data.val() == 'red') {
          new TWEEN.Tween(redPanel.object3D.children[1].material.color).to({r:0.897,g:0,b:0}, 500).start();
          new TWEEN.Tween(bluePanel.object3D.children[1].material.color).to({r:0,g:0,b:0.153}, 500).start();
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0.897,g:0,b:0}, 500).start();
          bluehat2.setAttribute('material', 'color: blue');
          redhat2.setAttribute('material', 'color: red');
        } else if (data.val() == 'blue') {
          new TWEEN.Tween(redPanel.object3D.children[1].material.color).to({r:0.153,g:0,b:0}, 500).start();
          new TWEEN.Tween(bluePanel.object3D.children[1].material.color).to({r:0,g:0,b:0.897}, 500).start();
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0,g:0,b:0.897}, 500).start();
          bluehat2.setAttribute('material', 'color: blue');
          redhat2.setAttribute('material', 'color: red');
        } else if (data.val() == 'redwins') {
          redname.setAttribute('n-object', 'res: effects/fireworks');
          updateNames();
          for (var i = 0; i < 25; i++) {
            if (document.querySelector('#cardBack' + i).getAttribute('color') == 'darkred') {
              var f1 = new TWEEN.Tween(document.querySelector('#cardBack' + i).object3D.children[0].material.color)
                .to({r:.7,g:.7,b:.7}, 250);
              var f2 = new TWEEN.Tween(document.querySelector('#cardBack' + i).object3D.children[0].material.color)
                .to({r:0.897,g:0,b:0}, 1000);
              f1.chain(f2);
              f2.chain(f1);
              f1.start();
            }
            var p1 = new TWEEN.Tween(redPanel.object3D.children[1].material.color)
              .to({r:.7,g:.7,b:.7}, 250)
              .onUpdate(function(){
                var c = redPanel.object3D.children[1].material.color;
                redhat2.setAttribute('material', {color: 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')'});
              });
            var p2 = new TWEEN.Tween(redPanel.object3D.children[1].material.color)
              .to({r:0.897,g:0,b:0}, 1000)
              .onUpdate(function(){
                var c = redPanel.object3D.children[1].material.color;
                redhat2.setAttribute('material', {color: 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')'});
              });
            p1.chain(p2);
            p2.chain(p1);
            p1.start();
          }
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0.897,g:0,b:0}, 500).start();
        } else if (data.val() == 'bluewins') {
          bluename.setAttribute('n-object', 'res: effects/fireworks');
          updateNames();
          for (var i = 0; i < 25; i++) {
            if (document.querySelector('#cardBack' + i).getAttribute('color') == 'darkblue') {
              var f1 = new TWEEN.Tween(document.querySelector('#cardBack' + i).object3D.children[0].material.color)
                .to({r:.7,g:.7,b:.7}, 250);
              var f2 = new TWEEN.Tween(document.querySelector('#cardBack' + i).object3D.children[0].material.color)
                .to({r:0,g:0,b:0.897}, 1000);
              f1.chain(f2);
              f2.chain(f1);
              f1.start();
            }
            var p1 = new TWEEN.Tween(bluePanel.object3D.children[1].material.color)
              .to({r:.7,g:.7,b:.7}, 250)
              .onUpdate(function(){
                var c = bluePanel.object3D.children[1].material.color;
                bluehat2.setAttribute('material', {color: 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')'});
              });
            var p2 = new TWEEN.Tween(bluePanel.object3D.children[1].material.color)
              .to({r:0,g:0,b:0.897}, 1000)
              .onUpdate(function(){
                var c = bluePanel.object3D.children[1].material.color;
                bluehat2.setAttribute('material', {color: 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')'});
              });
            p1.chain(p2);
            p2.chain(p1);
            p1.start();
          }
          new TWEEN.Tween(border.object3D.children[0].material.color).to({r:0,g:0,b:0.897}, 500).start();
        }
      });
      syncGO.on('value', function(data){
        if (data.val() != null) {
          gameOver = data.val();
          if (gameOver) {
            showColors();
          } else if (!isSM) {
            hideColors();
          }
        }
      });
      syncSound.on('value', function(data){
        if (data.val() != null) {
          document.querySelector('#' + data.val() + 'Sound').components['n-sound'].playSound();
        }
      });
      var panelCreated = false;
      syncPos.on('value', function(data){
        if (data.val() == null) {
          altspace.getSpace().then(function(space){
            console.log(space.templateSid);
            if (space.templateSid.includes('house-party')) {
              syncPos.set({scale: 2, pos:{x:-10.5,y:3.6,z:15}, rot:{x:0,y:90,z:0}});
            } else if (space.templateSid.includes('exhibition')) {
              syncPos.set({scale: 2, pos:{x:8,y:3.6,z:-1.7}, rot:{x:0,y:270,z:0}});
            } else if (space.templateSid.includes('campfire')) {
              syncPos.set({scale: 2, pos:{x:9.7,y:-0.3,z:-7.8}, rot:{x:0,y:-40,z:0}});
            } else if (space.templateSid.includes('youtube')) {
              syncPos.set({scale: 2, pos:{x:0,y:0,z:0}, rot:{x:0,y:0,z:0}});
            } else {
              syncPos.set({scale: 0.5, pos:{x:0,y:0,z:0}, rot:{x:0,y:0,z:0}});
            }
          });
        } else {
          new TWEEN.Tween(cont.object3D.scale).to({x:data.val().scale,y:data.val().scale,z:data.val().scale}, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
          new TWEEN.Tween(cont.object3D.position).to({x:data.val().pos.x,y:data.val().pos.y,z:data.val().pos.z}, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
          new TWEEN.Tween(cont.object3D.rotation).to({x:THREE.Math.degToRad(data.val().rot.x),y:THREE.Math.degToRad(data.val().rot.y),z:THREE.Math.degToRad(data.val().rot.z)}, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
          if (user.isModerator && !panelCreated) {
            panelCreated = true;
            createModControls(data.val());
          }
        }
      });

      redPanel.addEventListener('mouseup', function(){
        if (red && user.isModerator) {
          spyMR.set(null);
        } else if (team == '' && !red) {
          isSM = true;
          team = 'red';
          red = true;
          scene.systems['sync-system'].instantiate('redhat2', scene, scene, 'red');
          spyMR.set(user.displayName);
          spyMR.onDisconnect().set(null);
          showColors();
        } else if (team == 'red') {
          spyMR.set(null);
        } else if (team == 'blue') {
          currTeam.set('red');
        }
      });
      bluePanel.addEventListener('mouseup', function(){
        if (blue && user.isModerator) {
          spyMB.set(null);
        } else if (team == '' && !blue) {
          isSM = true;
          team = 'blue';
          blue = true;
          scene.systems['sync-system'].instantiate('bluehat2', scene, scene, 'blue');
          spyMB.set(user.displayName);
          spyMB.onDisconnect().set(null);
          showColors();
        } else if (team == 'blue') {
          spyMB.set(null);
        } else if (team == 'red') {
          currTeam.set('blue');
        }
      });
      shuf.addEventListener('mouseup', function(){
        if (isSM || user.isModerator){
          shuffle();
        }
      });
      switchT.addEventListener('mouseup', function(){
        if (user.isModerator || isSM){
          if (currentTeam == 'red') {
            currTeam.set('blue');
          } else {
            currTeam.set('red');
          }
        }
      });

      function shuffle() {
        shuffleArray(list);
        var rand = Math.round(Math.random());
        if (rand == 0) {
          currTeam.set('red');
          if (countColors().darkred == 8) {
            colors[colors.indexOf('darkblue')] = 'darkred'
          }
        } else {
          currTeam.set('blue');
          if (countColors().darkblue == 8) {
            colors[colors.indexOf('darkred')] = 'darkblue'
          }
        }

        shuffleArray(colors);
        words.set(list.slice(0,25));
        key.set(colors);
        rev = [];
        revealed.set([]);
        syncGO.set(false);
      }

      function updateNames() {
        var r, b;
        if (countColors2().darkred == null) {
          r = 0;
        } else {
          r = countColors2().darkred;
        }
        if (countColors2().darkblue == null) {
          b = 0;
        } else {
          b = countColors2().darkblue;
        }
        if (currentTeam == 'redwins') {
          redname.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Red Team<size=300%>\n<size=200%>You Win!<size=300%>\n<size=150%>' + redName);
          bluename.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Blue Team\n<size=400%>' + (countColors().darkblue - b) + '\n<size=150%>' + blueName);
        } else if (currentTeam == 'bluewins') {
          redname.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Red Team\n<size=400%>' + (countColors().darkred - r) + '\n<size=150%>' + redName);
          bluename.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Blue Team<size=300%>\n<size=200%>You Win!<size=300%>\n<size=150%>' + blueName);
        } else {
          redname.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Red Team\n<size=400%>' + (countColors().darkred - r) + '\n<size=150%>' + redName);
          bluename.setAttribute('n-text', 'fontSize: 2; text: <size=150%>Blue Team\n<size=400%>' + (countColors().darkblue - b) + '\n<size=150%>' + blueName);
        }
      }

      function hideColors() {
        for (var i = 0; i < 25; i++) {
          document.querySelector('#cardFront' + i).setAttribute('color', 'white');
        }
      }

      function showColors() {
        for (var i = 0; i < 25; i++) {
          document.querySelector('#cardFront' + i).setAttribute('color', colors[i]);
        }
      }

      function countColors() {
        var count = {};
        colors.forEach(function(x) { count[x] = (count[x] || 0)+1; });
        return count;
      }
      function countColors2() {
        var count = {};
        var arr = [];
        for (var i = 0; i < rev.length; i++) {
          arr.push(colors[rev[i]]);
        }
        arr.forEach(function(x) { count[x] = (count[x] || 0)+1; });
        return count;
      }

      var list2 = ['Horse','Sauna','Hooker','Stool','Mouth','Touchdown','Snake','Whiskey','Pickle','Hose','Legend','Blush','Dick','Cock',
      'Alcohol','Sausage','Pecker','Straight','Sore','Toy','Black','White','Period','Couch','Juice','Bra','Dame','Chick',
      'Bitch','Score','Sheep','Strap','Mattress','Train','Bondage','Weiner','Penis','Furry','Joystick','Apples','Condom','Bisexual',
      'Hole','Secretary','Roll','Strip','Freak','Tramp','Foreskin','Wine','Pee','Experiment','Johnson','Banana','Clam','Blow',
      'Balloon','Semen','Regret','Stripper','Homerun','Trim','Bar','Wood','Paddle','Cowgirl','JustJohn','Candle','Cigarette','Cigar',
      'Knob','Sex','Gang','Stud','Screw','Trousers','Safe','Girl','Package','Grope','Jewels','Beach','Chubby','Beef',
      'Bender','Shaft','Peaches','Swallow','Flower','Trunk','Sack','Job','Onion','Bowl','Jerk','Crap','Bush','Box',
      'Mushroom','Shame','Couple','Sweat','Strobe','Tubesteak','Rug','Butt','Nylon','Lick','Hotel','Boy','Boob','Biscuits',
      'Fatty','Share','Slut','Swimmers','Pound','Tuna','Roach','Brownie','Nuts','Blonde','Horny','Catcher','Body','Dominate',
      'Mole','Shave','Orgasm','Taboo','Roof','Twig','Red','Lube','Nude','Eat','Hooters','Legs','Behind','Olive',
      'Brown','Shower','Oyster','Taco','Salad','Udders','Rave','Inch','Nipple','Gay','High','Booze','Beaver','Pussy',
      'Ice','Skank','Melons','Tail','Rack','Uranus','Queer','Lingerie','Needle','Escort','Herb','Bear','Beans','Log',
      'Hamster','Skirt','Gigolo','Tap','Pie','Vasectomy','Queen','Group','Necklace','Commando','Headlights','Ashes','Bacon','Goose',
      'Pillows','Smell','Latex','Tavern','Smegma','Vegas','Queef','Hot','Navel','Gag','Headboard','Bed','Ass','Caboose',
      'Carpet','Smoke','Cuffs','Teabag','Shot','Vein','Purple','Gash','Nail','Hand','Head','Chaps','Animal','Coozie',
      'Fish','Snatch','Rookie','Tease','Snort','Vibrator','Pucker','Film','Mug','Bang','Hammer','Grandma',
      'Grass','Sniff','Prick','Tent','Baked','Video','Pub','G-Spot','Movie','Jazz','Friction','Eyes',
      'Drunk','Softballs','Kitty','Tequila','Bottom','Vinyl','Prostate','Chains','Motorboat','Crabs','French','Hurl',
      'Cheek','Solo','Lizard','Threesome','Breast','Virgin','Prison','Donkey','Monkey','Douche','Freckles','Bond',
      'Keg','Spank','Boxers','Throat','Pinch','Vodka','Pot','Lips','Mom','Finger','Fluff','Bling',
      'Rectum','Speed','Missionary','Tickle','Sin','Vomit','Porn','Cuddle','Moist','Manboobs','Flash','Dildo',
      'Cocktail','Sperm','Emission','Tie','Diarrhea','Wad','Pork','Bottle','Mixer','Crack','Fist','Club',
      'Cucumber','Spoon','Seed','Tip','Intern','Wang','Pole','Champagne','Milk','Loose','Fire','Choke',
      'Noodle','Spread','Doggy','Tit','Beer','Waste','Poker','Gerbil','Member','Bartender','Fetish','Bone',
      'Motel','Squirt','Lotion','Tongue','Flesh','Watch','Player','Balls','Meat','Cream','Fecal','Rubber',
      'Kinky','Stalker','Bust','Tool','Skid','Wax','Pitcher','Knees','Martini','Lobster','Feather','Booty',
      'Joint','Steamy','Mesh','Top','Facial','Weed','Pipe','Cherry','Lust','Knockers','Fantasy','Hump',
      'Poop','Stiff','Nurse','Torture','Bong','Wench','Pink','Gangbang','Love','Coyote','Drill','Acid',
      'Line','Stiletto','Turd','Touch','Daddy','Wet','Pimp','Hell','Liquor','Burn','Drag','Cougar',
      'Briefs','Stones','Naked','Orgy','Chest','Whip','Pig','Jugs','Lighter','Cannons','Down','Clap'];


      list = list.concat([/*'Vivian','Ben',*/'Covfefe','Maybe']);

      if (findGetParameter('mode') == 'undercover') {
        list = list2;
      } else if (findGetParameter('mode') == 'mixed') {
        list = list.concat(list2);
        list = list.filter(function(item,index,inputArray){
          return inputArray.indexOf(item) == index;
        });
      }

      function createModControls(data) {
        var hidden = true;
        var moveB = document.createElement('a-box');
        moveB.setAttribute('scale', '.1 .1 .1');
        moveB.setAttribute('position', '-1 0 -1');
        moveB.setAttribute('n-cockpit-parent', '');
        moveB.setAttribute('altspace-cursor-collider', 'enabled: true');
        scene.appendChild(moveB);

        var panel = document.createElement('a-plane');
        panel.setAttribute('position', '0 -1000 0');
        panel.setAttribute('material', 'color: black; transparent: true; opacity: 0.5');
        panel.setAttribute('n-cockpit-parent', '');

        var pxVal = data.pos.x;
        var pyVal = data.pos.y;
        var pzVal = data.pos.z;
        var rVal = data.rot.y;
        var sVal = data.scale;

        var text1 = document.createElement('a-entity');
        text1.setAttribute('position', '0 0 .01');
        updateText();
        text1.setAttribute('n-cockpit-parent', '');
        panel.appendChild(text1);

        var xU = document.createElement('a-cylinder');
        var xD = document.createElement('a-cylinder');
        xU.setAttribute('scale', '.07 .01 .07');
        xD.setAttribute('scale', '.07 .01 .07');
        xU.setAttribute('position', '.2 .35 .01');
        xD.setAttribute('position', '.4 .39 .01');
        xU.setAttribute('rotation', '-90 0 0');
        xD.setAttribute('rotation', '90 0 0');
        xU.setAttribute('segments-radial', '3');
        xD.setAttribute('segments-radial', '3');
        xU.setAttribute('n-cockpit-parent', '');
        xD.setAttribute('n-cockpit-parent', '');
        xU.setAttribute('altspace-cursor-collider', 'enabled: true');
        xD.setAttribute('altspace-cursor-collider', 'enabled: true');
        panel.appendChild(xU);
        panel.appendChild(xD);

        var yU = document.createElement('a-cylinder');
        var yD = document.createElement('a-cylinder');
        yU.setAttribute('scale', '.07 .01 .07');
        yD.setAttribute('scale', '.07 .01 .07');
        yU.setAttribute('position', '.2 .225 .01');
        yD.setAttribute('position', '.4 .265 .01');
        yU.setAttribute('rotation', '-90 0 0');
        yD.setAttribute('rotation', '90 0 0');
        yU.setAttribute('segments-radial', '3');
        yD.setAttribute('segments-radial', '3');
        yU.setAttribute('n-cockpit-parent', '');
        yD.setAttribute('n-cockpit-parent', '');
        yU.setAttribute('altspace-cursor-collider', 'enabled: true');
        yD.setAttribute('altspace-cursor-collider', 'enabled: true');
        panel.appendChild(yU);
        panel.appendChild(yD);

        var zU = document.createElement('a-cylinder');
        var zD = document.createElement('a-cylinder');
        zU.setAttribute('scale', '.07 .01 .07');
        zD.setAttribute('scale', '.07 .01 .07');
        zU.setAttribute('position', '.2 .1 .01');
        zD.setAttribute('position', '.4 .14 .01');
        zU.setAttribute('rotation', '-90 0 0');
        zD.setAttribute('rotation', '90 0 0');
        zU.setAttribute('segments-radial', '3');
        zD.setAttribute('segments-radial', '3');
        zU.setAttribute('n-cockpit-parent', '');
        zD.setAttribute('n-cockpit-parent', '');
        zU.setAttribute('altspace-cursor-collider', 'enabled: true');
        zD.setAttribute('altspace-cursor-collider', 'enabled: true');
        panel.appendChild(zU);
        panel.appendChild(zD);

        var rotU = document.createElement('a-cylinder');
        var rotD = document.createElement('a-cylinder');
        rotU.setAttribute('scale', '.07 .01 .07');
        rotD.setAttribute('scale', '.07 .01 .07');
        rotU.setAttribute('position', '.2 -.13 .01');
        rotD.setAttribute('position', '.4 -.09 .01');
        rotU.setAttribute('rotation', '-90 0 0');
        rotD.setAttribute('rotation', '90 0 0');
        rotU.setAttribute('segments-radial', '3');
        rotD.setAttribute('segments-radial', '3');
        rotU.setAttribute('n-cockpit-parent', '');
        rotD.setAttribute('n-cockpit-parent', '');
        rotU.setAttribute('altspace-cursor-collider', 'enabled: true');
        rotD.setAttribute('altspace-cursor-collider', 'enabled: true');
        panel.appendChild(rotU);
        panel.appendChild(rotD);

        var scaleU = document.createElement('a-cylinder');
        var scaleD = document.createElement('a-cylinder');
        scaleU.setAttribute('scale', '.07 .01 .07');
        scaleD.setAttribute('scale', '.07 .01 .07');
        scaleU.setAttribute('position', '.2 -.36 .01');
        scaleD.setAttribute('position', '.4 -.32 .01');
        scaleU.setAttribute('rotation', '-90 0 0');
        scaleD.setAttribute('rotation', '90 0 0');
        scaleU.setAttribute('segments-radial', '3');
        scaleD.setAttribute('segments-radial', '3');
        scaleU.setAttribute('n-cockpit-parent', '');
        scaleD.setAttribute('n-cockpit-parent', '');
        scaleU.setAttribute('altspace-cursor-collider', 'enabled: true');
        scaleD.setAttribute('altspace-cursor-collider', 'enabled: true');
        panel.appendChild(scaleU);
        panel.appendChild(scaleD);

        scene.appendChild(panel);
        moveB.addEventListener('mouseup', function(){
          if (hidden) {
            hidden = false;
            panel.setAttribute('position', '0 .5 -1.5');
          } else {
            hidden = true;
            panel.setAttribute('position', '0 -1000 0');
          }
        });
        xU.addEventListener('mouseup', function(){
          pxVal = Math.round((pxVal * 10) + 1) / 10;
          syncPos.child('pos').child('x').set(pxVal);
          updateText();
        });
        xD.addEventListener('mouseup', function(){
          pxVal = Math.round((pxVal * 10) - 1) / 10;
          syncPos.child('pos').child('x').set(pxVal);
          updateText();
        });
        yU.addEventListener('mouseup', function(){
          pyVal = Math.round((pyVal * 10) + 1) / 10;
          syncPos.child('pos').child('y').set(pyVal);
          updateText();
        });
        yD.addEventListener('mouseup', function(){
          pyVal = Math.round((pyVal * 10) - 1) / 10;
          syncPos.child('pos').child('y').set(pyVal);
          updateText();
        });
        zU.addEventListener('mouseup', function(){
          pzVal = Math.round((pzVal * 10) + 1) / 10;
          syncPos.child('pos').child('z').set(pzVal);
          updateText();
        });
        zD.addEventListener('mouseup', function(){
          pzVal = Math.round((pzVal * 10) - 1) / 10;
          syncPos.child('pos').child('z').set(pzVal);
          updateText();
        });
        rotU.addEventListener('mouseup', function(){
          rVal += 5;
          syncPos.child('rot').child('y').set(rVal);
          updateText();
        });
        rotD.addEventListener('mouseup', function(){
          rVal -= 5;
          syncPos.child('rot').child('y').set(rVal);
          updateText();
        });
        scaleU.addEventListener('mouseup', function(){
          sVal = Math.round((sVal * 10) + 1) / 10;
          syncPos.child('scale').set(sVal);
          updateText();
        });
        scaleD.addEventListener('mouseup', function(){
          sVal = Math.round((sVal * 10) - 1) / 10;
          syncPos.child('scale').set(sVal);
          updateText();
        });
        function updateText() {
          text1.setAttribute('n-text', 'fontSize: 1; horizontalAlign: left; width: 0.8; text: X: ' + pxVal + '\nY: ' + pyVal + '\nZ: ' + pzVal + '\n\nRotation: ' + rVal + '\n\nScale: ' + sVal);
        }
      }

    });
  });
  
  function setupSounds() {
    var click = 'http://bengarfield.github.io/AltVR/codenames/sounds/click';
    var fail = 'http://bengarfield.github.io/AltVR/codenames/sounds/fail';
    var bystander = 'http://bengarfield.github.io/AltVR/codenames/sounds/fail';
    var assassin = 'http://bengarfield.github.io/AltVR/codenames/sounds/assassin';
    var win = 'http://bengarfield.github.io/AltVR/codenames/sounds/win2';
    var redS = 'http://bengarfield.github.io/AltVR/codenames/sounds/red';
    var blueS = 'http://bengarfield.github.io/AltVR/codenames/sounds/blue';

    if (findGetParameter('sounds') == '2') {
      click = 'http://bengarfield.github.io/AltVR/codenames/sounds/click';
      fail = 'http://bengarfield.github.io/AltVR/codenames/sounds/whip';
      //bystander = 'sounds/fail';
      assassin = 'http://bengarfield.github.io/AltVR/codenames/sounds/lock';
      win = 'http://bengarfield.github.io/AltVR/codenames/sounds/win2';
      redS = 'http://bengarfield.github.io/AltVR/codenames/sounds/red';
      blueS = 'http://bengarfield.github.io/AltVR/codenames/sounds/blue';
    }

    clickSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? click + '.mp3' : click + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.5,
      minDistance: 1,
      maxDistance: 12,
    });
    failSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? fail + '.mp3' : fail + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.5,
      minDistance: 1,
      maxDistance: 12,
    });
    bystanderSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? bystander + '.mp3' : bystander + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.8,
      minDistance: 1,
      maxDistance: 12,
    });
    assassinSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? assassin + '.mp3' : assassin + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.8,
      minDistance: 1,
      maxDistance: 12,
    });
    winSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? win + '.mp3' : win + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.5,
      minDistance: 1,
      maxDistance: 12,
    });
    redSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? redS + '.mp3' : redS + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.5,
      minDistance: 1,
      maxDistance: 12,
    });
    blueSound.setAttribute('n-sound', {
      src: /Mobile/i.test(navigator.userAgent) ? blueS + '.mp3' : blueS + '.ogg',
      autoplay: false,
      loop: false,
      volume: 0.5,
      minDistance: 1,
      maxDistance: 12,
    });
  }
  
  if (findGetParameter('preset') == 'exhibition') {
    cont.setAttribute('scale', {x:2,y:2,z:2});
    cont.setAttribute('rotation', {x:0,y:180,z:0});
    cont.setAttribute('position', {x:0,y:4,z:20});
  } else if (findGetParameter('preset') == 'houseparty') {
    cont.setAttribute('scale', {x:2.5,y:2.5,z:2.5});
    cont.setAttribute('rotation', {x:0,y:270,z:0});
    cont.setAttribute('position', {x:10.5,y:4.7,z:13.5});
  } else if (findGetParameter('preset') == 'houseparty2') {
    cont.setAttribute('scale', {x:2,y:2,z:2});
    cont.setAttribute('rotation', {x:0,y:180,z:0});
    cont.setAttribute('position', {x:0,y:4,z:20});
  }
  
  if (findGetParameter('scale') != null) {
    var s = Number(findGetParameter('scale'));
    cont.setAttribute('scale', {x:s,y:s,z:s});
  }
  
  if (findGetParameter('rot') != null) {
    var r = Number(findGetParameter('rot'));
    cont.setAttribute('rotation', {x:0,y:r,z:0});
  }
  
  if (findGetParameter('pos') != null) {
    var p = findGetParameter('pos').split(',');
    cont.setAttribute('position', {x:Number(p[0]),y:Number(p[1]),z:Number(p[2])});
  }
  
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
  
  function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
  }
</script>
</body>
</html>