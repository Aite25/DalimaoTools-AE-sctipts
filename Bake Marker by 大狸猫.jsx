function main() {
    ///// info
    var scriptName = "Bake Marker by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Bake Marker by 大狸猫";

    var removeBox = 1;
    var indexBox = 0;

    function propertyWidth(){
        var curComp = app.project.activeItem;
        var selectedLayers = app.project.activeItem.selectedLayers;
        var properties = app.project.activeItem.selectedProperties;
        var propertyWidth = 0;
        for(var i = 0;i<properties.length;i++){
            if(properties[i].canSetExpression){
                if(properties[i].value instanceof Array){propertyWidth = properties[i].value.length;break}
                else if(typeof properties[i].value == 'number'){propertyWidth = 1;break}
            }
        }
        return propertyWidth;
    }

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
        if(removeBox == 1){
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
        if(removeBox == 1){
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
        if(removeBox == 1){
            var mnum = marker.numKeys;
            for(var i=1;i<mnum+1;i++){
                marker.removeKey(1);
            }
        }
        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<knum+1;i++){
            var kt = prop.keyTime(i);
            if(indexBox == 1){mv.comment = i;}
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
        if(removeBox == 1){
            var mnum = marker.numKeys;
            for(var i=1;i<mnum+1;i++){
                marker.removeKey(1);
            }
        }
        // 打帧
        var mv = new MarkerValue("");
        for(var i=1;i<knum+1;i++){
            var kt = prop.keyTime(i);
            if(indexBox == 1){mv.comment = i;}
            marker.setValueAtTime(kt,mv);
            prop.setSelectedAtKey(i,1);
        }
    }

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                compMarkerToKeyBtn: Button { text:'Comp → [Key]',alignment:['top','left'],preferredSize:[100,20],  } \
                layerMarkerToKeyBtn: Button { text:'Layer → [Key]',alignment:['top','left'],preferredSize:[100,20],  } \
            }, \
            gr2: Group { \
                keyToCompMarkerBtn: Button { text:'Key → [Comp]',alignment:['top','left'],preferredSize:[100,20],  } \
                keyToLayerMarkerBtn: Button { text:'Key → [Layer]',alignment:['top','left'],preferredSize:[100,20],  } \
            }, \
            gr3: Group { \
                removeBox: Checkbox { text:'Replace',value:1,alignment:['left','top']}    \
                indexBox: Checkbox { text:'Record Index',value:0,alignment:['left','top']}    \
            }, \
        }"; 
        pal.gr = pal.add(res);
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        pal.gr.gr1.compMarkerToKeyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            compMarkerToKey();
            app.endUndoGroup;
        };

        pal.gr.gr1.layerMarkerToKeyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            layerMarkerToKey();
            app.endUndoGroup;
        };

        
        pal.gr.gr2.keyToCompMarkerBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            keyToCompMarker();
            app.endUndoGroup;
        };

        pal.gr.gr2.keyToLayerMarkerBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            keyToLayerMarker();
            app.endUndoGroup;
        };

        pal.gr.gr3.removeBox.onClick = function () 
        {
            removeBox = this.value;
        }

        pal.gr.gr3.indexBox.onClick = function () 
        {
            indexBox = this.value;
        }

        // show user interface
        if (pal instanceof Window)
        {
            pal.center();
            pal.show();
        }
        else
        {
            pal.layout.layout(true);
        }       
    };
    this.run = function (thisObj) 
    {
            this.buildUI(thisObj);
    };
}

new main().run(this)
