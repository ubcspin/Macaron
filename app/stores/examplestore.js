import Reflux from 'reflux';

var LogStore = require('./logstore.js');
var VTIconStore = require('./vticonstore.js');
var PlaybackStore = require('./playbackstore.js');
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
						{
          "t": 1025.1572327044023,
          "value": 312.50000000000057,
        },
        {
          "t": 1943.3962264150944,
          "value": 157.4999999999999,
        }]
				}
			};

	for (var t = 0; t < duration; t+=dt)
	{
		rv.parameters.amplitude.data.push(
			{
				t:t,
				value:Math.sin(2*Math.PI*frequency*t/1000 - Math.PI/2*frequency)/2.0+0.5
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
  "selected": false,
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
  "selected": false,
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

//v-10-09-1-8
v10_09_1_8: {
  "duration": 3000,
  "selectedTimeRange": {
    "active": false,
    "time1": 0,
    "time2": 0
  },
  "selected": false,
  "parameters": {
    "amplitude": {
      "valueScale": [
        0,
        1
      ],
      "data": [
        {
          "t": 327.04402515723274,
          "value": 0.005555555555555314,
          "selected": true,
          "id": 351
        },
        {
          "t": 333.33333333333337,
          "value": 1,
          "selected": true,
          "id": 307
        },
        {
          "t": 433.6477987421385,
          "value": 0.9755282581475768,
          "selected": true,
          "id": 309
        },
        {
          "t": 483.64779874213843,
          "value": 0.9045084971874737,
          "selected": true,
          "id": 311
        },
        {
          "t": 533.6477987421384,
          "value": 0.7938926261462367,
          "selected": true,
          "id": 313
        },
        {
          "t": 583.6477987421384,
          "value": 0.6545084971874737,
          "selected": true,
          "id": 315
        },
        {
          "t": 658.1761006289308,
          "value": 0.4283295960759858,
          "selected": true,
          "id": 321
        },
        {
          "t": 708.1761006289308,
          "value": 0.31771372503474865,
          "selected": true,
          "id": 323
        },
        {
          "t": 758.1761006289308,
          "value": 0.24669396407464556,
          "selected": true,
          "id": 325
        },
        {
          "t": 833.1761006289308,
          "value": 0.22837805192465344,
          "selected": true,
          "id": 328
        },
        {
          "t": 883.1761006289308,
          "value": 0.2767189601280383,
          "selected": true,
          "id": 330
        },
        {
          "t": 933.1761006289308,
          "value": 0.3686688316289485,
          "selected": true,
          "id": 332
        },
        {
          "t": 982.5471698113206,
          "value": 0.5726616769645598,
          "selected": true,
          "id": 338
        },
        {
          "t": 1032.5471698113204,
          "value": 0.7214396943142177,
          "selected": true,
          "id": 340
        },
        {
          "t": 1082.5471698113204,
          "value": 0.8479978350377182,
          "selected": true,
          "id": 342
        },
        {
          "t": 1157.5471698113201,
          "value": 0.9699727025920212,
          "selected": true,
          "id": 345
        },
        {
          "t": 1276.7295597484278,
          "value": 1,
          "selected": true,
          "id": 347
        },
        {
          "t": 1289.3081761006295,
          "value": 0.005555555555555508,
          "selected": true,
          "id": 349
        },
        {
          "t": 1823.8993710691825,
          "value": 0.005555555555555314,
          "selected": true,
          "id": 357
        },
        {
          "t": 1830.188679245283,
          "value": 1,
          "selected": true,
          "id": 358
        },
        {
          "t": 1930.5031446540881,
          "value": 0.9755282581475768,
          "selected": true,
          "id": 359
        },
        {
          "t": 1980.5031446540881,
          "value": 0.9045084971874737,
          "selected": true,
          "id": 360
        },
        {
          "t": 2030.5031446540881,
          "value": 0.7938926261462367,
          "selected": true,
          "id": 361
        },
        {
          "t": 2080.5031446540884,
          "value": 0.6545084971874737,
          "selected": true,
          "id": 362
        },
        {
          "t": 2155.0314465408806,
          "value": 0.4283295960759858,
          "selected": true,
          "id": 363
        },
        {
          "t": 2205.0314465408806,
          "value": 0.31771372503474865,
          "selected": true,
          "id": 364
        },
        {
          "t": 2255.0314465408806,
          "value": 0.24669396407464556,
          "selected": true,
          "id": 365
        },
        {
          "t": 2330.0314465408806,
          "value": 0.22837805192465344,
          "selected": true,
          "id": 366
        },
        {
          "t": 2380.0314465408806,
          "value": 0.2767189601280383,
          "selected": true,
          "id": 367
        },
        {
          "t": 2430.0314465408806,
          "value": 0.3686688316289485,
          "selected": true,
          "id": 368
        },
        {
          "t": 2479.4025157232704,
          "value": 0.5726616769645598,
          "selected": true,
          "id": 369
        },
        {
          "t": 2529.40251572327,
          "value": 0.7214396943142177,
          "selected": true,
          "id": 370
        },
        {
          "t": 2579.40251572327,
          "value": 0.8479978350377182,
          "selected": true,
          "id": 371
        },
        {
          "t": 2654.40251572327,
          "value": 0.9699727025920212,
          "selected": true,
          "id": 372
        },
        {
          "t": 2773.5849056603774,
          "value": 1,
          "selected": true,
          "id": 373
        },
        {
          "t": 2786.163522012579,
          "value": 0.005555555555555508,
          "selected": true,
          "id": 374
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
          "t": 336.4779874213836,
          "value": 357.5000000000002,
          "selected": true,
          "id": 184
        },
        {
          "t": 798.7421383647799,
          "value": 77.49999999999966,
          "selected": true,
          "id": 352
        },
        {
          "t": 1270.440251572327,
          "value": 357.5000000000002,
          "selected": true,
          "id": 355
        },
        {
          "t": 1833.3333333333335,
          "value": 357.5000000000002,
          "selected": true,
          "id": 375
        },
        {
          "t": 2295.5974842767296,
          "value": 77.49999999999966,
          "selected": true,
          "id": 376
        },
        {
          "t": 2767.295597484277,
          "value": 357.5000000000002,
          "selected": true,
          "id": 377
        }
      ]
    }
  }
},

	textures: {
  "duration": 3000,
  "selectedTimeRange": {
    "active": false,
    "time1": 0,
    "time2": 0
  },
  "selected": false,
  "parameters": {
    "amplitude": {
      "valueScale": [
        0,
        1
      ],
      "data": [
        {
          "t": 433.96226415094316,
          "value": 1.1102230246251565e-16,
          "selected": false,
          "id": 78
        },
        {
          "t": 440.2515723270441,
          "value": 0.38888888888888895,
          "selected": false,
          "id": 79
        },
        {
          "t": 522.0125786163524,
          "value": 0.38888888888888895,
          "selected": false,
          "id": 80
        },
        {
          "t": 534.5911949685534,
          "value": 0.2666666666666666,
          "selected": false,
          "id": 73
        },
        {
          "t": 616.3522012578613,
          "value": 0.2666666666666666,
          "selected": false,
          "id": 74
        },
        {
          "t": 622.6415094339623,
          "value": 0.6555555555555554,
          "selected": false,
          "id": 75
        },
        {
          "t": 704.4025157232707,
          "value": 0.6555555555555554,
          "selected": false,
          "id": 76
        },
        {
          "t": 710.6918238993711,
          "value": 0.4388888888888889,
          "selected": false,
          "id": 71
        },
        {
          "t": 792.4528301886791,
          "value": 0.4388888888888889,
          "selected": false,
          "id": 72
        },
        {
          "t": 798.74213836478,
          "value": 0.8277777777777777,
          "selected": false,
          "id": 69
        },
        {
          "t": 880.5031446540884,
          "value": 0.8277777777777777,
          "selected": false,
          "id": 70
        },
        {
          "t": 886.7924528301886,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 67
        },
        {
          "t": 968.5534591194966,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 68
        },
        {
          "t": 968.5534591194967,
          "value": 1,
          "selected": false,
          "id": 42
        },
        {
          "t": 1050.314465408805,
          "value": 1,
          "selected": false,
          "id": 45
        },
        {
          "t": 1062.8930817610064,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 47
        },
        {
          "t": 1144.6540880503144,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 50
        },
        {
          "t": 1157.2327044025158,
          "value": 1,
          "selected": false,
          "id": 51
        },
        {
          "t": 1238.9937106918242,
          "value": 1,
          "selected": false,
          "id": 52
        },
        {
          "t": 1245.2830188679245,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 54
        },
        {
          "t": 1327.0440251572325,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 55
        },
        {
          "t": 1327.0440251572327,
          "value": 1,
          "selected": false,
          "id": 56
        },
        {
          "t": 1408.805031446541,
          "value": 1,
          "selected": false,
          "id": 57
        },
        {
          "t": 1421.3836477987422,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 58
        },
        {
          "t": 1509.4339622641508,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 81
        },
        {
          "t": 1509.433962264151,
          "value": 1,
          "selected": false,
          "id": 82
        },
        {
          "t": 1591.1949685534591,
          "value": 1,
          "selected": false,
          "id": 83
        },
        {
          "t": 1603.7735849056608,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 84
        },
        {
          "t": 1685.5345911949685,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 85
        },
        {
          "t": 1698.11320754717,
          "value": 1,
          "selected": false,
          "id": 86
        },
        {
          "t": 1779.8742138364782,
          "value": 1,
          "selected": false,
          "id": 87
        },
        {
          "t": 1786.1635220125786,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 88
        },
        {
          "t": 1867.9245283018868,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 89
        },
        {
          "t": 1867.9245283018868,
          "value": 1,
          "selected": false,
          "id": 90
        },
        {
          "t": 1949.6855345911954,
          "value": 1,
          "selected": false,
          "id": 91
        },
        {
          "t": 1962.2641509433965,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 92
        },
        {
          "t": 2031.4465408805033,
          "value": 0.6166666666666667,
          "selected": false,
          "id": 110
        },
        {
          "t": 2037.7358490566037,
          "value": 0.8277777777777777,
          "selected": false,
          "id": 113
        },
        {
          "t": 2119.496855345912,
          "value": 0.8277777777777777,
          "selected": false,
          "id": 114
        },
        {
          "t": 2125.786163522013,
          "value": 0.4388888888888889,
          "selected": false,
          "id": 115
        },
        {
          "t": 2207.5471698113206,
          "value": 0.4388888888888889,
          "selected": false,
          "id": 116
        },
        {
          "id": 119,
          "t": 2207.547169811321,
          "value": 0.6555555555555554,
          "selected": false
        },
        {
          "id": 120,
          "t": 2289.308176100629,
          "value": 0.6555555555555554,
          "selected": false
        },
        {
          "id": 121,
          "t": 2301.8867924528304,
          "value": 0.2666666666666666,
          "selected": false
        },
        {
          "id": 122,
          "t": 2383.647798742138,
          "value": 0.2666666666666666,
          "selected": false
        },
        {
          "id": 123,
          "t": 2389.937106918239,
          "value": 0.38888888888888895,
          "selected": false
        },
        {
          "id": 124,
          "t": 2471.698113207547,
          "value": 0.38888888888888895,
          "selected": false
        },
        {
          "id": 125,
          "t": 2477.9874213836474,
          "value": 1.1102230246251565e-16,
          "selected": false
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
          "id": 139,
          "t": 427.67295597484275,
          "value": 117.50000000000034,
          "selected": false
        },
        {
          "id": 129,
          "t": 886.7924528301886,
          "value": 277.5,
          "selected": false
        },
        {
          "id": 130,
          "t": 1094.3396226415093,
          "value": 235,
          "selected": false
        },
        {
          "id": 132,
          "t": 1276.7295597484276,
          "value": 277.5,
          "selected": false
        },
        {
          "id": 133,
          "t": 1484.2767295597484,
          "value": 235,
          "selected": false
        },
        {
          "id": 134,
          "t": 1672.955974842767,
          "value": 277.5,
          "selected": false
        },
        {
          "id": 135,
          "t": 1880.503144654088,
          "value": 235,
          "selected": false
        },
        {
          "id": 136,
          "t": 2081.761006289308,
          "value": 277.5,
          "selected": false
        },
        {
          "id": 138,
          "t": 2471.698113207547,
          "value": 117.50000000000034,
          "selected": false
        }
      ]
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
      PlaybackStore.actions.setTime(0);
      LogStore.actions.log("EXAMPLE_SELECT_"+foundName);
    }

		this.trigger(this._data);
	}

});


module.exports = {
	actions:exampleActions,
	store:exampleStore
};

