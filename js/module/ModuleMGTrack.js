/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

/* @file
 * The ModuleMGTrack class.
 */

class ModuleMGTrack extends ModuleObject {

  constructor(args={}){
    super();

    args = Object.assign({
      track: '',
      x: 0,
      y: 0,
      z: 0
    }, args);

    this.track = args.name.replace(/\0[\s\S]*$/g,'').toLowerCase();
    this.position = new THREE.Vector3(parseFloat(args.x), parseFloat(args.y), parseFloat(args.z));

  }

  Load( onLoad = null ){
    if(typeof onLoad == 'function')
      onLoad();
  }

  LoadModel (onLoad = null){
    Game.ModelLoader.load({
      file: this.track,
      onLoad: (mdl) => {
        THREE.AuroraModel.FromMDL(mdl, {
          onComplete: (model) => {
            try{
              console.log('track', model);
              this.model = model;
              this.position = this.model.position.copy(this.position);
              model.name = this.track;
              if(typeof onLoad == 'function')
                onLoad(this.model);
            }catch(e){
              console.error(e);
              if(typeof onLoad == 'function')
                onLoad(this.model);
            }
          },
          context: this.context,
          castShadow: false,
          receiveShadow: false
        });
      }
    });
  }

}

module.exports = ModuleMGTrack;