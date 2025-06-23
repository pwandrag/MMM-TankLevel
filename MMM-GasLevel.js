/* Magic Mirror
 * Module: MMM-GasLevel
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
		fillDate : '2025-05-21T00:00:00Z', // Date when the tank was last filled
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
	  this.sendSocketNotification("START_TANKLEVEL", {
		updateInterval: refresh,
		token: this.config.burnRate,
		fillDate: this.config.fillDate,
	  });
	},

	socketNotificationReceived: function(notification, payload) {

	  // was not able to receive data
	  if (notification == "ERROR") {
		msgStats.innerHTML=payload.error;
		return;
	  } else if (notification == "GASLEVEL_REFRESH") {
		// Update the gas level in the module
		this.payload = payload;
	  
		let gasLevel = payload.gasLevel; // Get the gas level from the payload
		let daysRemaining = payload.daysRemaining;

		let gasLevelSurge = gasLevel-10;
		let gasLevelText = this.getDom().querySelector(".gas-level");
		if (gasLevelText) {
		  gasLevelText.innerHTML = gasLevel.toFixed(0) + "%"; // Update the text with the gas level
	  	}

		let gasLevelElement = this.getDom().querySelector(".gas");
		gasLevelElement.style.height = `${gasLevel}%`;

		let gasTop = this.getDom().querySelector(".tank-top");
		gasTop.innerHTML = `${daysRemaining}d`;

		let root = document.documentElement;
		root.style.setProperty("--fill-level",`${gasLevel}%`);
		root.style.setProperty("--fill-level-surge",`${gasLevelSurge}%`);
		}
		return;
	},
  
	// Override dom generator.
	getDom: function() {
		
		// Build the table
		let container = document.createElement("div");

		container.className = "gaslevelContainer";
		container.style.width = this.config.width + "px";
		container.style.height = this.config.height + "px";

		let headerDiv = document.createElement("div");
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
		tankContainer.className = "tank-top";

		let tankBody = document.createElement("div");
		tankContainer.className = "tank";
		let gasLevel = document.createElement("div");
		gasLevel.className = "gas";
		let gasLevelText = document.createElement("span");
		gasLevelText.className = "gas-level";

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

		let bubble5 = document.createElement("div");
		bubble5.className = "bubble";
		bubble5.style.width = "18px";
		bubble5.style.height = "18px";
		bubble5.style.left = "60%";
		bubble5.style.animationDelay = "1.5s";

		tankBody.appendChild(gasLevel);
		gasLevel.appendChild(gasLevelText);
		gasLevel.appendChild(bubble1);
		gasLevel.appendChild(bubble2);
		gasLevel.appendChild(bubble3);
		gasLevel.appendChild(bubble4);
		gasLevel.appendChild(bubble5);

		let tankBottom = document.createElement("div");
		tankContainer.className = "tank-bottom";

		tankContainer.appendChild(tankTop);
		tankContainer.appendChild(tankBody);
		tankContainer.appendChild(tankBottom);

		container.appendChild(headerDiv);
		container.appendChild(divider);
		container.appendChild(tankContainer);

		return container;
	},
  

	
  });
  
