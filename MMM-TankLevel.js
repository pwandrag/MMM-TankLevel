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
		burnRate: this.config.burnRate,
		fillDate: this.config.fillDate,
	  });
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
		let TankLevelSurge = TankLevel-10;

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

		}
		return;
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

		let bubble5 = document.createElement("div");
		bubble5.className = "bubble";
		bubble5.style.width = "18px";
		bubble5.style.height = "18px";
		bubble5.style.left = "60%";
		bubble5.style.animationDelay = "1.5s";

		tankBody.appendChild(TankLevel);
		TankLevel.appendChild(TankLevelText);
		TankLevel.appendChild(bubble1);
		TankLevel.appendChild(bubble2);
		TankLevel.appendChild(bubble3);
		TankLevel.appendChild(bubble4);
		TankLevel.appendChild(bubble5);

		let tankBottom = document.createElement("div");
		tankBottom.className = "tank-bottom";

		tankContainer.appendChild(tankTop);
		tankContainer.appendChild(tankBody);
		tankContainer.appendChild(tankBottom);

		let tankElement = document.createElement("div");
		tankElement.style.justifyContent = "center";
		tankElement.style.display = "flex";
		tankElement.style.alignItems = "center";
		tankElement.appendChild(tankContainer);

		container.appendChild(headerDiv);
		container.appendChild(divider);
		container.appendChild(tankElement);

		return container;
	},
  

	
  });
  
