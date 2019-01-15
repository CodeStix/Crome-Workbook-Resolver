console.info("Loading workbook... (1/2)");

var currentLeak;
var frame;
var statusText;

window.onload = function()
{
	console.info("Loading workbook... (2/2)");

	frame = document.getElementById("viewFrame");

	setTimeout(function()
	{
		statusText = document.createElement("a");
		statusText.setAttribute("id","leakStatus");
		statusText.setAttribute("class","defaultfont");
		frame.contentWindow.document.getElementById("spanHorL").appendChild(statusText);

		downloadLeaks();

	}, 5000);
};

function downloadLeaks()
{
	console.info("Downloading leaks...");
	statusText.innerText = "Zoeken naar gelekte oplossingen...";

	// Downloading available workbook leaks.
	const proxyurl = "https://cors.io/?";
	fetch(proxyurl + "https://www.dropbox.com/s/jhc84b8nh4s6912/workbookLeaks.json?dl=1").then((resp) => resp.json()).then(function(data) 
	{
		var currentPage = window.location.href;

		for(var i = 0; i < data.leaks.length; i++)
		{
			if (currentPage.includes(data.leaks[i].ifContains))
			{
				currentLeak = data.leaks[i];
				console.info("Leak found type: " + currentLeak.type);
				console.info("Leak found ifContains: " + currentLeak.ifContains);
				console.info("Leak found normalFile: " + currentLeak.normalFile);
				console.info("Leak found solvedFile: " + currentLeak.solvedFile);
				break;
			}
		}

		leakFound();
	}).catch(function() 
	{
    	leakDownloadError();
	});
}

function leakDownloadError()
{
	statusText.innerText = "De gelekte oplossingen konden niet worden geladen. Klik om nog eens te proberen.";
	statusText.onclick = function() 
	{ 
		statusText.onclick = null;

		downloadLeaks(); 
	};
}

function leakFound()
{
	if (currentLeak == null)
	{
		statusText.innerText = "Dit boek heeft geen gelekte oplossingen.";

		//alert("Geen gelekte oplossingen beschikbaar voor dit werkboek.");
		return;
	}

	statusText.innerText = "Gelekte oplossingen gevonden, bekijk het oplossings-menu!";

	//alert("Er zijn gelekte oplossingen beschikbaar voor '" + currentLeak.type + "', bekijk het oplossings-menu in de rechterbovenhoek.");

	var btnSolve = frame.contentWindow.document.getElementById("btn_pinnedAnswersAll");//document.getElementById("btn_answerMode");
	btnSolve.disabled = false;
	btnSolve.onclick = function() { doSolve(true); };

	var btnNot = frame.contentWindow.document.getElementById("btn_answersNone");//document.getElementById("btn_answerMode");
	btnNot.disabled = false;
	btnNot.onclick = function() { doSolve(false); };
}


function doSolve(solve)
{
	statusText.innerText = "Laden...";

	var rightImage = frame.contentWindow.document.getElementsByClassName("rightimage realImage")[0];
	var leftImage = frame.contentWindow.document.getElementsByClassName("leftimage realImage")[0];
	rightImage.onload = function() 
	{
		statusText.innerText = "Voltooid.";
	};

	var newRightURL;
	var newLeftURL;

	if (solve)
	{
		newRightURL = rightImage.src.replace(currentLeak.normalFile, currentLeak.solvedFile);
		newLeftURL = leftImage.src.replace(currentLeak.normalFile, currentLeak.solvedFile);
	}
	else
	{
		newRightURL = rightImage.src.replace(currentLeak.solvedFile, currentLeak.normalFile);
		newLeftURL = leftImage.src.replace(currentLeak.solvedFile, currentLeak.normalFile);
	}
		
	rightImage.src = newRightURL;
	leftImage.src = newLeftURL;

	console.info("newRightURL:" + newRightURL);
	console.info("newLeftURL:" + newLeftURL);
}