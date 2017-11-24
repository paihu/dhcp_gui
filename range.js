function add_range(){
    console.log(this.name,this.start,this.end);
}
function startValidator(value){
    this.start = value;
    console.log("start: ",value
    ,Boolean(value.match(/(\d+\.?|\d+(\.\d+){0-3})/)));
    if(!Boolean(value.match(/(\d+\.?|\d+(\.\d+){0,3})/))){
        this.start = value.slice(0,-1);
    }
}
function endValidator(value){
    if(value.match(/[0-9]+(\.[0-9]+){0,3}/)){
        this.start = value;
    }else{
        this.start = value.slice(0,-1);
    }
}
window.addEventListener("load", function() {
    var add_view  = new Vue({
        el: '#add_view',
        created: function(){
            console.log("app_show created");
            //this.model = new DhcpSelector();
        },
        mounted: function(){
            console.log("app_show mounted");
            //this.model.CandidateListsChanged.observe(e=>{
            //    this.CandidateLists = this.model.CandidateLists;
            //});
        },
        data: {
            name: "",
            start: "",
            end: "",
            //CandidateLists: [],
            //CandidateHost: {},
            //inputhostvalue: [],
            //inputmacvalue: [],
        },
        methods: {
            add_range: add_range,
            startValidator: startValidator,
            endValidator: endValidator,
            //keyup_host: keyup_host,
            //keyup_mac: keyup_mac,
            //candidate_click: delete_candidate
        }
    });
});
