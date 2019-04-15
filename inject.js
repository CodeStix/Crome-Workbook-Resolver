// Obsolete

function injectScript(url, into, callback)
{
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function() 
    {
        script.onload = null;

        callback();
    }

    into.appendChild(script);

    script.src = url;
}