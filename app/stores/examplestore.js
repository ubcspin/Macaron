import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var EXAMPLE_KEY = "example"; //TODO: More general?


var sineExample = function(frequency, duration, dt) {
	var rv = {};
	rv.duration = duration;
	rv.selected=false;
	rv.selectedTimeRange={
						active:false,
						time1:0,
						time2:0
					};

	rv.parameters = {
				amplitude: {
					valueScale:[0,1], //normalized
					data : []
				},

				frequency: {
					valueScale:[50,500], //Hz
					data : [
						{ t: 0, value:250}, 
						{ t: 1500, value:400}]
				}
			};

	for (var t = 0; t < duration; t+=dt)
	{
		rv.parameters.amplitude.data.push(
			{
				t:t,
				value:Math.sin(2*Math.PI*frequency*t/1000)/2.0+0.5
			});
	}

	return rv;
};


var randomNoiseExample = function(duration, dt) {
	var rv = {};
	rv.duration = duration;
	rv.selected=false;
	rv.selectedTimeRange={
						active:false,
						time1:0,
						time2:0
					};

	rv.parameters = {
				amplitude: {
					valueScale:[0,1], //normalized
					data : []
				},

				frequency: {
					valueScale:[50,500], //Hz
					data : []
				}
			};

	for (var t = 0; t < duration; t+=dt)
	{
		//TODO: Make this use "seedrandom" package
			rv.parameters.frequency.data.push(
			{
				t:t,
				value:Math.random()*(rv.parameters.frequency.valueScale[1]-rv.parameters.frequency.valueScale[0])+rv.parameters.frequency.valueScale[0]
			});

		rv.parameters.amplitude.data.push(
			{
				t:t,
				value:Math.random()
			});
	}

	return rv;
};

var examples = {
	v4: {
  "duration": 3000,
  "selected": true,
  "selectedTimeRange": {
    "active": false,
    "time1": 0,
    "time2": 0
  },
  "parameters": {
    "amplitude": {
      "valueScale": [
        0,
        1
      ],
      "data": [
        {
          "id": 36,
          "t": 0,
          "value": 2.220446049250313e-16,
          "selected": true
        },
        {
          "id": 29,
          "t": 347.10743801652893,
          "value": 0.07222222222222222,
          "selected": true
        },
        {
          "id": 30,
          "t": 638.4297520661158,
          "value": 0.18888888888888894,
          "selected": true
        },
        {
          "id": 31,
          "t": 873.9669421487602,
          "value": 0.33333333333333337,
          "selected": true
        },
        {
          "id": 32,
          "t": 1028.9256198347107,
          "value": 0.49444444444444435,
          "selected": true
        },
        {
          "id": 33,
          "t": 1140.495867768595,
          "value": 0.6833333333333332,
          "selected": true
        },
        {
          "id": 34,
          "t": 1221.0743801652893,
          "value": 1,
          "selected": true
        },
        {
          "id": 35,
          "t": 1239.6694214876034,
          "value": 2.7755575615628914e-17,
          "selected": true
        },
        {
          "id": 45,
          "t": 1591.194968553459,
          "value": 2.220446049250313e-16,
          "selected": true
        },
        {
          "id": 46,
          "t": 1938.3024065699879,
          "value": 0.07222222222222222,
          "selected": true
        },
        {
          "id": 47,
          "t": 2229.624720619575,
          "value": 0.18888888888888894,
          "selected": true
        },
        {
          "id": 48,
          "t": 2465.161910702219,
          "value": 0.33333333333333337,
          "selected": true
        },
        {
          "id": 49,
          "t": 2620.1205883881694,
          "value": 0.49444444444444435,
          "selected": true
        },
        {
          "id": 50,
          "t": 2731.6908363220537,
          "value": 0.6833333333333332,
          "selected": true
        },
        {
          "id": 51,
          "t": 2812.269348718748,
          "value": 1,
          "selected": true
        },
        {
          "id": 52,
          "t": 2830.8643900410625,
          "value": 2.7755575615628914e-17,
          "selected": true
        }
      ]
    },
    "frequency": {
      "valueScale": [
        50,
        500
      ],
      "data": [
        {
          "id": 43,
          "t": 0,
          "value": 50,
          "selected": true
        },
        {
          "id": 39,
          "t": 591.1949685534591,
          "value": 104.99999999999977,
          "selected": true
        },
        {
          "id": 40,
          "t": 962.2641509433959,
          "value": 192.4999999999999,
          "selected": true
        },
        {
          "id": 41,
          "t": 1264.1509433962265,
          "value": 305,
          "selected": true
        },
        {
          "id": 42,
          "t": 1289.308176100629,
          "value": 50.00000000000023,
          "selected": true
        },
        {
          "id": 53,
          "t": 1591.194968553459,
          "value": 50,
          "selected": true
        },
        {
          "id": 54,
          "t": 2182.3899371069183,
          "value": 104.99999999999977,
          "selected": true
        },
        {
          "id": 55,
          "t": 2553.459119496855,
          "value": 192.4999999999999,
          "selected": true
        },
        {
          "id": 56,
          "t": 2855.3459119496856,
          "value": 305,
          "selected": true
        },
        {
          "id": 57,
          "t": 2880.503144654088,
          "value": 50.00000000000023,
          "selected": true
        }
      ]
    }
  }
},

	v3: {
  "duration": 3000,
  "selectedTimeRange": {
    "active": false,
    "time1": 0,
    "time2": 0
  },
  "selected": true,
  "parameters": {
    "amplitude": {
      "valueScale": [
        0,
        1
      ],
      "data": [
        {
          "t": 81.76100628930817,
          "value": 1.8041124150158794e-16,
          "selected": false,
          "id": 49
        },
        {
          "t": 88.0503144654088,
          "value": 0.20000000000000007,
          "selected": false,
          "id": 50
        },
        {
          "t": 182.38993710691824,
          "value": 0.20000000000000007,
          "selected": false,
          "id": 52
        },
        {
          "t": 226.41509433962273,
          "value": 0.8111111111111111,
          "selected": false,
          "id": 53
        },
        {
          "t": 339.62264150943395,
          "value": 0.8111111111111111,
          "selected": false,
          "id": 66
        },
        {
          "t": 352.20125786163516,
          "value": 0.20000000000000007,
          "selected": false,
          "id": 68
        },
        {
          "t": 452.83018867924517,
          "value": 0.20000000000000007,
          "selected": false,
          "id": 69
        },
        {
          "t": 496.8553459119499,
          "value": 0.8111111111111111,
          "selected": false,
          "id": 70
        },
        {
          "t": 672.9559748427675,
          "value": 0.8111111111111111,
          "selected": false,
          "id": 71
        },
        {
          "t": 1433.9622641509425,
          "value": 2.7755575615628914e-16,
          "selected": false,
          "id": 60
        },
        {
          "id": 156,
          "t": 1578.6163522012578,
          "value": 1.8041124150158794e-16,
          "selected": true
        },
        {
          "id": 157,
          "t": 1584.9056603773583,
          "value": 0.20000000000000007,
          "selected": true
        },
        {
          "id": 158,
          "t": 1679.245283018868,
          "value": 0.20000000000000007,
          "selected": true
        },
        {
          "id": 159,
          "t": 1723.2704402515724,
          "value": 0.8111111111111111,
          "selected": true
        },
        {
          "id": 160,
          "t": 1836.4779874213837,
          "value": 0.8111111111111111,
          "selected": true
        },
        {
          "id": 161,
          "t": 1849.0566037735848,
          "value": 0.20000000000000007,
          "selected": true
        },
        {
          "id": 162,
          "t": 1949.6855345911947,
          "value": 0.20000000000000007,
          "selected": true
        },
        {
          "id": 163,
          "t": 1993.7106918238994,
          "value": 0.8111111111111111,
          "selected": true
        },
        {
          "id": 164,
          "t": 2169.811320754717,
          "value": 0.8111111111111111,
          "selected": true
        },
        {
          "id": 165,
          "t": 2930.817610062892,
          "value": 2.7755575615628914e-16,
          "selected": true
        }
      ]
    },
    "frequency": {
      "valueScale": [
        50,
        500
      ],
      "data": [
        {
          "t": 0,
          "value": 57.5,
          "selected": false,
          "id": 3
        },
        {
          "t": 1500,
          "value": 57.5,
          "selected": false,
          "id": 200
        }
      ]
    }
  }
},

sineExample: sineExample(1, 3000, 25),

randomExample: randomNoiseExample(3000, 100),

v10_augmented: { //w/ v-10-21-3-11
  "duration": 3000,
  "selectedTimeRange": {
    "active": false,
    "time1": 0,
    "time2": 0
  },
  "selected": true,
  "parameters": {
    "amplitude": {
      "valueScale": [
        0,
        1
      ],
      "data": [
        {
          "t": 70.4350537969747,
          "value": 5.551115123125783e-17,
          "selected": false,
          "id": 1078
        },
        {
          "t": 71.49280108113695,
          "value": 1,
          "selected": false,
          "id": 1080
        },
        {
          "t": 421.3836477987428,
          "value": 1,
          "selected": false,
          "id": 1091
        },
        {
          "t": 490.5660377358495,
          "value": 0.32222222222222224,
          "selected": false,
          "id": 1082
        },
        {
          "t": 496.76438484328725,
          "value": 0.32222222222222224,
          "selected": false,
          "id": 1083
        },
        {
          "t": 528.3018867924541,
          "value": 1,
          "selected": false,
          "id": 1092
        },
        {
          "t": 878.1927335100597,
          "value": 1,
          "selected": false,
          "id": 1093
        },
        {
          "t": 962.2641509433981,
          "value": 0.32222222222222224,
          "selected": false,
          "id": 1096
        },
        {
          "t": 968.4624980508358,
          "value": 0.32222222222222224,
          "selected": false,
          "id": 1097
        },
        {
          "t": 1006.2893081761024,
          "value": 1,
          "selected": false,
          "id": 1100
        },
        {
          "t": 1349.8908467176072,
          "value": 1,
          "selected": false,
          "id": 1101
        },
        {
          "t": 1630.378398045637,
          "value": 5.551115123125783e-17,
          "selected": false,
          "id": 1089
        },
        {
          "t": 1779.8742138364782,
          "value": 0.005555555555555425,
          "selected": false,
          "id": 1157
        },
        {
          "t": 1781.1138832579659,
          "value": 1,
          "selected": false,
          "id": 1158
        },
        {
          "t": 1836.477987421384,
          "value": 1,
          "selected": false,
          "id": 1172
        },
        {
          "t": 1936.0725609439162,
          "value": 0.17777777777777787,
          "selected": false,
          "id": 1159
        },
        {
          "t": 1991.8576849108583,
          "value": 0.17777777777777787,
          "selected": false,
          "id": 1160
        },
        {
          "t": 1998.0560320182963,
          "value": 1,
          "selected": false,
          "id": 1161
        },
        {
          "t": 2050.3144654088055,
          "value": 1,
          "selected": false,
          "id": 1173
        },
        {
          "t": 2153.014709704247,
          "value": 0.17777777777777787,
          "selected": false,
          "id": 1162
        },
        {
          "t": 2208.799833671189,
          "value": 0.17777777777777787,
          "selected": false,
          "id": 1163
        },
        {
          "t": 2214.9981807786266,
          "value": 0.17777777777777787,
          "selected": false,
          "id": 1164
        },
        {
          "t": 2228.725505483653,
          "value": 1,
          "selected": false,
          "id": 1165
        },
        {
          "t": 2295.5974842767296,
          "value": 1,
          "selected": false,
          "id": 1174
        },
        {
          "t": 2902.0713134778307,
          "value": 5.551115123125783e-17,
          "selected": false,
          "id": 1166
        }
      ]
    },
    "frequency": {
      "valueScale": [
        50,
        500
      ],
      "data": [
        {
          "t": 490.56603773585016,
          "value": 72.5,
          "selected": false,
          "id": 1103
        },
        {
          "t": 496.85534591195056,
          "value": 114.99999999999977,
          "selected": false,
          "id": 1102
        },
        {
          "t": 943.3962264150962,
          "value": 114.99999999999977,
          "selected": false,
          "id": 1106
        },
        {
          "t": 949.6855345911965,
          "value": 155.0000000000001,
          "selected": false,
          "id": 1104
        },
        {
          "id": 1176,
          "t": 1729.559748427673,
          "value": 155.0000000000001,
          "selected": false
        },
        {
          "t": 1742.1383647798746,
          "value": 184.99999999999943,
          "selected": false,
          "id": 1170
        },
        {
          "t": 2196.3121783876504,
          "value": 184.99999999999943,
          "selected": false,
          "id": 1167
        },
        {
          "t": 2196.312178387651,
          "value": 125.00000000000057,
          "selected": false,
          "id": 1168
        }
      ]
    }
  }
},

	test3: {
			selected:false,
			duration: 3000, //ms

			selectedTimeRange: {
						active:false,
						time1:0,
						time2:0
					},

			parameters: {
				amplitude: {
					valueScale:[0,1], //normalized
					data : [
						{ t: 600, value:0.5}, 
						{ t: 1500, value:0.75 },
						{ t: 2100, value:0.5}, 
						{ t: 2900, value:0.25 }]
				},

				frequency: {
					valueScale:[50,500], //Hz
					data : [
						{ t: 0, value:250}, 
						{ t: 1500, value:400}]
				}
			}
		},
};

var exampleActions = Reflux.createActions(
	[
		'selectExample'
	]);


var exampleStore = Reflux.createStore({

	listenables: [exampleActions],

	init() {
		this._data = {
			selected:"test1",
			examples:examples
		};
	},

	getInitialState() {
		return this._data;
	},

	onSelectExample(newName) {
		var foundName = "";
		for (var ex in this._data.examples) {
			if (ex === newName)
			{
				foundName = ex;
			}
		}

		if (foundName != "")
		{
			this._data.selected=foundName;
			for (var ex in this._data.examples) {
				this._data.examples[ex].selected = (ex === foundName);
			}
			VTIconStore.actions.setVTIcon(this._data.examples[foundName], name=EXAMPLE_KEY);
		}

		this.trigger(this._data);
	}

});


module.exports = {
	actions:exampleActions,
	store:exampleStore
};

