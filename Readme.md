## MagicMirror Module: TankLevel

Display Gas Level

| Status | Version | Date | 
|:------- |:------- |:---- |
| Initial | 1.0.0 | 2025-06-23 |
| Latest  | 1.1.0 | 2025-06-28 |

#### What is this module doing?

*MMM-TankLevel* is a [MagicMirror](https://github.com/MichMich/MagicMirror) module for displaying the 
gas level calculated based on a burn % rate per day, and a fill date. The module listens to the calendar module for event entries named in the config setting `refillEventName` e.g.  'Gas Refill', which auto-resets the tank to 100%

### Example Screenshots

Module Screenshot:
![Tank Level screenshot](screenshot.png?raw=true "Tank Level")
---

### Installation

Manual Installation:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/pwandrag/MMM-TankLevel.git
cd MMM-TankLevel
```

### Configuration 

To configure the TankLevel module, you need to do the following:

1. Add the Module to the global MagicMirror `config.js` 
2. Edit the global config to add the burn rate and fill date
3. [optional] Modify `MMM-TankLevel.css` to your own CSS taste


Add this module to the modules array in the `config/config.js` file by adding the following example section.<br>You must include your SolarMan stationID and token, you can edit the config to include any of the configuration options described below. 

```javascript
{
    module: 'MMM-TankLevel',
    position: 'bottom_left',
    header: 'Gas Level',
    config: {
        width: 500,
        height: 400,
        burnRate: 5.7,
        fillDate: 2025-06-23
        linkCalendarEvents: true, //
        calendarName: "family", //name of calendar to listen to 
        refillEventName: "Gas Refill", //name of event to look for. Uses the last occurence of this event name to derrive date
    }
},
```

---

#### Configuration Options 

| Option            | Description  |
|:----------------- |:------------ | 
| width             | The width of the module.<br>*Optional*<br>*Default value:* `500` |
| height            | The height of the module.<br>*Optional*<br>*Default value:* `400` |
| burnRate          | Gas usage % per day |
| fillDate          | Date last filled |
| linkCalendarEvents| Set to true to listen to calendar events for refill dates <br>*Optional*<br>*Default value: `false`* |
| calendarName      | Name of calendar to listen to <br>*Optional* |
| refillEventName   | Name of event to look for. Uses the last occurence of this event name to derrive date <br>*Optional* |


#### Contribution

Feel free to post issues or remarks related to this module.  
For all other or general questions, please refer to the [MagicMirror Forum](https://forum.magicmirror.builders/).

#### License 

[MIT License](https://github.com/linuxtuxie/MMM-TankLevel/blob/main/LICENSE) 

