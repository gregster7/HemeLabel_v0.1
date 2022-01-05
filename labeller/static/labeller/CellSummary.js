class CellSummary {

    constructor(id_type, id_val) {
      this.id_type = id_type;
      this.id_val = id_val.toString();
    }

    printMe(){
      return this.id_type + ' ' + this.id_val;
    }

    createBigTable() {
      var table = '<table style="border:none" class="slide_page_table" id="classification_table_' +this.id_val+'">';
      table += '<tr class="class_table_row">';
      table += '<th class="class_table_td">Neutrophilic';
      table += '<th class="class_table_td">Other granulocytic';
      table += '<th class="class_table_td">Lymphoid';
      table += '<th class="class_table_td">Erythroid';
      table += '<th class="class_table_td">Megakaryocytic';
      table += '<th class="class_table_td">Misc';

      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M1 '+this.id_val+'">Blast (1):';
      table += '<td class="class_table_td count_E1 '+this.id_val+'">Immature Eo (q):';
      table += '<td class="class_table_td count_L0 '+this.id_val+'">Lymphobast (a):';
      table += '<td class="class_table_td count_ER1 '+this.id_val+'">Pronormoblast (z):';
      table += '<td class="class_table_td count_PL1 '+this.id_val+'">Immature Meg (m):';         
      table += '<td class="class_table_td count_U1 '+this.id_val+'">Artifact (7):';

      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M2 '+this.id_val+'">Promyelocyte (2):';
      table += '<td class="class_table_td count_E2 '+this.id_val+'">Eosinophil (w):';
      table += '<td class="class_table_td count_L1 '+this.id_val+'">Hematogone (s):';
      table += '<td class="class_table_td count_ER2 '+this.id_val+'">Basophilic normoblast (x):'; 
      table += '<td class="class_table_td count_PL2 '+this.id_val+'">Mature Meg (,):';         
      table += '<td class="class_table_td count_U2 '+this.id_val+'">Unknown (8):';

      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M3 '+this.id_val+'">Myelocyte (3):';
      table += '<td class="class_table_td count_B1 '+this.id_val+'">Immature Baso (e):';
      table += '<td class="class_table_td count_L2 '+this.id_val+'">Mature Lymphocyte (d):';
      table += '<td class="class_table_td count_ER3 '+this.id_val+'">Polychromatophilic (c):';            
      table += '<td class="class_table_td count_PL3 '+this.id_val+'">Platelet clump (.):';  
      table += '<td class="class_table_td count_U3 '+this.id_val+'">Other (9):';


      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M4 '+this.id_val+'">Metamyelocyte (4):';
      table += '<td class="class_table_td count_B2 '+this.id_val+'">Basophil (r):';
      table += '<td class="class_table_td count_L3 '+this.id_val+'">LGL (f):';
      table += '<td class="class_table_td count_ER4 '+this.id_val+'">Orthochromic/nuc red (v):';            
      table += '<td class="class_table_td count_PL4 '+this.id_val+'">Giant clump (/):';
      table += '<td class="class_table_td count_UL '+this.id_val+'">Unlabelled (u):';         
      // table += '<td class="class_table_td count_U4 '+this.id_val+'">Histiocyte (0):';

      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M5 '+this.id_val+'">Band (5):';
      table += '<td class="class_table_td count_MO1 '+this.id_val+'">Monoblast (t):';
      table += '<td class="class_table_td count_L4 '+this.id_val+'">Plasma cell (g):';
      table += '<td class="class_table_td count_ER5 '+this.id_val+'">Reticulocyte (b):';   
      table += '<td class="class_table_td">';
      table += '<td class="class_table_td count_U4 '+this.id_val+'">Mitotic body/karyorrhexis (0):';          
      

      table += '<tr class="class_table_row">';
      table += '<td class="class_table_td count_M6 '+this.id_val+'">Seg (6):';
      table += '<td class="class_table_td count_MO2 '+this.id_val+'">Monocyte (y):';
      table += '<td class="class_table_td">';
      table += '<td class="class_table_td count_ER6 '+this.id_val+'">Mature RBC (n):';

      table += '<td class="class_table_td">';
      table += '<td class="class_table_td">';
      table += '</table>';

      return table;
    }

  

    getULForSlide() {

      //slide_path = '/label_slide/'+sid+ '/';
      var ul = '<ul id="slide_list_' + this.id_val + '" class="slide_list slide_list_box">';
      //ul = ul + '<li class="cell_table_id">'+this.id_type+': '+ this.id_val +'</li>';
      // ul = ul + '<li class="label_btn"><a class="slide_label_btn" href= "'+ slide_path+'">Label</a></li>';
      // ul = ul + '<li class="slide_name" id="slide_name_' +sid+ '">Name: ' +slide_name+ '</li>';
      ul = ul + '<li><button type="button" id="slide_info_'+this.id_val+'" class="slide_info">Labelling Summary</li>';
      ul = ul + '<li id="cell_total_'+this.id_val+'"></li></ul>';
      ul = ul + '<div id="bigtable_' +this.id_val+ '" class="bigtable">' +this.createBigTable()+ '</div>';
   
      // ul = ul + '<li class="slide_label_btn" id="slide"'+sid+'">Show Slide Info</li></ul>';
      return ul;
    }

    static UpdateCountsOnPage(cells_json, celltypes_json, id_val) {
      // var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig, '"'));
      var cells = Cell.LoadCellsFromJson(cells_json, celltypes_json);
      var counts = CellCounter.countCells(cells);
      console.log(counts)

      for (var key in Cell.classLabelDict) {
        CellCounter.replaceOldCountWithNewCount(".class_table_td.count_"+key+'.'+id_val, counts[key]);
      };
    };
    
    addInfoButtonOnClick() {
      var id_type = this.id_type
      var id_val = this.id_val
      $('#slide_info_'+this.id_val).on('click', function() {
        var $this = $(this);
        // console.log("hellerrr");
        // console.log(this);
        var sid = $(this).attr('id').slice('slide_info_'.length);
        sid = id_val
        // console.log(sid);

        if ($this.hasClass("clicked_once")) {
          $this.removeClass("clicked_once");
          $this.removeClass('slide_info_down');
          $('#bigtable_' +sid).slideUp().removeClass("bigtable_box");
          $('#slide_list_' +sid).addClass('slide_list_box');
          $('#cell_total_'+sid).fadeOut();

        } else {


          $.get('/get_all_cells_generic/', {'id_type':id_type, 'id_val':id_val}, function(json) {
              console.log('/get_all_cells_generic/');

              var cells_json = json['all_cells_json'];
              var celltypes_json = json['celltypes_json']
              console.log(cells_json)
              console.log(celltypes_json)
              //console.log(cells_json);
              var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig, '"'));
              //console.log(cells_json_reformat);

              $this.addClass("clicked_once");
              $this.addClass('slide_info_down');
              $('#slide_list_' +sid).removeClass("slide_list_box");
              $('#bigtable_' +sid).slideDown().addClass("bigtable_box");
              $('#cell_total_'+sid).html('Total: ' + cells_json_reformat.length).fadeIn();

              CellSummary.UpdateCountsOnPage(cells_json, celltypes_json, id_val);

          });

          // $.get('/get_all_cells_in_slide/', {'sid':sid}, function(json) {

          //   console.log('lets get them cells!');
          //   //console.log(json);
          //   //console.log(json['all_cells_json']);
          //   var cells_json = json['all_cells_json'];
          //   //console.log(cells_json);
          //   var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig, '"'));
          //   //console.log(cells_json_reformat);

          //   $this.addClass("clicked_once");
          //   $this.addClass('slide_info_down');
          //   $('#slide_list_' +sid).removeClass("slide_list_box");
          //   $('#bigtable_' +sid).slideDown().addClass("bigtable_box");
          //   $('#cell_total_'+sid).html('Total: ' + cells_json_reformat.length).fadeIn();

          //   CellSummary.UpdateCountsOnPage(cells_json, sid);

          // });      
        
        };
      });
    }
  }


    // createBigTableOld() {
    //   var table = '<table style="border:none" class="slide_page_table" id="classification_table_' +this.id_val+'">';
    //   table += '<tr class="class_table_row">';
    //   table += '<th class="class_table_td">Neutrophilic';
    //   table += '<th class="class_table_td">Other granulocytic';
    //   table += '<th class="class_table_td">Lymphoid';
    //   table += '<th class="class_table_td">Erythroid';
    //   table += '<th class="class_table_td">Misc';
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M1 '+this.id_val+'">Blast (1):';
    //   table += '<td class="class_table_td slide count_E1 '+this.id_val+'">Immature Eo (q):';
    //   table += '<td class="class_table_td slide count_L0 '+this.id_val+'">Lymphobast (a):';
    //   table += '<td class="class_table_td slide count_ER1 '+this.id_val+'">Pronormoblast (z):';         
    //   table += '<td class="class_table_td slide count_U1 '+this.id_val+'">Artifact (7):';
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M2 '+this.id_val+'">Promyelocyte (2):';
    //   table += '<td class="class_table_td slide count_E2 '+this.id_val+'">Eosinophil (w):';
    //   table += '<td class="class_table_td slide count_L1 '+this.id_val+'">Hematogone (s):';
    //   table += '<td class="class_table_td slide count_ER2 '+this.id_val+'">Basophilic normoblast (x):';           
    //   table += '<td class="class_table_td slide count_U2 '+this.id_val+'">Unknown (8):';
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M3 '+this.id_val+'">Myelocyte (3):';
    //   table += '<td class="class_table_td slide count_B1 '+this.id_val+'">Immature Baso (e):';
    //   table += '<td class="class_table_td slide count_L2 '+this.id_val+'">Mature Lymphocyte (d):';
    //   table += '<td class="class_table_td slide count_ER3 '+this.id_val+'">Polychromatophilic (c):';            
    //   table += '<td class="class_table_td slide count_U3 '+this.id_val+'">Other (9):';
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M4 '+this.id_val+'">Metamyelocyte (4):';
    //   table += '<td class="class_table_td slide count_B2 '+this.id_val+'">Basophil (r):';
    //   table += '<td class="class_table_td slide count_L3 '+this.id_val+'">LGL (f):';
    //   table += '<td class="class_table_td slide count_ER4 '+this.id_val+'">Orthochromic/nuc red (v):';            
    //   table += '<td class="class_table_td slide count_U4 '+this.id_val+'">Histiocyte (0):';
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M5 '+this.id_val+'">Band (5):';
    //   table += '<td class="class_table_td slide count_MO1 '+this.id_val+'">Monoblast (t):';
    //   table += '<td class="class_table_td slide count_L4 '+this.id_val+'">Plasma cell (g):';
    //   table += '<td class="class_table_td slide count_ER5 '+this.id_val+'">Reticulocyte (b):';          
    //   table += '<td class="class_table_td slide count_UL '+this.id_val+'">Unlabelled (u):';         
    //   table += '<tr class="class_table_row">';
    //   table += '<td class="class_table_td slide count_M6 '+this.id_val+'">Seg (6):';
    //   table += '<td class="class_table_td slide count_MO2 '+this.id_val+'">Monocyte (y):';
    //   table += '<td class="class_table_td">';
    //   table += '<td class="class_table_td slide count_ER6 '+this.id_val+'">Mature RBC (n):';
    //   table += '<td class="class_table_td">';
    //   table += '</table>';

    //   return table;
    // }