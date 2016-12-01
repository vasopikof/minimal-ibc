// Step 1 ==================================
    var Ibc1 = require('ibm-blockchain-js');
    var ibc = new Ibc1(/*logger*/);             //you can pass a logger such as winston here - optional
    var chaincode = {};
    var app = require('express')();
    var http = require('http').Server(app);
    var bodyParser = require('body-parser');

    var g_cc;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded()); 
    // ==================================
    // configure ibc-js sdk
    // ==================================
    var options =   {
        network:{
            peers:   [{
                "api_host": "148.100.5.138",
                "api_port": 7050,
                "id":"CCXP_peer"
                //"id": "xxxxxx-xxxx-xxx-xxx-xxxxxxxxxxxx_vpx"
            }],
            users:  [{
                "enrollId": "test_user0",
                "enrollSecret": "MS9qrN8hFjlE"
            }],
            options: {                          //this is optional
                quiet: true, 
                timeout: 60000,
                tls: false,
            }
        },
        chaincode:{
            zip_url: 'https://github.com/ibm-blockchain/marbles-chaincode/archive/master.zip',
            unzip_dir: 'marbles-chaincode-master/part1',
            git_url: 'https://github.com/IBM-Blockchain/marbles-chaincode/tree/master/part1',
            deployed_name:'d526e457dd3d76bda5ffa4c8e411f4ce5a85303c9d0cf63d8090a6e90ae08b6b567426cbf288977f448a25535d20c0b1c594dddab22098a27dd71a1e05616717'
        }
    };

    // Step 2 ==================================
    ibc.load(options, cb_ready);

    // Step 3 ==================================
    function cb_ready(err, cc){                             //response has chaincode functions
        //app1.setup(ibc, cc);
        //app2.setup(ibc, cc);

    // Step 4 ==================================
        if(cc.details.deployed_name === ""){                //decide if I need to deploy or not
           // cc.deploy('init', ['a','10','b','5']);
        }
        else{
            g_cc = cc;
            console.log('chaincode summary file indicates chaincode has been previously deployed');
            

            //console.log('also deployed', ibc.chaincode.details.deployed_name);
            //cc.invoke.init_marble(["test_sdk", "yellow", 35, "tor"], cb_invoked);
            /*cc.query.read(['_marbleindex'], function(err, resp){
                var cc_deployed = false;
                try{
                    if(err == null){                                                            //no errors is good, but can't trust that alone
                        if(resp === 'null') {
                            cc_deployed = true;                                 //looks alright, brand new, no marbles yet
                            console.log('_marbleindex can be accessed');
                        }
                        else{
                            var json = JSON.parse(resp);
                            if(json.constructor === Array) cc_deployed = true;                  //looks alright, we have marbles
                        }
                    }else{
                        console.log("some error occured");
                    }
                }
                catch(e){

                }                                                                      //anything nasty goes here

                cb_deployed(null);                                                          //yes, lets go!
            
            });
*/            
            cb_deployed();
        }
    }

    // Step 5 ==================================
    function cb_deployed(err){
        console.log('sdk has deployed code and waited');
        //chaincode.query.read(['a']);
        http.listen(3000, function(){
          console.log('listening on *:3000');
          console.log('avaliable services: testGet,testGetWithParam,testPost,testPostWithParam');
        });
    }
    function cb_invoked(e, a){
        console.log('response: ', e, a);
    }
    app.get('/testGet', function(req, res){
      res.json({"msg":"test"});
    });
    app.get('/read_a', function(req, res){
        console.log('got read a request');
        g_cc.query.query(['a'],function(err,resp){
            var ss = resp.result.message;
            res.json({"msg":ss});
            console.log('success',ss);  
        });
    });
    app.get('/read_b', function(req, res){
        console.log('got read b request');
        g_cc.query.query(['b'],function(err,resp){
            var ss = resp.result.message;
            res.json({"msg":ss});
            console.log('success',ss);  
        });
    });
    app.get('/init', function(req, res){
        console.log('got init request');
        g_cc.invoke.init(['a','5','b','10'],function(err,resp){
            var ss = resp.result.message;
            res.json({"msg":ss});
            console.log('success',ss);  
        });
    });
    app.get('/chain_stats', function(req, res){
        console.log('got stat request');
        ibc.chain_stats(function(e, stats){
            console.log('got some stats', stats);
            res.json({"stat": stats});              
        });
    });
    app.get('/deploy', function(req, res){
        console.log('got deploy request');
        g_cc.deploy('init', ['99'],function(){
            console.log('success deploy');
            res.json({"stat": "success deploy"});              
        });
    });
     

    