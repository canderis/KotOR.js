class GameEffect {
  constructor(){
    this.creator = undefined;
    this.durationType = 0;
    this.duration = 0;
    this.expireDay = 0;
    this.expireTime = 0;
    this.spellId = -1;
    this.subType = 0;
    this.skipOnLoad = 0;

    this.applied = false;
    this.initialized = false;
    this.durationEnded = false;

  }

  initialize(){
    if(this.initialized)
      return this;

    if(!isNaN(this.creator)){
      this.creator = ModuleObject.GetObjectById(this.creator);
    }

    this.initialized = true;
    return this;
  }

  setDurationType(durationType = 0){
    this.durationType = durationType;
  }

  setDuration(duration = 0){
    this.duration = duration;
  }

  setExpireDay(expireDay = 0){
    this.expireDay = expireDay;
  }

  setExpireTime(expireTime = 0){
    this.expireTime = expireTime;
  }

  setObject(obj = undefined){
    this.object = obj;
  }

  setCreator(oCreator = undefined){
    this.creator = oCreator;
  }

  setSpellId(nSpellId = -1){
    this.spellId = nSpellId;
  }

  setSubType(nSubType = 0){
    this.subType = nSubType;
  }

  getCreator(){
    return this.creator;
  }

  getDuration(){
    return this.duration;
  }

  getDurationType(){
    return this.durationType;
  }

  getExpireDay(){
    return this.expireDay;
  }

  getExpireTime(){
    return this.expireTime;
  }

  getSpellId(){
    return this.spellId || -1;
  }

  getSubType(){
    return this.subType;
  }

  setSkipOnLoad( bSkipOnLoad = true ){
    this.skipOnLoad = bSkipOnLoad ? true : false;
  }

  update(delta){
    if(this.durationType == GameEffect.DurationType.TEMPORARY){
      if(this.duration <= 0){
        this.onDurationEnd();
        return;
      }
      this.duration -= delta;
    }
  }

  dispose(){
    
  }

  ///////////////
  // Effect Events
  ///////////////

  //Called when the effect is applied ingame
  onApply(){
    if(this.applied)
      return;

    this.applied = true;
  }

  //When the effect is removed ingame
  onRemove(){

  }
  
  //When the effect duration has expired
  onDurationEnd(){
    this.durationEnded = true;
    if(this.object instanceof ModuleObject){
      this.object.removeEffect(this);
    }else{
      this.onRemove();
    }
  }

  static EffectFromStruct( struct = undefined ){
    if(struct instanceof Struct){
      let effect = undefined;

      let eType = struct.GetFieldByLabel('Type').GetValue();
      let eSubType = struct.GetFieldByLabel('SubType').GetValue();
      let eCreator = struct.GetFieldByLabel('CreatorId').GetValue();
      let eSpellId = struct.GetFieldByLabel('SpellId').GetValue();
      
      let eDuration = struct.GetFieldByLabel('Duration').GetValue();
      let eExpireDay = struct.GetFieldByLabel('ExpireDay').GetValue();
      let eExpireTime = struct.GetFieldByLabel('ExpireTime').GetValue();

      let intList = [];
      let floatList = [];
      let stringList = [];
      let objectList = [];

      let tmpList = struct.GetFieldByLabel('IntList').GetChildStructs();
      for(let i = 0, len = tmpList.length; i < len; i++){
        intList[i] = tmpList[i].GetFieldByLabel('Value').GetValue();
      }

      tmpList = struct.GetFieldByLabel('FloatList').GetChildStructs();
      for(let i = 0, len = tmpList.length; i < len; i++){
        floatList[i] = tmpList[i].GetFieldByLabel('Value').GetValue();
      }

      tmpList = struct.GetFieldByLabel('StringList').GetChildStructs();
      for(let i = 0, len = tmpList.length; i < len; i++){
        stringList[i] = tmpList[i].GetFieldByLabel('Value').GetValue();
      }

      tmpList = struct.GetFieldByLabel('ObjectList').GetChildStructs();
      for(let i = 0, len = tmpList.length; i < len; i++){
        objectList[i] = tmpList[i].GetFieldByLabel('Value').GetValue();
      }

      //(???) Means i haven't confirmed this type yet
      switch(eType){
        case 2: //DamageResistance
          effect = new EffectDamageResistance(intList[0], intList[1], intList[2]);
        break;
        case 7: //Regenerate
          effect = new EffectRegenerate(intList[0], intList[1]);
        break;
        case 10: //AttackIncrease
          effect = new EffectAttackIncrease(intList[0], intList[1]);
        break;
        case 11: //AttackDecrease
          effect = new EffectAttackDecrease(intList[0], intList[1]);
        break;
        case 13: //DamageIncrease
          effect = new EffectDamageIncrease(intList[0], intList[1]);
        break;
        case 14: //DamageDecrease (???)
          effect = new EffectDamageDecrease(intList[0], intList[1]);
        break;
        case 22: //Immunity
          effect = new EffectImmunity(intList[0]);
        break;
        case 26: //SavingThrowIncrease
          effect = new EffectSavingThrowIncrease(intList[0], intList[1]);
        break;
        case 27: //SavingThrowDecrease (???)
          effect = new EffectSavingThrowDecrease(intList[0], intList[1]);
        break;
        case 28: //MovementSpeedIncrease
          effect = new EffectMovementSpeedIncrease(intList[0]);
        break;
        case 29: //MovementSpeedDecrease (???)
          effect = new EffectMovementSpeedDecrease(intList[0]);
        break;
        case 30: //VisualEffect
          effect = new EffectVisualEffect(intList[0]);
        break;
        case 35: //EffectPoison
          effect = new EffectPoison(intList[0]);
        break;
        case 36: //AbilityIncrease
          effect = new EffectAbilityIncrease(intList[0], intList[1]);
        break;
        case 37: //AbilityDecrease (???)
          effect = new EffectAbilityDecrease(intList[0], intList[1]);
        break;
        case 48: //ACIncrease
          effect = new EffectACIncrease(intList[1], 0, intList[5]);
        break;
        case 55: //SkillIncrease
          effect = new EffectSkillIncrease(intList[0], intList[1]);
        break;
        case 55: //SkillDecrease (???)
          effect = new EffectSkillDecrease(intList[0], intList[1]);
        break;
        case 62: //Disguise
          effect = new EffectDisguise(intList[0]);
        break;
        case 67: //SetEffectIcon
          effect = new EffectIcon(intList[0]);
        break;
        case 83: //BonusFeat
          effect = new EffectFeat(intList[0]);
        break;
        case 92: //BlasterDeflectionIncrease
          effect = new EffectBlasterDeflectionIncrease(intList[1]);
        break;
        case 93: //BlasterDeflectionDecrease (???)
          effect = new EffectBlasterDeflectionDecrease(intList[1]);
        break;
        case 107: //ForceShield
          effect = new EffectForceShield(intList[0]);
        break;
      }

      let eSkipOnLoad = struct.GetFieldByLabel('SkipOnLoad').GetValue();
      if(!eSkipOnLoad){

        if(typeof effect !== 'undefined'){
          effect.setDuration(eDuration);
          effect.setExpireDay(eExpireDay);
          effect.setExpireTime(eExpireTime);
          effect.setCreator(eCreator);
          effect.setSpellId(eSpellId == 4294967295 ? -1 : eSpellId);
          effect.setSubType(eSubType);

          if(eDuration){
            effect.setDurationType(GameEffect.DurationType.TEMPORARY);
          }
          //console.log('Handled Effect', eType, struct.ToJSON());
        }else{
          console.log('Unhandled Effect', eType, struct.ToJSON());
        }
      }else{
        if(typeof effect !== 'undefined'){
          //console.log('Skipped Effect', eType, struct.ToJSON());
        }else{
          console.log('Unhandled Skipped Effect', eType, struct.ToJSON());
        }
      }

      return effect;
    }
    return undefined;
  }

}

GameEffect.DurationType = {
  INSTANT:   0,
  TEMPORARY: 1,
  PERMANENT: 2,
};

GameEffect.Type = {

  //---------------------------//
  // nwscript.nss Effect Types
  //---------------------------//
  
  EffectInvalidEffect:		undefined,
  EffectDamageResistance:	1,
  //EFFECT_TYPE_ABILITY_BONUS:		2,
  EffectRegenerate:	      3,
  //EFFECT_TYPE_SAVING_THROW_BONUS:		4,
  //EFFECT_TYPE_MODIFY_AC:		5,
  //EFFECT_TYPE_ATTACK_BONUS:		6,
  EffectDamageReduction:		7,
  //EFFECT_TYPE_DAMAGE_BONUS:		8,
  EffectTemporaryHitPoints:		9,
  //EFFECT_TYPE_DAMAGE_IMMUNITY:		10,
  EffectEntangle:		      11,
  EffectInvulnerable:		  12,
  EffectDeaf:		          13,
  EffectRessurection:		  14,
  EffectImmunity:		      15,
  //EFFECT_TYPE_BLIND:		16,
  EffectEnemyAttackBonus:	17,
  EffectArcaneSpellFailure:		18,
  //EFFECT_TYPE_MOVEMENT_SPEED:		19,
  EffectAreaOfEffect:		  20,
  EffectBeam:             21,
  //EFFECT_TYPE_FORCE_RESISTANCE:		22,
  EffectCharmed:	        23,
  EffectConfused:	        24,
  EffectFrightened:	      25,
  EffectDominated:      	26,
  EffectParalyze:	        27,
  EffectDazed:	          28,
  EffectStunned:	        29,
  EffectSleep:	          30,
  EffectPoison:	          31,
  EffectDisease:	        32,
  EffectCurse:	          33,
  EffectSilence:	        34,
  EffectTurned:	          35,
  EffectHaste:	          36,
  EffectSlow:	            37,
  EffectAbilityIncrease:  38,
  EffectAbilityDecrease:  39,
  EffectAttackIncrease:   40,
  EffectAttackDecrease:   41,
  EffectDamageIncrease:   42,
  EffectDamageDecrease:   43,
  EffectDamageImmunityIncrease:   44,
  EffectDamageImmunityDecrease:   45,
  EffectACIncrease:       46,
  EffectACDecrease:       47,
  EffectMovementSpeedIncrease:    48,
  EffectMovementSpeedDecrease:    49,
  EffectSavingThrowIncrease:      50,
  EffectSavingThrowDecrease:      51,
  EffectForceResistanceIncrease:  52,
  EffectForceResistanceDecrease:  53,
  EffectSkillIncrease:		54,
  EffectSkillDecrease:		55,
  EffectInvisibility:			56,
  EffectImprovedInvisibility:			57,
  EffectDarkness:			    58,
  EffectDispellMagic:			59,
  EffectElementalShield:	60,
  EffectNegativeLevel:		61,
  EffectDisguise:			    62,
  EffectSanctuary:			  63,
  EffectTrueseeing:			  64,
  EffectSeeInvisible:			65,
  EffectTimeStop:			    66,
  EffectBlindness:			  67,
  EffectSpellLevelAbsorption:			68,
  EffectDispellMagicBest:	69,
  EffectUltraVision:			70,
  EffectMissChance:			  71,
  EffectConealment:			  72,
  EffectSpellImmunity:		73,
  EffectAssuredHit:       74,
  EffectVisualEffect:     75,
  EffectForcePushed:      80,
  EffectFeat:             83,
  
  //------------------------//
  // Unknown Effect Numbers
  //------------------------//
  EffectDeath:            99999,
  EffectHeal:             99998,
  EffectLink:             99997,
  EffectDamage:           99996,
  EffectForceShield:      99995,
  EffectIcon:             99994,
  EffectDroidStun:        99993,
  EffectChoke:            99992,
  EffectHorrified:        99991
};

module.exports = GameEffect;