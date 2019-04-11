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

		downloadLeaks(true);

	}, 5000);
};

function downloadLeaks(useOnline)
{
	console.info("Downloading leaks...");
	statusText.innerText = "Zoeken naar gelekte oplossingen...";

	const url;
	if (useOnline)
	{
		// Use the updated leaks version.
		const proxyurl = "https://cors.io/?";
		url = proxyurl + "https://www.dropbox.com/s/jhc84b8nh4s6912/workbookLeaks.json?dl=1";
	}
	else
	{
		// Get the offline leaks file.
		url = "chrome-extension://maoidnhjkefpedkamblocnibnflipoca/workbookLeaks.json";
	}

	// Downloading available workbook leaks.
	fetch(url).then((resp) => resp.json()).then(function(data) 
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
		
		if (useOnline)
			downloadLeaks(false);
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

	rightImage.parentElement.style.backgroundRepeat = "no-repeat";
	leftImage.parentElement.style.backgroundRepeat = "no-repeat";
	rightImage.parentElement.style.backgroundSize = "100% 100%";
	leftImage.parentElement.style.backgroundSize = "100% 100%";
	rightImage.parentElement.style.backgroundImage = "url('" + rightImage.src + "')";
	leftImage.parentElement.style.backgroundImage = "url('" + leftImage.src + "')";

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

//https://content.plantyn.com/CMS/CDS/Plantyn/Published%20Content/Scoodle%20eBooks/Nieuwe%20Delta-T%205_6%20Rationale%20functies%20(Scoodle%2011e102fa-c0ae-4e39-b38a-a66d00b3ee86)/Resources/0ddf644e-59d2-4d7e-9cab-2c6ff15962d8.pdf_/55.png
//https://content.plantyn.com/CMS/CDS/Plantyn/Published%20Content/Scoodle%20eBooks/Nieuwe%20Delta-T%205_6%20Rationale%20functies%20(Scoodle%2011e102fa-c0ae-4e39-b38a-a66d00b3ee86)/Resources/0ddf644e-59d2-4d7e-9cab-2c6ff15962d8.pdf_/55.png