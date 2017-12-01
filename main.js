'use strict';

var EndPoint = "/"
class FatModel {
    constructor() {
        this.dataSelector = new AssetSelector();
        this.hostSelector = new HostSelector();
        this.dhcpSelector = new DhcpSelector();
    }
    // from AssetSelector
    
    get AssetCandidateListsChanged() {
        return this.dataSelector.CandidateListsChanged;
    }
    get AssetCandidateHostChanged() {
        return this.dataSelector.CandidateHostChanged;
    }
    get AssetCandidateLists() {
        return this.dataSelector.CandidateLists;
    }
    get AssetCandidateHost() {
        return this.dataSelector.CandidateHost;
    }
    AssetSearchList(x) {
        this.dataSelector.SearchList(x);
    }
    AssetSearchHost(x) {
        this.dataSelector.SearchHost(x);
        this.hostSelector.host = this.dataSelector.CandidateHost.host;
    }

    // from HostSelector
    get hostChanged() {
        return this.hostSelector.hostChanged;
    }
    get typeChanged() {
        return this.hostSelector.typeChanged;
    }
    get macChanged() {
        return this.hostSelector.macChanged;
    }
    set host(x) {
        this.hostSelector.host = x;
    }
    set type(x) {
        this.hostSelector.type = x;
    }
    set mac(x) {
        this.hostSelector.mac = x;
    }
    get host() {
        return this.hostSelector.host;
    }
    get type() {
        return this.hostSelector.type;
    }
    get mac() {
        return this.hostSelector.mac;
    }

    // dhcpSelector 
    get CandidateListsChanged() {
        return this.dhcpSelector.CandidateListsChanged;
    }
    get CandidateLists() {
        return this.dhcpSelector.CandidateLists;
    }
    get rangesChanged(){
        return this.dhcpSelector.RangesChanged;
    }
    get Ranges(){
        return this.dhcpSelector.Ranges;
    }
    AllRanges(){
        this.dhcpSelector.AllRanges();
    }
    AllHosts(){
        this.dhcpSelector.AllHosts();
    }
}

class HostSelector {
    constructor() {
        this.hostChanged = new Notifier;
        this.typeChanged = new Notifier;
        this.macChanged = new Notifier;
        this.host = "";
        this.type = "1";
        this.mac = "";
    }
    _str_normalize(str) {
        return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 65248);
        }).toLowerCase();
    }
    set host(x) {
        x = this._str_normalize(x).match(/^[a-z0-9\-]+/i);
        if(x){
            x = x[0];
        }

        console.log("host change", x);
        this._host = x;
        this.hostChanged.fire();
    }
    set type(x) {
        console.log("host type", x);
        this._type = x;
        console.log("this type", this.type);
        this.typeChanged.fire();
    }
    set mac(x) {
        x = this._str_normalize(x);
        var y = "";
        for (var i of x) {
            if (i.match("[a-f0-9]")) {
                y += i
            }
        }
        y = y.replace(/(..)(?=.)/g, "$1:").slice(0,17);
        console.log("host mac", y);
        this._mac = y;
        this.macChanged.fire();
    }
    get host() {
        return this._host;
    }
    get type() {
        return this._type;
    }
    get mac() {
        return this._mac;
    }
}

class AssetSelector {
    constructor() {
        this.CandidateListsChanged = new Notifier;
        this.CandidateHostChanged = new Notifier;
        this.CandidateLists = [];
        this.CandidateHost = [];
    }

    set CandidateLists(x) {
        this._CandidateLists = x;
        console.log("CandidateListsFire");
        this.CandidateListsChanged.fire();
    }
    set CandidateHost(x) {
        this._CandidateHost = x;
        console.log("CandidateHostFire");
        this.CandidateHostChanged.fire();
    }

    get CandidateLists() {
        return this._CandidateLists;
    }
    get CandidateHost() {
        return this._CandidateHost;
    }

    // x: string
    // Assets から ホスト名に x を含むものを拾ってくる。
    // APIのresponseはデータがあれば  {'Hosts':['hosta','hostb',...]}
    // データがなければ{'msg':'error message'}
    SearchList(x) {
        if(x.length<=1){
            return
        }
        fetch(EndPoint + "Assets/Hosts/search/" + x).then(r=>r.json()).then(j=>{
            console.log(j)
            var list = [];
            var r = new RegExp(x,'i');;
            for (var i of j.Hosts) {
                if (i.match(r)) {
                    list.push(i);
                }
            }
            console.log(list);
            this.CandidateLists = list;
        }
        );
    }

    // x: string
    // Assets から ホスト名が x のを拾ってくる。
    // APIのresponseはデータがあれば  {'Host':{'host':'hostname','lan':'wired mac address','wlan':'wireless mac'}}
    // データがなければ{'msg':'error message'}
    SearchHost(x) {
        fetch(EndPoint + "Assets/Host/" + x).then(r=>r.json()).then(j=>{
            console.log(j);
            if (j.Host.host == x) {
                this.CandidateHost = j.Host;
            }
        }
        );
    }

}

class DhcpSelector{
    constructor() {
        this.CandidateListsChanged = new Notifier;
        this.CandidateLists = [];
        this.RangesChanged = new Notifier;
        this.Ranges = [];
    }
    set CandidateLists(x) {
        this._CandidateLists = x;
        console.log("CandidateListsFire");
        this.CandidateListsChanged.fire();
    }
    get CandidateLists() {
        return this._CandidateLists;
    }

    set Ranges(x){
        this._Ranges = x;
        console.log(this.Ranges);
        console.log("RangesFire");
        this.RangesChanged.fire()
    }
    get Ranges() {
        return this._Ranges;
    }

    DeleteHost(name){
        fetch(EndPoint + "DHCP/Host/"+ name, { method: 'DELETE'}).then(r=>r.json()).then(j=>{
            console.log(j);
        });
    }
    AllHosts(){
        fetch(EndPoint + "DHCP/Hosts/").then(r=>r.json()).then(j=>{
            console.log(j);
            this.CandidateLists = j.Hosts;
            console.log(j.Hosts);
        }
        );
    }
    SearchHosts(x){
        fetch(EndPoint + "DHCP/Hosts/search/" + x).then(r=>r.json()).then(j=>{
            console.log(j)
            this.CandidateLists = j.Hosts;
        }
        );
    }
    SearchHostsfromMac(x){
        fetch(EndPoint + "DHCP/Hosts/Macsearch/" + x).then(r=>r.json()).then(j=>{
            console.log(j)
            this.CandidateLists = j.Hosts;
        }
        );
    }
    AllRanges(){
        fetch(EndPoint + "DHCP/RANGE/").then(r=>r.json()).then(j=>{
            console.log(j);
            this.Ranges = j.Ranges;
        }
        );
    }

}
class Notifier {
    constructor() {
        this.handlers = [];
    }
    observe(handler) {
        this.handlers.push(handler);
    }
    fire() {
        this.handlers.forEach(h=>h());
    }
}

function delete_candidate(event){
    console.log("delete: ",event.target.value);
    this.model.DeleteHost(event.target.value);
    this.model.SearchHosts(this.inputhostvalue);
}

function keyup_host(event) {
    console.log(this.inputhostvalue);
    this.inputhostvalue = event.target.value;
    var value = event.target.value;
    value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toLowerCase();
    if (value.length > 0) {
        this.model.SearchHosts(value);
    }
    console.log("keyup: ", value, value.length);

}
function keyup_mac(event) {
    this.inputmacvalue = event.target.value;
    var value = event.target.value;
    value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toLowerCase();
    if (value.length > 0) {
        this.model.SearchHostsfromMac(value);
    }
    console.log("keyup: ", value, value.length);
}
// インクリメンタルサーチ
// 対象文字を正規化してモデルに投げる
function keyup(event) {
    this.inputvalue = event.target.value;
    var value = event.target.value;
    value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toLowerCase();
    if (value.length > 0) {
        this.model.AssetSearchList(value);
    }
    console.log("keyup: ", value, value.length);
}

function getAddress() {
    console.log(this);
}

// 候補リスト名をクリックしたとき
// 実際のデータを検索する
function candidate_click(event) {
    console.log("candidate_click", event.target.attributes.value.value);
    this.model.AssetSearchHost(event.target.attributes.value.value);
}

function click(event) {
    console.log("click: ", event.target);
}

// MacAddresdsをクリックしたとき、追加フォームに入れる
function set_mac(event) {
    console.log(event.target);
    this.model.mac = event.target.attributes.value.value;
    this.model.type = event.target.attributes.id.value;
}

function AllHosts(event){
    this.model.AllHosts();
}
// Host情報をAPI経由で追加する
function add_host(event) {
    var error = false;
    this.message = "";
    var json = {
        'host': this.host,
        'typeid': this.type,
        'mac': this.mac
    }
    if(!json['host'].match(/^[0-9a-zA-Z\-]+$/)){
        this.message += "ホスト名がおかしいです";
        error = true;
    }
    if(json['mac'].length!=17){
        this.message += "MAC Addressの長さがおかしいです\n";
        error = true;
    }
    if(json['typeid']==""){
        this.message += "タイプを選択してください\n";
        error = true;
    }
    if(error){
        return
    }
    console.log("type: ", this.type);
    console.log("add_host", JSON.stringify(json))
    fetch(EndPoint + 'DHCP/Host/' + this.model.host, {
        method: 'POST',
        body: JSON.stringify(json),
        headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).then(resp=>{
        return resp.json()
    }
    ).then(json=>{
        this.message = json
    }
    )
}

function host_change(event) {
    console.log("host change",event.target.value)
    this.model.host = event.target.value
}
function mac_change(event) {
    console.log("mac change",event.target.value)
    this.model.mac = event.target.value
}
window.addEventListener("load", function() {
    var del_view = new Vue({
        el: '#app_delete',
        created: function(){
            console.log("app_show created");
            this.model = new DhcpSelector();
        },
        mounted: function(){
            console.log("app_show mounted");
            this.model.CandidateListsChanged.observe(e=>{
                this.CandidateLists = this.model.CandidateLists;
            });
        },
        data: {
            CandidateLists: [],
            CandidateHost: {},
            inputhostvalue: [],
            inputmacvalue: [],
        },
        methods: {
            keyup_host: keyup_host,
            keyup_mac: keyup_mac,
            candidate_click: delete_candidate
        }
    });
    var show = new Vue({
        el: '#app_show',
        created: function(){
            console.log("app_show created");
            this.model = new DhcpSelector();
        },
        mounted: function(){
            document.getElementById('list-ip-address-tab').addEventListener('shown.bs.tab',(e)=>{
                this.model.AllHosts();
            });
            console.log("app_show mounted");
            this.model.CandidateListsChanged.observe(e=>{
                this.CandidateLists = this.model.CandidateLists;
            });
            this.model.AllHosts();
        },
        data: {
            CandidateLists: [],
            ranges: [],
        },
        methods: {
            show: AllHosts
        }

    });
    var model = new FatModel();
    var host = new Vue({
        el: '#app2',
        created: function() {
            this.model = model;
            this.model.AllRanges();
            console.log("app2 created", this);
        },
        mounted: function() {
            this.model.hostChanged.observe(e=>{
                console.log("host change observe", this.model.host);
                this.host = this.model.host;
            }
            );
            this.model.macChanged.observe(e=>{
                console.log("mac change observe");
                this.mac = this.model.mac;
            }
            );
            this.model.typeChanged.observe(e=>{
                console.log("type change observe", this.model.type);
                this.type = this.model.type;
            }
            );
            this.model.rangesChanged.observe(e=>{
                this.ranges = this.model.Ranges;
                console.log(this.model.Ranges)
            }
            );
        },
        data: {
            host: "",
            mac: "",
            type: "",
            message: "",
            ranges: [],
        },
        methods: {
            host_change: host_change,
            mac_change: mac_change,
            add_host: add_host,
        },
        computed: {}
    });
    var vm = new Vue({
        el: '#app',
        created: function() {
            this.model = model;
            console.log("created", this);
        },
        mounted: function() {
            this.model.AssetCandidateListsChanged.observe(()=>{
                this.CandidateLists = this.model.AssetCandidateLists;
                if (this.CandidateLists.length == 1) {
                    this.model.AssetSearchHost(this.CandidateLists[0]);
                }
            }
            );
            this.model.AssetCandidateHostChanged.observe(()=>{
                this.CandidateHost = this.model.AssetCandidateHost;
                this.model.host = this.CandidateHost.host;
                this.model.mac = this.CandidateHost.mac;
            }
            );
        },
        data: {
            inputvalue: "",
            CandidateLists: [],
            CandidateHost: {},
            ranges: [],
        },
        methods: {
            candidate_click: candidate_click,
            keyup: keyup,
            //click: click,
            set_mac: set_mac,
        },
        computed: {}
    });
});

