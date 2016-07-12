import React from 'react'

var VTIconStore = require('./../stores/vticonstore.js');

var DTWMixin = {

  properDynamicTimeWarp: function(wave1value, wave2value, nSamples) {

    /** Setting up the variables I'll need farther down **/
    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var duration1 = VTIconStore.store.getInitialState()["wave1"].duration;
    var duration2 = VTIconStore.store.getInitialState()["wave2"].duration;
    var partitionedAmps1 = new Array(nSamples);
    var partitionedAmps2 = new Array(nSamples);
    var partitionWidth = Math.round(Math.min(duration1/nSamples, duration2/nSamples));
    var n1 = Math.round(duration1 / partitionWidth);
    var n2 = Math.round(duration2 / partitionWidth);

    var i1 = 0;  var i2 = 0;
    var t1 = 0;  var t2 = 0;
    var j1 = 0;  var j2 = 0;

    /** Partitioning the waveforms **/
    while(t1 <= duration1) {
      if (wave1Amps[i1]) {
        if (t1 >= wave1Amps[i1].t) { i1++; }
      }

      if (!wave1Amps[i1]) {
        partitionedAmps1[j1] = wave1Amps[wave1Amps.length-1].value;
      } else if (i1 == 0) {
        partitionedAmps1[j1] = wave1Amps[i1].value;
      } else {
        var rise = wave1Amps[i1].value - wave1Amps[i1-1].value;
        var run = wave1Amps[i1].t - wave1Amps[i1-1].t;
        var slope = rise / run;
        var diffT = t1 - wave1Amps[i1-1].t;
        var sampledValue = wave1Amps[i1-1].value + (slope * diffT);
        partitionedAmps1[j1] = +sampledValue.toFixed(3);
      }

      t1 += partitionWidth; j1++;
    }

    while (t2 <= duration2) {
      if (wave2Amps[i2]) {
        if (t2 >= wave2Amps[i2].t) { i2++; }
      }

      if (!wave2Amps[i2]) {
        partitionedAmps2[j2] = wave2Amps[wave2Amps.length-1].value;
      } else if (i2 == 0) {
        partitionedAmps2[j2] = wave2Amps[i2].value;
      } else {
        var rise = wave2Amps[i2].value - wave2Amps[i2-1].value;
        var run = wave2Amps[i2].t - wave2Amps[i2-1].t;
        var slope = rise / run;
        var diffT = t2 - wave2Amps[i2-1].t;
        var sampledValue = wave2Amps[i2-1].value + (slope * diffT);
        partitionedAmps2[j2] = +sampledValue.toFixed(3);
      }

      t2 += partitionWidth; j2++;
    }
    var max1 = Math.max.apply(null, partitionedAmps1);
    var max2 = Math.max.apply(null, partitionedAmps2);
    console.log(max1, max2);

    /** Computing the Cost Matrix **/
    var costMatrix = new Array(n1 * n2);

    for (var i=0; i<=n1; i++) {
      for (var j=0; j<=n2; j++) {
        var costIndex = this._indexFunction(i,j,nSamples);
        var scaledV1 = partitionedAmps1[i] / max1;
        var scaledV2 = partitionedAmps2[j] / max2;
        var cost = this._localCost(scaledV1, scaledV2);
        cost = +cost.toFixed(3);
        costMatrix[costIndex] = cost;
      }
    }

    /** Finding the optimal path through the cost matrix **/
    var i = 0; var j = 0;
    var costSize = n1 + n2;
    var costNodes = new Array(costSize);
    costNodes[0] = {i:0, j:0, cost:costMatrix[this._indexFunction(0,0,nSamples)]};
    var nNodes = 1;

    while ((partitionedAmps1[i+1] != null) || (partitionedAmps2[j+1] != null)) {

      // Case 1: We're at the top of the Cost Matrix
      if (partitionedAmps1[i+1] == null) {
        var newNode = {i:i, j:j+1, cost:costMatrix[this._indexFunction(i,j+1,nSamples)]};
        costNodes[nNodes] = newNode;
        j++; nNodes++;
      }

      // Case 2: We're on the far right of the Cost Matrix
      else if (partitionedAmps2[j+1] == null) {
        var newNode = {i:i+1, j:j, cost:costMatrix[this._indexFunction(i+1,j,nSamples)]};
        costNodes[nNodes] = newNode;
        i++; nNodes++;
      }

      // Case 3: We're somewhere in the middle and need to choose a next step!
      else {
        var up    = costMatrix[this._indexFunction(i+1, j,  nSamples)];
        var right = costMatrix[this._indexFunction(i,   j+1,nSamples)];
        var diag  = costMatrix[this._indexFunction(i+1, j+1,nSamples)];
        var minCost = Math.min(up, right, diag);
        console.log({u:up, r:right, d:diag});

        if (up == minCost) {
          costNodes[nNodes] = {i:i+1, j:j, cost:up}
          i++; nNodes++
        }

        else if (right == minCost) {
          costNodes[nNodes] = {i:i, j:j+1, cost: right}
          j++; nNodes++;
        }

        else if (diag == minCost) {
          costNodes[nNodes] = {i:i+1, j:j+1, cost: diag};
          j++; i++; nNodes++;
        }

        else {
          alert('uh oh... cost Matrix problems :(');
          break;
        }
      }
    }
    console.log(costNodes);

    /** Find all edges to form keyframe pairings **/
    var k = 0;
    var outputNodes = new Array(nNodes);
    var nOutNodes = 0;

    while (costNodes[k+1]) {

      // Case 1: there are a few repeat I indices
      if (costNodes[k].i == costNodes[k+1].i) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].i == costNodes[newK].i) { newK++; }
          else {done = true;}
        }
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[newK].j};
        nOutNodes++;
        k = newK;
      }

      // Case 2: there are a few repeat J indices
      else if (costNodes[k].j == costNodes[k+1].j) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].j == costNodes[newK].j) { newK++; }
          else {done = true;}
        }
        //var newI = Math.round((costNodes[k].i+costNodes[newK].i)/2);
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[newK].i, j:costNodes[k].j};
        nOutNodes++;
        k = newK;
      }

      // Case 3: No repeats
      else {
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
      }

      k++;
    }

    console.log(outputNodes);

    /** Use that path through the cost matrix to mix the waves! **/
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
    //for (var k=0; k<nOutNodes; k++) {
    for (var k=0; k<nNodes; k++) {
      var i = costNodes[k].i;
      var j = costNodes[k].j;
      //var i = outputNodes[k].i;
      //var j = outputNodes[k].j;
      var iT = i * partitionWidth;
      var jT = j * partitionWidth;
      var iV = partitionedAmps1[i];
      var jV = partitionedAmps2[j];
      var newT = (wave1value*iT*0.01) + (wave2value*jT*0.01);
      var newV = (wave1value*iV*0.01) + (wave2value*jV*0.01);
      VTIconStore.actions.newKeyframe("amplitude", newT, newV, "mixedWave");
    }

    /** Then just average the frequency data... **/
    var wave1Freq = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data;
    var wave2Freq = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data;
    var n1 = wave1Freq.length; var n2 = wave2Freq.length;
    var avg1 = 0; var avg2 = 0;
    for (var i=0; i<n1; i++) { avg1 += (1/n1) * wave1Freq[i].value; }
    for (var i=0; i<n2; i++) { avg2 += (1/n2) * wave2Freq[i].value; }
    var newF = ((wave1value/100)*avg1)+((wave2value/100)*avg2);
    VTIconStore.actions.newKeyframe("frequency", 0, newF, "mixedWave");
    VTIconStore.actions.newKeyframe("frequency", 3000, newF, "mixedWave");
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
    VTIconStore.actions.unselectKeyframes("mixedWave");

  },

  scrappyDynamicTimeWarp: function(wave1value, wave2value, nSamples) {
    alert('sorry, this algorithm isnt ready yet :(');

    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var n1 = wave1Amps.length; var n2 = wave2Amps.length;
    var costMatrix = new Array(n1 * n2);
    for (var i=0; i<n1; i++) {
      for (var j=0; j<n2; j++) {
        var ind = this._indexFunction(i, j, nSamples);
        var val = Math.abs(wave1Amps[i].value - wave2Amps[j].value);
        costMatrix[ind] = val;
      }
    }
    console.log(costMatrix);
  },

  _indexFunction: function(i, j, nSamples) {
    return (nSamples * i) + j;
  },

  _localCost: function(x, y) {
    return Math.abs(x - y);
  }

};

module.exports = DTWMixin;
