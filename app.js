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
            zip_url: 'https://github.com/CCPX-system/CCPX-blockchain/raw/master/GOLANG/ccpx/ccpx.zip',
            unzip_dir: '/',
            git_url: 'https://github.com/CCPX-system/CCPX-blockchain/GOLANG/ccpx'
            ,deployed_name:'53a5f443cdd832f0a8273d5a1ff86a55fa7d0ea14f48dbbeccdd1fec266ca2bac26fcc95497b4095668e95c0ee5753f1b995517a95110779068820d5868842f5'
        }
    };

    // Step 2 ==================================
    ibc.load(options, cb_ready);

    // Step 3 ==================================
    function cb_ready(err, cc){                             //response has chaincode functions
        //app1.setup(ibc, cc);
        //app2.setup(ibc, cc);

    // Step 4 ==================================
        if(cc.details.deployed_name === "ccpx"){                //decide if I need to deploy or not
            g_cc = cc;
            cc.deploy('init', ['99'], {delay_ms: 30000}, function(e){                       //delay_ms is milliseconds to wait after deploy for conatiner to start, 50sec recommended
                console.log("success deployed");
                cb_deployed();
            });
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
    app.get('/read', function(req, res){
        console.log('got read request');
        g_cc.query.read(['_pointindex'],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json({"msg":resp});
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
        });
    });
    app.get('/read_point', function(req, res){
        console.log('got read test_marbe request');
        g_cc.query.read(['AirChina-2016111-'],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json({"msg":resp});
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
        });
    });

    app.get('/read_b', function(req, res){
        console.log('got read b request');
        g_cc.query.query(['b'],function(err,resp){
            //var ss = resp.result.message;
            res.json({"msg":resp});
            console.log('success',resp);  
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
    app.post('/init_point', function(req, res){
        var seller = req.body.seller;
        var owner = req.body.owner;
        var curret_date = new Date();
        var dateStr = curret_date.getFullYear()+''+curret_date.getMonth()+''+curret_date.getDate();
        console.log('got init_marble request');
        g_cc.invoke.init_point([seller+'-'+dateStr+'-',owner],function(err,resp){
            var ss = resp;
            res.json({"msg":ss});
            console.log('success',ss);  
        });
    });
    app.post('/getpointdetail', function(req, res){
        var id = req.body.point_id;
        console.log('got read request');
        g_cc.query.read([id],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json({"msg":resp});
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
        });
    });
    app.post('/getpoint', function(req, res){
        var owner = req.body.owner;        
        console.log('got getpoint request');
        g_cc.invoke.findPointWithOwner([owner],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                g_cc.query.read(['_tmpRelatedPoint'],function(err,resp){
                    if(!err){
                        //var ss = resp.result.message;
                        res.json({"msg":resp});
                        console.log('success',resp);  
                    }else{
                        console.log('fail');
                    }
                });  
            }else{
                console.log('fail');
            }

        });
    });
     

    