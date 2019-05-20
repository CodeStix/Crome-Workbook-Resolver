var platform = null;

// UI
var statusText;
var btnSolve;
var btnNot;
var btnLineByLine;
var btnShare;

// Popup box
var popup;
var popupLoading;
var popupButton1;
var popupButton2;
var popupText;

window.onload = function()
{
	popup = document.createElement("div");
	popup.style.position = "fixed";
	popup.style.display = "none";
	popup.style.zIndex = "1";
	popup.style.top = "40%";
	popup.style.bottom = "40%";
	popup.style.left = "30%";
	popup.style.right = "30%";
	popup.style.backgroundColor = "#307BB3";
	var popupDiv = document.createElement("div");
	popupDiv.style.position = "absolute";
	popupDiv.style.display = "block";
	popupDiv.style.top = "6px";
	popupDiv.style.bottom = "6px";
	popupDiv.style.left = "6px";
	popupDiv.style.right = "6px";
	popupDiv.style.backgroundColor = "#E9F1F6";
	popupDiv.style.color = "#307BB3";
	popupText = document.createElement("div");
	popupText.style.fontFamily = "Helvetica, Arial, sans-serif";
	popupText.style.fontWeight = "bold";
	popupText.style.fontSize = "120%";
	popupText.innerText = "Dit is een test.";
	popupText.top = "8px";
	popupText.style.padding = "10px 65px 20px 10px";
	popupDiv.appendChild(popupText);
	popupLoading = document.createElement("img");
	popupLoading.src = "https://cds.knooppunt.net/Pages/JavaScript/p5/lib/images/ajax_loader_gray.gif";
	popupLoading.style.position = "absolute";
	popupLoading.style.display = "block";
	popupLoading.style.height = "50px";
	popupLoading.style.right = "10px";
	popupLoading.style.top = "10px";
	popupDiv.appendChild(popupLoading);
	var d4 = document.createElement("span");
	d4.style.position = "absolute";
	d4.style.top = "2px";
	d4.style.left = "2px";
	d4.style.fontSize = "8px";
	d4.style.color = "#AAAABB";
	d4.innerText = "Stijn Rogiest © 2019 (reddusted@gmail.com)";
	popupDiv.appendChild(d4);
	var d3 = document.createElement("div");
	d3.style.position = "absolute";
	d3.style.bottom = "0px";
	d3.style.left = "0px";
	d3.style.right = "0px";
	d3.style.height = "30px";
	d3.style.backgroundColor = "#D9E1E6";
	popupDiv.appendChild(d3);
	popupButton1 = document.createElement("button");
	popupButton1.value = "Okey";
	popupButton1.style.position = "absolute";
	popupButton1.style.bottom = "3px";
	popupButton1.style.top = "3px";
	popupButton1.style.right = "3px";
	popupButton1.style.width = "40%";
	popupButton1.style.backgroundColor = "#408BA3";
	popupButton1.style.color = "white";
	popupButton1.innerText = "OK";
	popupButton1.onclick = function()
	{
		popup.style.display = "none";
	}
	d3.appendChild(popupButton1);
	popupButton2 = document.createElement("button");
	popupButton2.value = "Annuleren";
	popupButton2.style.position = "absolute";
	popupButton2.style.bottom = "3px";
	popupButton2.style.top = "3px";
	popupButton2.style.left = "3px";
	popupButton2.style.width = "40%";
	popupButton2.style.backgroundColor = "#408BA3";
	popupButton2.style.color = "white";
	popupButton2.innerText = "Annuleren";
	popupButton2.onclick = function()
	{
		popup.style.display = "none";
	}
	d3.appendChild(popupButton2);
	popup.appendChild(popupDiv);
	document.getElementsByTagName("body")[0].appendChild(popup);

	box("Werkboek laden...", null, true, null, null);

	if (window.location.href.indexOf("cds.knooppunt.net") >= 0)
		platform = 'knooppunt';
	else if (window.location.href.indexOf("content.plantyn.com") >= 0)
		platform = 'plantyn';
	else if (window.location.href.indexOf("digiboek.be") >= 0)
		platform = 'pelckmans';

	console.info("KPZP platform: " + platform);

	if (platform == null)
	{
		box("Jammer. Er zijn geen oplossingen beschikbaar.", null, false, null);
		return;
	}

	// Wait for the iframe to load.
	/*var f = setInterval(function()
	{
		if (frame.contentWindow.document.getElementById("spanHorL") != null)
		{
			clearInterval(f);

			setTimeout(inject, 1500);
		}
	}, 150);*/
	setTimeout(createUI, 5000);
};

function createUI()
{
	box("Oplossingen verkrijgen...", null, true, null, null);

	// These functions have to setup every UI component.
	var ok = false;
	if (platform == 'knooppunt')
		ok = initKnooppuntUI();
	else if (platform == 'plantyn')
		ok = initPlantynUI();
	else if (platform == 'pelckmans')
		ok = initPelckmansUI();

	if (!ok)
	{
		box("Jammer! Er zijn geen oplossingen beschikbaar.", null, false, null);

		return;
	}

	if (btnSolve != null)
	{
		btnSolve.title = "Alle antwoorden op deze pagina weergeven.";
		btnSolve.onclick =  function() { doSolve(true); }
	}

	if (btnNot != null)
	{
		btnNot.title = "Alle antwoorden op deze pagina verbergen.";
		btnNot.onclick = function() { doSolve(false); }
	}

	if (btnLineByLine != null)
	{
		btnLineByLine.title = "Download alle oplossingen als een PDF bestand.";
		btnLineByLine.onclick = function() 
		{ 
			box("Weet je zeker dat je de oplossingen wilt exporteren als een PDF bestand? Dit kan enkele minuten duren.", function(result) 
			{
				if (result)
				{
					box("PDF aanmaken... Dit zal even duren...", null, true, null);
	
					btnLineByLine.disabled = true;
					btnLineByLine.title = "Er wordt al een PDF aangemaakt, dit kan even duren.";
	
					downloadAsPDF(function() 
					{
						box("PDF is aangemaakt, download zal binnen enkele seconden starten...", null, false, null);
	
						btnLineByLine.disabled = false;
						btnLineByLine.title = "Download alle oplossingen als een PDF bestand.";
					});
				}
			}, false);
		}
	}

	if (btnShare != null)
	{
		btnShare.title = "Ja nee eh.";
		btnShare.onclick = function() 
		{  
			alert("Waar ben jij mee bezig? Druk gewoon op 'alle oplossingen weergeven', waarom zou je een sleutel gebruiken?");
	
			btnShare.disabled = true;
		}
	
	}

	box("Er zijn oplossingen beschikbaar, bekijk het oplossings-menu!", null, false, null);

	if (btnSolve != null)
		btnSolve.disabled = false;
	if (btnNot != null)
		btnNot.disabled = false;
	if (btnLineByLine != null)
		btnLineByLine.disabled = false;
}

function initKnooppuntUI()
{
	if (document.getElementsByClassName("m-modal").length != 0)
	{
		return false;
	}

	var frame = document.getElementById("viewFrame");

	statusText = document.createElement("a");
	statusText.setAttribute("id","leakStatus");
	statusText.setAttribute("class","defaultfont");
	frame.contentWindow.document.getElementById("spanHorL").appendChild(statusText);
	btnSolve = frame.contentWindow.document.getElementById("btn_pinnedAnswersAll");
	btnNot = frame.contentWindow.document.getElementById("btn_answersNone");
	btnLineByLine = frame.contentWindow.document.getElementById("btn_pinnedAnswersByLine");
	btnShare = frame.contentWindow.document.getElementById("btn_shareAnswers");

	return true;
}

function initPlantynUI()
{
	return initKnooppuntUI();
}

function initPelckmansUI()
{
	var parent = document.querySelector("#twrapper .topbar .topwrapper ul.topnav2.magazine");
	const buttonIcon = "/assets-5/css/min/pelckmans/img/edit-pelckmans.png";

	function btn(text)
	{
		var b = document.createElement("li");
		var c = document.createElement("a");
		c.href = "javascript:void(0)";
		var d = document.createElement("div");
		d.classList.add("topnav2-button");
		var e = document.createElement("img");
		e.src = buttonIcon;
		var f = document.createElement("span");
		f.classList.add("topnav2-title");
		f.innerText = text;
		d.appendChild(e);
		d.appendChild(f);
		c.appendChild(d);
		b.appendChild(c);
		parent.appendChild(b);
		return c;
	}

	btnSolve = btn("Toon oplossingen");
	btnNot = btn("Verberg oplossingen");

	return true;
}

function box(text, callback, loading = false, button2Text = "Annuleren", button1Text = "OK")
{
	popup.style.display = "block";
	popupLoading.style.display = loading ? "block" : "none";

	popupText.innerText = text;
	popupButton1.innerText = button1Text;
	popupButton2.innerText = button2Text;
	popupButton1.style.display = button1Text != null ? "block" : "none";
	popupButton2.style.display = button2Text != null ? "block" : "none";

	popupButton1.onclick = function()
	{
		popup.style.display = "none";

		if (typeof callback != 'undefined' && callback != null)
			callback(true);
	};
	popupButton2.onclick = function()
	{
		popup.style.display = "none";

		if (typeof callback != 'undefined' && callback != null)
			callback(false);
	};
}

function setStatus(status, type = null)
{
	const trueColor = 'lime';
	const falseColor = 'red';

	if (statusText == null)
	{
		console.info("KPZP status: " + status);
		return;
	}

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

function getPageCount()
{
	//parseInt(frame.contentWindow.document.querySelectorAll("#divHorBottom #spanHorL span.defaultfont")[0].innerText.substring(4)) - 1;
	return 10; //TODO
}

function downloadAsPDF(callback)
{
	//TODO new method.

	/*if (normalPdfUrl == null || solvedPdfUrl == null)
		doSolve(false);

	var pageCount = getPageCount();
	
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
		popupText.innerText = "PDF aanmaken... (" + current + "/" + pageCount + ")";
		setStatus("PDF aanmaken... (" + current + "/" + pageCount + ")");

		if (current > pageCount)
		{
			var file = currentLeak.type + "_Oplossingen.pdf";

			doc.save(file);

			setStatus("PDF is aangemaakt.", true);

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

	nextPage();*/
}

function doSolve(solve)
{
	setStatus("Laden...");

	var t = window.location.href; 
	var s = solve ? "block" : "none";
	if(platform == 'knooppunt' || platform == 'plantyn')
		document.getElementById("viewFrame").contentWindow.document.getElementsByClassName("answerrow")[0].style.display = s;
	else if (platform == 'pelckmans')
		document.getElementsByClassName("solution-layer")[1].style.display = s;

	/*var rightImage = frame.contentWindow.document.getElementsByClassName("rightimage realImage")[0];
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
	}*/
}