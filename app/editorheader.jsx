
import React from 'react';
import Reflux from 'reflux';



var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');
var SaveLoadStore = require('./stores/saveloadstore.js');
var LogStore = require('./stores/logstore.js');

var UserAgreement = require('./useragreement.jsx');
var UserInstructions = require('./userinstructions.jsx');
var VersionHistory = require('./versionHistory.jsx');
//dilorom

var VTIconStore = require('./stores/vticonstore.js');
//dilorom
var EditorHeader = React.createClass({

	mixins : [
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study'), //emitted updates go to 'study' key
					
				//hasti
				Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
			],

	propTypes: {
			},

	getInitialState : function () {
		return 
			{value: 0.5}; 
	},

	getDefaultProps: function() {
	    return {
	    	displayAnimation:false,
	    	displayInterfaceMode:false,
	    	displaySaveButton:true,
           
           //dilorom
	    	displayChangeAmpButton:true,
	    	displayMoveFreqButton:true,
	    	displayEnergyButton:true,
	    	displayPulseButton:true,
	    	displayInFreqButton:true,
	    	displayDecFreqButton:true,
	    	displaySlider:true,
	    	//dilorom

	    	displayStartButton:false,
			uploadFileID:"uploadedFile"
	    }
	},

	_onAnimationChange: function(val) {
		AnimationStore.actions.setAnimation(val.target.value);
	},

	_onDisplayModeChange: function(val) {
		StudyStore.actions.setDisplayMode(val.target.value);
	},

	_onStartClick : function(e) {
		LogStore.actions.log("START_TASK");
	},

	_onSaveClick : function(e) {
		SaveLoadStore.actions.save();
	},

	//dilorom

	_onEnergyClick : function(e) {
		VTIconStore.actions.energy();
	},
	_onPulseClick : function(e) {
		//console.log("pulse");
		VTIconStore.actions.pulse();
	},

	_onChangeClick : function(e) {
		VTIconStore.actions.increaseAmplitude();
		//console.log("hello");
	},

	_onMoveClick : function(e) {
		VTIconStore.actions.decreaseAmplitude();
		//console.log("hello");
	},
	_onInFreqClick : function(e) {
		VTIconStore.actions.inFreq();
		//console.log("InFreq");
	},
	_onDecFreqClick : function(e) {
		VTIconStore.actions.decFreq();
		//console.log("Decfreq");
	},
	_onSliderChange : function(e) {
		console.log("from _onSliderChange = ", e.target.value);
		VTIconStore.actions.increaseAmplitude(e.target.value);
		//this.setState({value: e.target.value});
	},
	
	//dilorom

	_onLoadButtonClick : function(e) {
		document.getElementById(this.props.uploadFileID).click();
	},

	_onLoadClick : function(e) {
		var uploadedFiles = document.getElementById(this.props.uploadFileID);
		if (uploadedFiles.files.length > 0) {
			SaveLoadStore.actions.loadMacaronFile(uploadedFiles.files[0]);
		}
		uploadedFiles.value = [];
	},

	/**
	* Rendering
	* 
	*/

	render : function() {

		var headerStyle = {
		};

		var blockStyle = {
           display: 'block',
           /*padding: '10px 10px 10px 10px'*/
           height: '25px'
           
		};

		var animationOptions = this.state.animation.animationOptions;
		var displayOptions = this.state.study.modes;
		var animationChangeCallback = this._onAnimationChange;
		var displayChangeCallback = this._onDisplayModeChange;
		var selectedAnimation = this.state.animation.animation;
		var selectedDisplayMode = this.state.study.currentMode;


		var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			className:'unselectable',
			fontSize:12
		};

		//The UBC Logo to be placed next to the title
        // var logo = new Image();
        // logo.src = require("../img/macaron-logo.png");
        // logo.style = "width:60px;height:71px;";
        // logo.alt = "Example Image Location";

        // var logoDisplay = <h8><img src={logo.src} alt={logo.alt} style={logo.style}/></h8>;

		var animationOptionDisplay = <span />
		if (this.props.displayAnimation)
		{
			animationOptionDisplay = (<select className="animationoptions unselectable" onChange={animationChangeCallback}>
					{animationOptions.map( (animationOption) => (
						<option value={animationOption} selected={animationOption==selectedAnimation}>{animationOption}</option>
						))}
				</select>);
		}

		var interfaceModeDisplay = <span />
		if (this.props.displayInterfaceMode)
		{
			interfaceModeDisplay = (<select className="displayoptions unselectable" onChange={displayChangeCallback}>
					{Object.keys(displayOptions).map( (displayOption) => (
						<option value={displayOption} selected={displayOption==selectedDisplayMode}>{displayOption}</option>
						))}
				</select>);
		}

		var startButton = <span />
		if (this.props.displayStartButton)
		{
			startButton = (<button onClick={this._onStartClick}>Start666666</button>);
		}

		var saveButton = <span />
		if (this.props.displaySaveButton)
		{
			saveButton = (<a class="btn header" style={buttonStyle} onClick={this._onSaveClick} ><i className="fa fa-download"></i>Save</a>);
			//saveButton = (<button onClick={this._onSaveClick}><i class="fa fa-download"></i>Finish</button>);
		}
          
          //dilorom
         var energyButton = <span />
		if (this.props.displayEnergyButton)
		{
			energyButton = (<a class="btn header" style={buttonStyle} onClick={this._onEnergyClick}>Energy</a>);
			
		}

		var pulseButton = <span />
			if (this.props.displayPulseButton)
			{
				pulseButton = (<a class="btn header" style={buttonStyle} onClick={this._onPulseClick}>Pulse</a>);
			}


	     var changeAmpButton = <span />
			if (this.props.displayChangeAmpButton)
			{
				changeAmpButton = (<a class="btn header" style={buttonStyle} onClick={this._onChangeClick}>Inc_Amp</a>);
			}

		var moveFreqButton = <span />
			if (this.props.displayMoveFreqButton)
			{
				moveFreqButton = (<a class="btn header" style={buttonStyle} onClick={this._onMoveClick}>Dec_Amp</a>);
			}
		var inFreqButton = <span />
			if (this.props.displayInFreqButton)
			{
				inFreqButton = (<a class="btn header" style={buttonStyle} onClick={this._onInFreqClick}>In_Freq</a>);
			}
		var decFreqButton = <span />
			if (this.props.displayDecFreqButton)
			{
				decFreqButton = (<a class="btn header" style={buttonStyle} onClick={this._onDecFreqClick}>Dec_Freq</a>);
			}
		var slider = <span />
			if (this.props.displaySlider)
			{
				slider = (
					<input id="typeinp" type="range"  min="-1" max="1" value={this.state.value} onChange={this._onSliderChange} step="0.1"/>
				);
			}


			// var stateOfMatter;
			// if (this.state.value <= 0) {
   //          stateOfMatter = 'less than 0';
   //          console.log(stateOfMatter);
          
	  //       } else if (this.state.value >= 0) {
	  //           stateOfMatter = 'greater than 0';
	  //           console.log(stateOfMatter);
	            
	        
	  //       } else {
	  //           stateOfMatter = 'between 0 and 1';
	  //           console.log(stateOfMatter);
	  //       }
		
		//dilorom

		var loadButton = <span />
		if (this.props.displaySaveButton)
		{
			// loadButton = (<a class="btn header" style={buttonStyle} onClick={this._onLoadClick} ><i className="fa fa-upload"></i> Load</a>);

			loadButton = (<span>
					<input type="file" className="hidden" id={this.props.uploadFileID} onChange={this._onLoadClick}></input>
					<a class="btn header" style={buttonStyle} onClick={this._onLoadButtonClick} ><i className="fa fa-upload"></i>Load</a>
					</span>);
		}




		return (
			<div className="header" style={headerStyle}>
				{startButton}

				
				<span className="title unselectable" >
					VibTune
					<VersionHistory/>
				</span>

				<span className="menu">
					

					{animationOptionDisplay}
					{interfaceModeDisplay}
					<UserInstructions />
					<UserAgreement />
					{saveButton}
					{loadButton}
					{changeAmpButton}
					{moveFreqButton}
					{slider}
					{inFreqButton}
					{decFreqButton}
					{energyButton}
					{pulseButton}
					{this.state.value}


				
				</span>


			</div>
			);
	}

});

module.exports = EditorHeader;