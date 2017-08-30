'use strict';

var EndPoint="/"
class FatModel {
  constructor(){
    this.dataSelector = new DataSelector();
    this.hostSelector = new HostSelector();
  }
  // from DataSelector
  get CandidateListsChanged(){
    return this.dataSelector.CandidateListsChanged;
  }
  get CandidateHostChanged(){
    return this.dataSelector.CandidateHostChanged;
  }
  get CandidateLists(){
    return this.dataSelector.CandidateLists;
  }
  get CandidateHost(){
    return this.dataSelector.CandidateHost;
  }
  SearchList(x){
    this.dataSelector.SearchList(x);
  }
  SearchHost(x){
    this.dataSelector.SearchHost(x);
    this.hostSelector.host = this.dataSelector.CandidateHost.host;
  }



  // from HostSelector
  get hostChanged(){
    return this.hostSelector.hostChanged;
  }
  get typeChanged(){
    return this.hostSelector.typeChanged;
  }
  get macChanged(){
    return this.hostSelector.macChanged;
  }
  set host(x){
    this.hostSelector.host = x;
  }
  set type(x){
    this.hostSelector.type = x;
  }
  set mac(x){
    this.hostSelector.mac = x;
  }
  get host(){
    return this.hostSelector.host;
  }
  get type(){
    return this.hostSelector.type;
  }
  get mac(){
    return this.hostSelector.mac;
  }
}


class HostSelector {
  constructor(){
    this.hostChanged = new Notifier;
    this.typeChanged = new Notifier;
    this.macChanged = new Notifier;
    this.host="";
    this.type="lan";
    this.mac="";
  }
  set host(x){
    console.log("host change",x);
    x = x.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toLowerCase();
    this._host = x;
    this.hostChanged.fire();
  }
  set type(x){
    console.log("host type",x);
    this._type = x;
    console.log("this type",this.type);
    this.typeChanged.fire();
  }
  set mac(x){
    console.log("host mac",x);
    x = x.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toLowerCase();
    var y="";
    for(var i of x){
	    console.log(i)
	    if(i.match("[a-f0-9]")){
		    y+=i
	    }
    }
    y = y.replace(/(..)(?=.)/g,"$1:");

    this._mac = y;
    this.macChanged.fire();
  }
  get host(){
    return this._host;
  }
  get type(){
    return this._type;
  }
  get mac(){
    return this._mac;
  }
}

class DataSelector {
  constructor(){
    this.CandidateListsChanged = new Notifier;
    this.CandidateHostChanged = new Notifier;
    this.CandidateLists = [];
    this.CandidateHost = [];
  }

  set CandidateLists(x){
    this._CandidateLists = x;
    console.log("CandidateListsFire");
    this.CandidateListsChanged.fire();
  }
  set CandidateHost(x){
    this._CandidateHost = x;
    console.log("CandidateHostFire");
    this.CandidateHostChanged.fire();
  }

  get CandidateLists(){
    return this._CandidateLists;
  }
  get CandidateHost(){
    return this._CandidateHost;
  }

  // x: string
  // asset.json 内データのうち、
  // host が x で始まるものの host名リストをCandidateListsに設定する
  // 実際はAPI叩く予定
  SearchList(x){
    fetch(EndPoint+"Assets/Hosts/search/"+x).then(r => r.json()).then(j => {
      console.log(j)
      var list = [];
      for(var i of j.Hosts){
        if (i.match(x)){
          list.push(i);
        }
      }
      this.CandidateLists = list;
    });
  }

  // x: string
  // asset.json 内データのうち、
  // host が x であるオブジェクトを CandidateHostに設定する
  // 実際はAPI叩く予定
  SearchHost(x){
    fetch(EndPoint+"Assets/Host/"+x).then(r => r.json()).then(j => {
      console.log(j.Host);
      for(var i of j.Host){
        if (i.host == x){
          this.CandidateHost = i;
          return
        }
      }
    });
  }

}

class Notifier {
  constructor(){
    this.handlers=[];
  }
  observe(handler){
    this.handlers.push(handler);
  }
  fire(){
    this.handlers.forEach(h=>h());
  }
}


// インクリメンタルサーチ
// 対象文字を正規化してモデルに投げる
function keyup(event){
this.inputvalue = event.target.value;
var value = event.target.value;
value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
}).toLowerCase();
this.model.SearchList(value);
console.log("keyup: ",value);
}


function getAddress(){
  console.log(this);
}

// 候補リスト名をクリックしたとき
// 実際のデータを検索する
function candidate_click(event){
  console.log("candidate_click",event.target.attributes.value.value);
  this.model.SearchHost(event.target.attributes.value.value);
}

function click(event){
console.log("click: ",event.target);
}

function set_mac(event){
console.log(event.target);
this.model.mac = event.target.attributes.value.value;
this.model.type = event.target.attributes.id.value;
}

function add_host(event){
    var json = {'host': this.model.host,'type':this.model.type,'mac':this.model.mac}
    console.log("add_host",JSON.stringify(json))
    fetch(EndPoint+'DHCP/Host/'+this.model.host,{method: 'POST',body: JSON.stringify(json),headers: new Headers({'Content-Type': 'application/json','Accept':'application/json'})}).then(resp =>{return resp.json()}).then(json => {this.message=json})
}

function host_change(event){
	this.model.host=event.target.value
}
function mac_change(event){
	this.model.mac=event.target.value
}
window.addEventListener("load",function(){
  var model = new FatModel();
  var host = new Vue({
    el:'#app2',
    created: function(){
      this.model = model;
      console.log("created",this);
    },
    mounted: function(){
      this.model.hostChanged.observe(e => {
        console.log("host change observe",this.model.host);
        this.host = this.model.host;
      });
      this.model.macChanged.observe(e => {
        this.mac = this.model.mac;
      });
      this.model.typeChanged.observe(e => {
        console.log("type change observe",this.model.type);
        if(this.model.type==this.lan){
          this.type = this.lan
        }else if(this.model.type==this.wlan){
          this.type = this.wlan;
        }
      });
    },
    data:{
      host: "",
      mac: "",
      type: "",
      lan: "lan",
      wlan: "wlan",
      message: "",
    },
    methods:{
      host_change: host_change,
      mac_change: mac_change,
      add_host: add_host,
    },
    computed: {
    }
  });
  var vm = new Vue({
    el:'#app',
    created: function(){
      this.model = model;
      console.log("created",this);
    },
    mounted: function(){
      this.model.CandidateListsChanged.observe(() => {
        this.CandidateLists = this.model.CandidateLists;
        if(this.CandidateLists.length==1){
          this.model.SearchHost(this.CandidateLists[0]);
        }
      });
      this.model.CandidateHostChanged.observe(() => {
        this.CandidateHost = this.model.CandidateHost;
        this.model.host = this.CandidateHost.host;
      });
    },
    data: {
        inputvalue: "",
        CandidateLists: [],
        CandidateHost: {},
    },
    methods:{
      candidate_click: candidate_click,
      keyup: keyup,
      click: click,
      set_mac: set_mac,
    },
    computed: {
    }
  });
});
