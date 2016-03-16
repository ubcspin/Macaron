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

        var userInstructionsHeaderElement = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h2>";
        userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'>Instructions - Macaron Overview (1 of 5) </h2>";
        document.getElementById("inner1").appendChild(userInstructionsHeaderElement);

        //need a div to centre image and text
        var centre = document.createElement("div");
        centre.style = "text-align:center;";
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

        /************************************************************
         						 Page 2 Stuff
        *************************************************************/

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

        var userInstructionsHeaderElement = document.createElement("userInstructionsHeaderElement");
        //userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'> <img src='" + img.src + "' alt='Example Image' style='width:40px;height:50px;'>Instructions - Macaron Overview (1 of 5) </h2>";
        userInstructionsHeaderElement.innerHTML = "<h2 class='pageHeader'>Instructions - Playback (2 of 5) </h2>";
        document.getElementById("inner2").appendChild(userInstructionsHeaderElement);


	}
});

module.exports = {
	actions:userInstructionsActions,
	store:userInstructionsStore
};
