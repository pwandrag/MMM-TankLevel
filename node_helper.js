/*
 *
 * MMM-SolarMan
 *
 * Author: pwandrag
 * MIT Licensed.
 *
 */
let NodeHelper = require('node_helper');


/**
 * 
 *
 * @module
 * @param {Object} opts  Need to pass a burn rate and fill date.
 */
let SolarMan = async function(opts,source) {

	if(!opts.burnRate) {
		throw new Error('no burnrate defined');
	}
	if(!opts.fillDate) {
		throw new Error('no fillDate Defined');
	}

	return chartData
};

module.exports = NodeHelper.create({
    // Override start method.
    start: function() {
	  console.log("Starting node helper for: " + this.name);
	  this.started = false;
	  this.config = {};
      return;
    },

	// Override socketNotificationReceived method.
	socketNotificationReceived: async function(notification, payload) {

		var self = this;
			self.processData(payload); // When the MagicMirror module is called the first time, we are immediatly going to fetch data
   			setInterval( async function() { await self.processData(payload) }, 14400000); // update every 4 hours
			self.started = true;
		return;
	},

	processData: async function(payload) {
		var self = this;

		let rate = payload.burnRate; //rate in %/day
		let fillDate = new Date(payload.fillDate);
		let now = new Date();
		let daysSinceFillRate = Math.floor((now - fillDate) / (1000 * 60 * 60 * 24)); // Calculate days since last fill
		let gasLevel = 100 - (daysSinceFillRate * rate); // Calculate gas level in %
		if (gasLevel < 0) {
			gasLevel = 0; // Ensure gas level does not go below 0%
		}
		if (gasLevel > 100) {
			gasLevel = 100; // Ensure gas level does not exceed 100%
		}
		let daysRemaining = Math.floor((100 - gasLevel) / rate); // Calculate days remaining based on burn rate
		if (daysRemaining < 0) {
			daysRemaining = 0; // Ensure days remaining does not go below 0
		}

		// Send all to script
		self.sendSocketNotification('GASLEVEL_REFRESH', {
			gasLevel: gasLevel,
			daysRemaining: daysRemaining
		});
	
		return;
	},

});
