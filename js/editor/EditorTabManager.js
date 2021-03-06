class EditorTabManager {

  constructor(){
    this.currentTab = undefined;
    this.tabs = [];
    this.$tabs = $('<ul class="tabs-menu" />').sortable();

    this.$tabsScrollControl = $('<div class="tabs-scroll-control" />');
    this.$tabsScrollControlLeft = $('<div class="tabs-scroll-control-btn left" />');
    this.$tabsScrollControlRight = $('<div class="tabs-scroll-control-btn right" />');

    this.scrollTimer = null;
    this.scrollSpeed = 25;

    this.$tabsScrollControl.append(this.$tabsScrollControlLeft).append(this.$tabsScrollControlRight);

    this.$tabsContainer = $('<div class="tabs tab-content" style="display: block; position:relative; top: 30px; height: calc(100% - 30px);"/>');

    this.signals = {
      tabAdded: new Signal(),
      tabRemoved: new Signal(),
      resized: new Signal()
    };

    this.$tabs.bind('mousewheel', (e) => {
      let amount = e.originalEvent.wheelDelta /120;
      if(amount > 0) { //LEFT
        this.ScrollTabsMenuLeft();
      }
      else{ //RIGHT
        this.ScrollTabsMenuRight();
      }
    });

  }

  AddTab(tab){
    //Check to see if the tab has the singleInstance flag set to TRUE
    if(tab.singleInstance){
      if(this.TabTypeExists(tab)){
        this.GetTabByType(tab.constructor.name).Show();
        return; //Return because the TabManager can only have one of these
      }
    }

    //Check to see if a tab is already editing this resource
    let alreadyOpen = this.IsResourceIdOpenInTab(tab.GetResourceID());
    if(alreadyOpen != null){
      //Show the tab that is already open
      alreadyOpen.Show();
      //return so that the rest of the function is not called
      return;
    }

    tab.Attach(this);
    tab.Show();
    this.tabs.push(tab);
    this.signals.tabAdded.dispatch(tab);
    return tab;
  }

  //Checks the supplied resource ID against all open tabs and returns tab if it is found
  IsResourceIdOpenInTab(resID = null){

    if(resID != null){
      for(let i = 0; i!=this.tabs.length; i++){
        if(this.tabs[i].GetResourceID() == resID){
          return this.tabs[i];
        }
      }
    }

    return null;

  }

  GetTabByType(tabClass){
    for(let i = 0; i!=this.tabs.length; i++){
      if(this.tabs[i].constructor.name === tabClass)
        return this.tabs[i];
    }
    return false;
  }

  TabTypeExists(tab){
    let tabClass = tab.constructor.name;
    for(let i = 0; i!=this.tabs.length; i++){
      if(this.tabs[i].constructor.name === tabClass)
        return true;
    }
    return false;
  }

  HideAll(){
    for(let i = 0; i!=this.tabs.length; i++){
      this.tabs[i].Hide();
    }
  }

  RemoveTab(tab){
    let length = this.tabs.length;
    for(let i = 0; i!=length; i++){
      if(tab == this.tabs[i]){
        console.log('Tab found. Deleting');
        this.tabs[i].$tab.remove();
        this.tabs[i].$tabContent.remove();
        this.signals.tabRemoved.dispatch(this.tabs[i]);
        this.tabs.splice(i, 1);
        break;
      }
    }
    try{
      console.log('Trying to show');
      if(this.tabs.length){
        let t = this.tabs[this.tabs.length-1];
        console.log(t);
        t.Show();
      }
    }catch(e){ console.log(e); }
  }

  //Attaches the TabManager to the DOM
  AttachTo($dom){
    //$dom.append(this.$tabs).append(this.$tabsScrollControl).append(this.$tabsContainer);
    $dom.append(this.$tabs).append(this.$tabsContainer);

    this.$tabsScrollControlLeft.off('mouseenter').off('mouseleave').on('mouseenter', () => {

      if(this.timer != null)
        global.clearTimeout(this.timer)

      let func_scrollL = () => {
        this.ScrollTabsMenuLeft();
        this.timer = setTimeout( () => {
          func_scrollL();
        }, 100);
      };
      func_scrollL();

    }).on('mouseleave', () => {
      if(this.timer != null)
        global.clearTimeout(this.timer)
    });

    this.$tabsScrollControlRight.off('mouseenter').off('mouseleave').on('mouseenter', () => {

      if(this.timer != null)
        global.clearTimeout(this.timer)

      let func_scrollR = () => {
        this.ScrollTabsMenuRight();
        this.timer = setTimeout( () => {
          func_scrollR();
        }, 100);
      };
      func_scrollR();

    }).on('mouseleave', () => {
      if(this.timer != null)
        global.clearTimeout(this.timer)
    });


  }

  ScrollTabsMenuLeft(){
    this.$tabs[0].scrollLeft -= this.scrollSpeed;
  }

  ScrollTabsMenuRight(){
    this.$tabs[0].scrollLeft += this.scrollSpeed;
  }

  TriggerResize(){
    let len = this.tabs.length;
    for(let i = 0; i < len; i++){
      this.tabs[i].onResize();
    }
  }

}

EditorTabManager.__tabId = 0;
EditorTabManager.GetNewTabID = function(){
  console.log(EditorTabManager.__tabId);
  let id = EditorTabManager.__tabId+=1;
  return id;
}

module.exports = EditorTabManager;
