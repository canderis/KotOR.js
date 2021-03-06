/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

/* @file
 * The MenuInventory menu class.
 */

class MenuInventory extends GameMenu {
  
  constructor( args = {} ){
    super(args);

    this.background = 'blackfill';

    this.LoadMenu({
      name: 'inventory_p',
      onLoad: () => {

        //this.lbl_hint = this.getControlByName('LBL_HINT');
        /*this.LB_ITEMS = this.getControlByName('LB_ITEMS');
        this.LBL_PORT = this.getControlByName('LBL_PORT');
        this.BTN_CHANGE1 = this.getControlByName('BTN_CHANGE1');
        this.BTN_CHANGE2 = this.getControlByName('BTN_CHANGE2');*/

        if(typeof this.onLoad === 'function')
          this.onLoad();

      }
    })

  }

  Show(){
    super.Show();
    
    Game.MenuActive = true;
    this.LB_ITEMS.clearItems();
    let inv = InventoryManager.getNonQuestInventory();
    for(let i = 0; i < inv.length; i++){
      this.LB_ITEMS.addItem(inv[i]);
    }

    TextureLoader.LoadQueue();

    this['BTN_CHANGE1'].hide();
    this['BTN_CHANGE2'].hide();

    for(let i = 0; i < PartyManager.party.length; i++){
      let partyMember = PartyManager.party[i];
      let portraitId = partyMember.getPortraitId();
      let portrait = Global.kotor2DA['portraits'].rows[portraitId];

      if(!i){
        
        if(this.LBL_PORT.getFillTextureName() != portrait.baseresref){
          this.LBL_PORT.setFillTextureName(portrait.baseresref)
          TextureLoader.tpcLoader.fetch(portrait.baseresref, (texture) => {
            this.LBL_PORT.setFillTexture(texture);
          });
        }

      }else{
        this['BTN_CHANGE'+(i)].show();
        if(this['BTN_CHANGE'+(i)].getFillTextureName() != portrait.baseresref){
          this['BTN_CHANGE'+(i)].setFillTextureName(portrait.baseresref)
          TextureLoader.tpcLoader.fetch(portrait.baseresref, (texture) => {
            this['BTN_CHANGE'+(i)].setFillTexture(texture);
          });
        }
      }
    }

  }

}

module.exports = MenuInventory;