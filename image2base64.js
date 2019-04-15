const downscaleCanvas = document.createElement("canvas");

function urlToBase64(url, callback) 
{
    /*fetch(url).then(res => res.blob()).then(blob =>
    {
        const reader = new FileReader();

        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(blob);
    }).catch(function(error) 
    {
        callback(null);
    });*/
    var img = new Image();
    img.onload = function () 
    {
        downscaleCanvas.width = img.width;
        downscaleCanvas.height = img.height;

        var ctx = downscaleCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0, downscaleCanvas.width, downscaleCanvas.height);

        callback(downscaleCanvas.toDataURL());
    }
    img.onerror = function()
    {
        callback(null);
    }
    img.src = url;
}

function urlToBase64Downscale(url, downscaleFactor, callback)
{
    var img = new Image();
    img.onload = function () 
    {
        downscaleCanvas.width = img.width / downscaleFactor;
        downscaleCanvas.height = img.height / downscaleFactor;

        var ctx = downscaleCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high"; //"low" || "medium" || "high"
        ctx.drawImage(img, 0, 0, downscaleCanvas.width, downscaleCanvas.height);

        callback(downscaleCanvas.toDataURL());
    }
    img.onerror = function()
    {
        callback(null);
    }
    img.src = url;
}