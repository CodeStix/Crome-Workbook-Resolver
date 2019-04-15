var leaks;
var currentLeak;

var frame;
var statusText;
var btnSolve;
var btnNot;
var btnLineByLine;
var btnShare;

var normalPdfUrl;
var solvedPdfUrl;

window.onload = function()
{
	console.info("Loading workbook... (1/2)");

	// Load default local leaks file.
	fetch(chrome.extension.getURL("leaks.json")).then((resp) => resp.json()).then(function(data) 
	{
		leaks = data;
	}).catch(function(error)
	{
		leaks = {
			leaks: []
		};
	});

	// Try to load updated local leaks file.
	chrome.storage.local.get(['workbookLeaks'], function(data) 
	{	
		if (typeof data != 'undefined' && data != null)
		{
			console.info("Loaded local leaks from storage.");

			leaks = data;
		}
	});

	var inject = function()
	{
		console.info("Injecting... (2/2)");

		statusText = document.createElement("a");
		statusText.setAttribute("id","leakStatus");
		statusText.setAttribute("class","defaultfont");

		frame.contentWindow.document.getElementById("spanHorL").appendChild(statusText);

		btnSolve = frame.contentWindow.document.getElementById("btn_pinnedAnswersAll");//document.getElementById("btn_answerMode");
		btnSolve.title = "Alle antwoorden op deze pagina weergeven.";
		btnSolve.onclick =  function() { doSolve(true); }

		btnNot = frame.contentWindow.document.getElementById("btn_answersNone");//document.getElementById("btn_answerMode")
		btnNot.title = "Alle antwoorden op deze pagina verbergen.";
		btnNot.onclick = function() { doSolve(false); }

		btnLineByLine = frame.contentWindow.document.getElementById("btn_pinnedAnswersByLine");;
		btnLineByLine.title = "Download alle oplossingen als een PDF bestand.";
		btnLineByLine.onclick = function() 
		{ 
			btnLineByLine.disabled = true;
			btnLineByLine.title = "Er wordt al een PDF aangemaakt, dit kan even duren.";

			downloadAsPDF(function() 
			{
				btnLineByLine.disabled = false;
				btnLineByLine.title = "Download alle oplossingen als een PDF bestand.";
			}); 
		}

		btnShare = frame.contentWindow.document.getElementById("btn_shareAnswers");
		btnShare.title = "Ja nee eh.";
		btnShare.onclick = function() 
		{  
			alert("Waar ben jij mee bezig? Druk gewoon op 'alle oplossingen weergeven', waarom zou je een sleutel gebruiken?");

			btnShare.disabled = true;
		}

		console.info("Downloading leaks...");
		statusText.innerText = "Zoeken naar gelekte oplossingen...";

		downloadOnlineLeaks(function(onlineLeaks)
		{
			if (onlineLeaks != null)
			{
				leaks = onlineLeaks;
				
				chrome.storage.local.set({'workbookLeaks': onlineLeaks}, function() 
				{
					console.info("Local leaks were updated to newest online leaks!");
				});
			}

			console.info(leaks);

			// Finding the leak for the current workbook.
			var currentPage = window.location.href;
			var findLeak = function(url) 
			{
				for(var i = 0, ii = leaks.leaks.length; i < ii; i++)
				{
					var leak = leaks.leaks[i];

					for (var j = 0, jj = leak.ifContains.length; j < jj; j++)
					{
						if (url.includes(leak.ifContains[j]))
						{
							console.info("Leak found type: " + leak.type);
							console.info("Leak found ifContains: " + leak.ifContains);
							console.info("Leak found normalFile: " + leak.normalFile);
							console.info("Leak found solvedFile: " + leak.solvedFile);
							
							return leak;
						}
					}
				}

				return null;
			}
	
			currentLeak = findLeak(currentPage);
			if (currentLeak == null)
			{
				setStatus("!! Dit boek heeft geen gelekte oplossingen.", false);
			}
			else
			{
				setStatus((onlineLeaks != null ? "Online" : "Offline") + " oplossingen gevonden, bekijk het oplossings-menu!", true);
		
				btnSolve.disabled = false;
				btnNot.disabled = false;
				btnLineByLine.disabled = false;
			}
		});
	}

	frame = document.getElementById("viewFrame");

	// Wait for the iframe to load.
	var f = setInterval(function()
	{
		if (frame.contentWindow.document.getElementById("spanHorL") != null)
		{
			clearInterval(f);

			setTimeout(inject, 1500);
		}
	}, 150);
};

function setStatus(status, type = null)
{
	const trueColor = 'lime';
	const falseColor = 'red';

	statusText.innerText = status;

	if (type != null)
	{
		repeat(function(i) 
		{
			statusText.style.color = i % 2 == 1 ? (type ? trueColor : falseColor) : null;
		}, 250, 7);
	}
}

function repeat(func, interval, times)
{
	if (times <= 1)
		return;

	setTimeout(function() 
	{
		func(times);
		repeat(func, interval, --times);
	}, interval);
}

function downloadOnlineLeaks(callback)
{
	// Use the updated leaks version.
	const proxyurl = "https://cors.io/?";
	var url = proxyurl + "https://www.dropbox.com/s/psegjugj6wuz32f/leaks.json?dl=1";

	// Downloading available workbook leaks.
	fetch(url).then((resp) => resp.json()).then(function(data) 
	{
		if (typeof data != 'undefined' && data != null)
		{
			callback(data);
		}
		else
		{
			callback(null);
		}
	}
	).catch(function() 
	{
		callback(null);
	});
}

function downloadAsPDF(callback)
{
	if (normalPdfUrl == null || solvedPdfUrl == null)
	{
		doSolve(false);
	}

	setStatus("PDF wordt aangemaakt, dit zal enkele minuten duren...", true);

	var pageCount = parseInt(frame.contentWindow.document.querySelectorAll("#divHorBottom #spanHorL span.defaultfont")[0].innerText.substring(4)) - 1;
	
	// Check for transparancy
	var copyNormalLayer = true;
	var image = new MarvinImage();
	image.load(solvedPdfUrl + "/" + Math.floor(pageCount / 2) + ".png", function()
	{
		copyNormalLayer = image.getAlphaComponent(50, 50) == 0;

		console.info("Also copy normal layer? " + copyNormalLayer);
	});

	//const downscaleFactor = 1.75;
	var doc = new jsPDF('p', 'pt','a4', true);
	var addPage = function(normal, solved, callback)
	{
		var addSolvedLayer = function()
		{
			urlToBase64(solved, function(base2) 
			{
				if (base2 == null)
				{
					callback(false);
					return;
				}

				try
				{
					doc.addImage(base2, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), undefined, 'FAST');
					//doc.text(20, 20, 'Page');

					callback(true);
				}
				catch
				{
					callback(false);
				}
			});
		};

		if (copyNormalLayer)
		{
			urlToBase64(normal, function(base) 
			{
				if (base == null)
				{
					callback(false);
					return;
				}

				try
				{
					doc.addImage(base, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), undefined, 'FAST');
				}
				catch
				{ }

				addSolvedLayer();
			});
		}
		else
		{
			addSolvedLayer();
		}
	} 

	var current = 1;
	var nextPage = function()
	{
		setStatus("PDF aanmaken... (" + current + "/" + pageCount + ")");

		if (current > pageCount)
		{
			var file = currentLeak.type + "_Oplossingen.pdf";

			doc.save(file);

			setStatus("PDF is aangemaakt, download zal zometeen starten... ", true);

			callback();

			return;
		}

		var normal = normalPdfUrl + "/" + current + ".png";
		var solved = solvedPdfUrl + "/" + current + ".png";

		addPage(normal, solved, function(ok) 
		{ 
			doc.addPage();

			current++;

			nextPage();
		});
	}

	nextPage();
}

function doSolve(solve)
{
	setStatus("Laden...");

	var rightImage = frame.contentWindow.document.getElementsByClassName("rightimage realImage")[0];
	var leftImage = frame.contentWindow.document.getElementsByClassName("leftimage realImage")[0];

	if (normalPdfUrl == null || solvedPdfUrl == null)
	{
		normalPdfUrl = rightImage.src.substring(0, rightImage.src.lastIndexOf('/'));
		solvedPdfUrl = normalPdfUrl.replace(currentLeak.normalFile, currentLeak.solvedFile);

		console.info("normalPdfUrl: " + normalPdfUrl);
		console.info("solvedPdfUrl: " + solvedPdfUrl);
	}

	var rightOverlayImage = frame.contentWindow.document.getElementById("solved_image_right");
	if (rightOverlayImage == null)
	{
		if (!solve)
			return;

		rightOverlayImage = frame.contentWindow.document.createElement('img');
		rightOverlayImage.id = "solved_image_right";
		rightOverlayImage.style.cssText = rightImage.style.cssText;
		rightImage.parentElement.appendChild(rightOverlayImage);
	}

	var leftOverlayImage = frame.contentWindow.document.getElementById("solved_image_left");
	if (leftOverlayImage == null)
	{
		if (!solve)
			return;

		leftOverlayImage = frame.contentWindow.document.createElement('img');
		leftOverlayImage.id = "solved_image_left";
		leftOverlayImage.style.cssText = leftImage.style.cssText;
		leftImage.parentElement.appendChild(leftOverlayImage);
	}

	if (solve)
	{
		var newRightURL = rightImage.src.replace(currentLeak.normalFile, currentLeak.solvedFile);
		var newLeftURL = leftImage.src.replace(currentLeak.normalFile, currentLeak.solvedFile);

		rightOverlayImage.onload = function() 
		{
			setStatus("Oplossingen weegegeven.");
	
			rightOverlayImage.onload = null;
		};
	
		rightOverlayImage.src = newRightURL;
		leftOverlayImage.src = newLeftURL;

		console.info(newRightURL);
		console.info(newLeftURL);
	}
	else
	{
		rightImage.parentElement.removeChild(rightOverlayImage);
		leftImage.parentElement.removeChild(leftOverlayImage);

		setStatus("Oplossingen verborgen.");
	}
}