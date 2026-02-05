/*
 * 模块名称: Null
 * 功能描述: 空对象创建工具，支持创建固态和形状空对象，支持父子链接
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var NullModule = (function() {
    var moduleObj = {
        name: "Null",
        displayName: "Null",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 默认值
            var guideBox = 0;
            var eachBox = 0;
            var setParentBox = 0;
            var repBox = 1;
            var indBox = 0;
            var fromVar = 0;
            var toVar = 1;

            // 资源字符串
            var null_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { \
                        guideBox: Checkbox { text:'Guide',preferredSize:[60,17],value:"+ guideBox +"}    \
                        eachBox: Checkbox { text:'Each',preferredSize:[60,17],value:"+ eachBox +"}    \
                        setParentBox: Checkbox { text:'Parent',preferredSize:[60,17],value:"+ setParentBox +"}    \
                        resetBtn: Button { text:'Reset',alignment:['left','top'], preferredSize:[50,17] } \
                    }, \
                    gr3: Group { \
                        solidNullBtn: Button { text:'Solid Null',alignment:['left','top'], preferredSize:[80,20] } \
                        shapeNullBtn: Button { text:'Shape Null',alignment:['left','top'], preferredSize:[80,20] } \
                        parentChainBtn: Button { text:'Parent Chain',alignment:['left','top'], preferredSize:[80,20] } \
                    }, \
                    markerPanel: Panel { text:'Marker Baker', orientation:'column', alignment:['fill','top'], alignChildren:['left','top'], \
                        gr4: Group { \
                            fromSt: StaticText { text:'From',preferredSize:[30,17],alignment:['left','center']} \
                            fromSlider: Slider { preferredSize:[46,17],minvalue:0,maxvalue:2,value:0 } \
                            fromVarSt: StaticText { text:'Key',preferredSize:[110,17]} \
                        }, \
                        gr5: Group { \
                            toSt: StaticText { text:'To',preferredSize:[30,17],alignment:['left','center']} \
                            toSlider: Slider { preferredSize:[46,17],minvalue:0,maxvalue:2,value:1 } \
                            toVarSt: StaticText { text:'Layer Marker',preferredSize:[110,17]} \
                        }, \
                        gr6: Group { \
                            replaceBox: Checkbox { text:'Replace',value:"+ repBox +"} \
                            indexBox: Checkbox { text:'Index',value:"+ indBox +"} \
                            applyBtn: Button { text:'Apply',preferredSize:[70,20]} \
                        }, \
                    }, \
                }";
            
            var grp = container.add(null_res);
            
            // UI路径引用
            var guideBox_ = grp.gr1.guideBox;
            var eachBox_ = grp.gr1.eachBox;
            var setParentBox_ = grp.gr1.setParentBox;
            var resetBtn = grp.gr1.resetBtn;

            var solidNullBtn = grp.gr3.solidNullBtn;
            var shapeNullBtn = grp.gr3.shapeNullBtn;
            var parentChainBtn = grp.gr3.parentChainBtn;
            
            var fromSlider = grp.markerPanel.gr4.fromSlider;
            var fromVarSt = grp.markerPanel.gr4.fromVarSt;
            
            var toSlider = grp.markerPanel.gr5.toSlider;
            var toVarSt = grp.markerPanel.gr5.toVarSt;
            
            var replaceBox = grp.markerPanel.gr6.replaceBox;
            var indexBox = grp.markerPanel.gr6.indexBox;
            var applyBtn = grp.markerPanel.gr6.applyBtn;

            // 辅助函数：添加固态空对象
            function addSolidNull() {
                var thisComp = app.project.activeItem;
                var nullL = thisComp.layers.addNull();
                nullL.label = 9;
                return nullL;
            }

            // 辅助函数：添加形状空对象
            function addShapeNull() {
                var thisComp = app.project.activeItem;
                var shape = thisComp.layers.addShape();
                
                shape.label = 9;
                var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                sgroup1.name = "Retangle 1";
                sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
                // Fill
                var sgroup1S = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                sgroup1S.enabled = 0;
                var sgroup1F = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
                sgroup1F("ADBE Vector Fill Color").setValue([1,1,1,1]);
                sgroup1F.enabled = 0;
                
                return shape;
            }

            // 辅助函数：创建父子链
            function parentChain() {
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;

                if(secL.length>1){
                    for(var i=0;i<secL.length-1;i++) {
                        secL[i].parent = secL[i+1];
                    }
                }else{
                    return;
                }
            }
            
            // Marker Baker 功能函数
            function layerMarkerToKey() {
                var thisComp = app.project.activeItem;
                var assignObj = thisComp.selectedLayers[0];
                var prop;
                var props = app.project.activeItem.selectedProperties;
                
                for(var i=0; i<props.length; i++) {
                    if(props[i].canSetExpression) {
                        prop = props[i];
                        break;
                    }
                }
                
                var marker = assignObj.marker;
                var mnum = marker.numKeys;

                if(repBox == 1) {
                    var knum = prop.numKeys;
                    for(var i=1; i<knum+1; i++) {
                        prop.removeKey(1);
                    }
                }

                for(var i=1; i<mnum+1; i++) {
                    var mkt = marker.keyTime(i);
                    prop.setValueAtTime(mkt, prop.value);
                    prop.setSelectedAtKey(i, 1);
                }
            }

            function compMarkerToKey() {
                var thisComp = app.project.activeItem;
                var prop;
                var props = app.project.activeItem.selectedProperties;
                
                for(var i=0; i<props.length; i++) {
                    if(props[i].canSetExpression) {
                        prop = props[i];
                        break;
                    }
                }
                
                var marker = thisComp.markerProperty;
                var mnum = marker.numKeys;

                if(repBox == 1) {
                    var knum = prop.numKeys;
                    for(var i=1; i<knum+1; i++) {
                        prop.removeKey(1);
                    }
                }
                
                for(var i=1; i<mnum+1; i++) {
                    var mkt = marker.keyTime(i);
                    prop.setValueAtTime(mkt, prop.value);
                    prop.setSelectedAtKey(i, 1);
                }
            }

            function keyToCompMarker() {
                var thisComp = app.project.activeItem;
                var prop;
                var props = app.project.activeItem.selectedProperties;
                var marker = thisComp.markerProperty;
                
                for(var i=0; i<props.length; i++) {
                    if(props[i].canSetExpression) {
                        prop = props[i];
                        break;
                    }
                }
                
                var knum = prop.numKeys;
                
                if(repBox == 1) {
                    var mnum = marker.numKeys;
                    for(var i=1; i<mnum+1; i++) {
                        marker.removeKey(1);
                    }
                }
                
                var mv = new MarkerValue("");
                for(var i=1; i<knum+1; i++) {
                    var kt = prop.keyTime(i);
                    if(indBox == 1) {
                        mv.comment = i;
                    }
                    marker.setValueAtTime(kt, mv);
                    prop.setSelectedAtKey(i, 1);
                }
            }

            function keyToLayerMarker() {
                var thisComp = app.project.activeItem;
                var prop;
                var props = app.project.activeItem.selectedProperties;
                var marker = app.project.activeItem.selectedLayers[0].marker;
                
                for(var i=0; i<props.length; i++) {
                    if(props[i].canSetExpression) {
                        prop = props[i];
                        break;
                    }
                }
                
                var knum = prop.numKeys;
                
                if(repBox == 1) {
                    var mnum = marker.numKeys;
                    for(var i=1; i<mnum+1; i++) {
                        marker.removeKey(1);
                    }
                }
                
                var mv = new MarkerValue("");
                for(var i=1; i<knum+1; i++) {
                    var kt = prop.keyTime(i);
                    if(indBox == 1) {
                        mv.comment = i;
                    }
                    marker.setValueAtTime(kt, mv);
                    prop.setSelectedAtKey(i, 1);
                }
            }

            function compMarkerToLayerMarker() {
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var compMarker = thisComp.markerProperty;
                var compMnum = compMarker.numKeys;

                var layerMarker = secL[0].marker;
                var layerMnum = layerMarker.numKeys;

                if(repBox == 1) {
                    for(var i=1; i<layerMnum+1; i++) {
                        layerMarker.removeKey(1);
                    }
                }

                var mv = new MarkerValue("");
                for(var i=1; i<compMnum+1; i++) {
                    var kt = compMarker.keyTime(i);
                    if(indBox == 1) {
                        mv.comment = i;
                    }
                    layerMarker.setValueAtTime(kt, mv);
                }
            }

            function layerMarkerToCompMarker() {
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;

                var compMarker = thisComp.markerProperty;
                var compMnum = compMarker.numKeys;

                var layerMarker = secL[0].marker;
                var layerMnum = layerMarker.numKeys;

                if(repBox == 1) {
                    for(var i=1; i<compMnum+1; i++) {
                        compMarker.removeKey(1);
                    }
                }

                var mv = new MarkerValue("");
                for(var i=1; i<layerMnum+1; i++) {
                    var kt = layerMarker.keyTime(i);
                    if(indBox == 1) {
                        mv.comment = i;
                    }
                    compMarker.setValueAtTime(kt, mv);
                }
            }

            // 事件回调
            solidNullBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var nullL;
                var nullLarr = [];

                // none selected layers
                if(secL.length == 0){
                    nullL = addSolidNull();
                    nullLarr.push(nullL);
                }else if(secL.length == 1){
                    // one selected layer
                    nullL = addSolidNull();
                    nullL.moveBefore(secL[0]);
                    if(secL[0].parent == null){
                        nullL.position.setValue(secL[0].position.value);
                    }
                    if(setParentBox == 1){
                        if(secL[0].parent == null){
                            secL[0].parent = nullL;
                        }
                    }
                    nullLarr.push(nullL);
                }else{
                    // multi-layers
                    if(eachBox == 1){
                        // eachLayer creat one null
                        var secLc = [];
                        for(var i=0;i<secL.length;i++){
                            secLc.push(secL[i]);
                        }

                        if(setParentBox == 1){
                            for(var i=0;i<secLc.length;i++){
                                if(secLc[i].parent == null){
                                    // creat null
                                    nullL = addSolidNull();
                                    // move null
                                    nullL.moveBefore(secLc[i]);
                                    // set null position
                                    if(secLc[i].parent == null){
                                        nullL.position.setValue(secLc[i].position.value);
                                        secLc[i].parent = nullL;
                                    }
                                    // push null into arr
                                    nullLarr.push(nullL);
                                }
                            }
                        }else{
                            for(var i=0;i<secLc.length;i++){
                                nullL = addSolidNull();
                                nullL.moveBefore(secLc[i]);
                                // set position
                                if(secLc[i].parent == null){
                                    nullL.position.setValue(secLc[i].position.value);
                                }
                                nullLarr.push(nullL);
                            }
                        }
                    }else{
                        // multiLayers creat one null
                        nullL = addSolidNull();
                        // move null layer
                        var minIndL = secL[0];
                        for(var i=1;i<secL.length;i++){
                            if(minIndL.index > secL[i].index){
                                minIndL = secL[i];
                            }
                        }
                        nullL.moveBefore(minIndL);
                        // null position
                        if(secL[0].parent == null){
                            nullL.position.setValue(secL[0].position.value);
                        }
                        // set parent
                        if(setParentBox == 1){
                            for(var i=0;i<secL.length;i++){
                                if(secL[i].parent == null){
                                    secL[i].parent = nullL;
                                }
                            }
                        }
                        // push null into arr
                        nullLarr.push(nullL);
                    }
                }

                
                // guide box & select the created null
                for(var i =0;i<nullLarr.length;i++){
                    if(guideBox==1){
                        nullLarr[i].guideLayer = 1;
                    }
                    nullLarr[i].selected = 1;
                }
                app.endUndoGroup();
            };

            shapeNullBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var nullL;
                var nullLarr = [];

                // none selected layers
                if(secL.length == 0){
                    nullL = addShapeNull();
                    var num = parseInt(nullL.name.slice(-1));
                    nullL.name = "S_NULL " + num;
                    nullLarr.push(nullL);
                }else if(secL.length == 1){
                    // one selected layer
                    nullL = addShapeNull();
                    nullL.moveBefore(secL[0]);
                    if(secL[0].parent == null){
                        nullL.position.setValue(secL[0].position.value);
                    }
                    if(setParentBox == 1){
                        if(secL[0].parent == null){
                            secL[0].parent = nullL;
                        }
                    }
                    nullLarr.push(nullL);
                }else{
                    // multi-layers
                    if(eachBox == 1){
                        // eachLayer creat one null
                        var secLc = [];
                        for(var i=0;i<secL.length;i++){
                            secLc.push(secL[i]);
                        }

                        if(setParentBox == 1){
                            for(var i=0;i<secLc.length;i++){
                                if(secLc[i].parent == null){
                                    // creat null
                                    nullL = addShapeNull();
                                    // move null
                                    nullL.moveBefore(secLc[i]);
                                    // set null position
                                    if(secLc[i].parent == null){
                                        nullL.position.setValue(secLc[i].position.value);
                                        secLc[i].parent = nullL;
                                    }
                                    // push null into arr
                                    nullLarr.push(nullL);
                                }
                            }
                        }else{
                            for(var i=0;i<secLc.length;i++){
                                nullL = addShapeNull();
                                nullL.moveBefore(secLc[i]);
                                // set position
                                if(secLc[i].parent == null){
                                    nullL.position.setValue(secLc[i].position.value);
                                }
                                nullLarr.push(nullL);
                            }
                        }
                    }else{
                        // multiLayers creat one null
                        nullL = addShapeNull();
                        // move null layer
                        var minIndL = secL[0];
                        for(var i=1;i<secL.length;i++){
                            if(minIndL.index > secL[i].index){
                                minIndL = secL[i];
                            }
                        }
                        nullL.moveBefore(minIndL);
                        // null position
                        if(secL[0].parent == null){
                            nullL.position.setValue(secL[0].position.value);
                        }
                        // set parent
                        if(setParentBox == 1){
                            for(var i=0;i<secL.length;i++){
                                if(secL[i].parent == null){
                                    secL[i].parent = nullL;
                                }
                            }
                        }
                        // push null into arr
                        nullLarr.push(nullL);
                    }
                }

                // change the name & guide box & select the created null
                for(var i =0;i<nullLarr.length;i++){
                    var nullnamenum = nullLarr[i].name.match(/\d+$/);
                    nullLarr[i].name = 'S_NULL '+ nullnamenum.toString();
                    if(guideBox==1){
                        nullLarr[i].guideLayer = 1;
                        nullLarr[i]("ADBE Root Vectors Group")("ADBE Vector Group")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke").enabled = 1;
                        nullLarr[i]("ADBE Root Vectors Group")("ADBE Vector Group")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Width").setValue(1);
                    }
                    nullLarr[i].selected = 1;
                }
                app.endUndoGroup();
            };

            parentChainBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                parentChain();
                app.endUndoGroup();
            };

            // Checkbox事件
            guideBox_.onClick = function() {
                guideBox = this.value;
            };

            eachBox_.onClick = function() {
                eachBox = this.value;
            };

            setParentBox_.onClick = function() {
                setParentBox = this.value;
            };

            resetBtn.onClick = function() {
                guideBox_.value = 0;
                eachBox_.value = 0;
                setParentBox_.value = 0;
                guideBox = 0;
                eachBox = 0;
                setParentBox = 0;
            };
            
            // Marker Baker 事件
            replaceBox.onClick = function() {
                repBox = this.value;
            };
            
            indexBox.onClick = function() {
                indBox = this.value;
            };
            
            fromSlider.onChange = fromSlider.onChanging = function() {
                this.value = Math.round(this.value);
                if(this.value == 0) {
                    fromVarSt.text = "Key";
                } else if(this.value == 1) {
                    fromVarSt.text = "Layer Marker";
                } else if(this.value == 2) {
                    fromVarSt.text = "Comp Marker";
                }
            };
            
            toSlider.onChange = toSlider.onChanging = function() {
                this.value = Math.round(this.value);
                if(this.value == 0) {
                    toVarSt.text = "Key";
                } else if(this.value == 1) {
                    toVarSt.text = "Layer Marker";
                } else if(this.value == 2) {
                    toVarSt.text = "Comp Marker";
                }
            };
            
            applyBtn.onClick = function() {
                app.beginUndoGroup("Marker Baker");
                if(fromSlider.value == 0 && toSlider.value == 1) {
                    keyToLayerMarker();
                } else if(fromSlider.value == 0 && toSlider.value == 2) {
                    keyToCompMarker();
                } else if(fromSlider.value == 1 && toSlider.value == 0) {
                    layerMarkerToKey();
                } else if(fromSlider.value == 1 && toSlider.value == 2) {
                    layerMarkerToCompMarker();
                } else if(fromSlider.value == 2 && toSlider.value == 0) {
                    compMarkerToKey();
                } else if(fromSlider.value == 2 && toSlider.value == 1) {
                    compMarkerToLayerMarker();
                }
                app.endUndoGroup();
            };

            return grp;
        }
    };

    return moduleObj;
})();

// 独立运行模式 - 只在非启动器加载时运行
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "Null by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        NullModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}