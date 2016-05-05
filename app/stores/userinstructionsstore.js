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
        userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'>Instructions - Macaron Overview (1 of 5) </h2>";
        document.getElementById("inner1").appendChild(userInstructionsHeaderElement);

        //need a div to centre image and text
        var centre = document.createElement("div");
        centre.style.textAlign = "center";
        centre.id = "centre";
        document.getElementById("inner1").appendChild(centre);

        //The gif or image to display
        var img = new Image();
        img.src = require("../../img/macaron-instruct-1.png");
        //img.style = "width:40px;height:51px;";
        img.alt = "Example Image Location";

         //The central image or gif placement location
        var userInstructionsImageLocation = document.createElement("userInstructionsImageLocation");
        userInstructionsImageLocation.id = "macaronText";
        userInstructionsImageLocation.innerHTML = "<p><img src='" + img.src + "' alt='Example Image'></p>";
        document.getElementById("centre").appendChild(userInstructionsImageLocation);

        //The actual instruction text location
        var userInstructionsTextElement = document.createElement("userAgreementTextElement");
        userInstructionsTextElement.id = "macaronInstruction";
        userInstructionsTextElement.innerHTML = "<p>Thank you for using Macaron! Below are quick references to the most important interface elements. Please make sure to plug in an actuator to the headphone jack of your computer to feel the vibrations. <b>Please remember to unmute the button when editing or playing back any vibrations.</b></p>";
        document.getElementById("inner1").appendChild(userInstructionsTextElement);

        //The actual instruction text location continued eg. bullet point list
        var userInstructionsListElement = document.createElement("userInstructionsListElement");
        userInstructionsListElement.innerHTML = "<ul><li><b>A: </b>The left hand pane here is the area where you can edit your current vibration in terms of amplitude and frequency</li><li><b>B: </b>The top pane is where you can view the vibration in their overall waveform distribution</li><li><b>C: </b>The left axes here shows that you can specifically target a vibration pattern's amplitude or frequency to be edited</li><li><b>D: </b>The right hand pane here is the area where you can load an example vibration pattern that can be viewed (not edited)</li><li><b>E: </b>The Mute button is on by default when loading Macaron in order to prevent constant vibrations of any actuators plugged in</li><li><b>F: </b>The top header here contains the User Agreement, and Save/Load buttons for backing up your current vibrations being edited</li></ul>";
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
        userInstructionsHeaderElement2.innerHTML = "<h2 class='pageHeader'>Instructions - Playback (2 of 5) </h2>";
        document.getElementById("inner2").appendChild(userInstructionsHeaderElement2);

        //div to centre
        var centre2 = document.createElement("div");
        centre2.style.textAlign = "center";
        centre2.id = "centre2";
        document.getElementById("inner2").appendChild(centre2);

        //gif to display
        var img2 = new Image();
        img2.src = require("../../img/macaron-playback.gif");
        //img2.style = "width:800px;height:448px;"; //this never seems to work with a direct reference, can only use in-line
        img2.alt = "Example Image Location";

        //show gif
        var userInstructionsImageLocation2 = document.createElement("userInstructionsImageLocation2");
        //userInstructionsImageLocation2.id = "macaronText";
        userInstructionsImageLocation2.innerHTML = "<p><img src='" + img2.src + "' alt='Example Image' style='width:800px;height:448px;'></p>";
        document.getElementById("centre2").appendChild(userInstructionsImageLocation2);

        //The actual instruction text location
        var userInstructionsTextElement2 = document.createElement("userAgreementTextElement2");
        userInstructionsTextElement2.id = "macaronInstruction2";
        userInstructionsTextElement2.innerHTML = "<p>You can playback any vibrations through the respective 'play' icon for either your currently selected example vibration (right side), or your own custom vibration (left side).<br></br>You can also skip to the beginning or the end of the vibration by using the left or right arrow icons. Manual scrubbing of the vibration is also possible by clicking and dragging the red position marker.</p>";
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
        var a = document.createElement('a');
        a.href = "#page3";
        a.title = "page3";
        a.className = "nextPageButton";
        a.innerHTML = "Next";
        document.getElementById("inner2").appendChild(a);

        /*****************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
                                 Page 3 Stuff
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************/

        if(document.getElementById("page3")){
            document.body.removeChild(page3);

        }

        var a = document.createElement('a');
        a.href = "#page3";

        var userInstructionsElement = document.createElement("div");
        userInstructionsElement.id = "page3";
        userInstructionsElement.className = "modalDialogInstructions";
        document.body.appendChild(a);
        document.body.appendChild(userInstructionsElement);

        //a.click();

        //the main div that all the main text elements will go under
        var inner3 = document.createElement("div");
        inner3.id = "inner3";
        document.getElementById("page3").appendChild(inner3);

        //should be able to re-use
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner3").appendChild(a);

        //header
        var userInstructionsHeaderElement3 = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h3 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h3>";
        userInstructionsHeaderElement3.innerHTML = "<h2 class='pageHeader'>Instructions - Loading Example Vibration from Gallery (3 of 5)</h3>";
        document.getElementById("inner3").appendChild(userInstructionsHeaderElement3);

        //div to centre
        var centre3 = document.createElement("div");
        centre3.style.textAlign = "center";
        centre3.id = "centre3";
        document.getElementById("inner3").appendChild(centre3);

        //gif to display
        var img3 = new Image();
        img3.src = require("../../img/macaron-load-example.gif");
        //img3.style = "width:800px;height:448px;"; //this never seems to work with a direct reference, can only use in-line
        img3.alt = "Example Image Location";

        //show gif
        var userInstructionsImageLocation3 = document.createElement("userInstructionsImageLocation3");
        //userInstructionsImageLocation3.id = "macaronText";
        userInstructionsImageLocation3.innerHTML = "<p><img src='" + img3.src + "' alt='Example Image' style='width:800px;height:448px;'></p>";
        document.getElementById("centre3").appendChild(userInstructionsImageLocation3);

        //The actual instruction text location
        var userInstructionsTextElement3 = document.createElement("userAgreementTextElement3");
        userInstructionsTextElement3.id = "macaronInstruction3";
        userInstructionsTextElement3.innerHTML = "<p>You can load an example vibration from the design gallery located on the most right side of the page. Simply click on a pattern to load its respective amplitude and frequency form breakdowns that can be viewed (but not edited) on the right side of the page.</p>";
        document.getElementById("inner3").appendChild(userInstructionsTextElement3);

        //the prev or next button location
        //prev
        var a = document.createElement('a');
        a.href = "#page2";
        a.title = "page2";
        a.className = "prevPageButton";
        a.innerHTML = "Prev";
        document.getElementById("inner3").appendChild(a);
        //next
        var a = document.createElement('a');
        a.href = "#page4";
        a.title = "page4";
        a.className = "nextPageButton";
        a.innerHTML = "Next";
        document.getElementById("inner3").appendChild(a);

        /*****************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
                                 Page 4 Stuff
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************/

        if(document.getElementById("page4")){
            document.body.removeChild(page4);

        }

        var a = document.createElement('a');
        a.href = "#page4";

        var userInstructionsElement = document.createElement("div");
        userInstructionsElement.id = "page4";
        userInstructionsElement.className = "modalDialogInstructions";
        document.body.appendChild(a);
        document.body.appendChild(userInstructionsElement);

        //a.click();

        //the main div that all the main text elements will go under
        var inner4 = document.createElement("div");
        inner4.id = "inner4";
        document.getElementById("page4").appendChild(inner4);

        //should be able to re-use
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner4").appendChild(a);

        //header
        var userInstructionsHeaderElement4 = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h4 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h4>";
        userInstructionsHeaderElement4.innerHTML = "<h2 class='pageHeader'>Instructions - Make your own vibration pattern (4 of 5) </h4>";
        document.getElementById("inner4").appendChild(userInstructionsHeaderElement4);

        //div to centre
        var centre4 = document.createElement("div");
        centre4.style.textAlign = "center";
        centre4.id = "centre4";
        document.getElementById("inner4").appendChild(centre4);

        //gif to display
        var img4 = new Image();
        img4.src = require("../../img/macaron-make-vibration.gif");
        //img4.style = "width:800px;height:448px;"; //this never seems to work with a direct reference, can only use in-line
        img4.alt = "Example Image Location";

        //show gif
        var userInstructionsImageLocation4 = document.createElement("userInstructionsImageLocation4");
        //userInstructionsImageLocation4.id = "macaronText";
        userInstructionsImageLocation4.innerHTML = "<p><img src='" + img4.src + "' alt='Example Image' style='width:800px;height:448px;'></p>";
        document.getElementById("centre4").appendChild(userInstructionsImageLocation4);

        //The actual instruction text location
        var userInstructionsTextElement4 = document.createElement("userAgreementTextElement4");
        userInstructionsTextElement4.id = "macaronInstruction4";
        userInstructionsTextElement4.innerHTML = "<p>You can make your own vibration pattern by clicking on the shaded area on the left hand side to create points that can be dragged around to invoke changes in amplitude or frequncy.</p>";
        document.getElementById("inner4").appendChild(userInstructionsTextElement4);

        //the prev or next button location
        //prev
        var a = document.createElement('a');
        a.href = "#page3";
        a.title = "page3";
        a.className = "prevPageButton";
        a.innerHTML = "Prev";
        document.getElementById("inner4").appendChild(a);
        //next
        var a = document.createElement('a');
        a.href = "#page5";
        a.title = "page5";
        a.className = "nextPageButton";
        a.innerHTML = "Next";
        document.getElementById("inner4").appendChild(a);

        /*****************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
                                 Page 4 Stuff
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************
        ******************************************************************************************************/

        if(document.getElementById("page5")){
            document.body.removeChild(page5);

        }

        var a = document.createElement('a');
        a.href = "#page5";

        var userInstructionsElement = document.createElement("div");
        userInstructionsElement.id = "page5";
        userInstructionsElement.className = "modalDialogInstructions";
        document.body.appendChild(a);
        document.body.appendChild(userInstructionsElement);

        //a.click();

        //the main div that all the main text elements will go under
        var inner5 = document.createElement("div");
        inner5.id = "inner5";
        document.getElementById("page5").appendChild(inner5);

        //should be able to re-use
        a.href = "#close";
        a.title = "Close";
        a.className = "close";
        a.innerHTML = "X";
        document.getElementById("inner5").appendChild(a);

        //header
        var userInstructionsHeaderElement5 = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h5 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:50px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h5>";
        userInstructionsHeaderElement5.innerHTML = "<h2 class='pageHeader'>Instructions - Save/Load your own vibration pattern (5 of 5) </h5>";
        document.getElementById("inner5").appendChild(userInstructionsHeaderElement5);

        //div to centre
        var centre5 = document.createElement("div");
        centre5.style.textAlign = "center";
        centre5.id = "centre5";
        document.getElementById("inner5").appendChild(centre5);

        //gif to display
        var img5 = new Image();
        img5.src = require("../../img/macaron-save-load-vibration.gif");
        //img5.style = "width:800px;height:58px;"; //this never seems to work with a direct reference, can only use in-line
        img5.alt = "Example Image Location";

        //show gif
        var userInstructionsImageLocation5 = document.createElement("userInstructionsImageLocation5");
        //userInstructionsImageLocation5.id = "macaronText";
        userInstructionsImageLocation5.innerHTML = "<p><img src='" + img5.src + "' alt='Example Image' style='width:800px;height:448px;'></p>";
        document.getElementById("centre5").appendChild(userInstructionsImageLocation5);

        //The actual instruction text location
        var userInstructionsTextElement5 = document.createElement("userAgreementTextElement5");
        userInstructionsTextElement5.id = "macaronInstruction5";
        userInstructionsTextElement5.innerHTML = "<p>You can save your own vibration pattern by clicking the Save button in the top right corner. This will save a file that contains your current progress locally onto your computer. If you ever need to go back to a past pattern, just click the Load button to load this file which will revert your pattern.</p>";
        document.getElementById("inner5").appendChild(userInstructionsTextElement5);

        //the prev or next button location
        //prev
        var a = document.createElement('a');
        a.href = "#page4";
        a.title = "page4";
        a.className = "prevPageButton";
        a.innerHTML = "Prev";
        document.getElementById("inner5").appendChild(a);

	}
});

module.exports = {
	actions:userInstructionsActions,
	store:userInstructionsStore
};
