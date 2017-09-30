var script = document.createElement('script');
script.src = 'https://cdn.rawgit.com/mrdoob/three.js/r84/build/three.min.js';
document.head.appendChild(script);

var userId = location.pathname.split('/')[2];
var token = document.head.children['csrf-token'].content;

document.body.children[4].firstElementChild.innerHTML = '<div class="col-xs-6 col-sm-4 col-md-3"><div class="panel panel-default form-panel" style="padding-left: 0px; padding-right: 0px; margin-top: 0px; margin-bottom: 0px;"><br><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[500,500,500]" high="[255,230,65]">Ben</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[64,69,101]" high="[6000,400,300]">WACOMalt</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[64,69,101]" high="[6000,400,300]">Shoo Shoo</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[36,45,54]" high="[6000,6000,6000]">JustJohn</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[4000,0,0]" high="[4000,600,350]">oOblik</button><button class="pill-button--primary" style="margin:auto" id="button" type="pod-classic" prim="[255,30,70]" high="[245,255,43]">Plix</button><button class="pill-button--primary" style="margin:auto" id="button" type="pod-classic" prim="[206,255,0]" high="[255,0,134]">Chaos</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[74,58,58]" high="[928,396,280]">Genesis</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[50,0,0]" high="[4000,600,420]">ProxCyde</button></div></div><div class="col-xs-6 col-sm-4 col-md-3"><div class="panel panel-default form-panel" style="padding-left: 0px; padding-right: 0px; margin-top: 0px; margin-bottom: 0px;"><br><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[43,59,84]" high="[9000,450,2000]">Oddity</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[0,0,0]" high="[4000,400,500]">Rockabella</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[7,14,64]" high="[500,600,900]">Lia</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[7,16,64]" high="[999,999,100]">Katherine</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[26,26,26]" high="[2,0,2048]">Richie</button><button class="pill-button--primary" style="margin:auto" id="button" type="pod-classic" prim="[57,179,24]" high="[10,0,400]">Chris</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[0,255,216]" high="[229,133,217]">Shoseki</button><button class="pill-button--primary" style="margin:auto" id="button" type="pod-classic" prim="[247,120,0]" high="[182,0,255]">Calaquin</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[69,21,115]" high="[420,2100,132]">Tahla</button></div></div><div class="col-xs-6 col-sm-4 col-md-3"><div class="panel panel-default form-panel" style="padding-left: 0px; padding-right: 0px; margin-top: 0px; margin-bottom: 0px;"><br><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[0,0,0]" high="[232,255,0]">Smiley</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[208,96,8]" high="[2,0,255]">Sloan</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[255,0,0]" high="[158,2500000,18]">Poxxxx</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[255,255,255]" high="[0,255,0]">Kai</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[55,55,100]" high="[450,800,8000]">Jacob</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[77,77,77]" high="[255,96,0]">Crystal</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-f01" prim="[38,0,69]" high="[350,0,850]">Sana</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[0,112,36]" high="[255,238,0]">Falkrons</button><button class="pill-button--primary" style="margin:auto" id="button" type="s-series-m01" prim="[8,8,8]" high="[350,20000,0]">evildoer</button></div></div><div class="col-xs-6 col-sm-4 col-md-3"><div class="panel panel-default form-panel" style="padding-left: 0px; padding-right: 0px; margin-top: 0px; margin-bottom: 0px;"><br><button class="pill-button--primary" style="margin:auto" id="changeBack">Return</button></div></div>';

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

for (var i = 0; i < document.querySelectorAll('#button').length; i++) {
  //console.log(document.querySelectorAll('#button')[i]);
  document.querySelectorAll('#button')[i].addEventListener('mouseup', function(e){
    console.log(e.target.innerHTML);

    var avatar = {type: e.target.attributes.type.value, prim: JSON.parse(e.target.attributes.prim.value), high: JSON.parse(e.target.attributes.high.value)};

    console.log(avatar);
    console.log(avatar.type);
    console.log(avatar.prim);
    console.log(avatar.high);

    //prim.style.backgroundColor = 'rgb(' + avatar.prim[0] + ',' + avatar.prim[1] + ',' + avatar.prim[2] + ')';
    //high.style.backgroundColor = 'rgb(' + avatar.high[0] + ',' + avatar.high[1] + ',' + avatar.high[2] + ')';

    e.target.style.backgroundColor = 'green'

    set(avatar.type, avatar.prim, avatar.high);
  });
}

changeBack.addEventListener('mouseup', function(){
  if (currentAvatar.avatar_sid != 'rubenoid-male-01' || currentAvatar.avatar_sid != 'rubenoid-female-01') {
  	set(currentAvatar.avatar_sid, currentAvatar['primary-color'], currentAvatar['highlight-color']);
  } else {
  	var XHR = createRequest();
    var data = 'utf8=%E2%9C%93&_method=patch&user_avatar%5Bavatar_sid%5D=' + currentAvatar.avatar_sid + '&user_avatar%5Bprimary_color%5D=&user_avatar%5Bprimary_red%5D=&user_avatar%5Bprimary_green%5D=&user_avatar%5Bprimary_blue%5D=&user_avatar%5Bhighlight_red%5D=&user_avatar%5Bhighlight_green%5D=&user_avatar%5Bhighlight_blue%5D=&user_avatar%5Brobothead_highlight_red%5D=&user_avatar%5Brobothead_highlight_green%5D=&user_avatar%5Brobothead_highlight_blue%5D=&user_avatar%5Brubenoid_male_texture_1%5D=' + currentAvatar['rubenoid-male-texture-1'] + '&user_avatar%5Brubenoid_male_texture_2%5D=' + currentAvatar['rubenoid-male-texture-2'] + '&user_avatar%5Brubenoid_male_texture_3%5D=' + currentAvatar['rubenoid-male-texture-3'] + '&user_avatar%5Brubenoid_female_texture_1%5D=' + currentAvatar['rubenoid-female-texture-1'] + '&user_avatar%5Brubenoid_female_texture_2%5D=' + currentAvatar['rubenoid-female-texture-2'] + '&user_avatar%5Brubenoid_female_texture_3%5D=' + currentAvatar['rubenoid-female-texture-3'] + '&user_avatar%5Bhash%5D=';

  }
});

function set (type, prim, high) {
  console.log(generateAvatarData(type, prim, high));
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
