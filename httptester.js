//HTTP, SMTP and utility libraries required
const nodemailer = require('nodemailer');
const util = require('util');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//SMTP transport settings
let transport = nodemailer.createTransport({
    host: 'smtp.landsend.com',
    port: 25,
    auth: {
       user: 'dontask',
       pass: 'donttell'
    }
});

//Message content
const message = {
    from: 'LE.Promo.Error@landsend.com', // Sender address
    to: 'Ronald.Schmitt@landsend.com;Jeremy.Fredrich@landsend.com;Jessica.Rickard@landsend.com;Robert.Radosevich@landsend.com;Alan.Hummer@landsend.com;Santanu.Mojumder@landsend.com',         // List of recipients
    subject: 'Promo Cache Alert! Alert! Alert!', // Subject line
    text: 'We have a promotion cache problem.  See here: \r\n\r\n_DETAILS_' // Plain text body
};

//Data used in this script
var config = {
    "appName": "Site Checker",
    "URLs": [
        {
            "servername": "www.landsend.com",
            "URI":  "https://www.landsend.com/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "orgin-m1-www.landsend.com",
            "URI":  "https://origin-m1-www.landsend.com/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "orgin-d1-www.landsend.com",
            "URI":  "https://origin-d1-www.landsend.com/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx08:1080",
            "URI":  "http://leuspx08:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx09:1080",
            "URI":  "http://leuspx09:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx10:1080",
            "URI":  "http://leuspx10:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx25:1080",
            "URI":  "http://leuspx25:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx26:1080",
            "URI":  "http://leuspx26:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx27:1080",
            "URI":  "http://leuspx27:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx28:1080",
            "URI":  "http://leuspx28:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx29:1080",
            "URI":  "http://leuspx29:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        },
        {
            "servername": "leuspx30:1080",
            "URI":  "http://leuspx30:1080/api/OfferDetailServlet?promotionSegmentId=null",
            "RunIt": true
        }
    ],
    "HTTPDefaults": {
        "type": "GET",
        "url" : "",
        "headers": {
            "Content-Type": "'application/json"
        },
        "responseType": "json",
        "data": ""
    }
}
var promoArray = [];

//Call Main thread
mainThread();

/****************
Setup and configuration
****************/
function mainThread() {    

    /****************
    Main control thread - When document loaded, do this routine
    ****************/
    //Rip thru each URL, save and compare to the others.
    config.URLs.forEach(function(inputURL) {
        if (inputURL.RunIt) {
            getURL(inputURL.URI, {})
            .then(onURLFetchSuccess, function(error) {
                //Took Error - log it
                promoArray.push({"url": inputURL.URI, "promo": "", "error":error.status + "=" + error.statusText});
                if (promoArray.length == config.URLs.length) {
                    checkForProblems(promoArray);
                }
            });
        }
        else {
            promoArray.push({"url": inputURL.URI, "promo": "(skipped)", "error": "(none)" });
            if (promoArray.length == config.URLs.length) {
                checkForProblems(promoArray);
            }
        }
    });
}

//Handle successful results
function onURLFetchSuccess(responseObject) {

    //Got URL
    //put respons intoa JSON object
    var promoResponse = JSON.parse(responseObject.responseText);

    if (promoResponse.promoCode && promoResponse.promoNumber) {
       
        //Gen ourkey
        var newPromo = promoResponse.promoCode + ":" + promoResponse.promoNumber;
       
        promoArray.push({"url": responseObject.url, "promo": newPromo, "error": "(none)"});
    }
    else {
        promoArray.push({"url": responseObject.url, "promo": "", "error": responseObject.error.status + "=" + responseObject.error.statusText + " Text:" + responseObject.responseText});
    }

    //IF we are done, process the set
    if (promoArray.length == config.URLs.length) {
        checkForProblems(promoArray);
    }
}

//Go thru array and see if we have problems
function checkForProblems(inputPromoArray) {

    var blnError = false;
    var szPromoMessage = "";
    var savePromo = "";

    inputPromoArray.forEach(function(promoObject) {
        //Intiialize save value, if not set

        //See if it is the same
        if (promoObject.promo == "(skipped)") {
            //skip it
        }
        else {
            if (savePromo == "") 
                savePromo = promoObject.promo;
       
            //Now check
            //console.log("PRMO: " + promoObject.promo + " VS " + savePromo + "ERR:" + promoObject.error);
            if (promoObject.promo != savePromo || promoObject.promo == "" || promoObject.error != "(none)") {
                //we have a probolem
                blnError = true;
                //console.log("ERROR HERE!");
            }
            else {
                //All Good
            }
            if (promoObject.error == "(none)") {
                szPromoMessage = szPromoMessage + "URL: " + promoObject.url + " = " + promoObject.promo + "\r\n";
            }
            else {
                szPromoMessage = szPromoMessage + "URL: " + promoObject.url + " = " + promoObject.promo + " error: " + JSON.parse(JSON.stringify(promoObject.error)) + "\r\n";
            }
            savePromo = promoObject.promo;
        }

    });

    //Found error, send the alarm - else, chill
    if (blnError) {
        throwError(szPromoMessage);
    }
    else {
        doLog("Success - All good.");
        doLog(szPromoMessage);
    }
}

//Do the HTTP work to get the URL payload
function getURL (inputURL, optionsOverrides) {

    // merge default and override options
    var options = extend(config.HTTPDefaults, optionsOverrides || {});

    // concat url
    options.url = inputURL;
    // return promise
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        // open request
        req.open(options.type, options.url, true);
        // set response type (json)
        req.responseType = options.responseType;
        // on load logic
        req.onload = function() {
            // consider all statuses between 200 and 400 successful
            if (req.status >= 200 && req.status < 400) {
                //all good
                req.url = inputURL;
                resolve(req);
             }
            // all other ones are considered to be errors
            else {
                //reject(req.response, req.status, req.statusText);
                reject({
                    response: req.response, 
                    status: req.status, 
                    statusText: req.statusText
                });
            }

        };

        // Unpredicted error
        req.onerror = function() {
            reject({
                response: undefined, 
                status: undefined, 
                statusText: 'Unknown Error'
            });
        };

        // set all headers
        for(header in options.headers){
            req.setRequestHeader(header, options.headers[header]);
        }

        // send the request
        req.send(options.data);

    });

}

//Throw an error alert
function throwError(inputMessage) {
    //Send EMail
    var myMessageText = message.text;
    myMessageText = myMessageText.replace("_DETAILS_", inputMessage);
    message.text = myMessageText;
    transport.sendMail(message, function(err, info) {
        if (err) {
        console.log(err)
        } else {
        console.log(info);
        }
    });
    doLog("Took Error - Not all good.");
    doLog(inputMessage);
}

//Debug log
function doLog(inputObject) {
    console.log(util.inspect(inputObject, false, null, true /* enable colors */))
}

// Simple extend function
function extend (target, overrides) {

    // new empty object
    var extended = Object.create(target);

    // copy all properties from default
    Object.keys(target).map(function (prop) {
        extended[prop] = target[prop];
    });

    // iterate through overrides
    Object.keys(overrides).map(function (prop) {

        // if the attribute is an object, extend it too
        if(typeof overrides[prop] === 'object'){
            extended[prop] = extend(extended[prop], overrides[prop]);
        }
        // otherwise just assign value to the extended object
        else{
            extended[prop] = overrides[prop];
        }
    });

    return extended;

};
