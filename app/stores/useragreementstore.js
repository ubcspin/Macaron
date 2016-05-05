import Reflux from 'reflux';

//actions that can be called by a component aka jsx file
var userAgreementActions = Reflux.createActions(
	[
		'showText'
	]
);

var userAgreementStore = Reflux.createStore({

	listenables: [userAgreementActions],

	onShowText() {

        /*
        var a = document.createElement('a');
        a.href = "http://apple.com";
        document.body.appendChild(a);
        a.click();
        */

        //used to check if there is already a user agreement window generated before, clears it so we don't re-generate it
        if(document.getElementById("userAgreement")){
            document.body.removeChild(userAgreement);

        }



        var a = document.createElement('a');
        a.href = "#userAgreement";


        var userAgreementElement = document.createElement("div");
        userAgreementElement.id = "userAgreement";
        userAgreementElement.className = "modalDialog";
        document.body.appendChild(a);
        document.body.appendChild(userAgreementElement);

        a.click(); //to trigger next part, aka generating the modal window and darkened bg
        //document.body.removeChild(a);

        //the main div that all the main text elements will go under
        var inner = document.createElement("div");
        inner.id = "inner";
        document.getElementById("userAgreement").appendChild(inner);

        //the close button now takes over the current link
        //bug where the close button and window looks right initially, but subsequent link clicks will make the popup too long, only refresh will fix
        //a.href = "#close title='Close' class='close'";
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner").appendChild(a);
        //a.click();

         //The UBC Logo to be placed next to the title
        var img = new Image();
        //var img = '<img src="img/ubc_logo_alpha_gone.png" />';
        //img.src = '<img src="img/ubc_logo_alpha_gone.png" />';
        img.src = require("../../img/ubc_logo_alpha_gone.png");
        //img.src = require("/Users/Matthew/Macaron/img/test.gif");
        img.style.width = "40px";
				img.style.height = "51px";
        //img.style = "width:320px;height:240px";
        img.alt = "Example Image Location";
        //document.getElementById("inner").appendChild(img);

        //The actual placeholder title location
        var userAgreementHeaderElement = document.createElement("userAgreementHeaderElement");
        //var imgPlaceHolder = document.createElement("img");
        //imgPlaceHolder.id = "imgPlaceHolder";
        //userAgreementHeaderElement.id = "userAgreementHeaderElement";
        //userAgreementHeaderElement.innerHTML = "<h2 class='userAgreementHeader'>Privacy policy statement</h2>";
        //userAgreementHeaderElement.innerHTML = img;
        userAgreementHeaderElement.innerHTML = "<h2 class='userAgreementHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Privacy policy statement </h2>";
        document.getElementById("inner").appendChild(userAgreementHeaderElement);


        //The actual placeholder text location
        var userAgreementTextElement = document.createElement("userAgreementTextElement");
        userAgreementTextElement.id = "macaronText";
        userAgreementTextElement.innerHTML = "<p>Macaron is research software developed by the SPIN research group at the University of British Columbia (UBC). As part of our commitment to improving our tools and conducting user interface research, we collect <b>anonymous</b> information about your interactions with Macaron, similar to other online tools. This includes data like: </p>";
        document.getElementById("inner").appendChild(userAgreementTextElement);

        //The actual placeholder text listed items, note the list item omits quotes for telemetry... okay?
        var userAgreementListElement = document.createElement("userAgreementListElement");
        userAgreementListElement.innerHTML = "<ul><li>Usage statistics (or telemetry). This includes time spent using the tool or interacting with various elements, and interaction patterns (eg. clicks, mouse movements, key presses, commands)</li><li>Software environment to understand performance, compatibility, and demographics (eg. browser or operating system version).</li><li>Your IP address is used for recording general location (i.e., region: state or country), but not stored directly and never linked to any personal information.</li><li>Information you supply to us directly, for example, through questionnaires, feedback forms, or crash reports.</li></ul>";
        document.getElementById("inner").appendChild(userAgreementListElement);

        //The actual placeholder text location continuing text after the list is shown
        var userAgreementTextElementCont = document.createElement("userAgreementTextElementCont");
        userAgreementTextElementCont.innerHTML = "<p>The data we collect will be used to help us further develop Macaron and similar tools. This data may be published as part of our academic research, eg., at conferences, talks, or as video, articles, or online posts.</p>";
        document.getElementById("inner").appendChild(userAgreementTextElementCont);

        var userAgreementTextElementFinalSeg = document.createElement("userAgreementTextElementFinalSeg");
        userAgreementTextElementFinalSeg.innerHTML = "<p><b>We do not collect, store, or report personal or identifiable information about you or your account.</b> The research project associated with this tool has been approved by UBC's Behavioural Ethics Research Board (#H13-01620). If you have any questions, please contact us at tmp@ubc.com.</p>";
        document.getElementById("inner").appendChild(userAgreementTextElementFinalSeg);

        //This can work to prevent further appendments... but prevents link from opening in first place?
        //document.body.removeChild(userAgreementElement);




	}
});

module.exports = {
	actions:userAgreementActions,
	store:userAgreementStore
};
