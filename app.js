const express=require('express');
const path = require('path');
const app=express();
const bodyParser = require('body-parser');
const sha256 = require('sha256');
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');
const request = require("request");
const QRCode = require('qrcode');
const replace = require('replace-in-file');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.get('/*', (req, res) => {
res.sendFile(path.join(__dirname, './index.html'));
})

app.post('/notifyurl', (req, res) => {
console.log(req.body);
})

app.post('/', function(req, res) {
  //res.sendStatus(200);
  var timestamp = Math.floor((new Date()).getTime() / 1000);
  var merchorderid = timestamp + "SP";

  function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
  }
  var nonce_str = generateRandomString(20);

  var tohash = "appid=kpb67f5efda76b481998645ef28ca356&callback_info=https://fbvid.soepaing.com/callbackurl&merch_code=200106&merch_order_id=" + merchorderid + "&method=kbz.payment.precreate&nonce_str=" + nonce_str + "&notify_url=https://fbvid.soepaing.com/notifyurl&timeout_express=100m&timestamp=" + timestamp + "&total_amount=20000&trade_type=PAY_BY_QRCODE&trans_currency=MMK&version=1.0&key=1be73b08e9f3215020aa88d28a494b08";

  var hashed = sha256(tohash);

  var tokbzjson = { "Request": { "timestamp": timestamp, "notify_url": "https://fbvid.soepaing.com/notifyurl", "method": "kbz.payment.precreate", "nonce_str": nonce_str, "sign_type": "SHA256", "sign": hashed, "version": "1.0", "biz_content": { "merch_order_id": merchorderid, "merch_code": "200106", "appid": "kpb67f5efda76b481998645ef28ca356", "trade_type": "PAY_BY_QRCODE", "total_amount": "20000", "trans_currency": "MMK", "timeout_express": "100m", "callback_info": "https://fbvid.soepaing.com/callbackurl" } } }
  var tokbzjsonstring = JSON.stringify(tokbzjson);
  var url = "http://api.kbzpay.com/payment/gateway/uat/precreate"

  request({
         url: url,
         method: "POST",
         json: tokbzjson
     }, function (error, response, body) {
         if (!error && response.statusCode === 200) {
             console.log(body)
             //var obj = JSON.parse(body);
             //var qrstring = obj.Response.nonce_str
              QRCode.toDataURL(body.Response.qrCode, function (err, url) {
              res.writeHead(200, {'Content-Type': 'text/html'});
              var beforecode = '<!DOCTYPE html><html lang="en" dir="ltr"> <head> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"> <meta charset="utf-8"> <title>Scan to Pay</title> <style>.center { padding: 70px 0; border: 3px solid green; text-align: center;}</style> </head> <body> <div class="card center" style="width: 18rem;"> <img class="card-img-top" src="'
              var aftercode = '" alt="Card image cap"> <div class="card-body"> <h5 class="card-title">Scan Here to Pay</h5> <p class="card-text">KBZ Pay ဖြင့်ငွေပေးချေရန် အထက်ပါ QR Code ကို Scan ဖတ်ပါ။</p> <a href="https://play.google.com/store/apps/details?id=com.kbzbank.kpaycustomer&hl=my" class="btn btn-primary">Download KBZ Pay App</a> </div> </div> </body></html>'
              res.write(beforecode + url + aftercode);



              res.end();
              })
         }
         else {

             console.log("error: " + error)
             console.log("response.statusCode: " + response.statusCode)
             console.log("response.statusText: " + response.statusText)
         }

 })

  console.log('user clicked at ' + timestamp + " and merchorderid: " + merchorderid + " and nonce_str: " + nonce_str + " and to hash: " + tohash + " hashed: " + hashed + " tokbz: " + tokbzjsonstring);
});


const port =2000;
app.listen(port,()=>{
console.log(`App running on ${port}`);
})
