/*
 *
 * MMM-TankLevel
 *
 * Author: pwandrag
 * MIT Licensed.
 *
 */
let NodeHelper = require('node_helper');

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
		console.log("MMM-TankLevel: "+notification);
		if (!self.started)
		{
			setInterval( async function() { await self.processData(payload) }, payload.updateInterval); // update every 4 hours
			self.started = true;
			self.processData(payload); // When the MagicMirror module is called the first time, we are immediatly going to fetch data
		}else {
			console.log("MMM-TankLevel: Already started, not starting again");
		}
		return;
	},

	processData: async function(payload) {
		var self = this;
		//console.info("MMM-TankLevel: "+JSON.stringify(payload));

		let rate = payload.burnRate; //rate in %/day
		let fillDate = new Date(payload.fillDate);
		let now = new Date();
		let daysSinceFillRate = Math.floor((now - fillDate) / (1000 * 60 * 60 * 24)); // Calculate days since last fill
		let TankLevel = 100 - (daysSinceFillRate * rate); // Calculate gas level in %
		if (TankLevel < 0) {
			TankLevel = 0; // Ensure gas level does not go below 0%
		}
		if (TankLevel > 100) {
			TankLevel = 100; // Ensure gas level does not exceed 100%
		}
		let daysRemaining = Math.floor((TankLevel) / rate); // Calculate days remaining based on burn rate
		if (daysRemaining < 0) {
			daysRemaining = 0; // Ensure days remaining does not go below 0
		}

		// Send all to script
		self.sendSocketNotification('TANKLEVEL_REFRESH', {
			TankLevel: TankLevel,
			daysRemaining: daysRemaining
		});
	
		return;
	},

});
