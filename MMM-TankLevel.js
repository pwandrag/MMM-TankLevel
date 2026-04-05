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
		burnRate: 5.2, // Fallback burn rate in %/day (used when not enough refill history)
		fillDate : new Date(), // Date when the tank was last filled
		refillEventName: 'Gas Refill', // Name of the calendar event for refill`
		calendarName: 'family', // Name of the calendar to listen for refill events
		linkCalendarEvents: false, // Set to true to link calendar events for refill
		lookBackMonths: 12, // Number of months to look back for seasonal burn rate calculation
		summerMonths: "6,7,8,9",   // Comma-separated month numbers considered summer (1=Jan)
		winterMonths: "12,1,2,3",  // Comma-separated month numbers considered winter (1=Jan)
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
	  this.seasonInfo = null;
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
			// Collect all refill events within the lookback window and sort ascending
			let cutoffDate = new Date();
			cutoffDate.setMonth(cutoffDate.getMonth() - this.config.lookBackMonths);

			let refillDates = payload
				.filter(event => event.title.toLowerCase() === this.config.refillEventName.toLowerCase())
				.map(event => {
					let d = new Date(0);
					d.setUTCSeconds(event.startDate / 1000);
					return d;
				})
				.filter(d => d >= cutoffDate)
				.sort((a, b) => a - b);

			if (refillDates.length === 0) {
				console.log("MMM-TankLevel: No refill events found within lookback window");
				return;
			}

			// Most recent refill is the current fill date
			let fillDate = refillDates[refillDates.length - 1];
			this.config.fillDate = fillDate;
			console.log("MMM-TankLevel: Fill date updated to " + this.config.fillDate);

			// Parse season month lists (1-12)
			let summerMonths = Array.isArray(this.config.summerMonths)
				? this.config.summerMonths
				: (this.config.summerMonths ? this.config.summerMonths.split(",").map(m => parseInt(m.trim())).filter(m => !isNaN(m)) : []);
			let winterMonths = Array.isArray(this.config.winterMonths)
				? this.config.winterMonths
				: (this.config.winterMonths ? this.config.winterMonths.split(",").map(m => parseInt(m.trim())).filter(m => !isNaN(m)) : []);
			let currentMonth = new Date().getMonth() + 1; // 1-12

			// Classify each consecutive interval by the season of its start date
			let summerIntervals = [];
			let winterIntervals = [];
			let allIntervals = [];

			for (let i = 1; i < refillDates.length; i++) {
				let days = (refillDates[i] - refillDates[i - 1]) / (1000 * 60 * 60 * 24);
				let startMonth = refillDates[i - 1].getMonth() + 1;
				allIntervals.push(days);
				if (summerMonths.includes(startMonth)) {
					summerIntervals.push(days);
				} else if (winterMonths.includes(startMonth)) {
					winterIntervals.push(days);
				}
			}

			// Select interval pool based on current season; fall back to all intervals, then config
			let seasonLabel, selectedIntervals;
			if (summerMonths.includes(currentMonth) && summerIntervals.length > 0) {
				seasonLabel = "summer";
				selectedIntervals = summerIntervals;
			} else if (winterMonths.includes(currentMonth) && winterIntervals.length > 0) {
				seasonLabel = "winter";
				selectedIntervals = winterIntervals;
			} else {
				seasonLabel = summerMonths.includes(currentMonth) || winterMonths.includes(currentMonth)
					? "overall (no seasonal data yet)"
					: "overall";
				selectedIntervals = allIntervals;
			}

			let computedBurnRate = null;
			if (selectedIntervals.length >= 1) {
				let avgDays = selectedIntervals.reduce((a, b) => a + b, 0) / selectedIntervals.length;
				computedBurnRate = 100 / avgDays;
				console.log(`MMM-TankLevel: ${seasonLabel} burn rate: ${computedBurnRate.toFixed(4)} %/day (avg interval: ${avgDays.toFixed(1)} days, ${selectedIntervals.length} sample(s))`);
			} else {
				console.log("MMM-TankLevel: Not enough refill history, using fallback burnRate config");
			}

			this.seasonInfo = {
				label: seasonLabel,
				count: selectedIntervals.length,
				usingFallback: computedBurnRate === null,
			};

			this.sendSocketNotification("TANKLEVEL_UPDATE", {
				updateInterval: refresh,
				burnRate: computedBurnRate !== null ? computedBurnRate : this.config.burnRate,
				fillDate: this.config.fillDate,
			});
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

		var gasColour = 'linear-gradient(180deg,rgba(0, 255, 55, 0) 0%, rgba(0, 255, 55, 0.35) 25%, rgba(0, 255, 55, 1) 100%)';
		if (TankLevel < 20) {
			gasColour = 'linear-gradient(180deg,rgba(255,0, 0, 0) 0%, rgba(255, 0, 0, 0.35) 25%, rgba(255, 0, 0, 1) 100%)'; // Change color to red if below 20%
		} else if (TankLevel < 50) {
			gasColour = 'linear-gradient(180deg,rgba(255,255, 0, 0) 0%, rgba(255, 255, 0, 0.35) 25%, rgba(255, 255, 0, 1) 100%)'; // Change color to yellow if below 50%
		}
		TankLevelElement.style.background = gasColour; // Update the background color of the gas level

		let seasonBadge = container.querySelector(".season-badge");
		if (this.seasonInfo) {
			let label = this.seasonInfo.label;
			let isSummer = label === "summer";
			let isWinter = label === "winter";
			let iconClass = isSummer ? "fas fa-fw fa-sun"
				: isWinter  ? "fas fa-fw fa-snowflake"
				:              "fas fa-fw fa-chart-bar";
			let badgeClass = isSummer ? "season-summer"
				: isWinter  ? "season-winter"
				:              "season-overall";
			let periodText = this.seasonInfo.usingFallback
				? "fallback rate"
				: `${this.seasonInfo.count} period${this.seasonInfo.count !== 1 ? "s" : ""}`;
			seasonBadge.className = `season-badge ${badgeClass}`;
			seasonBadge.innerHTML = `<i class="${iconClass}"></i> ${label} &middot; ${periodText}`;
		}
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

		let seasonBadge = document.createElement("div");
		seasonBadge.className = "season-badge season-overall";

		container.appendChild(headerDiv);
		container.appendChild(divider);
		container.appendChild(tankElement);
		container.appendChild(seasonBadge);

		return container;
	},
  

	
  });
  
