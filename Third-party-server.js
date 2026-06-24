const http=require("http");
const {Pool}=require("pg");
const { stringify } = require("querystring");

const connection = new Pool(
{
    user:"postgres",
    host:"localhost",
    database:"EA-gateway",
    password:"root123",
    port:5432
}
);



const versions_service = http.createServer( async (req,res)=>
    {
        if(req.method=="GET" && req.url==="/versions")
        {
            try{
            const result = await connection.query("select version_name,version_update_descriptions, released_at from versions");

            res.writeHead(200, { "Content-Type": "application/json" });
            
            return res.end(JSON.stringify(result.rows));
            }
            catch(error)
            {
                console.log("Query failed",error);
                return res.end(stringify({message:"Internal server problemmm"}))
            }
        }   
        res.statusCode=404;
        res.end(JSON.stringify({message:"requested path not found"}));
    }
    ).listen(4001);

const announcement_service = http.createServer(async (req,res)=>
    {
        if(req.method=="GET" && req.url==="/announcements")
        {
            try
            {
            const result= await connection.query("select announcement_content,announced_at from announcements order by announced_at desc");
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(result.rows));
            }
            catch(error)
            {
                console.log("Query failed",error);
                return res.end(JSON.stringify({message:"Internal server problemmm"}));               
            }
        }  
        res.end("Closing the connection");  

    }).listen(4002);

const masterServer=http.createServer(async (req,res)=>
    {
        if (req.url=="/versions")
        {
            const response= await fetch("http://localhost:4001/versions");
            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
        }
        else if (req.url =="/announcements")
        {
            const response= await fetch("http://localhost:4002/announcements");
            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
        }
    });
    
masterServer.listen(4000,()=>
    console.log("master server is running at port 4000")
);

        /*
        console.log("Running announcement server");
        console.log("base url : localhost:3000/",);
        console.log("Requested method : ",req.method);
        console.log("Requested url",req.url);
        */


        /*


                console.log("Running download versions server");

        console.log("base url : localhost:3000/",);
        console.log("Requested method : ",req.method);
        console.log("Requested url",req.url);

        requestHandlers(req.method,req.url,res);
        res.end("Closing the connection"); 
        */

/*
function requestHandlers(requestMethod,requestUrl)
{
    if(requestMethod==="GET" && requestUrl==='/futureUpdates')
    {
        pool.query
    }
}*/

/*
const server= http.createServer(
    (req,res)=>
    {
        res.writeHead(200, { "Content-Type": "text/plain" });
        console.log("base url : localhost:3000/",);
        console.log("Requested method : ",req.method);
        console.log("Requested url",req.url);

        requestHandlers(req.method,res.url);
    
        res.end("Closing the connection");  
    }
);

server.listen(3000,
    ()=>{
        console.log("Server is running in port 3000");
    }
);
*/
