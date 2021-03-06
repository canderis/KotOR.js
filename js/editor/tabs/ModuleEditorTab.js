class ModuleEditorTab extends EditorTab {
  constructor(){
    super({
      toolbar: {
        items: [
          {name: 'Add', items: [
            {name: 'Doors', onClick: () => {
              this.addNewDoor();
            }},
            {name: 'Placeable', onClick: () => {
              this.addNewPlaceable();
            }},
            {name: 'Sound', onClick: () => {
              this.addNewSound();
            }}
          ]},
          {name: 'Visible', items: [
            {name: 'Toggle Creatures', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.CREATURE);
            }},
            {name: 'Toggle Doors', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.DOOR);
            }},
            {name: 'Toggle Placeables', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.PLACEABLE);
            }},
            {name: 'Toggle Rooms', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.ROOM);
            }},
            {name: 'Toggle Sound Helpers', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.SOUND);
            }},
            {name: 'Toggle Triggers', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.TRIGGER);
            }},
            {name: 'Toggle Waypoints', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.WAYPOINT);
            }},
            {name: 'Toggle Walkmesh On/Off', onClick: () => {
              this.toggleNodeVisibility(ModuleEditorTab.NODES.WALKMESH);
            }}
          ]},
          {name: 'Editor', items: [
            {name: 'Camera', items: [
              {name: 'Editor Camera', onClick: () => {
                this.setMode(ModuleEditorTab.MODES.EDIT);
              }},
              {name: 'Player Camera', onClick: () => {
                this.setMode(ModuleEditorTab.MODES.PREVIEW);
              }}
            ]},
            {name: 'Toggle Fog', onClick: () => {
              this.scene.fog = !this.scene.fog ? this.module.area.fog : undefined;
            }}
          ]},
        ]
      }
    });
    this.singleInstance = true;

    $('a', this.$tab).text('Module Editor');
    this.$stats = $('<div id="render-stats"></div>');
    //this.$tabContent.append(this.$canvas);

    this.toolbar = null;
    this.$toolbar = null;
    this.sidebar = null;
    this.$sidebar = null;

    this.$toolsUI = $('<div class="float-ui" style="z-index: 99;"><div class="float-ui-header"></div><div class="float-ui-content"><ul></ul></div></div>');
    this.toolsUI = this.$toolsUI[0];

    this.toolsUI.$header = $('float-ui-header', this.$toolsUI);
    this.toolsUI.$content = $('float-ui-content', this.$toolsUI);
    this.toolsUI.$list = $('ul', this.$toolsUI);

    this.toolsUI.tools = [
      { type: UIItem.TYPE.GLYPHICON,
        name : "Select",
        icon: 'glyphicon-hand-up',
        color: 'white',
        onClick: () => {
          this.axes.visible = false;
          this.controls.CurrentTool = this.controls.TOOL.SELECT;
        }
      },
      { type: UIItem.TYPE.GLYPHICON,
        name : "Move",
        icon: 'glyphicon-screenshot',
        color: 'green',
        onClick: () => {
          this.controls.CurrentTool = this.controls.TOOL.OBJECT_MOVE;
          this.axes.visible = true;
          this.axes.setMode('translate');
        }
      },
      { type: UIItem.TYPE.GLYPHICON,
        name : "Rotate",
        icon: 'glyphicon-retweet',
        color: 'blue',
        onClick: () => {
          this.controls.CurrentTool = this.controls.TOOL.OBJECT_ROTATE;
          this.axes.visible = true;
          this.axes.setMode('rotate');
        }
      }
    ];

    this.toolsUI.buildUI = () => {

      for(let i = 0; i < this.toolsUI.tools.length; i++){

        let tool = this.toolsUI.tools[i];
        tool.parent = this.toolsUI.$list;
        let uiItem = new UIItem(tool);

      }

    };

    this.toolsUI.init = () => {
      this.$tabContent.append(this.$toolsUI);
      this.$toolsUI.draggable({
        handle: '.float-ui-header',
        containment: this.$tabContent
      });
      this.toolsUI.buildUI();
    }

    this.toolsUI.init();

    this.mode = ModuleEditorTab.MODES.EDIT;

    this.walkmeshVisibility = false;
    this.isDestroyed = false;

    /* RENDERER Global variables */
    this.canvas = null;
    this.engine = null;
    this.audio = null;
    this.scene = null;
    this.sceneOverlay = null;
    this.camera = null;
    this.controls = null;
    this.selected = null;

    this.group = {
      creatures: new THREE.Group(),
      doors: new THREE.Group(),
      placeables: new THREE.Group(),
      rooms: new THREE.Group(),
      sounds: new THREE.Group(),
      triggers: new THREE.Group(),
      waypoints: new THREE.Group(),
      lights: new THREE.Group(),
      light_helpers: new THREE.Group(),
      emitters: new THREE.Group(),
      stunt: new THREE.Group(),
      player: new THREE.Group()
    };

    this.sceneTree = {
      rooms: [],
      creatures: [],
      placeables: [],
      doors: [],
      sounds: [],
      stores: [],
      triggers: [],
      waypoints: []
    };

    this.emitters = {};
    this._emitters = {};

    this.group.creatures.visible = Config.options.Editor.Module.Helpers.creature.visible;
    this.group.doors.visible = Config.options.Editor.Module.Helpers.door.visible;
    this.group.placeables.visible = Config.options.Editor.Module.Helpers.placeable.visible;
    //this.group.rooms.visible = Config.options.Editor.Module.Helpers.room.visible;
    this.group.sounds.visible = Config.options.Editor.Module.Helpers.sound.visible;
    this.group.triggers.visible = Config.options.Editor.Module.Helpers.trigger.visible;
    this.group.waypoints.visible = Config.options.Editor.Module.Helpers.waypoint.visible;
    this.group.player.visible = false;

    this.signals = {
		    objectSelected: new Signal(),
    		objectFocused: new Signal(),
    		objectAdded: new Signal(),
    		objectChanged: new Signal(),
    		objectRemoved: new Signal()
    };

    TemplateEngine.GetTemplateAsync('templates/editor-module-3d.html', {tabId: this.id}, (tpl) => {
      this.$tabContent.append(tpl);

      this.$container = $(this.ElementId('#container'), this.$tabContent);

      this.$containerRenderer = $(this.ElementId('#renderer'), this.$tabContent);

      this.$containerScene = $(this.ElementId('#project-templates'), this.$tabContent);

      this.$containerExplorer = $(this.ElementId('#project-explorer'), this.$tabContent);

      this.$containerObjProps = $(this.ElementId('#object-properties'), this.$tabContent);

      this.$container.layout();



      this.Init();

    });

  }

  EngineSizeUpdate(){
    setTimeout( () => {
      this.camera.aspect = this.$content.innerWidth() / this.$content.innerHeight();
      this.camera.updateProjectionMatrix();

      //Update the static cameras
      for(let i = 0; i < this.staticCameras.length; i++){
        this.staticCameras[i].aspect = this.$content.innerWidth() / this.$content.innerHeight();
        this.staticCameras[i].updateProjectionMatrix();
      }

      this.renderer.setSize( this.$content.innerWidth(), this.$content.innerHeight() );
    }, 1000 );
  }

  updateFrustumObjects(object){

    // every time the camera or objects change position (or every frame)
    this.currentCamera.updateMatrixWorld(); // make sure the camera matrix is updated
    this.currentCamera.matrixWorldInverse.copy(this.currentCamera.matrixWorld).invert();
    //this.currentCamera.matrixWorldInverse.getInverse( this.currentCamera.matrixWorld );
    this.viewportProjectionMatrix.multiplyMatrices( this.currentCamera.projectionMatrix, this.currentCamera.matrixWorldInverse );
    this.viewportFrustum.setFromProjectionMatrix( this.viewportProjectionMatrix );

    // frustum is now ready to check all the objects you need
    //frustum.intersectsObject( object )
  }

  Render(){
    if(this.isDestroyed)
      return;

    requestAnimationFrame(  () => { this.Render(); }  );

    if(!this.visible)
      return;

    this.axes.enabled = this.axes.visible;

    let delta = this.clock.getDelta();
    //this.axes.update();
    this.controls.Update(delta);

    try{
      //editor3d.selectionBox.update();
    }catch(e){}

    //CREATURES
    let obj = undefined;
    for(let i = 0, len = this.module.area.creatures.length; i < len; i++){
      obj = this.module.area.creatures[i];
      if(obj.model instanceof THREE.AuroraModel){
        obj.model.position.copy(obj.position);
        obj.model.rotation.copy(obj.rotation);
        obj.model.update(delta);
      }

      obj.updateAnimationState();
    }

    //PLACEABLES
    obj = undefined;
    for(let i = 0, len = this.module.area.placeables.length; i < len; i++){
      obj = this.module.area.placeables[i];
      if(obj.model instanceof THREE.AuroraModel){
        obj.model.position.copy(obj.position);
        obj.model.rotation.copy(obj.rotation);
        obj.model.update(delta);
      }
    }


    //DOORS
    obj = undefined;
    for(let i = 0, len = this.module.area.doors.length; i < len; i++){
      obj = this.module.area.doors[i];
      if(obj.model instanceof THREE.AuroraModel){
        obj.model.position.copy(obj.position);
        obj.model.rotation.copy(obj.rotation);
        obj.model.update(delta);
      }
    }

    //ROOMS
    obj = undefined;
    for(let i = 0, len = this.module.area.rooms.length; i < len; i++){
      obj = this.module.area.rooms[i];
      if(obj.model instanceof THREE.AuroraModel)
        obj.model.update(delta);
    }

    for(let i = 0; i < AnimatedTextures.length; i++){
      AnimatedTextures[i].Update(delta);
    }

    if(this.mode == ModuleEditorTab.MODES.PREVIEW){
      if(this.player instanceof ModuleCreature){
        this.updateFollowerCamera(delta);
        this.player.rotation.z = this.player.facing;

        this.player.AxisFront.multiplyScalar(this.player.force * delta);
        this.player.position.add(this.player.AxisFront);

        this.player.updateAnimationState();
        if(this.player.model instanceof THREE.AuroraModel){
          this.player.model.rotation.z = this.player.rotation.z;
          this.player.model.update(delta);
        }

      }
    }

    this.audio.Update(this.currentCamera.position, this.currentCamera.rotation);

    this.cam_controls.update();

    LightManager.update(delta, this.currentCamera);

    this.renderer.clear();
    this.renderer.clearDepth();
    this.renderer.render( this.scene, this.currentCamera );

    this.stats.update();

  }

  Init(){

    loader.Show();
    loader.SetMessage("Loading Module...");

    global.editor3d = this;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      autoClear: false,
      depth: false,
      logarithmicDepthBuffer: true,
    });
    this.renderer.autoClear = false;
    //this.renderer.sortObjects = false;

    this.$content = $('<div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; overflow: hidden;" />');
    this.$infoPane = $('<div class="info-pane" />');

    this.$containerRenderer.append(this.$content);

    this.renderer.setSize( this.$content.innerWidth(), this.$content.innerHeight() );

    this.canvas = this.renderer.domElement;
    this.$canvas = $(this.canvas);
    this.$canvas.addClass('noselect').attr('tabindex', 1);

    this.audio = new AudioEngine();

    this.clock = new THREE.Clock();
    this.stats = new Stats();

    this.$content.append($(this.stats.dom));
    this.$content.append(this.$canvas);
    this.$content.append(this.$infoPane);

    this.scene = new THREE.Scene();
    this.sceneOverlay = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 50, this.$content.innerWidth() / this.$content.innerHeight(), 0.1, 15000 );
    this.camera.up = new THREE.Vector3( 0, 0, 1 );

    
    this.followerCamera = new THREE.PerspectiveCamera( 50, this.$content.innerWidth() / this.$content.innerHeight(), 0.1, 15000 );
    this.followerCamera.up = new THREE.Vector3( 0, 0, 1 );

    //Static Camera's that are in the .git file of the module
    this.staticCameras = [];
    //Animates Camera's are MDL files that have a camera_hook and animations for use in dialog
    this.animatedCameras = [];

    this.staticCameraIndex = 0;
    this.animatedCameraIndex = 0;
    this.currentCamera = this.camera;

    this.viewportFrustum = new THREE.Frustum();
    this.viewportProjectionMatrix = new THREE.Matrix4();

    this.raycaster = new THREE.Raycaster();

    this.axes = new THREE.TransformControls( this.currentCamera, this.canvas );//new THREE.AxisHelper(10);            // add axes
    this.axes.selected = null;
    this.scene.add(this.axes);

    //This works
    this.selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0xffffff);
    this.selectionBox.update();
    this.selectionBox.visible = false;
    this.scene.add( this.selectionBox );

    this.controls = new EditorControls(this.currentCamera, this.canvas, this);
    this.controls.AxisUpdate(); //always call this after the Yaw or Pitch is updated
    this.controls.SetCameraMode(EditorControls.CameraMode.EDITOR);
    
    this.cam_controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.cam_controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.cam_controls.dampingFactor = 0.25;
    this.cam_controls.screenSpacePanning = false;
    this.cam_controls.minDistance = 5;
    this.cam_controls.maxDistance = 500;
    this.cam_controls.minPolarAngle = 0.0;
    this.cam_controls.maxPolarAngle = 1.3801207189585918;
    this.cam_controls.panSpeed = 1.0;
    this.cam_controls.rotateSpeed = 0.5;

    //0x60534A
    this.globalLight = new THREE.AmbientLight(0xFFFFFF);
    this.globalLight.position.x = 0
    this.globalLight.position.y = 0
    this.globalLight.position.z = 0
    this.globalLight.intensity  = 0.5

    this.scene.add(this.globalLight);

    //this.camera.position.z = 2.5;

    this.scene.add(this.group.rooms);
    this.scene.add(this.group.placeables);
    this.scene.add(this.group.doors);
    this.scene.add(this.group.creatures);
    this.scene.add(this.group.waypoints);
    this.scene.add(this.group.sounds);
    this.scene.add(this.group.triggers);
    this.scene.add(this.group.player);

    this.cursorGroup = new THREE.Group();
    this.scene.add(this.cursorGroup);

    Game.scene = this.scene;

    try{

      Module.FromProject(Global.Project.directory, (module) => {
        console.log('Module', module);
        this.module = module;
        this.globalLight.color.setHex('0x'+this.module.area.DynAmbientColor.toString(16));
  
        try{
          /*console.log('SunFog', this.module.area.SunFogOn == 1)
          if(this.module.area.SunFogOn == 1){
            console.log('SunFog', '0x'+this.module.area.SunFogColor.toString(16), this.module.area.SunFogNear, this.module.area.SunFogFar)
            this.scene.fog = new THREE.Fog(this.module.area.SunFogColor, this.module.area.SunFogNear, this.module.area.SunFogFar);
          }*/
        }
        catch(e){ console.error('SunFog error', e); }
  
        //this.camera.position.setX(this.module['Mod_Entry_X']);
        //this.camera.position.setY(this.module['Mod_Entry_Y']);
        //this.camera.position.setZ(this.module['Mod_Entry_Z'] + 2);
        //this.camera.rotation.set(Math.PI / 2, -Math.atan2(this.module['Mod_Entry_Dir_X'], this.module['Mod_Entry_Dir_Y']), 0);
  
        //this.camera.pitch = THREE.Math.radToDeg(this.camera.rotation.y) * -1;
        //this.camera.yaw = THREE.Math.radToDeg(this.camera.rotation.x);
  
        let ypr = this.toEulerianAngle(this.camera.quaternion);
  
        this.camera.pitch = THREE.Math.radToDeg(ypr.pitch);
        this.camera.yaw = THREE.Math.radToDeg(ypr.yaw) * -1;
  
        if (this.camera.pitch > 89.0)
            this.camera.pitch = 89.0;
        if (this.camera.pitch < -89.0)
            this.camera.pitch = -89.0;
  
        for(let i = 0; i < this.module.area.cameras.length; i++){
          let cam = this.module.area.cameras[i];
          cam.InitProperties();
          let camera = new THREE.PerspectiveCamera(cam.FieldOfView, this.$tabContent.innerWidth() / this.$tabContent.innerHeight(), 0.1, 1500);
          camera.up = new THREE.Vector3( 0, 0, 1 );
          camera.AxisFront = new THREE.Vector3(0.0, 1.0, 0.0);
          camera.position.set(cam.position.x, cam.position.y, cam.position.z + cam.Height);
  
          camera.rotation.set(Math.PI / 2, Math.atan2(cam.quaternion.x, cam.quaternion.w), 0);
  
          let ypr = this.toEulerianAngle(camera.quaternion);
  
          camera.pitch = THREE.Math.radToDeg(ypr.pitch);
          camera.yaw = THREE.Math.radToDeg(ypr.roll) * -1;
  
          if (camera.pitch > 89.0)
              camera.pitch = 89.0;
          if (camera.pitch < -89.0)
              camera.pitch = -89.0;
  
  
          //let euler = new THREE.Euler();
          //euler.setFromQuaternion(camera.quaternion);
          //camera.testEuler = euler;
          //camera.yaw = THREE.Math.radToDeg(euler.x) - 90;
          //camera.pitch = cam.Pitch - 90.0;
  
          //camera.yaw = ypr.pitch;
          //camera.pitch = cam.Pitch;// - 90.0;
  
          this.staticCameras.push(camera);
  
        }
  
        //this.module.rooms.reverse();
        this.loadScene( () => {

          this.resetCameraPosition();

          this.buildSceneTree();
          loader.Dismiss();
          this.Render();
  
          this.updateInfoBox();
          this.cam_controls.target.set(Game.module.Mod_Entry_X, Game.module.Mod_Entry_Y, Game.module.Mod_Entry_Z);
        });
      });

    }catch(e){
      console.log(e);
    }
    console.log('Init Engine');

    this.signals.objectSelected.add( ( object ) => {

      let $content = $('div > div', this.$containerObjProps);
      $content.html('');

      if(object != null){

        let $inputName = $('<input type="text" disabled />');
        let $inputTemplateResRef = $('<input type="text" disabled />');
        let $btnTemplateResRef = $('<button class="btn btn-default">Choose</button>');
        let $btnTemplateResRefEdit = $('<button class="btn btn-default">Edit</button>');

        $inputName.val(object.name);
        $inputTemplateResRef.val(object.moduleObject.templateResRef);

        $content.append($inputTemplateResRef).append($btnTemplateResRef).append($btnTemplateResRefEdit);

        $btnTemplateResRef.click( (e) => {
          e.preventDefault();

          let resType = undefined;

          if(object.moduleObject instanceof ModuleCreature)
            resType = ResourceTypes.utc;

            if(object.moduleObject instanceof ModuleDoor)
            resType = ResourceTypes.utd;

          if(object.moduleObject instanceof ModulePlaceable)
            resType = ResourceTypes.utp;

          if(object.moduleObject instanceof ModuleTrigger)
            resType = ResourceTypes.utt;
          
          if(object.moduleObject instanceof ModuleStore)
            resType = ResourceTypes.utm;

          if(object.moduleObject instanceof ModuleItem)
            resType = ResourceTypes.uti;

          if(object.moduleObject instanceof ModuleWaypoint)
            resType = ResourceTypes.utw;

          if(resType){

            let picker = new TemplateResRefPickerWizard({
              selected: object.moduleObject.templateResRef,
              restype: resType,
              onChoose: (selected) => {
                let moduleObject = object.moduleObject;
                console.log(selected, moduleObject);

                loader.SetMessage('Reloading Template...');
                loader.Show();

                let instance = GFFObject.FromStruct(moduleObject.toToolsetInstance());
                instance.GetFieldByLabel('TemplateResRef').SetValue(selected);
                moduleObject.template = instance;
                $inputTemplateResRef.val(selected);
                moduleObject.Load( () => {
                  moduleObject.LoadModel( (model) => {
                    model.moduleObject = moduleObject; 
                    this.select(model);
                    loader.Dismiss();
                  });
                });
              }
            });

          }

        });

        $btnTemplateResRefEdit.click( (e) => {
          e.preventDefault();

          if(object.moduleObject.template instanceof UTCObject){
            let newUTCTab = tabManager.AddTab(new UTCEditorTab({gff: object.moduleObject.template.gff}));
          }else if(object.moduleObject.template instanceof UTDObject){
            let newUTDTab = tabManager.AddTab(new UTDEditorTab({gff: object.moduleObject.template.gff}));
          }else if(object.moduleObject.template instanceof UTPObject){
            let newUTPTab = tabManager.AddTab(new UTPEditorTab({gff: object.moduleObject.template.gff}));
          }

        });


      }

      /*
      if(this.editor.selected != null){
        if(this.editor.selected.parent.moduleObject != null){
          console.log('Set Object')
          //objProps.SetObject(this.editor.selected.parent.moduleObject);
        }else{
          console.log('Can\'t Set Object')
        }
      }
      */

    });

  }

  resetCameraPosition(){
    if(this.module)
      this.camera.position.set( this.module.Mod_Entry_X, this.module.Mod_Entry_Y, this.module.Mod_Entry_Z );
  }

  toEulerianAngle(q){
  	let ysqr = q.y * q.y;

  	// roll (x-axis rotation)
  	let t0 = +2.0 * (q.w * q.x + q.y * q.z);
  	let t1 = +1.0 - 2.0 * (q.x * q.x + ysqr);
  	let roll = Math.atan2(t0, t1);

  	// pitch (y-axis rotation)
  	let t2 = +2.0 * (q.w * q.y - q.z * q.x);
  	t2 = t2 > 1.0 ? 1.0 : t2;
  	t2 = t2 < -1.0 ? -1.0 : t2;
  	let pitch = Math.asin(t2);

  	// yaw (z-axis rotation)
  	let t3 = +2.0 * (q.w * q.z + q.x *q.y);
  	let t4 = +1.0 - 2.0 * (ysqr + q.z * q.z);
  	let yaw = Math.atan2(t3, t4);

    return {yaw: yaw, pitch: pitch, roll: roll};
  }

  onResize () {
    super.onResize();
    try{
      this.EngineSizeUpdate();
    }catch(e){

    }
  }

  onDestroy(){
    super.onDestroy();
    this.audio.Destroy();
  }

  updateInfoBox(){

    this.$infoPane.text(`Camera X: ${this.currentCamera.position.x}, Y: ${this.currentCamera.position.y}, Z: ${this.currentCamera.position.z}`);
    setTimeout( () => { this.updateInfoBox() }, 250 );

  }

  select ( object ) {
    console.log('ModuleEditorTab', 'select', object);
    if(this.selected === object) return;

    this.axes.detach();
    this.axes.attach( object );
    if(this.controls.CurrentTool != this.controls.TOOL.SELECT){
      this.axes.visible = true;
    }else{
      this.axes.visible = false;
    }

    this.selected = object;
    this.signals.objectSelected.dispatch( object );
  }

  toggleNodeVisibility(nodeType = 0){
    switch(nodeType){
      case ModuleEditorTab.NODES.ROOM:
        this.group.rooms.visible = !this.group.rooms.visible;
      break;
      case ModuleEditorTab.NODES.CREATURE:
        this.group.creatures.visible = !this.group.creatures.visible;
        Config.options.Editor.Module.Helpers.creature.visible = this.group.creatures.visible;
      break;
      case ModuleEditorTab.NODES.PLACEABLE:
        this.group.placeables.visible = !this.group.placeables.visible;
        Config.options.Editor.Module.Helpers.placeable.visible = this.group.placeables.visible;
      break;
      case ModuleEditorTab.NODES.DOOR:
        this.group.doors.visible = !this.group.doors.visible;
        Config.options.Editor.Module.Helpers.door.visible = this.group.doors.visible;
      break;
      case ModuleEditorTab.NODES.WAYPOINT:
        this.group.waypoints.visible = !this.group.waypoints.visible;
        Config.options.Editor.Module.Helpers.waypoint.visible = this.group.waypoints.visible;
      break;
      case ModuleEditorTab.NODES.TRIGGER:
        this.group.triggers.visible = !this.group.triggers.visible;
        Config.options.Editor.Module.Helpers.trigger.visible = this.group.triggers.visible;
      break;
      case ModuleEditorTab.NODES.SOUND:
        this.group.sounds.visible = !this.group.sounds.visible;
        Config.options.Editor.Module.Helpers.sound.visible = this.group.sounds.visible;
      break;
      case ModuleEditorTab.NODES.WALKMESH:
        console.log('Toggle walkmeshVisibility', this.group.rooms)
        this.walkmeshVisibility = !this.walkmeshVisibility;

        this.group.rooms.traverse( (node) => {
          if(node.isWalkmesh){
            console.log('setNodeVisibility', node);
            node.visible = this.walkmeshVisibility;
            node.traverse( (node) => {
              node.visible = this.walkmeshVisibility;
            });
          }
        });

        //Config.options.Editor.Module.Helpers.sound.visible = this.group.sounds.visible;
      break;
    }
    Config.save(null, true);
  }

  addNewDoor() {

    let vec = this.getCameraBasedPos();

    let door = new ModuleDoor({
      'TemplateResRef': 'sw_door_dan1',
      'X': vec.x,
      'Y': vec.y,
      'Z': vec.z
    });
    loader.Show();
    loader.SetMessage('Loading Door');
    door.LoadTemplate( (template) => {
      template.LoadModel( (model) => {

        //console.log('loaded', modelName);
        //model.translateX(door.props['X']);
        //model.translateY(door.props['Y']);
        //model.translateZ(door.props['Z']);

        model.rotation.set(0, 0, door.props['Bearing']);
        template.model.moduleObject = door;

        this.group.doors.add( model );

        loader.Dismiss();
      });
    });

  }

  addNewPlaceable () {

    let vec = this.getCameraBasedPos();

    let viewportSize = this.renderer.getSize();
    let viewportMiddle = new THREE.Vector2(viewportSize.width / 2, viewportSize.height / 2);

    this.raycaster.setFromCamera( viewportMiddle, this.currentCamera );
    let intersections = this.raycaster.intersectObjects( this.group.rooms.children, true );
    let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    console.log('addNewPlaceable', intersection, intersections);
    if ( intersection !== null) {
      vec = intersection.point;
    }

    this.cursorGroup = new THREE.Group();


    let plc = new ModulePlaceable(
      ModuleObject.TemplateFromJSON({
        'TemplateResRef': 'plc_footlker',
        'X': vec.x,
        'Y': vec.y,
        'Z': vec.z
      })
    );
    loader.Show();
    loader.SetMessage('Loading Placeable');
    plc.LoadTemplate( (template) => {
      template.LoadModel( (model) => {

        //model.translateX(plc.props['X']);
        //model.translateY(plc.props['Y']);
        //model.translateZ(plc.props['Z']);
        template.model.moduleObject = plc;
        model.rotation.set(0, 0, plc.props['Bearing']);

        this.cursorGroup.add( model );

        loader.Dismiss();
      });
    });
  }

  addNewSound () {

  }

  getCameraBasedPos () {
    let cx, cy, cz, lx, ly, lz;
    let dir = new THREE.Vector3(0,0,-1);

    dir.applyAxisAngle(new THREE.Vector3( 1, 0, 0 ), this.camera.rotation.x);
    dir.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), this.camera.rotation.y);
    dir.applyAxisAngle(new THREE.Vector3( 0, 0, 1 ), this.camera.rotation.z);
    let dist = -5;

    cx = this.camera.position.x;
    cy = this.camera.position.y;
    cz = this.camera.position.z;

    lx = dir.x;
    ly = dir.y;
    lz = dir.z;

    let l = Math.sqrt((dist*dist)/(lx*lx+ly*ly+lz*lz));

    let x1, x2;
    let y1, y2;
    let z1, z2;

    x1 = cx + lx*l;
    x2 = cx - lx*l;

    y1 = cy + ly*l;
    y2 = cy - ly*l;

    z1 = cz + lz*l;
    z2 = cz - lz*l;

    return {x: x1, y: y1, z: this.camera.position.z};
  }

  buildSceneTree(){
    $('#scene-tree').html('');
    let treeIndex = 0;

    let $nodeScene = $('<li><input class="node-toggle" type="checkbox" checked="checked" id="module-scene-tree-'+(treeIndex)+'"><label for="module-scene-tree-'+(treeIndex++)+'">Area</label><span></span><ul></ul></li>');

    let $nodeSceneUL = $('ul', $nodeScene);

    let areaGroups = [
      {name: 'Creatures', array: this.module.area.creatures},
      {name: 'Doors', array: this.module.area.doors},
      {name: 'Encounters', array: this.module.area.encounters},
      {name: 'Items', array: this.module.area.items},
      {name: 'Merchants', array: this.module.area.stores},
      {name: 'Placeables', array: this.module.area.placeables},
      {name: 'Rooms', array: this.module.area.rooms},
      {name: 'Sounds', array: this.module.area.sounds},
      {name: 'Triggers', array: this.module.area.triggers},
      {name: 'Waypoints', array: this.module.area.waypoints}
    ];

    for (let i = 0, len = areaGroups.length; i < len; i++) {
      let group = areaGroups[i];

      let $nodeGroup = $('<li><input class="node-toggle" type="checkbox" checked="" id="module-scene-tree-'+(treeIndex)+'"><label for="module-scene-tree-'+(treeIndex++)+'">'+group.name.titleCase()+'</label><span></span><ul></ul></li>');
      let $nodeGroupUL = $('ul', $nodeGroup);

      let len = group.array.length;
      let children = group.array;

      for(let j = 0; j < len; j++){
        let child = children[j];
        let nth = j+1;

        let name = group.name.slice(0, -1).titleCase()+' '+((nth < 10) ? ("0" + nth) : nth);

        if(typeof child.getName === 'function')
          name = child.getName();

        let $node = $('<li>'+name+'</li>');
        $node.on('click', (e) => {
          e.preventDefault();
          if(child instanceof ModuleObject){
            if(child.model instanceof THREE.AuroraModel){
              this.select(child.model);
            }
          }

        });
        $nodeGroupUL.append($node);

      }

      $nodeSceneUL.append($nodeGroup);

    }

    $('#scene-tree', this.$containerScene).append($nodeScene);




  }

  async loadPlayer(){

    return new Promise( (resolve, reject) => {

      console.log('Loading Player')

      let player = new ModuleCreature(this.module.area.getPlayerTemplate());
      player.partyID = -1;
      player.id = ModuleObject.GetNextPlayerId();

      player.Load( () => {
        if(GameKey == 'TSL'){
          player.appearance = 134;
          player.gender = 1;
          player.portrait = 10;
        }
        player.LoadScripts( () => {
          player.LoadModel( (model) => {
  
            let spawnLoc = this.module.area.getSpawnLocation();
  
            player.position.x = spawnLoc.XPosition;
            player.position.y = spawnLoc.YPosition;
            player.position.z = spawnLoc.ZPosition;
            player.setFacing(-Math.atan2(spawnLoc.XOrientation, spawnLoc.YOrientation), true);
            //player.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan2(spawnLoc.XOrientation, spawnLoc.YOrientation));
            player.computeBoundingBox();
            model.moduleObject = player;
            model.hasCollision = true;

            this.group.player.add(model);
  
            resolve();
          });
        });
      });

      this.player = player;

    });

  }

  async loadScene( onLoad = null ){

    await this.loadDoors();
    await this.loadPlaceables();
    await this.loadCreatures();
    await this.loadSoundTemplates();
    await this.loadTriggers();
    await this.loadWaypoints();
    await this.loadRooms();
    await this.loadTextures();
    await this.loadAudio();
    await this.loadPlayer();

    if(typeof onLoad === 'function')
      onLoad();

  }

  async loadDoors() {

    return new Promise( (resolve, reject) => {
      console.log('Loading Doors');
      let loop = new AsyncLoop({
        array: this.module.area.doors,
        onLoop: (door, asyncLoop) => {
          //loader.SetMessage('Loading Door: '+(i+1)+'/'+this.triggers.length);
          door.context = this;
          door.Load( () => {
            door.LoadModel( (model) => {
              //model.translateX(door.getX());
              //model.translateY(door.getY());
              //model.translateZ(door.getZ());
  
              model.rotation.set(0, 0, door.getBearing());
              door.model.box = door.box = new THREE.Box3().setFromObject(door.getModel());
              this.group.doors.add( model );
            });
          });
          asyncLoop.next();
        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }


  async loadPlaceables(){

    return new Promise( (resolve, reject) => {
      console.log('Loading Placeables');
      let loop = new AsyncLoop({
        array: this.module.area.placeables,
        onLoop: (plc, asyncLoop) => {
          //loader.SetMessage('Loading Placeable: '+(i+1)+'/'+this.triggers.length);
          plc.context = this;
          plc.Load( () => {
            plc.position.set(plc.getX(), plc.getY(), plc.getZ());
            plc.rotation.set(0, 0, plc.getBearing());
            plc.LoadModel( (model) => {
              //plc.LoadWalkmesh(model.name, (pwk) => {
                //console.log('loaded', modelName);
    
                this.group.placeables.add( model );
    
                try{
                  //model.add(pwk.model);
                  //model.walkmesh = pwk;
                  //Game.walkmeshList.push(pwk.mesh);
                }catch(e){
                  console.error('Failed to add pwk', model.name, pwk);
                }
              //});
            });
          });
          asyncLoop.next();
        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadWaypoints(){

    return new Promise( (resolve, reject) => {
      console.log('Loading Waypoints');
      let loop = new AsyncLoop({
        array: this.module.area.waypoints,
        onLoop: (waypoint, asyncLoop) => {
          //loader.SetMessage('Loading Waypoint: '+(i+1)+'/'+this.triggers.length);
          waypoint.context = this;
          waypoint.Load( () => {
            //waypnt.LoadModel( (mesh) => {
              // wpObj.position.set(waypnt.getXPosition(), waypnt.getYPosition(), waypnt.getZPosition());
              // wpObj.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.atan2(-waypnt.getYOrientation(), -waypnt.getXOrientation()));
              // wpObj.mesh.moduleObject = waypnt;
              // this.group.waypoints.add(wpObj.mesh);
              asyncLoop.next();
            //});
          });

        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadTriggers(){

    return new Promise( (resolve, reject) => {
      console.log('Loading Triggers');
      let loop = new AsyncLoop({
        array: this.module.area.triggers,
        onLoop: (trig, asyncLoop) => {
          trig.context = this;
          trig.Load( () => {
            this.group.triggers.add(trig.mesh);
            asyncLoop.next();
          });
          //loader.SetMessage('Loading Trigger: '+(i+1)+'/'+this.triggers.length);
          /*trig.LoadTemplate( (template) => {
            let type = template.gff.GetFieldByLabel('Type').Value;
            let trigGeom = new THREE.Geometry();
    
            //Push verticies
            for(let tgvi = 0; tgvi < trig.props.Geometry.length; tgvi++){
              let tgv = trig.props.Geometry[tgvi];
              trigGeom.vertices[tgvi] = new THREE.Vector3( tgv.PointX,  tgv.PointY, tgv.PointZ );
            }
    
            //Set Faces
            trigGeom.faces.push(
              new THREE.Face3(2,0,1),
              new THREE.Face3(3,0,2)
            );
    
            trigGeom.computeBoundingSphere();
    
            let material = new THREE.MeshBasicMaterial({
               color: new THREE.Color( 0xFFFFFF ),
               side: THREE.DoubleSide
            });
    
            switch(type){
              case UTTObject.Type.GENERIC:
                material.color.setHex(0xFF0000)
              break;
              case UTTObject.Type.TRANSITION:
                material.color.setHex(0x00FF00)
              break;
              case UTTObject.Type.TRAP:
                material.color.setHex(0xFFEB00)
              break;
            }
    
            template.mesh = new THREE.Mesh( trigGeom, material );
            template.mesh.position.set(trig.props.XPosition, trig.props.YPosition, trig.props.ZPosition);
            template.mesh.rotation.set(trig.props.XOrientation, trig.props.YOrientation, trig.props.ZOrientation);
            template.mesh.moduleObject = trig;
            
          });*/

        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadCreatures(){

    return new Promise( (resolve, reject) => {
      console.log('Loading Creatures');
      let loop = new AsyncLoop({
        array: this.module.area.creatures,
        onLoop: (crt, asyncLoop) => {
          crt.context = this;
          crt.Load( () => {
            crt.LoadModel( (model) => {
              crt.model.moduleObject = crt;
              crt.position.x = (crt.getXPosition());
              crt.position.y = (crt.getYPosition());
              crt.position.z = (crt.getZPosition());
              
              //crt.setFacing(Math.atan2(crt.getXOrientation(), crt.getYOrientation()) + Math.PI/2, true);
              crt.setFacing(-Math.atan2(crt.getXOrientation(), crt.getYOrientation()), true);
  
              model.hasCollision = true;
              model.name = crt.getTag();
              //try{ model.buildSkeleton(); }catch(e){}
              this.group.creatures.add( model );
              asyncLoop.next();
            });
          });

        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadRooms(){

    return new Promise( (resolve, reject) => {
      console.log('Loading Rooms');
      let loop = new AsyncLoop({
        array: this.module.area.rooms,
        onLoop: (room, asyncLoop) => {
          room.context = this;
          room.load( (room) => {
            room.model.moduleObject = room;
            this.group.rooms.add(room.model);
            asyncLoop.next();
          });
        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadSoundTemplates (){

    return new Promise( (resolve, reject) => {
      console.log('Loading Sound Emitters');
      let loop = new AsyncLoop({
        array: this.module.area.sounds,
        onLoop: (sound, asyncLoop) => {
          sound.Load( () => {
            sound.LoadSound( () => {
              sound.LoadModel( (model) => {
                this.group.sounds.add(model);
                asyncLoop.next();
              });
            });
          });
        }
      });
      loop.iterate(() => {
        resolve();
      });
    });

  }

  async loadAudio(){

    return new Promise( (resolve, reject) => {

      let ambientDay = Global.kotor2DA['ambientsound'].rows[editor3d.module.audio.AmbientSndDay].resource;

      AudioLoader.LoadAmbientSound(ambientDay, (data) => {
        console.log('Loaded Ambient Sound', ambientDay);
        this.audio.SetAmbientSound(data);

        let bgMusic = Global.kotor2DA['ambientmusic'].rows[editor3d.module.audio.MusicDay].resource;

        AudioLoader.LoadMusic(bgMusic, (data) => {
          console.log('Loaded Background Music', bgMusic);
          this.audio.SetBackgroundMusic(data);
          resolve();

        }, () => {
          console.error('Background Music not found', bgMusic);
          resolve();
        });

      }, () => {
        console.error('Ambient Audio not found', ambientDay);
        resolve();
      });

    });

  }

  async loadTextures(){
    return new Promise( (resolve, reject) => {
      TextureLoader.LoadQueue(() => {
        resolve();
      }, (texName) => {
        loader.SetMessage('Loading Textures: '+texName);
      });
    });
  }

  Save(){

    if(this.module instanceof Module){

      let ifo = this.module.toolsetExportIFO();
      ifo.Export( path.join(project.directory, 'module.ifo'), () => {
        console.log(`module.IFO saved!`);
        let are = this.module.area.toolsetExportARE();
        are.Export( path.join(project.directory, `${this.module.area._name}.are`), () => {
          console.log(`${this.module.area._name}.are saved!`);
          let git = this.module.area.toolsetExportGIT();
          git.Export( path.join(project.directory, `${this.module.area._name}.git`), () => {
            console.log(`${this.module.area._name}.git saved!`);
            
            console.log('Completed module and Area save!');

          }, () => {
            console.error(`Couldn't save ${this.module.area._name}.git`);
          });
        }, () => {
          console.error(`Couldn't save ${this.module.area._name}.are`);
        });
      }, () => {
        console.error(`Couldn't save module.IFO`);
      });

    }

  }

  setMode(mode = 0){
    this.mode = mode;
    switch(mode){
      case ModuleEditorTab.MODES.PREVIEW:
        this.currentCamera = this.followerCamera;
        this.group.player.visible = true;

        let spawnLoc = this.module.area.getSpawnLocation();
  
        this.player.position.x = spawnLoc.XPosition;
        this.player.position.y = spawnLoc.YPosition;
        this.player.position.z = spawnLoc.ZPosition;
        this.player.setFacing(-Math.atan2(spawnLoc.XOrientation, spawnLoc.YOrientation), true);

        this.followerCamera.facing = -Math.atan2(spawnLoc.XOrientation, spawnLoc.YOrientation) + Math.PI/2;
        this.cam_controls.enabled = false;
      break;
      default:
        this.currentCamera = this.camera;
        this.group.player.visible = false;
        this.cam_controls.enabled = true;
      break;
    }

  }

  updateFollowerCamera(delta = 0) {
    
    /*for(let i = 0; i < this.octree_walkmesh.objects.length; i++){
      let obj = this.octree_walkmesh.objects[i];
      if(obj instanceof THREE.Mesh){
        obj.visible = true;
      }
    }*/

    let followee = this.player;

    let camStyle = this.module.getCameraStyle();
    let cameraHeight = parseFloat(camStyle.height); //Should be aquired from the appropriate camerastyle.2da row set by the current module

    let offsetHeight = 0;

    //if(this.Mode == this.MODES.MINIGAME){
    //  offsetHeight = 1;
    //}else{
      if(!isNaN(parseFloat(followee.getAppearance().cameraheightoffset))){
        offsetHeight = parseFloat(followee.getAppearance().cameraheightoffset);
      }
    //}

    this.followerCamera.pitch = THREE.Math.degToRad(camStyle.pitch);
    
    let camHeight = (1.35 + cameraHeight)-offsetHeight;
    let distance = camStyle.distance * 1;

    // this.raycaster.far = 10;
    
    // this.raycaster.ray.direction.set(Math.cos(this.followerCamera.facing), Math.sin(this.followerCamera.facing), 0).normalize();
    // this.raycaster.ray.origin.set(followee.position.x,followee.position.y,followee.position.z + camHeight);

    // let octreeResults = this.octree_walkmesh.search( this.raycaster.ray.origin, 10, true, this.raycaster.ray.direction )
    // let intersects = this.raycaster.intersectOctreeObjects( octreeResults );
    // if ( intersects.length > 0 ) {
    //   for(let i = 0; i < intersects.length; i++){
    //     if(intersects[i].distance < distance){
    //       distance = intersects[i].distance * .75;
    //       //detect = true
    //     }
    //   }
    // }

    // this.raycaster.far = Infinity;

    // for(let i = 0; i < this.octree_walkmesh.objects.length; i++){
    //   let obj = this.octree_walkmesh.objects[i];
    //   if(obj instanceof THREE.Mesh){
    //     obj.visible = false;
    //   }
    // }

    /*if(this.Mode == this.MODES.MINIGAME){

      followee.camera.camerahook.getWorldPosition(this.followerCamera.position);
      followee.camera.camerahook.getWorldQuaternion(this.followerCamera.quaternion);

      switch(this.module.area.Minithis.Type){
        case 1: //SWOOPRACE
          this.followerCamera.fov = this.module.area.Minithis.CameraViewAngle;
        break;
        case 2: //TURRET
          this.followerCamera.fov = this.module.area.Minithis.CameraViewAngle;
        break;
      }
      this.followerCamera.fov = this.module.area.Minithis.CameraViewAngle;

    }else{*/
      this.followerCamera.position.copy(followee.position);

      //If the distance is greater than the last distance applied to the camera. 
      //Increase the distance by the frame delta so it will grow overtime until it
      //reaches the max allowed distance wether by collision or camera settings.
      if(distance > this.followerCamera.distance){
        distance = this.followerCamera.distance += 2 * delta;
      }
        
      this.followerCamera.position.x += distance * Math.cos(this.followerCamera.facing);
      this.followerCamera.position.y += distance * Math.sin(this.followerCamera.facing);
      this.followerCamera.position.z += camHeight;

      this.followerCamera.distance = distance;
    
      this.followerCamera.rotation.order = 'YZX';
      this.followerCamera.rotation.set(this.followerCamera.pitch, 0, this.followerCamera.facing+Math.PI/2);
    //}
    
    this.followerCamera.updateProjectionMatrix();

  }

}

ModuleEditorTab.NODES = {
  NA: 0,
  ROOM: 1,
  CREATURE: 2,
  PLACEABLE: 3,
  DOOR: 4,
  WAYPOINT: 5,
  TRIGGER: 6,
  SOUND: 7,
  WALKMESH: 8,
};

ModuleEditorTab.MODES = {
  EDIT: 0,
  PREVIEW: 1
}

module.exports = ModuleEditorTab;
