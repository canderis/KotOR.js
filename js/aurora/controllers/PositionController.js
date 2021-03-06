class PositionController extends OdysseyController {

  constructor( controller = undefined ){
    super(controller);
  }

  setFrame(manager = undefined, anim = undefined, controller = undefined, data = undefined){
    if(typeof manager.modelNode.controllers.get(AuroraModel.ControllerType.Position) != 'undefined'){

      if(manager.trans && controller.frameCount > 1){
        manager.modelNode.trans.position.copy(manager.modelNode.position);
        anim._position.copy(manager.modelNode.trans.position);
      }else{
        anim._position.copy(manager.modelNode.controllers.get(AuroraModel.ControllerType.Position).data[0]);
      }

      if(anim.name.indexOf('CUT') > -1 && manager.modelNode.name == 'cutscenedummy'){
        anim._position.sub(manager.model.position);
      }

    }
    if(manager.trans && controller.frameCount > 1){
      manager.modelNode.position.lerp(anim._position.add(data), anim.data.delta);
    }else{
      manager.modelNode.position.copy(anim._position.add(data));
    }
    manager.modelNode.updateMatrix();
  }

  animate(manager = undefined, anim = undefined, controller = undefined, last = undefined, next = undefined, fl = 0){
    //if(last.x == next.x && last.y == next.y && last.z == next.z)
    //  break;

    //Cache the position controller
    if(manager.modelNode.controllers.hasPosition === undefined){
      let _controller = manager.modelNode.controllers.get(AuroraModel.ControllerType.Position);
      if(typeof _controller != 'undefined'){
        manager.modelNode.controllers.hasPosition = true;
        manager.modelNode.controllers.position = _controller;
      }else{
        manager.modelNode.controllers.hasPosition = false;
        manager.modelNode.controllers.position = undefined;
      }
    }

    if(manager.modelNode.controllers.hasPosition){
      anim._position.copy(manager.modelNode.controllers.position.data[0]);
      if(anim.name.indexOf('CUT') > -1 && manager.modelNode.name == 'cutscenedummy'){
        anim._position.sub(manager.model.position);
      }
    }

    if(last.isBezier){
      //Last point
      if(last.isLinearBezier){
        manager._vec3.copy(last.bezier.getPoint(0)).add(anim._position);
        manager.modelNode.position.copy(manager._vec3);
      }else{
        manager._vec3.copy(last.bezier.getPoint((0.5 * fl) + 0.5).add(anim._position));
        manager.modelNode.position.copy(manager._vec3);
      }

      //Next point
      //if(next.isLinearBezier){
        manager._vec3.copy(next.bezier.getPoint( next.lastFrame ? 0 : 0.5 )).add(anim._position);
        manager.modelNode.position.lerp(manager._vec3, fl);
      //}else{
      //  manager._vec3.copy(next.bezier.getPoint(0.5 * fl).add(anim._position));
      //  manager.modelNode.position.lerp(manager._vec3, fl);
      //}
    }else if(next.isBezier){
      //Last point
      manager._vec3.copy(last).add(anim._position);
      manager.modelNode.position.copy(manager._vec3);
      //Next point
      if(next.isLinearBezier){
        manager._vec3.copy(next.bezier.getPoint(0)).add(anim._position);
        manager.modelNode.position.lerp(manager._vec3, fl);
      }else{
        manager._vec3.copy(next.bezier.getPoint(0.5 * fl)).add(anim._position);
        manager.modelNode.position.lerp(manager._vec3, fl);
      }
    }else{
      
      //if(manager.trans && lastFrame == 0){
      //  manager.modelNode.position.copy(manager.modelNode.trans.position);
      //}else{
        manager._vec3.copy(last).add(anim._position);
        manager.modelNode.position.copy(manager._vec3);
      //}

      manager._vec3.copy(next);
      manager._vec3.add(anim._position);

      // if(anim.data.elapsed > anim.transition){
      //   manager.modelNode.position.copy(last);
      //   manager.modelNode.position.add(anim._position);
      // }
      manager.modelNode.position.lerp(manager._vec3, fl);
    }
    manager.modelNode.updateMatrix();
  }

}

module.exports = PositionController;