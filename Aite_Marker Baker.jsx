var panelGlobal = this;
var pal = (function () {
    var repBox = 1;
    var indBox = 0;
    var fromVar = 0;
    var toVar = 1;

    function layerMarkerToKey (){
        var thisComp = app.project.activeItem;
        var assignObj = thisComp.selectedLayers[0];
        var prop;
        var props = app.project.activeItem.selectedProperties;
        // 选中第一个属性
        for(var i=0 ; i<props.length ; i++ ){
            if(props[i].canSetExpression){
                prop = props[i];
                break;
            }
        }
        // var marker = thisComp.markerProperty;
        var marker = assignObj.marker;
        var mnum = marker.numKeys;

        // 删帧
        if(repBox == 1){
            var knum = prop.numKeys;
            for(var i=1;i<knum+1;i++){
                prop.removeKey(1);
            }
        }

        // 打帧
        for(var i=1;i<mnum+1;i++){
            var mkt = marker.keyTime(i);
            prop.setValueAtTime(mkt,prop.value);
            prop.setSelectedAtKey(i,1);
        }
    }

    function compMarkerToKey (){
        var thisComp = app.project.activeItem;

        // var assignObj = thisComp.selectedLayers[0];
        var prop;
        var props = app.project.activeItem.selectedProperties;
        // 选中第一个属性
        for(var i=0 ; i<props.length ; i++ ){
            if(props[i].canSetExpression){
                prop = props[i];
                break;
            }
        }
        var marker = thisComp.markerProperty;
        // var marker = assignObj.marker;
        var mnum = marker.numKeys;

        // 删帧
        if(repBox == 1){
            var knum = prop.numKeys;
            for(var i=1;i<knum+1;i++){
                prop.removeKey(1);
            }
        }
        // 打帧
        for(var i=1;i<mnum+1;i++){
            var mkt = marker.keyTime(i);
            prop.setValueAtTime(mkt,prop.value);
            prop.setSelectedAtKey(i,1);
        }
    }

    function keyToCompMarker (){
        var thisComp = app.project.activeItem;

        // var assignObj = thisComp.selectedLayers[0];
        var prop;
        var props = app.project.activeItem.selectedProperties;
        var marker = thisComp.markerProperty;
        // var marker = assignObj.marker;
        
        // 选中第一个属性
        for(var i=0 ; i<props.length ; i++ ){
            if(props[i].canSetExpression){
                prop = props[i];
                break;
            }
        }
        var knum = prop.numKeys;
        // 删帧
        if(repBox == 1){
            var mnum = marker.numKeys;
            for(var i=1;i<mnum+1;i++){
                marker.removeKey(1);
            }
        }
        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<knum+1;i++){
            var kt = prop.keyTime(i);
            if(indBox == 1){mv.comment = i;}
            marker.setValueAtTime(kt,mv);
            prop.setSelectedAtKey(i,1);
        }
    }

    function keyToLayerMarker (){
        var thisComp = app.project.activeItem;

        // var assignObj = thisComp.selectedLayers[0];
        var prop;
        var props = app.project.activeItem.selectedProperties;
        var marker = app.project.activeItem.selectedLayers[0].marker;
        // var marker = assignObj.marker;
        
        // 选中第一个属性
        for(var i=0 ; i<props.length ; i++ ){
            if(props[i].canSetExpression){
                prop = props[i];
                break;
            }
        }
        var knum = prop.numKeys;
        // 删帧
        if(repBox == 1){
            var mnum = marker.numKeys;
            for(var i=1;i<mnum+1;i++){
                marker.removeKey(1);
            }
        }
        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<knum+1;i++){
            var kt = prop.keyTime(i);
            if(indBox == 1){mv.comment = i;}
            marker.setValueAtTime(kt,mv);
            prop.setSelectedAtKey(i,1);
        }
    }

    function compMarkerToLayerMarker (){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var compMarker = thisComp.markerProperty;
        var compMnum = compMarker.numKeys;

        var layerMarker = secL[0].marker;
        var layerMnum = layerMarker.numKeys;

        // 删帧
        if(repBox == 1){
            for(var i=1;i<layerMnum+1;i++){
                layerMarker.removeKey(1);
            }
        }

        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<compMnum+1;i++){
            var kt = compMarker.keyTime(i);
            if(indBox == 1){mv.comment = i;}
            layerMarker.setValueAtTime(kt,mv);
        }
    }

    function layerMarkerToCompMarker (){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;

        var compMarker = thisComp.markerProperty;
        var compMnum = compMarker.numKeys;

        var layerMarker = secL[0].marker;
        var layerMnum = layerMarker.numKeys;

        // 删帧
        if(repBox == 1){
            for(var i=1;i<compMnum+1;i++){
                compMarker.removeKey(1);
            }
        }

        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<layerMnum+1;i++){
            var kt = layerMarker.keyTime(i);
            if(indBox == 1){mv.comment = i;}
            compMarker.setValueAtTime(kt,mv);
        }
    }
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":9,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"pal","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Marker Baker by 大狸猫","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"gr1","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-4":{"id":4,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":"fromVarSt","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Layer Marker","justify":"left","preferredSize":[110,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"gr3","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-7":{"id":7,"type":"Slider","parentId":1,"style":{"enabled":true,"varName":"fromSlider","preferredSize":[46,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"gr2","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-9":{"id":9,"type":"Slider","parentId":8,"style":{"enabled":true,"varName":"toSlider","preferredSize":[46,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"toVarSt","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Comp Marker","justify":"left","preferredSize":[110,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"indexBox","text":"Record Index","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"replaceBox","text":"Replace","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":"fromSt","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"From","justify":"left","preferredSize":[32,0],"alignment":"center","helpTip":null}},"item-14":{"id":14,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"To","justify":"left","preferredSize":[30,0],"alignment":"center","helpTip":null}}},"order":[0,1,13,7,4,8,14,9,10,5,12,11],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":true,"afterEffectsDockable":true,"itemReferenceList":"None"}}
  */ 

  // PAL
  // ===
  var pal = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette"); 
      if ( !(panelGlobal instanceof Panel) ) pal.text = "Marker Baker by 大狸猫"; 
      pal.orientation = "column"; 
      pal.alignChildren = ["left","top"]; 
      pal.spacing = 10; 
      pal.margins = 16; 

  // GR1
  // ===
  var gr1 = pal.add("group", undefined, {name: "gr1"}); 
      gr1.orientation = "row"; 
      gr1.alignChildren = ["left","center"]; 
      gr1.spacing = 10; 
      gr1.margins = 0; 

  var fromSt = gr1.add("statictext", undefined, undefined, {name: "fromSt"}); 
      fromSt.text = "From"; 
      fromSt.preferredSize.width = 30; 
      fromSt.alignment = ["left","center"]; 

  var fromSlider = gr1.add("slider", undefined, undefined, undefined, undefined, {name: "fromSlider"}); 
      fromSlider.minvalue = 0; 
      fromSlider.maxvalue = 2; 
      fromSlider.value = 0; 
      fromSlider.preferredSize.width = 46; 

  var fromVarSt = gr1.add("statictext", undefined, undefined, {name: "fromVarSt"}); 
      fromVarSt.text = "Key"; 
      fromVarSt.preferredSize.width = 110; 

  // GR2
  // ===
  var gr2 = pal.add("group", undefined, {name: "gr2"}); 
      gr2.orientation = "row"; 
      gr2.alignChildren = ["left","center"]; 
      gr2.spacing = 10; 
      gr2.margins = 0; 

  var statictext1 = gr2.add("statictext", undefined, undefined, {name: "statictext1"}); 
      statictext1.text = "To"; 
      statictext1.preferredSize.width = 30; 
      statictext1.alignment = ["left","center"]; 

  var toSlider = gr2.add("slider", undefined, undefined, undefined, undefined, {name: "toSlider"}); 
      toSlider.minvalue = 0; 
      toSlider.maxvalue = 2; 
      toSlider.value = 1; 
      toSlider.preferredSize.width = 46; 

  var toVarSt = gr2.add("statictext", undefined, undefined, {name: "toVarSt"}); 
      toVarSt.text = "Layer Marker"; 
      toVarSt.preferredSize.width = 110; 

  // GR3
  // ===
  var gr3 = pal.add("group", undefined, {name: "gr3"}); 
      gr3.orientation = "row"; 
      gr3.alignChildren = ["left","center"]; 
      gr3.spacing = 10; 
      gr3.margins = 0; 

  var replaceBox = gr3.add("checkbox", undefined, undefined, {name: "replaceBox"}); 
      replaceBox.text = "Replace"; 
      replaceBox.value = repBox;

  var indexBox = gr3.add("checkbox", undefined, undefined, {name: "indexBox"}); 
      indexBox.text = "Index"; 
      indexBox.value = indBox;
 
  var applyBtn = gr3.add("button", undefined, undefined, {name: "applyBtn"}); 
  applyBtn.text = "Apply"; 
  applyBtn.preferredSize = [70,20];

  pal.layout.layout(true);
  pal.layout.resize();
  pal.onResizing = pal.onResize = function () { this.layout.resize(); }

  if ( pal instanceof Window ) pal.show();

    // box
  replaceBox.onClick = function(){repBox = this.value;}
  indexBox.onClick = function(){indBox = this.value;}

  // slider
  fromSlider.onChange = fromSlider.onChanging = function()
  {
    this.value = Math.round(this.value);
    if(this.value == 0){fromVarSt.text = "Key";}
    else if(this.value == 1){fromVarSt.text = "Layer Marker";}
    else if(this.value == 2){fromVarSt.text = "Comp Marker";}
  }

  toSlider.onChange = toSlider.onChanging = function()
  {
    this.value = Math.round(this.value);
    if(this.value == 0){toVarSt.text = "Key";}
    else if(this.value == 1){toVarSt.text = "Layer Marker";}
    else if(this.value == 2){toVarSt.text = "Comp Marker";}
  }

  // Btn
  applyBtn.onClick = function(){
      if(fromSlider.value == 0 && toSlider.value == 1){keyToLayerMarker();}
      else if(fromSlider.value == 0 && toSlider.value == 2){keyToCompMarker();}
      else if(fromSlider.value == 1 && toSlider.value == 0){layerMarkerToKey();}
      else if(fromSlider.value == 1 && toSlider.value == 2){layerMarkerToCompMarker();}
      else if(fromSlider.value == 2 && toSlider.value == 0){compMarkerToKey();}
      else if(fromSlider.value == 2 && toSlider.value == 1){compMarkerToLayerMarker();}
  }

  return pal;
}());

