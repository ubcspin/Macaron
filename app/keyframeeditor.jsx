
import React from 'react';
import d3 from 'd3';
import Reflux from 'reflux';

var VTIconStore = require('./stores/vticonstore.js');
var TimelineMixin = require('./util/timelinemixin.js');
var ScaleStore = require('./stores/scalestore.js');
var DragStore = require('./stores/dragstore.js');

var KeyframeEditor = React.createClass({

	mixins : [
		TimelineMixin("divWrapper"),
		Reflux.connect(ScaleStore.store, 'scales') //emitted updates go to 'scales' key			
		],



	propTypes: {
		name : React.PropTypes.string.isRequired,
		parameter : React.PropTypes.string.isRequired,
		vticon : React.PropTypes.object.isRequired,
		selection : React.PropTypes.object.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		currentTime: React.PropTypes.number.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: 90,
	      width:"100%",
	      circleColor:'#FF8400',
	      selectedCircleColor:'#B05B00',
	      selectionColor:'#676767',
	      selectionOpacity:0.2,
	      doubleClickTime:500, //ms
	      axisTickLength:5,
	      axisNameWidth:18,
	      axisTickLeft:30,
	      selectable:true,
	      visualization:true,
	      visualizeTicks:true,
	      modifiable:true,
	      topBuffer:20,
	    }
	},


	componentDidMount: function () {
    	var parameter_range = [this.props.height-this.props.keyframeCircleRadius, this.props.keyframeCircleRadius+this.props.topBuffer];

    	this._lastMouseDownTime = 0;

    	ScaleStore.actions.setTrackrange(this.props.name, this.props.parameter, parameter_range); 
    	ScaleStore.actions.setTopOffset(this.props.name, this.props.parameter, this.refs.divWrapper.getDOMNode().offsetTop) ;
	},


	render : function() {

		var keyframeCircleRadius = this.props.keyframeCircleRadius;
		var circleColor = this.props.circleColor;
		var selectedCircleColor = this.props.selectedCircleColor;

		var data = this.props.vticon.parameters[this.props.parameter].data;

		var valueScale = this.props.vticon.parameters[this.props.parameter].valueScale;

		var scaleY = this.state.scales[this.props.name].scaleParameter[this.props.parameter];

        var scaleX = this.props.scaleX;
        var height = this.props.height;


        var lineGen = d3.svg.line()
                            .x(function(d)
                            {
                                return scaleX(d.t);
                            })
                            .y(function(d)
                            {
                                return scaleY(d.value);
                            });

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};


		var firstValue = data[0].value;
		var lastValue = data[data.length-1].value;
		
		var fillPath =lineGen(
				[{t:0, value:valueScale[0]}]
				.concat([{t:0, value:firstValue}])
				.concat(data)
				.concat([{t:this.props.vticon.duration, value:lastValue}])
				.concat([{t:this.props.vticon.duration, value:valueScale[0]}]));


		//current time vis
		//TODO: put this in a seperate location
		var currentTimeLineFunc = d3.svg.line()
								.x(function(d) {
									return d[0]
								})
								.y(function(d) {
									return d[1]
								});
		var currentTimePath = currentTimeLineFunc([
						[scaleX(this.props.currentTime), 0],
						[scaleX(this.props.currentTime), height]	
				]);

		var keyframeCallback = this._onMouseDownKeyframe;

		//axis
		// var yAxis = d3.svg.axis()
		// 					.scale(scaleY);
		var axisTickLength = this.props.axisTickLength;
		var axisTickLeft = this.props.axisTickLeft;

		
		var selectable = this.props.selectable;
		//selection square
		var selectionSquare = <rect />;
		if(selectable && this.props.vticon.selected && this.props.selection.active) {
			var tLeft = this.props.selection.time1;
			var tRight = this.props.selection.time2;
			if(tLeft > tRight) {
				tLeft = this.props.selection.time2;
				tRight = this.props.selection.time1;
			}

			var vTop = this.props.selection.parameters[this.props.parameter].value1;
			var vBottom = this.props.selection.parameters[this.props.parameter].value2;
			if(vTop < vBottom) {
				vTop = this.props.selection.parameters[this.props.parameter].value2;
				vBottom = this.props.selection.parameters[this.props.parameter].value1;
			
			}
			



			var x = scaleX(tLeft);
			var y = scaleY(vTop);
			var width = scaleX(tRight) - x;
			var height = scaleY(vBottom) - y;

			selectionSquare = <rect
				x={x}
				y={y} 
				width={width}
				height={height}
				fill={this.props.selectionColor}
				opacity={this.props.selectionOpacity} />
		}

		var playheadLine = <rect />;
		if(this.props.vticon.selected) {
			playheadLine = <path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />
		}


		var visualization = this.props.visualization;
		var visPath = <path />;
		if (visualization) {
			visPath = (<path
							d={fillPath}
							fill="#FFDDAD"
							stroke="#FFDDAD"
							onMouseDown={this._onMouseDown}>
						</path>);
		}

		var paramLabels = <text />;
		var paramTicks = <rect />;
		if (this.props.visualizeTicks) {
			paramTicks = <text x="0" y="0" transform={"translate("+this.props.axisNameWidth+","+this.props.height/2+") rotate(-90)"}>{this.props.parameter.charAt(0).toUpperCase() + this.props.parameter.slice(1)}</text>;
			paramTicks = scaleY.ticks(5).map(function(tick, idx) {

								//tick line
								var lineProps = {
									stroke:'black',
									strokeWidth:0.5
								};
								lineProps['y1'] = scaleY(tick);
								lineProps['y2'] = scaleY(tick);
								lineProps['x1'] = axisTickLeft;
								lineProps['x2'] = axisTickLeft + axisTickLength;
								var line = React.DOM.line(lineProps);

								//tick label
								var labelProps = {
									fontSize:10,
									className:'unselectable'
								};
								labelProps['y'] = scaleY(tick)+3;
								labelProps['x'] = axisTickLeft+axisTickLength+4;
								var label = React.DOM.text(labelProps, tick);
								return (<g key={idx}>
											{line}
											{label}
										</g>);


						});
			paramLabels = (<text
					x="0" y="0"
					transform={"translate("+this.props.axisNameWidth+","+this.props.height/2+") rotate(-90)"}>
						{this.props.parameter.charAt(0).toUpperCase() + this.props.parameter.slice(1)}
				</text>);

		}

		return (
				<div ref="divWrapper" style={divStyle}>
					<svg  width="100%" height="100%" onMouseDown={this._onMouseDown} >
						
						{visPath}
						{paramLabels}

						{paramTicks}
						
						{playheadLine}

						{data.map(function(d)
							{
								var rv = <rect />;
								if (visualization && selectable) {
									rv = (<circle cx={scaleX(d.t)} cy={scaleY(d.value)} r={keyframeCircleRadius} onMouseDown={keyframeCallback} data-id={d.id} data-selected={d.selected} fill={d.selected ? selectedCircleColor : circleColor}>
									</circle>);
								}
								return rv;
							})
						}

						{selectionSquare}


						

					</svg>
				</div>
			);
	},


	/**
	* UI Callbacks
	*/
	_onMouseDown(e) {

		var t = Date.now();

		VTIconStore.actions.selectVTIcon(this.props.name);

		if ( this.props.modifiable && ((t - this._lastMouseDownTime) <= this.props.doubleClickTime))
		{
			//double click
			var keyframeCircleRadius = this.props.keyframeCircleRadius;

			var valueScale = this.props.vticon.parameters[this.props.parameter].valueScale;

	        var scaleY = this.state.scales[this.props.name].scaleParameter[this.props.parameter];

	        var x = e.clientX - this.state.offsetLeft;
	        var y = e.clientY - this.state.offsetTop;

	        VTIconStore.actions.newKeyframe(this.props.parameter, this.props.scaleX.invert(x), scaleY.invert(y), e.shiftKey, name=this.props.name);
	        DragStore.actions.startKeyframeDrag(this.props.name, e.shiftKey);

		} else if (this.props.selectable) {
  			DragStore.actions.startSelectDrag(this.props.name, e.shiftKey);
		} else {
		VTIconStore.actions.unselectKeyframes();
		}

		

		this._lastMouseDownTime = t;

		return false;
	},

	_onMouseDownKeyframe(e) {

		VTIconStore.actions.selectVTIcon(this.props.name);

		var id = parseInt(e.target.getAttribute("data-id"));
		var selected = (e.target.getAttribute("data-selected") === 'true');

		if (this.props.selectable)
		{
			if (!selected)
			{
				if(e.shiftKey) {
					VTIconStore.actions.addToggleSelectedKeyframe(id, name=this.props.name);
				} else {
					VTIconStore.actions.selectKeyframe(id, name=this.props.name);
				}
			}

			if(this.props.modifiable)
			{
				DragStore.actions.startKeyframeDrag(this.props.name);
			}

		}
		

		return false;
	}



});

module.exports = KeyframeEditor;