class ConfigWizard extends Wizard {
  constructor(){
    super();
    console.log('ConfigWizard', this);
    //this.$wizard = $(TemplateEngine.GetTemplate('templates/modal-config.html'));

    TemplateEngine.GetTemplateAsync('templates/modal-config.html', null, (tpl) => {
      this.$wizard = $(tpl);

      this.$content = $('#modal-content', this.$wizard);

      this.$themeTabs = $('<ul class="nav nav-tabs" id="modal-config-theme-tabs" />');
      this.$themeTabContainers = $('<div id="modal-config-theme-tab-containers" class="tab-content" style="display: block;" />');

        // <ul class="nav nav-tabs" id="myTab">
  			//   <li class="active"><a data-target="#home" data-toggle="tab">Home</a></li>
  			//   <li><a data-target="#profile" data-toggle="tab">Profile</a></li>
  			//   <li><a data-target="#messages" data-toggle="tab">Messages</a></li>
  			//   <li><a data-target="#settings" data-toggle="tab">Settings</a></li>
  			// </ul>

      this.$themePage = $('<div />');
      this.$themePage.append(this.$themeTabs).append(this.$themeTabContainers);

      this.$content.append(this.$themePage);

      for(key in Config.options.Theme){
        let index = Object.keys(Config.options.Theme).indexOf(key);
        let tabId = 'modal-config-theme-tabs-'+key.toLowerCase();

        let $tab = $('<li><a data-target="#'+tabId+'" data-toggle="tab">'+key+'</a></li>');
        let $tabContainer = $('<div id="'+tabId+'" class="tab-pane" />');

        if(!index){
          $tab.removeClass('active').addClass('active');
          $tabContainer.removeClass('active').addClass('active');
        }

        this.$themeTabs.append($tab);
        this.$themeTabContainers.append($tabContainer);

        let $themeGroup = $('<div></div>');
        let theme = Config.options.Theme[key];
        for(key in theme){
          let option = theme[key];
          let $picker = this.ColorPicker({
            color: option.color
          }).on('changeColor', (picker) => {
            option.color = picker.color.toHex();
          });
          $themeGroup.append('<label>'+key+'</label>').append($picker);
        }

        $tabContainer.append($themeGroup).append('<br>');
      }

      $('#modal-config-save', this.$wizard).on('click', (e) => {
        e.preventDefault();
        Config.save();
      });


      $('body').append(this.$wizard);
      this.$wizard.filter('.modal').modal({
          backdrop: 'static',
          keyboard: false
      });

      this.Show();

    });

  }


  ColorPicker(options = {}){
    let $colorPicker = $('<div class="input-group color-picker colorpicker-component">'+
        '<input type="text" value="#CCC" class="form-control" />'+
        '<span class="input-group-addon"><i></i></span>'+
    '</div>').colorpicker(options);
    return $colorPicker;
  }

}

module.exports = ConfigWizard;
