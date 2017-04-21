
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
			{value: 0}; 
	},

	getDefaultProps: function() {
	    return {
	    	displayAnimation:false,
	    	displayInterfaceMode:false,
	    	displaySaveButton:true,
           
           //dilorom
	    	displaySlider:true,
		    displaySlider_F:true,
		    displayEnergySlider:true,
	    	displayPulseButton:true,
	    	displayTempoButton:true,
		    displaySideNavButton:true,
		    displayFakeSlider:true,
		    displayTogButton:true,
		    displayDiscontinuitySlider:true,

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

	_onSliderChange : function(e) {
		VTIconStore.actions.increaseAmplitude(e.target.value);
		
	},
	_onSlider_FChange : function(e) {
		VTIconStore.actions.freq_slider(e.target.value);
		
	},

	_onEnergyChange : function(e) {
		VTIconStore.actions.energy(e.target.value);
	},

	_onPulseClick : function(e) {
		console.log("pulse");
		//VTIconStore.actions.pulse();
	},
	_onDiscontClick : function(e) {
		console.log("Discont");
		VTIconStore.actions.pulse(e.target.value);
	},
	_onTempoClick : function(e) {
		//console.log("hello Tempo");
		VTIconStore.actions.tempo();
	},
	_onFakeClick : function(e) {
		console.log("Faaafaaa");
		
	},
	_onToggleButtonClick : function(e) {
		console.log("toggle button!");
	},
	_openNav : function(e) {
		document.getElementById("mySidenav").style.width = "250px";
		document.getElementById("main").style.marginLeft = "250px";
	},

	_closeNav : function(e) {
		document.getElementById("mySidenav").style.width = "0";
		document.getElementById("main").style.marginLeft= "0";
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
			fontSize:15,
			cursor:'pointer',
			color: "#4c4c4c"
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
         var energySlider = <span />
		if (this.props.displayEnergySlider)
		{
			energySlider = (
					<input id="typeinp" type="range"  min="-500" max="500" value={this.state.value} onChange={this._onEnergyChange} step="50"/>
				);
		}
		var pulseButton = <span />
			if (this.props.displayPulseButton)
			{
				pulseButton = (<a class="btn header" style={buttonStyle} onClick={this._onPulseClick}>Pulse</a>);
			}
		var slider = <span />
			if (this.props.displaySlider)
			{
				slider = (
					<input id="typeinp" type="range"  min="-1" max="1" value={this.state.value} onChange={this._onSliderChange} step="0.1"/>
				);
			}
			var slider_F = <span />
			if (this.props.displaySlider_F)
			{
				slider_F = (
					<input id="typeinp" type="range"  min="-500" max="500" value={this.state.value} onChange={this._onSlider_FChange} step="50"/>
				);
			}
			var fake_Slider = <span />
			if (this.props.displayFakeSlider)
			{
				fake_Slider = (
					<input id="typeinp" type="range"  min="-1" max="1" value={this.state.value} onChange={this._onFakeClick} step="0.5"/>
				);
			}
			var discontinuity_Slider = <span />
			if (this.props.displayDiscontinuitySlider)
			{
				discontinuity_Slider = (
					<input id="typeinp" type="range"  min="1" max="4" value={this.state.value} onChange={this._onDiscontClick} step="1"/>
				);
			}
			//toggle switch button not working yet :(
			var toggleButton = <span />
			if (this.props.displayTogButton)
			{
				toggleButton = (
					<input id="switch" type="checkbox" className="slider round" onClick={this._onToggleButtonClick}/>); 
			}

			var tempoButton = <span />
			if (this.props.displayTempoButton)
			{
				tempoButton = (<a class="btn header" style={buttonStyle} onClick={this._onTempoClick}>Tempo</a>);
			}

		
			
		
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
			<div className="header">
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
					{pulseButton}
					{tempoButton}
				
					
					{this.state.value} 

					<span id="mySidenav" className="sidenav">
					<section className="half">
						<a href="javascript:void(0)" className="closebtn" onClick={this._closeNav}>&times;</a>
						<table>
							<tr><p>ENGINEERING</p></tr>
							<tr>
								<td>Amplitude</td>
								<td>{slider}</td>
							</tr>
							<tr>
								<td>Frequency</td>
								<td>{slider_F}</td>
							</tr>
							<tr>
								<td>Energy</td>
								<td>{energySlider}</td>
							</tr>
							<tr>
								<td>Tempo</td>
								<td>{fake_Slider}</td>
							</tr>
							<tr>
								<td>Discontinuity</td>
								<td>{discontinuity_Slider}</td>
							</tr>
							<tr>
								<td>Irregularity</td>
								<td>{fake_Slider}</td>
							</tr>
						</table>
					</section>
					<section className="half">
						<table>
							<tr><p>EMOTION</p></tr>
							<tr>
								<td>Agitation</td>
								<td>{energySlider}</td>
							</tr>
							<tr>
								<td>Liveliness</td>
								<td>{fake_Slider}</td>
							</tr>
							<tr>
								<td><a>Strangeness</a></td>
								<td>button</td>
							</tr>
						</table>
					</section>
					</span>
					<span id="main">
					<span style={headerStyle} onClick={this._openNav}>Emotion Filters</span>
					</span> 
				</span>
			</div>
		);
	}

});

module.exports = EditorHeader;