## MagicMirror Module: TankLevel

Display Gas Level

| Status | Version | Date | 
|:------- |:------- |:---- |
| Initial | 1.0.0 | 2025-06-23 |

#### What is this module doing?

*MMM-TankLevel* is a [MagicMirror](https://github.com/MichMich/MagicMirror) module for displaying the 
gas level calculated based on a burn % rate per day, and a fill date 

### Example Screenshots

Module Screenshot:

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


#### Contribution

Feel free to post issues or remarks related to this module.  
For all other or general questions, please refer to the [MagicMirror Forum](https://forum.magicmirror.builders/).

#### License 

[MIT License](https://github.com/linuxtuxie/MMM-TankLevel/blob/main/LICENSE) 

