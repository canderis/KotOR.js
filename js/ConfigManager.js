/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

/* @file
 * The ConfigManager class.
 */

class ConfigManager{

  constructor(json_path){

    let _settings = {};
    this.listeners = {};

    try{
      //console.log('ConfigManager', json_path);
      try{
        _settings = JSON.parse(fs.readFileSync(json_path));
      }catch(e){ console.error('ConfigManager', e); }
      //console.log('ConfigManager', json_path, _settings);
    }catch(e){ console.error('ConfigManager', e); }


    this.options = this._mergeDeep(defaults, _settings);
    this.cache();

    if(_settings == {}){
      this.Save(null, true);
    }

    ipcRenderer.on('config-changed', (event, data) => {
      this.options = data;
      let diffs = this.diff(this.options, this._cache);
      for(let i = 0, len = diffs.length; i < len; i++){
        this.triggerEvent(diffs[i].key, diffs[i].value, diffs[i].old);
      }
    });

  }

  //https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
  diff(obj1, obj2, key = '', diffs = []){

    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
      return obj1;
    }

    let _key;

    // Compare our objects
    for (_key in obj1) {
      if (obj1.hasOwnProperty(_key)) {
        this._compare(obj1[_key], obj2[_key], key ? key+'.'+_key : _key, diffs);
      }
    }

    return diffs;

  }

  cache(){
    this._cache = JSON.parse(JSON.stringify(this.options));
  }

  //https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
  _compare(item1, item2, key, diffs){

    // Get the object type
    let type1 = Object.prototype.toString.call(item1);
    let type2 = Object.prototype.toString.call(item2);

    // If type2 is undefined it has been removed
    if (type2 === '[object Undefined]') {
      return;
    }

    // If an object, compare recursively
    if (type1 === '[object Object]') {
      this.diff(item1, item2, key, diffs);
      return;
    }
    
    // If an array, compare
    if (type1 === '[object Array]') {
      if (!this._arraysMatch(item1, item2)) {
        diffs.push({
          key: key,
          value: item1,
          old: item2
        });
      }
      return;
    }

    // If items are different types
    if (item1 !== item2) {
      diffs.push({
        key: key,
        value: item1,
        old: item2
      });
      return;
    }

  }

  //https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
  _arraysMatch(arr1, arr2){

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false;
  
    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
  
    // Otherwise, return true
    return true;
  
  }

  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  _isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  _mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this._isObject(target) && this._isObject(source)) {
      for (const key in source) {
        if (this._isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this._mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this._mergeDeep(target, ...sources);
  }

  get(path = '', defaultValue = null){
    if(Array.isArray(path))
      path = path.join('.');

    let parts = path.split('.');
    let property = this.options;
    for(let i = 0, len = parts.length; i < len; i++){
      if(typeof property[parts[i]] != 'undefined'){
        property = property[parts[i]];
      }else{
        return undefined;
      }
    }

    if(property != this.options){
      if(property == null || property == 'null')
        return defaultValue;

      return property;
    }

    return undefined;
  }

  set(path = '', value = ''){
    if(Array.isArray(path))
      path = path.join('.');

    if(typeof value == 'string' || typeof value == 'number' || typeof value == 'boolean' || typeof value == 'object' || Array.isArray(value)){
      let parts = path.split('.');
      let scope = this.options;
      let i = 0, len = Math.max(parts.length-1, 0);
      for(i = 0; i < len; i++){
        if(scope[parts[i]]){
          scope = scope[parts[i]];
        }
        
        if(typeof scope == 'undefined'){
          console.warn('ConfigManager.set', 'Invalid property', path);
          return undefined;
        }
      }

      if(scope[parts[i]] == this.options){
        return undefined;
      }

      if(typeof scope[parts[len]] == 'undefined'){
        scope[parts[len]] = {};
      }

      if(typeof scope[parts[len]] != 'undefined'){
        let _old = JSON.parse(JSON.stringify(scope[parts[len]]));
        scope[parts[len]] = value;
        if(_old != value){
          this.triggerEvent(path, value, _old);
          this.save(null, true);
        }
      }
    }else{
      console.warn('ConfigManager.set', 'Invalid value type', typeof value, value);
    }
  }

  triggerEvent(path, value, old){
    let listener = this.listeners[path];
    if(Array.isArray(listener)){
      for(let i = 0, len = listener.length; i < len; i++){
        let callback = listener[i];
        if(typeof callback == 'function'){
          callback(path, value, old);
        }
      }
    }
    this.cache();
  }

  //Add an EventListener for a property path
  //EventListeners can have multiple callbacks per property
  on(path = '', callback = undefined){
    if(path){
      let listenerObject = this.listeners[path];
      if(typeof listenerObject == 'object'){
        let index = listenerObject.indexOf(callback);
        if(index == -1){ //Don't let the same callback be applied twice
          listenerObject.push( callback );
        }
      }else{
        listenerObject = [];
        listenerObject.push( callback );
        this.listeners[path] = listenerObject;
      }
    }
  }

  //Remove an EventListener for a property path
  //EventListeners can have multiple callbacks per property
  off(path = '', callback = undefined){
    if(path){
      let listenerObject = this.listeners[path];
      if(typeof listenerObject == 'object'){
        let index = listenerObject.indexOf(callback);
        if(index >= 0){
          listenerObject.splice(index, 1);
        }
      }
    }
  }

  getRecentFiles(){
    switch(GameKey){
      case 'KOTOR':
        return this.options.Games.KOTOR.recent_files;
      case 'TSL':
        return this.options.Games.TSL.recent_files;
    }
    return [];
  }

  getRecentProjects(){
    switch(GameKey){
      case 'KOTOR':
        return this.options.Games.KOTOR.recent_projects;
      case 'TSL':
        return this.options.Games.TSL.recent_projects;
    }
    return [];
  }

  save(onSave = null, silent = false){
    //NotificationManager.Notify(NotificationManager.Types.INFO, 'Saving Configuration');
    //Write out the settings to the settings.json file in the home directory
    //console.log('ConfigManager.save');

    try{
      fs.writeFile('settings.json',
        JSON.stringify(this.options, null, "\t"),
        (err) => {
          if(err){
            console.error('ConfigManager.Save', e);
            return;
          }

          if(typeof onSave === 'function'){
            onSave();
          }
        }
      );
    }catch(e){
      console.error('ConfigManager.save', e);
    }

    //console.log('ConfigManager.save', 'Updating other processes.');
    ipcRenderer.send('config-changed', JSON.parse(JSON.stringify(this.options)));

  }

  static GetAppDirectory(){
    if(isRunningInAsar()){
      return path.dirname(app.getPath('exe'));
    }else{
      return app.getAppPath();
    }
  }

}

const defaults = {
  first_run: true,
  Games: {
    KOTOR: {
      Location: null,
      recent_files: [],
      recent_projects: []
    },
    TSL: {
      Location: null,
      recent_files: [],
      recent_projects: []
    }
  },
  Launcher: {
    selected_profile: null,
    width: 1200,
    height: 600
  },
  Profiles: {

  },
  Game: {
    show_application_menu: false,
    debug: {
      show_fps: false,
      light_helpers: false,
      show_collision_meshes: false,
      creature_collision: true,
      door_collision: true,
      placeable_collision: true,
      world_collision: true,
      camera_collision: true,
      encounter_geometry_show: false,
      trigger_geometry_show: false,
      waypoint_geometry_show: false,
      is_shipping_build: true,
    }
  },
  Theme: {
    NSS: {
      keywords: {
        color: "#ffb800",
        fontSize: "inherit"
      },
      methods: {
        color: "#1d7fd9",
        fontSize: "inherit"
      },
      constants: {
        color: "#9648ba",
        fontSize: "inherit"
      }
    },
    GFF: {
      struct: {
        label: {
          color: "#FFF",
          fontSize: "inherit"
        },
        "color": "#8476a2"
      },
      field: {
        label: {
          color: "#FFF",
          fontSize: "inherit"
        },
        "color": "#337a9c"
      }
    }
  },
  look_in_override: false,
  Editor: {
    profile: null,
    Module: {
      Helpers: {
        creature: {
          visible: false
        },
        door: {
          visible: false
        },
        encounter: {
          visible: false
        },
        placeable: {
          visible: false
        },
        merchant: {
          visible: false
        },
        sound: {
          visible: false
        },
        trigger: {
          visible: false
        },
        waypoint: {
          visible: false
        },
      }
    }
  },
  Panes: {
    left: {open: true},
    right: {open: true},
    top: {open: false},
    bottom: {open: false}
  },
  Projects_Directory: path.join(ConfigManager.GetAppDirectory(), 'projects'),
  recent_projects: [],
  recent_files: []
};

module.exports = ConfigManager;
