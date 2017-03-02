import Reflux from 'reflux';

//actions that can be called by a component aka jsx file
var userInstructionsActions = Reflux.createActions(
	[
		'showInstructions'
	]
);

var userInstructionsStore = Reflux.createStore({

	listenables: [userInstructionsActions],

	onShowInstructions() {

		//used to check if there is already a user instruction window generated before, clears it so we don't re-generate it
        if(document.getElementById("page1")){
            document.body.removeChild(page1);

        }

    	var a = document.createElement('a');
        a.href = "#page1";


        var userInstructionsElement = document.createElement("div");
        userInstructionsElement.id = "page1";
        userInstructionsElement.className = "modalDialogInstructions";
        document.body.appendChild(a);
        document.body.appendChild(userInstructionsElement);

        a.click();

        //the main div that all the main text elements will go under
        var inner1 = document.createElement("div");
        inner1.id = "inner1";
        inner1.className = "instructionsContainer";
        document.getElementById("page1").appendChild(inner1);

        //should be able to re-use
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner1").appendChild(a);

        //page 1 header
        var userInstructionsHeaderElement = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h2>";
        userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'>Instructions (1 of 2) </h2>";
        document.getElementById("inner1").appendChild(userInstructionsHeaderElement);

        //need a div to centre image and text
        var centre = document.createElement("div");
        centre.style.textAlign = "center";
        centre.id = "centre";
        document.getElementById("inner1").appendChild(centre);

        //The gif or image to display
        var img = new Image();
        img.src = require("../../img/Macaron-DemoVideo-Trimmed1.gif");
        //img.style = "width:40px;height:51px;";
        img.alt = "Example Image Location";

         //The central image or gif placement location
        var userInstructionsImageLocation = document.createElement("userInstructionsImageLocation");
        userInstructionsImageLocation.id = "macaronText";
        userInstructionsImageLocation.innerHTML = "<p><img width='60%' src='" + img.src + "' alt='Example Image'></p>";
        document.getElementById("centre").appendChild(userInstructionsImageLocation);

        //The actual instruction text location
        var userInstructionsTextElement = document.createElement("userAgreementTextElement");
        userInstructionsTextElement.id = "macaronInstruction";
        userInstructionsTextElement.innerHTML = "<p>Thank you for using Macaron! Please make sure to plug in an actuator to the headphone jack of your computer to feel the vibrations. <b>Please remember to unmute the button when editing or playing back any vibrations.</b></p>";
        document.getElementById("inner1").appendChild(userInstructionsTextElement);

        //The actual instruction text location continued eg. bullet point list
        var userInstructionsListElement = document.createElement("userInstructionsListElement");
        userInstructionsListElement.innerHTML = "<ul> \
            <li><b>Double clicking</b> will create a new keyframe; <b> backspace or delete</b> will delete the selected keyframes.</li> \
            <li><b>Spacebar</b> will toggle playback.</li> \
            <li><b>Ctrl- or Cmd-C</b> will copy the selected keyframes; <b>Ctrl- or Cmd-P</b> will paste copied keyframes at the red playhead.</li> \
            <li><b>Ctrl- or Cmd-Z</b> will undo the last change; <b>Shift+Ctrl- or Shift+Cmd-Z</b> will redo the last undone change.</li> \
            </ul>";
        document.getElementById("inner1").appendChild(userInstructionsListElement);

        //the prev or next button location
        var a = document.createElement('a');
        a.href = "#page2";
        a.title = "page2";
        a.className = "nextPageButton";
        a.innerHTML = "Next";
        document.getElementById("inner1").appendChild(a);
        //a.click();

        /*****************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
         						 Page 2 Stuff
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************/

        //where page 2 should start
        //used to check if there is already a user instruction window generated before, clears it so we don't re-generate it
        if(document.getElementById("page2")){
            document.body.removeChild(page2);

        }

        var a = document.createElement('a');
        a.href = "#page2";

        var userInstructionsElement = document.createElement("div");
        userInstructionsElement.id = "page2";
        userInstructionsElement.className = "modalDialogInstructions";
        document.body.appendChild(a);
        document.body.appendChild(userInstructionsElement);

        //a.click();

        //the main div that all the main text elements will go under
        var inner2 = document.createElement("div");
        inner2.id = "inner2";
        document.getElementById("page2").appendChild(inner2);

        //should be able to re-use
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner2").appendChild(a);

        //header
        var userInstructionsHeaderElement2 = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h2>";
        userInstructionsHeaderElement2.innerHTML = "<h2 class='pageHeader'>Instructions (2 of 2) </h2>";
        document.getElementById("inner2").appendChild(userInstructionsHeaderElement2);

        //div to centre
        var centre2 = document.createElement("div");
        centre2.style.textAlign = "center";
        centre2.id = "centre2";
        document.getElementById("inner2").appendChild(centre2);

        //gif to display
        var img2 = new Image();
        img2.src = require("../../img/Macaron-DemoVideo-Trimmed2.gif");
        //img2.style = "width:800px;height:448px;"; //this never seems to work with a direct reference, can only use in-line
        img2.alt = "Example Image Location";

        //show gif
        var userInstructionsImageLocation2 = document.createElement("userInstructionsImageLocation2");
        //userInstructionsImageLocation2.id = "macaronText";
        userInstructionsImageLocation2.innerHTML = "<p><img width='60%' src='" + img2.src + "' alt='Example Image'></p>";
        document.getElementById("centre2").appendChild(userInstructionsImageLocation2);

        //The actual instruction text location
        var userInstructionsTextElement2 = document.createElement("userAgreementTextElement2");
        userInstructionsTextElement2.id = "macaronInstruction2";
        userInstructionsTextElement2.innerHTML = "<p>The examples on the left are a <b>design gallery</b>. You can look at these examples, select, copy and paste them into your editor on the left. Note that examples are currently not editable.</p>";
        document.getElementById("inner2").appendChild(userInstructionsTextElement2);

        //the prev or next button location
        //prev
        var a = document.createElement('a');
        a.href = "#page1";
        a.title = "page1";
        a.className = "prevPageButton";
        a.innerHTML = "Prev";
        document.getElementById("inner2").appendChild(a);
        //next
        // var a = document.createElement('a');
        // a.href = "#page3";
        // a.title = "page3";
        // a.className = "nextPageButton";
        // a.innerHTML = "Next";
        // document.getElementById("inner2").appendChild(a);


	}
});

module.exports = {
	actions:userInstructionsActions,
	store:userInstructionsStore
};
