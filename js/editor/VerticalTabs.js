class VerticalTabs {

  constructor($tabHost = null){
    let self = this;
    if($tabHost != null){
      this.$tabHost = $tabHost;
      this.$tabBtns = $('ul li a', this.$tabHost);
      this.$tabs = $('.tabs .tab-pane', this.$tabHost);

      this.$tabs.each( function(i){
        //console.log($(this).attr('id'));
        $(this).data('tab-rel', '#'+$(this).attr('id'));
      });

      this.$tabBtns.on('click', function(e) {
        e.preventDefault();
        //console.log($(this));
        let href = $(this).attr('href');
        self.$tabs.hide();
        self.$tabs.each( function(i){
          //console.log(href, $(this).data('tab-rel'))
          if(href == $(this).data('tab-rel')){
            $(this).show();
          }
        });
      });


      this.$tabs.perfectScrollbar().hide();
      this.$tabBtns.first().click();

    }

  }

}

module.exports = VerticalTabs;
