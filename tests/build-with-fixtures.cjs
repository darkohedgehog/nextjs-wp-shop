/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node fixture runner. */
const http = require('node:http');
const {spawn} = require('node:child_process');
const empty = {nodes: [], pageInfo: {hasNextPage:false,endCursor:null}};
const server=http.createServer((req,res)=>{
  req.resume(); req.on('end',()=>{
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({data:{fAQs:empty,products:empty,productCategories:empty,pwbBrands:empty,posts:empty,terms:empty}}));
  });
});
server.listen(18764,'127.0.0.1',()=>{
 const base='http://127.0.0.1:18764';
 const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'};
 for (const k of ['WP_BASE_URL','WP_INTERNAL_BASE_URL','WC_BASE_URL','NEXT_PUBLIC_WC_BASE_URL','NEXT_PUBLIC_WP_URL','NEXT_PUBLIC_WP_BASE_URL']) env[k]=base;
 for (const k of ['WP_GRAPHQL_URL','WP_INTERNAL_GRAPHQL_URL','NEXT_PUBLIC_WP_GRAPHQL_URL','NEXT_PUBLIC_GRAPHQL_URL']) env[k]=base+'/graphql';
 env.WP_REST_ROOT=base+'/wp-json'; env.WOO_INTERNAL_BASE_URL='https://woo.invalid';
 env.NEXT_PUBLIC_SITE_URL='https://shop.invalid';
 for(const k of ['WC_KEY','WC_SECRET','WC_CONSUMER_KEY','WC_CONSUMER_SECRET']) env[k]='local-fixture';
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','build'],{env,stdio:'inherit'});
 child.on('exit',code=>server.close(()=>process.exit(code??1)));
});
