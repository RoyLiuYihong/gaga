var clientType = "iOS";
// var callbackIdParamName = "_zalyjsCallbackId"
var callbackIdParamName = "zalyjsCallbackId";

//set pc web referrer
//localStorage, prevent page flush, and the referrer is lost
var refererUrl = document.referrer;
var refererUrlKey = "documentReferer";
if(refererUrl.length>0) {
    localStorage.setItem(refererUrlKey, refererUrl);
    refererUrlKeyVal = localStorage.getItem(refererUrlKey);
}
var zalyjsSiteLoginMessageBody={};


function zalyjsCallbackHelperConstruct() {

    var thiz = this
    this.dict = {}

    //
    // var id = helper.register(callback)
    //
    this.register = function(callbackFunc) {
        var id = Math.random().toString()
        thiz.dict[id] = callbackFunc
        return id
    }

    //
    // helper.call({"_zalyjsCallbackId", "args": ["", "", "", ....]  })
    //
    this.callback = function(param) {
        try {
            param = atob(param);
            // js json for \n
            param = param.replace(/\n/g,"\\\\n");

            var paramObj = JSON.parse(param)
            var id = paramObj[callbackIdParamName]

            var args = paramObj["args"]
            var callbackFunc = thiz.dict["" + id]
            if (callbackFunc != undefined) {
                // callback.apply(undefined, args)
                callbackFunc(args);
                delete(thiz.dict[id])
            } else {
                // do log
                console.log("callback",  ""  + id  + "is undefined")
            }
        } catch (error) {
            console.log("callback", error)
            // do log
        }
    }
    return this
};
var zalyjsCallbackHelper = new zalyjsCallbackHelperConstruct();

getOsType();

function getOsType() {
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
        clientType =  'Android';
    } else if (u.indexOf('iPhone') > -1) {
        clientType = 'IOS';
    } else {
        clientType = "PC";
    }
}

function isAndroid() {
    return clientType.toLowerCase() == "android"
}

function isIOS() {
    return clientType.toLowerCase() == "ios"
}

function jsonToQueryString(json) {
    url = Object.keys(json).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(json[k])
    }).join('&')
    return url
}


function addJsByDynamic(url)
{
    var script = document.createElement("script")
    script.type = "text/javascript";
    //Firefox, Opera, Chrome, Safari 3+
    script.src = url;
    $(".zaly_container")[0].appendChild(script);
}

//
//
// Javascript Bridge Begin
//
//

function zalyjsSetClientType(t) {
    clientType = t
}

function zalyjsNavOpenPage(url) {
    var messageBody = {}
    messageBody["url"] = url
    messageBody = JSON.stringify(messageBody)

    if (isAndroid()) {
        window.Android.zalyjsNavOpenPage(messageBody)
    } else if(isIOS()) {
        window.webkit.messageHandlers.zalyjsNavOpenPage.postMessage(messageBody)
    }
}

function zalyjsLoginSuccess(loginName, sessionid, isRegister, callback) {

    var callbackId = zalyjsCallbackHelper.register(callback)
    var messageBody = {}
    messageBody["loginName"] = loginName
    messageBody["sessionid"] = sessionid
    messageBody["isRegister"] = (isRegister == true ? true : false)
    messageBody[callbackIdParamName] = callbackId
    messageBody = JSON.stringify(messageBody)

    if (isAndroid()) {
        window.Android.zalyjsLoginSuccess(messageBody)
    } else if(isIOS()) {
        window.webkit.messageHandlers.zalyjsLoginSuccess.postMessage(messageBody)
    } else {
        loginPcClient(messageBody, callback.name);
    }
}

function zalyjsWebSuccessCallBack(result) {
    localStorage.clear();
    window.location.href = result;
}

////登录pc, 暂时没有使用callbackId,
function loginPcClient(messageBody, callbackName)
{
    messageBody = JSON.parse(messageBody);
    var refererUrl = localStorage.getItem(refererUrlKey);
    zalyjsSiteLoginMessageBody = messageBody;
    zalyjsSiteLoginMessageBody.refererUrl = refererUrl;
    zalyjsSiteLoginMessageBody.callbackName = callbackName;

    if(messageBody.isRegister == false)  {
        var jsUrl = "./index.php?action=page.js&loginName="+messageBody.loginName+"&success_callback=zalyjsWebLoginSuccess&fail_callback="+callbackName;
        addJsByDynamic(jsUrl);
        return;
    }
    zalyjsWebLoginSuccess();
}

////登录成功后，web回调
function zalyjsWebLoginSuccess()
{
    var refererUrl = zalyjsSiteLoginMessageBody.refererUrl;
    if(refererUrl) {
        if(refererUrl.indexOf("?") > -1) {
            var refererUrl = zalyjsSiteLoginMessageBody.refererUrl+"&preSessionId="+zalyjsSiteLoginMessageBody.sessionid+"&isRegister="+zalyjsSiteLoginMessageBody.isRegister;
        } else {
            var refererUrl = zalyjsSiteLoginMessageBody.refererUrl+"?preSessionId="+zalyjsSiteLoginMessageBody.sessionid+"&isRegister="+zalyjsSiteLoginMessageBody.isRegister;
        }
        refererUrl = refererUrl + " &fail_callback="+zalyjsSiteLoginMessageBody.callbackName+"&&success_callback=zalyjsWebSuccessCallBack";
        addJsByDynamic(refererUrl);
    }
}

//web 检查用户是否已经被注册
function zalyjsWebCheckUserExists(failedCallback, successCallback)
{
    var jsUrl = "./index.php?action=page.js&loginName="+registerLoginName+"&success_callback="+successCallback.name+"&fail_callback="+failedCallback.name;
    addJsByDynamic(jsUrl);
}

//android, ios, pc
function zalyjsLoginConfig(callback) {
    var callbackId = zalyjsCallbackHelper.register(callback)

    var messageBody = {}
    messageBody[callbackIdParamName] = callbackId
    messageBody = JSON.stringify(messageBody)

    if (isAndroid()) {
        window.Android.zalyjsLoginConfig(messageBody)
    } else if(isIOS()) {
        window.webkit.messageHandlers.zalyjsLoginConfig.postMessage(messageBody)
    } else {
        var siteConfigJsUrl = "./index.php?action=page.siteConfig&callback="+callback.name;
        addJsByDynamic(siteConfigJsUrl);
    }
}

function zalyjsNavClosePlugin()
{
    if (isAndroid()) {
        console.log("is android");
        window.Android.zalyjsNavClose()
    } else if(isIOS()) {
        window.webkit.messageHandlers.zalyjsNavClose()
    }
}

function zalyjsAlert(str)
{
    if (isAndroid()) {
        window.Android.zalyjsAlert(str);
    } else if(isIOS()) {
        alert(str);
    } else {
        alert(str);
    }
}


