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
            ,deployed_name:'0baf08a4ff8901d3b568121d631d117c83c0fa1f46ed3f9b4a4487802a08b2bf7e1994f3d5a59faa3adf736ce566f3a3e2558d168d805e890ff3de54f5bb4559'
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
          
        });
    }
    function cb_invoked(e, a){
        console.log('response: ', e, a);
    }



//-------------------------------------------------------------------------------------
//-----------------API FOR PROD--------------------------------------------------------

    app.post('/getLatExRec', function(req, res){
        var seller = req.body.SELLER_ID;
        var num = req.body.RECORD_NUM;
        console.log('got getLatExRec request');
        g_cc.query.read(['findLatest',seller,num],function(err,resp){
            if(!err){

                var pre = JSON.parse(resp);
                if (pre.tx == null){
                    res.json({
                        "respond":401,
                        "content":null
                    });
                    return;
                }
                var len = (pre.tx.length);
                for(var i =0 ;i <len;i++){
                    var ms = pre.tx[i].EX_TIME;
                    console.log(ms);
                    var m = new Date(parseInt(ms));
                    console.log(m);
                    pre.tx[i].EX_TIME = m.getFullYear()+'/'+padZ((m.getMonth()+1))+'/'+padZ(m.getDate())+" "+padZ(m.getHours())+":"+padZ(m.getMinutes())+":"+padZ(m.getSeconds());
                }

                res.json({
                    "respond":300,
                    "content":pre.tx
                });
                console.log('success',pre);  
            }else{
                console.log('fail');
            }
        });
    });

    app.post('/getToExPo', function(req, res){
        var seller = req.body.SELLER_ID;
        var from = req.body.START_TIME;
        var to = req.body.END_TIME;
        
        console.log('got getToExPo request from:'+from+"==to:"+to);
        g_cc.query.read(['findRange',seller,Date.parse(from).toString(),Date.parse(to).toString()],function(err,resp){
            if(!err){
                var pre = JSON.parse(resp);
                if (pre.tx == null){
                    res.json({
                        "respond":401,
                        "content":null
                    });
                    return;
                }
                var len = (pre.tx.length);
                for(var i =0 ;i <len;i++){
                    var ms = pre.tx[i].EX_TIME;
                    console.log(ms);
                    var m = new Date(parseInt(ms));
                    console.log(m);
                    pre.tx[i].EX_TIME = m.getFullYear()+'/'+padZ((m.getMonth()+1))+'/'+padZ(m.getDate())+" "+padZ(m.getHours())+":"+padZ(m.getMinutes())+":"+padZ(m.getSeconds());
                }

                res.json({
                    "respond":300,
                    "content":pre.tx
                });
                console.log('success',pre);   
            }else{
                console.log('fail');
            }
        });
    });

    app.post('/responseStore', function(req, res){
        var id = req.body.Request_id;
        var sellerA = req.body.seller_A;
        var sellerB = req.body.seller_B;
        var userA = req.body.user_A;
        var userB = req.body.user_B;
        var pointA = req.body.point_A;
        var pointB = req.body.point_B;


        var curret_date = new Date();
        var dateStr = curret_date.getFullYear()+''+curret_date.getMonth()+''+curret_date.getDate();
        var tmpID = sellerA+'-'+sellerB+'-'+dateStr+'-'+id;
        console.log('got responseStore request');
        g_cc.invoke.init_transaction([tmpID,userA,userB,sellerA,sellerB,pointA,pointB,''+Date.parse(new Date())],function(err,resp){
            var ss = resp;
            res.json({
                "msg":ss,
                "respond":true,
                "record_id":id
            });
            console.log('success',ss);  
        });
    });

//-------------------------------------------------------------------------------------
//-----------------API FOR DEV--------------------------------------------------------


    app.get('/testGet', function(req, res){
      res.json({"msg":"test"});
    });
    app.get('/query_point', function(req, res){
        console.log('got read request');
        g_cc.query.read(['read','_pointindex'],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json(JSON.parse(resp));
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
        });
    });
    app.get('/query_tx', function(req, res){
        console.log('got read request');
        g_cc.query.read(['read','_minimaltx'],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json({"msg":JSON.parse(resp)});
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
        });
    });
    app.post('/read_key', function(req, res){
        var key = req.body.key;
        console.log('got read key request');
        g_cc.query.read(['read',key],function(err,resp){
            if(!err){
                //var ss = resp.result.message;
                res.json({"msg":JSON.parse(resp)});
                console.log('success',resp);  
            }else{
                console.log('fail');
            }
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
        g_cc.query.read('read',[id],function(err,resp){
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
                console.log("get _tmpRelatedPoint");
                g_cc.query.read(['read','_tmpRelatedPoint'],function(err,resp){
                    if(!err){
                        //var ss = resp.result.message;
                        res.json({"msg":resp});
                        console.log('success',resp);  
                    }else{
                        console.log('fail',err);
                    }
                });  
            }else{
                console.log('fail');
            }

        });
    });
    app.post('/testPost',function(req,res){
        var foo = req.body.foo;
        var bar = req.body.FOO;
        res.json({"foo":foo,"FOO":bar});
    });
     
    function padZ(s){
        if (s.toString().length ==1){
            return '0'+s;   
        }
        return s;
    }
    