(function () {
    var g = function () { for (var b = function (c) { c.origin || (c.origin = c.protocol + "//" + c.hostname + (c.port ? ":" + c.port : "")) }, d = function (c, e) { try { return b(c.location), b(e.location), c.location.origin === e.location.origin } catch (f) { return !1 } }, a = window; a != a.parent && d(a, a.parent); a = a.parent); return a }(); (function () {
        var b, d = 0; try { if (g._setupM2KSessionGlobalSetting(window)) return } catch (a) { } g._setupM2KSessionGlobalSetting = function (a) {
            a.setupM2KSessionSetting = g.setupM2KSessionSetting; a.isSessionEncrypt = g.isSessionEncrypt;
            a.getM2KCrumb = g.getM2KCrumb; return a.setupM2KSessionSetting && a.isSessionEncrypt && a.getM2KCrumb
        }; window.setupM2KSessionSetting = function (a) { "boolean" === typeof a.sessionEncrypt && (b = a.sessionEncrypt, localStorage.setItem("__M2K_SESSION_ENCRYPT__", b)); b ? d = a.crumb || window.getM2KCrumb() || 0 : (d = Math.floor((new Date).getTime() / 864E5), localStorage.setItem("__M2K_VIRTUAL_CRUMB__", d)) }; window.isSessionEncrypt = function () { return "boolean" === typeof b ? b : "true" === localStorage.getItem("__M2K_SESSION_ENCRYPT__") }; window.getM2KCrumb =
            function () { return window.isSessionEncrypt() ? d : Number(localStorage.getItem("__M2K_VIRTUAL_CRUMB__")) }
    })(); (function () {
        try { g._setupM2KSessionMonitor(window); return } catch (e) { g._setupM2KSessionMonitor = function (f) { f.startM2KSessionMonitor = g.startM2KSessionMonitor; f.stopM2KSessionMonitor = g.stopM2KSessionMonitor } } var b = null, d = null, a = null, c = function () {
            var e = (new Date).getTime(); if (!(6E4 < e - b && 6E4 > e - d)) {
                d = e; var f = new XMLHttpRequest; f.onload = function (h) {
                    if (h = f.getResponseHeader("X-M2K-Session")) window.setM2KIdentify(h),
                        null !== a && (clearInterval(a), a = null)
                }; f.open("get", "/cgi-bin/check_session?m=" + Math.floor(9007199254740991 * Math.random()), !0); f.send()
            }
        }; window.startM2KSessionMonitor = function () { null === a && (b = (new Date).getTime(), a = setInterval(c, 1E3)) }; window.stopM2KSessionMonitor = function () { null !== a && (clearInterval(a), a = null) }
    })(); (function () {
        function b(a, c) { var e = ""; for (i = 0; i < a.length; ++i) { var f = a.charCodeAt(i) ^ c; e += String.fromCharCode(f) } return e } var d = function (a) { "__M2K_SESSION__" === a.key && a.newValue && window.stopM2KSessionMonitor() };
        window.addEventListener ? window.addEventListener("storage", d) : window.attachEvent("storage", d); window.getM2KIdentify = function () { return b(localStorage.getItem("__M2K_SESSION__") || "", window.getM2KCrumb()) }; window.setM2KIdentify = function (a) { return localStorage.setItem("__M2K_SESSION__", b(a || "", window.getM2KCrumb())) }
    })()
})();