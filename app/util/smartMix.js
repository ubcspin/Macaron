import React from 'react';

var VTIconStore = require('./../stores/vticonstore.js');
var CrossfadeMixin = require('./CrossfadeMixin.js');
var DTWMixin = require('./DTWmixin.js');

var SmartMix = {

  smartMix: function(wave1value, wave2value, nSamples) {

    var cutoff = 4; // Fine tune this!

    var cost = this._computeCost(wave1value, wave2value, nSamples);

    if (cost > cutoff) {
      CrossfadeMixin.vectorCrossfade(wave1value, wave2value, nSamples);
    } else {
      DTWMixin.properDynamicTimeWarp(wave1value, wave2value, nSamples);
    }
  },

  _computeCost: function(wave1value, wave2value, nSamples) {
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

        if (up == minCost) {
          costNodes[nNodes] = {i:i+1, j:j, cost:up}
          i++; nNodes++;
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
    var totalCost = 0; var i=0;
    while (costNodes[i+1]) {totalCost += costNodes[i].cost; i++;}
    console.log(totalCost);
    return totalCost;
  },

  _indexFunction: function(i, j, nSamples) {
    return (nSamples * i) + j;
  },

  _localCost: function(x, y) {
    return Math.abs(x - y);
  }

}

module.exports = SmartMix;
