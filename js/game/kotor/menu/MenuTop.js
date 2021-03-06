/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

/* @file
 * The MenuTop menu class.
 */

class MenuTop extends GameMenu {
  
  constructor( args = {} ){
    super(args);

    this.LoadMenu({
      name: 'top',
      onLoad: () => {

        this.LBLH_OPT = this.getControlByName('LBLH_OPT');
        this.LBLH_MAP = this.getControlByName('LBLH_MAP');
        this.LBLH_JOU = this.getControlByName('LBLH_JOU');
        this.LBLH_MSG = this.getControlByName('LBLH_MSG');
        this.LBLH_ABI = this.getControlByName('LBLH_ABI');
        this.LBLH_CHA = this.getControlByName('LBLH_CHA');
        this.LBLH_INV = this.getControlByName('LBLH_INV');
        this.LBLH_EQU = this.getControlByName('LBLH_EQU');

        this.BTN_OPT = this.getControlByName('BTN_OPT');
        this.BTN_MAP = this.getControlByName('BTN_MAP');
        this.BTN_JOU = this.getControlByName('BTN_JOU');
        this.BTN_MSG = this.getControlByName('BTN_MSG');
        this.BTN_ABI = this.getControlByName('BTN_ABI');
        this.BTN_CHAR = this.getControlByName('BTN_CHAR');
        this.BTN_INV = this.getControlByName('BTN_INV');
        this.BTN_EQU = this.getControlByName('BTN_EQU');

        /*this.LBLH_OPT.hideBorder();
        this.LBLH_MAP.hideBorder();
        this.LBLH_JOU.hideBorder();
        this.LBLH_MSG.hideBorder();
        this.LBLH_ABI.hideBorder();
        this.LBLH_CHA.hideBorder();
        this.LBLH_INV.hideBorder();
        this.LBLH_EQU.hideBorder();*/

        this.BTN_MSG.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuMessages.Open();
        });

        this.BTN_JOU.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuJournal.Open();
        });

        this.BTN_MAP.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuMap.Open();
        });

        this.BTN_OPT.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuOptions.Open();
        });

        this.BTN_CHAR.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuCharacter.Open();
        });

        this.BTN_ABI.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuAbilities.Open();
        });

        this.BTN_INV.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuInventory.Open();
        });

        this.BTN_EQU.addEventListener('click', (e) => {
          e.stopPropagation();
          this.CloseAllOtherMenus();
          Game.MenuEquipment.Open();
        });

        this.tGuiPanel.offset.y = 198;
        this.RecalculatePosition();

        if(typeof this.onLoad === 'function')
          this.onLoad();

      }
    })

  }

  
  CloseAllOtherMenus(){
    let currentMenu = MenuManager.GetCurrentMenu();
    
    if(currentMenu == Game.MenuAbilities ||
      currentMenu == Game.MenuInventory ||
      currentMenu == Game.MenuJournal ||
      currentMenu == Game.MenuMap ||
      currentMenu == Game.MenuMessages ||
      currentMenu == Game.MenuOptions ||
      currentMenu == Game.MenuCharacter ||
      currentMenu == Game.MenuEquipment ){
        currentMenu.Close();
    }

  }

}

module.exports = MenuTop;