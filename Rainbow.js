var script = document.createElement('script');
script.src = 'https://cdn.rawgit.com/mrdoob/three.js/r84/build/three.min.js';
document.head.appendChild(script);

var userId = location.pathname.split('/')[2];
var token = document.head.children['csrf-token'].content;

var page = '<div class="col-xs-6 col-sm-4 col-md-3"><div class="panel panel-default form-panel" style="padding-left: 0px; padding-right: 0px; margin-top: 0px; margin-bottom: 0px;"><br><button class="pill-button--primary" style="margin:auto" id="changeBack">Return</button><br><br><button class="pill-button--primary" style="margin:auto" id="rainbow">Rainbow</button><br><br><br><button class="pill-button--primary" style="margin:auto" id="stopB">Stop</button></div></div>';
document.body.children[4].firstElementChild.innerHTML = page;

setTimeout(function(){
  var dataRequest = (THREE.FileLoader ? new THREE.FileLoader() : new THREE.XHRLoader(/* DEPRECATED: r83 */));
  dataRequest.setWithCredentials(true);
  dataRequest.load('https://account.altvr.com/api/v1/users/' + userId, onLoaded, undefined, undefined);
}, 1000);

var currentAvatar;

function onLoaded(obj) {
var avatar = JSON.parse(obj).users[0].user_avatar.config.avatar;
  currentAvatar = avatar;
  console.log(currentAvatar);
}

changeBack.addEventListener('mouseup', function(){
  if (currentAvatar.avatar_sid == 'rubenoid-male-01' || currentAvatar.avatar_sid == 'rubenoid-female-01') {
    console.log('human');
    var XHR = createRequest();
     var data = 'utf8=%E2%9C%93&_method=patch&user_avatar%5Bavatar_sid%5D=' + currentAvatar.avatar_sid + '&user_avatar%5Bprimary_color%5D=&user_avatar%5Bprimary_red%5D=255&user_avatar%5Bprimary_green%5D=255&user_avatar%5Bprimary_blue%5D=255&user_avatar%5Bhighlight_red%5D=0&user_avatar%5Bhighlight_green%5D=255&user_avatar%5Bhighlight_blue%5D=255&user_avatar%5Brobothead_highlight_red%5D=&user_avatar%5Brobothead_highlight_green%5D=&user_avatar%5Brobothead_highlight_blue%5D=&user_avatar%5Brubenoid_male_texture_1%5D=' + currentAvatar['rubenoid-male-texture-1'][0] + '&user_avatar%5Brubenoid_male_texture_2%5D=' + currentAvatar['rubenoid-male-texture-2'][0] + '&user_avatar%5Brubenoid_male_texture_3%5D=' + currentAvatar['rubenoid-male-texture-3'][0] + '&user_avatar%5Brubenoid_female_texture_1%5D=' + currentAvatar['rubenoid-female-texture-1'][0] + '&user_avatar%5Brubenoid_female_texture_2%5D=' + currentAvatar['rubenoid-female-texture-2'][0] + '&user_avatar%5Brubenoid_female_texture_3%5D=' + currentAvatar['rubenoid-female-texture-3'][0] + '&user_avatar%5Bhash%5D=';
     XHR.send(data);
    reset();
  } else {
    set(currentAvatar.avatar_sid, currentAvatar['primary-color'], currentAvatar['highlight-color']);
  }
});

var loop = 0;

rainbow.addEventListener('mouseup', function(){
  clearInterval(loop);
  var colors = [];
  var x = 250;
  for (var i = 0; i < x; i++) {
    //console.log(i * 10);
    var rgb = HSVtoRGB(i/x,1,1);
    colors.push([rgb.r, rgb.g, rgb.b]);
  }
  console.log(colors);
  
  var multi = 2;

  var currentColor = 0;
  loop = setInterval(function(){
  	rainbow.style.backgroundColor = 'rgb(' + colors[currentColor][0] + ',' + colors[currentColor][1] + ',' + colors[currentColor][2] + ')';
  	set(currentAvatar.avatar_sid, currentAvatar['primary-color'], [colors[currentColor][0]*multi,colors[currentColor][1]*multi,colors[currentColor][2]*multi]);
  	//set('pod-classic', [57,179,24], [colors[currentColor][0]*multi,colors[currentColor][1]*multi,colors[currentColor][2]*multi]);
  	currentColor += 1;
  	if (currentColor == x) {
  	  currentColor = 0;
  	}
  }, 500);
});

stopB.addEventListener('mouseup', function(){
  clearInterval(loop);
});

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function set (type, prim, high) {
  //console.log(generateAvatarData(type, prim, high));
  var XHR = createRequest();
  var data = generateAvatarData(type, prim, high);
  XHR.send(data);
  reset();
}

function generateAvatarData(sid, prim, high) {
  var data = 'utf8=%E2%9C%93&_method=patch&user_avatar%5Bavatar_sid%5D=' + sid + '&user_avatar%5Bprimary_color%5D=&user_avatar%5Bprimary_red%5D=' + prim[0] + '&user_avatar%5Bprimary_green%5D=' + prim[1] + '&user_avatar%5Bprimary_blue%5D=' + prim[2] + '&user_avatar%5Bhighlight_red%5D=' + high[0] + '&user_avatar%5Bhighlight_green%5D=' + high[1] + '&user_avatar%5Bhighlight_blue%5D=' + high[2] + '&user_avatar%5Brobothead_highlight_red%5D=&user_avatar%5Brobothead_highlight_green%5D=&user_avatar%5Brobothead_highlight_blue%5D=&user_avatar%5Brubenoid_male_texture_1%5D=1&user_avatar%5Brubenoid_male_texture_2%5D=1&user_avatar%5Brubenoid_male_texture_3%5D=1&user_avatar%5Brubenoid_female_texture_1%5D=1&user_avatar%5Brubenoid_female_texture_2%5D=1&user_avatar%5Brubenoid_female_texture_3%5D=1&user_avatar%5Bhash%5D=';
  return data;
}

function createRequest() {
  var XHR = new XMLHttpRequest();
  XHR.open('POST', 'https://account.altvr.com/users/' + userId + '/avatar');
  XHR.setRequestHeader('X-CSRF-Token', token);
  XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  XHR.setRequestHeader('Accept', '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript');
  XHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  return XHR;
}

function reset() {
  var resetAvatar = setInterval(function(){
    Alt.Util.ResetAvatar(function(){
      clearInterval(resetAvatar);
    });
  }, 250);
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}