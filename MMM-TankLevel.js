/* Magic Mirror
 * Module: MMM-TankLevel
 * Displays propane tank level using burn rate and tank size.
 *
 * Author: pwandrag
 * Version: 1.0.0
 * MIT Licensed.
 *
 */

Module.register("MMM-TankLevel",{
	// Default module config.
	defaults: {	  
		updateIntervalSeconds: 120, // Update interval in seconds
		width: 500,
		height: 400,
		burnRate: 5.2, // Burn rate in kg/day	  
		fillDate : new Date(), // Date when the tank was last filled
		refillEventName: 'Gas Refill', // Name of the calendar event for refill`
		calendarName: 'family', // Name of the calendar to listen for refill events
		linkCalendarEvents: false, // Set to true to link calendar events for refill
	},

  
	// Define required scripts. Chart.js needed for the graph.
	getScripts: function() {
	  return [
		'moment.js'
	  ];
	},
  
	// Define required styles.
	getStyles: function() {
	  return ["MMM-TankLevel.css"];
	},
  
	// Override start method.
	start: function() {
	  console.log("Starting module: " + this.name);

	  this.payload = false;
	  refresh = (this.config.updateIntervalSeconds) * 1000;
	  this.sendSocketNotification("TANKLEVEL_START", {
		updateInterval: refresh,
		burnRate: this.config.burnRate,
		fillDate: this.config.fillDate,
		refillEventName: this.config.refillEventName,
		calendarName: this.config.calendarName,
	  });
	},

	notificationReceived: function(notification, payload, sender) {

	if (!this.config.linkCalendarEvents) {
		console.log("MMM-TankLevel: No calendar name configured, skipping calendar events");
		return;
	}

	// Listen to calendar events
	if (notification == "CALENDAR_EVENTS") {
		console.log("MMM-TankLevel: Received calendar events");
		console.log("MMM-TankLevel: Sender name: " + sender.name);

		//filter all payload entries for calendarName='family'
	  	if (payload && payload.length > 0) {

			payload = payload.filter(event => event.calendarName === this.config.calendarName);
			if (payload.length === 0) {
				console.log("MMM-TankLevel: No family calendar events found");
				return;
			}
			// Extract the last event's start date where title='Fill Date'
			let fillDateEvent = payload.findLast(event => event.title === this.config.refillEventName);
			if (fillDateEvent) {
				let fillDate = new Date(0);
				fillDate.setUTCSeconds(fillDateEvent.startDate/1000); // Convert milliseconds to seconds
				if (fillDate) {
					this.config.fillDate = fillDate; // Update the fill date in the config
					console.log("MMM-TankLevel: Fill date updated to " + this.config.fillDate);
					this.sendSocketNotification("TANKLEVEL_UPDATE", {
						updateInterval: refresh,
						burnRate: this.config.burnRate,
						fillDate: this.config.fillDate,
					});
				} else {
					console.log("MMM-TankLevel: No valid fill date found in calendar events");
				}
			}
		}
	  }
	
	},

	socketNotificationReceived: function(notification, payload) {

	  // was not able to receive data
	  if (notification == "ERROR") {
		msgStats.innerHTML=payload.error;
		return;
	  } else if (notification == "TANKLEVEL_REFRESH") {
		// Update the gas level in the module
		this.payload = payload;
	  
		let TankLevel = payload.TankLevel; // Get the gas level from the payload
		let daysRemaining = payload.daysRemaining;
		let TankLevelSurge = TankLevel-3;

		let container = document.getElementById("TankLevelContainer")

		let levelStyle = container.querySelector(".tank-container");
		levelStyle.style.setProperty("--fill-level",`${TankLevel}%`);
		levelStyle.style.setProperty("--fill-level-surge",`${TankLevelSurge}%`);

		let TankLevelText = container.querySelector(".gas-level");
		TankLevelText.innerHTML = TankLevel.toFixed(0) + "%"; // Update the text with the gas level

		let TankLevelElement = container.querySelector(".gas");
		TankLevelElement.style.height = `${TankLevel}%`;

		let gasTop = container.querySelector(".tank-top");
		gasTop.innerHTML = `${daysRemaining}d`;

		var gasColour = 'linear-gradient(180deg,rgba(0, 255, 55, 0) 0%, rgba(0, 255, 55, 0.35) 25%, rgba(0, 255, 55, 1) 100%);';
		if (TankLevel < 20) {
			gasColour = 'linear-gradient(180deg,rgba(255,0, 0, 0) 0%, rgba(255, 0, 0, 0.35) 25%, rgba(255, 0, 0, 1) 100%);'; // Change color to red if below 20%
		} else if (TankLevel < 50) {
			gasColour = 'linear-gradient(180deg,rgba(255,255, 0, 0) 0%, rgba(255, 255, 0, 0.35) 25%, rgba(255, 255, 0, 1) 100%);'; // Change color to yellow if below 50%

		}
		TankLevelElement.style.backgroundColor = gasColour; // Update the background color of the gas level
		return;
	}
	},
  
	// Override dom generator.
	getDom: function() {
		
		// Build the table
		let container = document.createElement("div");

		container.id = "TankLevelContainer";
		container.className = "TankLevelContainer";
		container.style.width = this.config.width + "px";
		container.style.height = this.config.height + "px";

		let headerDiv = document.createElement("div");
		headerDiv.className = "module-header";
		let headerText = document.createElement("p");
		headerText.innerHTML = "Gas Level";
		headerText.style = "margin: 0px 0px 0px 15px;";
		headerText.className = "light small";

		let headerIcon = document.createElement("i");
		headerIcon.className = "fas fa-fw fa-fire-flame-simple";

		headerDiv.appendChild(headerIcon);
		headerDiv.appendChild(headerText);

		let divider = document.createElement("hr");
		divider.className = "dimmed";

		let tankContainer = document.createElement("div");
		tankContainer.className = "tank-container";

		let tankTop = document.createElement("div");
		tankTop.className = "tank-top";

		let tankBody = document.createElement("div");
		tankBody.className = "tank";
		let TankLevel = document.createElement("div");
		TankLevel.className = "gas";
		let TankLevelText = document.createElement("span");
		TankLevelText.className = "gas-level";

		let bubble1 = document.createElement("div");
		bubble1.className = "bubble";
		bubble1.style.width = "10px";
		bubble1.style.height = "10px";
		bubble1.style.left = "20%";
		bubble1.style.animationDelay = "0s";
		let bubble2 = document.createElement("div");
		bubble2.className = "bubble";
		bubble2.style.width = "15px";
		bubble2.style.height = "15px";
		bubble2.style.left = "50%";
		bubble2.style.animationDelay = "1s";
		let bubble3 = document.createElement("div");
		bubble3.className = "bubble";
		bubble3.style.width = "12px";
		bubble3.style.height = "12px";
		bubble3.style.left = "70%";
		bubble3.style.animationDelay = "0.5s";
		let bubble4 = document.createElement("div");
		bubble4.className = "bubble";
		bubble4.style.width = "8px";
		bubble4.style.height = "8px";
		bubble4.style.left = "30%";
		bubble4.style.animationDelay = "2s";

		//let bubble5 = document.createElement("div");
		//bubble5.className = "bubble";
		//bubble5.style.width = "18px";
		//bubble5.style.height = "18px";
		//bubble5.style.left = "60%";
		//bubble5.style.animationDelay = "1.5s";

		tankBody.appendChild(TankLevel);
		TankLevel.appendChild(TankLevelText);
		TankLevel.appendChild(bubble1);
		TankLevel.appendChild(bubble2);
		TankLevel.appendChild(bubble3);
		TankLevel.appendChild(bubble4);
		//TankLevel.appendChild(bubble5);

		let tankBottom = document.createElement("div");
		tankBottom.className = "tank-bottom";

		tankContainer.appendChild(tankTop);
		tankContainer.appendChild(tankBody);
		tankContainer.appendChild(tankBottom);

		let tankElement = document.createElement("div");
		tankElement.className = "tank-element";
		tankElement.appendChild(tankContainer);

		container.appendChild(headerDiv);
		container.appendChild(divider);
		container.appendChild(tankElement);

		return container;
	},
  

	
  });
  
