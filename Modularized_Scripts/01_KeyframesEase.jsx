/*
 * KeyframesEase - 关键帧缓动工具
 * 可单独运行，也可被 DalimaoTools 调用
 * Author: 大狸猫
 */

// 模块导出对象
var KeyframesEaseModule = (function() {
    
    var scriptName = "KeyframesEase";
    var influence = 0;
    var space = 100;
    var framenum = 1;
    var snapBox = 0;
    
    // 辅助函数
    function clamp(a,b,c){
        if(a>c){a = c};
        if(a<b){a = b};
        return a;
    }
    
    function reverseSeclect(){
        var tcomp = app.project.activeItem;
        var secL = tcomp.selectedLayers;
        for(var i=0;i<secL.length;i++){
            secL[i].selected = 0;
        }
        for(var i=0;i<secL.length;i++){
            secL[secL.length-1-i].selected = 1;
        }
    }

    function idcreat(){ 
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
    
        for(var i = 0;i<secL.length-1;i++){
            var slider = secL[i].effect.addProperty('ADBE Slider Control');
            slider.name = "ID";
            if(secL[i].index > secL[secL.length-1].index){
                slider(1).expression = 'id = index - thisComp.layer("' + secL[secL.length-1].name + '").index;\n\//id = effect(\"ID\")(\"ADBE Slider Control-0001\");';
            }else{
                slider(1).expression = 'id = thisComp.layer("' + secL[secL.length-1].name + '").index - index;\n\//id = effect(\"ID\")(\"ADBE Slider Control-0001\");';
            }
        }
    }

    // 提取运动功能
    function extractMotion(saveToNull) {
        var thisComp = app.project.activeItem;
        if (!thisComp) {
            return;
        }
        
        var selectedLayers = thisComp.selectedLayers;
        if (selectedLayers.length == 0) {
            return;
        }
        
        var layer = selectedLayers[0];
        var selectedProps = layer.selectedProperties;
        
        // 如果没有选择属性，默认提取Transform属性
        var propsToProcess = [];
        if (selectedProps.length == 0) {
            var transformGroup = layer.transform;
            var transformPropsArray = [
                transformGroup.position,
                transformGroup.rotation,
                transformGroup.scale,
                transformGroup.anchorPoint
            ];
            
            // 只添加有关键帧的属性
            for (var t = 0; t < transformPropsArray.length; t++) {
                if (transformPropsArray[t] && transformPropsArray[t].numKeys > 0) {
                    propsToProcess.push(transformPropsArray[t]);
                }
            }
            
            // 如果Transform里也没有关键帧，静默返回
            if (propsToProcess.length == 0) {
                return;
            }
        } else {
            // 使用选中的属性
            for (var i = 0; i < selectedProps.length; i++) {
                propsToProcess.push(selectedProps[i]);
            }
        }
        
        for (var i = 0; i < propsToProcess.length; i++) {
            var prop = propsToProcess[i];
            
            if (!prop.canSetExpression || prop.numKeys < 1) {
                continue;
            }
            
            // 获取最后一个关键帧的值
            var lastKeyIndex = prop.numKeys;
            var lastKeyValue = prop.keyValue(lastKeyIndex);
            
            // 判断是否是Transform属性
            var isTransformProp = false;
            var propMatchName = prop.matchName;
            var transformProps = [
                "ADBE Position", 
                "ADBE Rotate Z", 
                "ADBE Rotate X", 
                "ADBE Rotate Y",
                "ADBE Scale",
                "ADBE Anchor Point",
                "ADBE Orientation"
            ];
            
            for (var t = 0; t < transformProps.length; t++) {
                if (propMatchName == transformProps[t]) {
                    isTransformProp = true;
                    break;
                }
            }
            
            // 收集所有关键帧信息
            var keyframes = [];
            for (var k = 1; k <= prop.numKeys; k++) {
                var keyTime = prop.keyTime(k);
                var keyValue = prop.keyValue(k);
                var offsetValue;
                
                if (keyValue.length != undefined) {
                    // 数组值（位置、缩放等）
                    offsetValue = [];
                    for (var v = 0; v < keyValue.length; v++) {
                        offsetValue[v] = keyValue[v] - lastKeyValue[v];
                    }
                } else {
                    // 单个值（旋转、不透明度等）
                    offsetValue = keyValue - lastKeyValue;
                }
                
                keyframes.push({
                    time: keyTime,
                    offsetValue: offsetValue,
                    inEase: prop.keyInTemporalEase(k),
                    outEase: prop.keyOutTemporalEase(k),
                    inInterpolation: prop.keyInInterpolationType(k),
                    outInterpolation: prop.keyOutInterpolationType(k)
                });
            }
            
            // 保存偏移值到空对象或滑块
            if (saveToNull && isTransformProp) {
                // 保存到空对象
                var nullLayer = thisComp.layers.addNull();
                nullLayer.name = layer.name + " motion";
                nullLayer.moveBefore(layer);
                
                // 设置空对象的对应属性
                var nullProp = null;
                switch (propMatchName) {
                    case "ADBE Position":
                        nullProp = nullLayer.transform.position;
                        break;
                    case "ADBE Rotate Z":
                    case "ADBE Rotate X":
                    case "ADBE Rotate Y":
                        nullProp = nullLayer.transform.rotation;
                        break;
                    case "ADBE Scale":
                        nullProp = nullLayer.transform.scale;
                        break;
                    case "ADBE Anchor Point":
                        nullProp = nullLayer.transform.anchorPoint;
                        break;
                    case "ADBE Orientation":
                        nullProp = nullLayer.transform.orientation;
                        break;
                }
                
                if (nullProp != null) {
                    // 在空对象上创建关键帧
                    for (var k = 0; k < keyframes.length; k++) {
                        nullProp.setValueAtTime(keyframes[k].time, keyframes[k].offsetValue);
                        
                        // 复制缓动
                        if (k > 0 || keyframes.length == 1) {
                            nullProp.setTemporalEaseAtKey(k + 1, keyframes[k].inEase, keyframes[k].outEase);
                        }
                    }
                }
            } else {
                // 保存到滑块（非Transform属性或选择保存到本图层）
                var controlProp = null;
                var controlName = prop.name + "_Offset";
                
                // 根据属性维度选择合适的控制器
                if (lastKeyValue.length != undefined) {
                    // 数组值 - 使用Point Control或3D Point Control
                    if (lastKeyValue.length == 2) {
                        // 2D点控制
                        controlProp = layer.Effects.addProperty('ADBE Point Control');
                        controlProp.name = controlName;
                        controlProp = controlProp(1); // Point属性
                    } else if (lastKeyValue.length == 3) {
                        // 3D点控制
                        controlProp = layer.Effects.addProperty('ADBE Point3D Control');
                        controlProp.name = controlName;
                        controlProp = controlProp(1); // Point属性
                    } else {
                        // 其他维度，使用多个滑块
                        var sliders = [];
                        for (var v = 0; v < lastKeyValue.length; v++) {
                            var slider = layer.Effects.addProperty('ADBE Slider Control');
                            slider.name = controlName + (v > 0 ? "_" + v : "");
                            sliders.push(slider(1));
                        }
                        
                        // 为每个滑块创建关键帧
                        for (var k = 0; k < keyframes.length; k++) {
                            for (var v = 0; v < sliders.length; v++) {
                                sliders[v].setValueAtTime(keyframes[k].time, keyframes[k].offsetValue[v]);
                                if (k > 0 || keyframes.length == 1) {
                                    sliders[v].setTemporalEaseAtKey(k + 1, keyframes[k].inEase, keyframes[k].outEase);
                                }
                            }
                        }
                        continue;
                    }
                } else {
                    // 单个值 - 使用Slider Control
                    var slider = layer.Effects.addProperty('ADBE Slider Control');
                    slider.name = controlName;
                    controlProp = slider(1);
                }
                
                if (controlProp != null) {
                    // 在控制器上创建关键帧
                    for (var k = 0; k < keyframes.length; k++) {
                        controlProp.setValueAtTime(keyframes[k].time, keyframes[k].offsetValue);
                        if (k > 0 || keyframes.length == 1) {
                            controlProp.setTemporalEaseAtKey(k + 1, keyframes[k].inEase, keyframes[k].outEase);
                        }
                    }
                }
            }
        }
    }

    function layerOffset(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var fdr = thisComp.frameDuration;
        var firstINP = secL[0].inPoint;
        var targetTime = snapBox == 1 ? thisComp.time : firstINP;
        
        for(var i=0;i<secL.length;i++){
            var timeDif = secL[i].inPoint - secL[i].startTime;
            secL[i].startTime = targetTime + framenum*fdr*i - timeDif;
        }
    }
    
    // UI创建函数 - 用于作为模块被调用时
    function buildUI(container) {
        var keyframeEase_res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                influenceSt: StaticText { text:'Influence' ,preferredSize:[50,17]}    \
                influenceSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:10,value:0 } \
                influenceEt: EditText { text:'0',alignment:['left','center'], preferredSize:[45,17] } \
                applyBtn: Button { text:'Apply',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr2: Group { \
                spaceSt: StaticText { text:'Space',preferredSize:[50,17] }    \
                spaceSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:20,value:10 } \
                spaceEt: EditText { text:'100',alignment:['left','center'], preferredSize:[45,17] } \
                extractBtn: Button { text:'Extract',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr3: Group { orientation:'row', alignment:['left','top'],\
                frameSt: StaticText { text:'Frame' ,preferredSize:[50,17]}    \
                minEt: EditText { text:'0',alignment:['left','center'], preferredSize:[23,17] } \
                frameSlider: Slider { alignment:['left','center'], preferredSize:[41,17],minvalue:0 ,maxvalue:30,value:1 } \
                maxEt: EditText { text:'30',alignment:['left','center'], preferredSize:[23,17] } \
                frameEt: EditText { text:'1',alignment:['left','center'], preferredSize:[39,17] } \
                snapBox: Checkbox { text:'[',value:0,alignment:['left','top']}    \
                frameBtn: Button { text:'√' ,preferredSize:[36,17]}    \
            }, \
            gr4: Group { orientation:'row', alignment:['left','top'],\
                bakeBtn: Button { text:'Bake',alignment:['left','top'],preferredSize:[76,17] } \
                revSecLBtn: Button { text:'revSecL',alignment:['left','top'],preferredSize:[100,17] } \
                idCreatBtn: Button { text:'ID Create',alignment:['left','top'],preferredSize:[100,17] } \
            }, \
            extractMotionPanel: Panel { text:'Extract Motion', orientation:'column', alignment:['fill','top'], alignChildren:['left','top'], \
                gr5: Group { orientation:'row', alignment:['left','top'],\
                    extractMotionToSliderBtn: Button { text:'Extract to Slider',alignment:['left','top'],preferredSize:[135,17] } \
                    extractMotionToNullBtn: Button { text:'Extract to Null',alignment:['left','top'],preferredSize:[145,17] } \
                }, \
            }, \
        }";
        
        var gr = container.add(keyframeEase_res);
        
        // 绑定事件
        gr.gr1.influenceEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.influenceSlider.value = Math.round(this.text%100)/10;
            influence = parseFloat(this.text);
        }
        
        gr.gr1.influenceSlider.onChange = gr.gr1.influenceSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.influenceEt.text = this.value*10;
            influence = this.value*10;
            if(app.project.activeItem && app.project.activeItem.selectedProperties.length != 0){
                gr.gr1.applyBtn.onClick();
            }
        };
        
        gr.gr2.spaceEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.spaceSlider.value = Math.round(this.text)/10;
            space = parseFloat(this.text);
        }
        
        gr.gr2.spaceSlider.onChange = gr.gr2.spaceSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.spaceEt.text = this.value*10;  
            space = this.value*10;
            if(app.project.activeItem && app.project.activeItem.selectedProperties.length != 0){
                gr.gr1.applyBtn.onClick();
            }
        };
        
        gr.gr1.applyBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var infOut = clamp(influence,0.1,100);
            var infIn = clamp(200-space-influence,0.1,100);
            var selectedLayers = app.project.activeItem.selectedLayers;
            var easeOut = new KeyframeEase(0, infOut);
            var easeIn = new KeyframeEase(0, infIn);
            
            for(var i = 0;i<selectedLayers.length;i++){
                for(var j = 0;j<selectedLayers[i].selectedProperties.length;j++){
                    if(selectedLayers[i].selectedProperties[j].canSetExpression){
                        var prop = selectedLayers[i].selectedProperties[j];
                        var easeOutAll = [];
                        var easeInAll = [];
                        
                        if ( !prop.isSpatial && prop.value.length == 3 ) {
                            easeOutAll = [easeOut,easeOut,easeOut];
                            easeInAll = [easeIn,easeIn,easeIn];
                        } else if ( !prop.isSpatial && prop.value.length == 2 ) {
                            easeOutAll = [easeOut,easeOut];
                            easeInAll = [easeIn,easeIn];
                        } else {
                            easeOutAll = [easeOut];
                            easeInAll = [easeIn];
                        }
                        
                        for(var k = 0;k< prop.selectedKeys.length;k++){
                            var curKeys = prop.selectedKeys;
                            prop.setTemporalContinuousAtKey(curKeys[k], 1);
                            prop.setTemporalEaseAtKey(curKeys[k],easeInAll,easeOutAll);
                        }
                    }
                }
            }
            app.endUndoGroup;
        };
        
        gr.gr2.extractBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            if(selectedLayers.length > 0 && selectedLayers[0].selectedProperties.length > 0){
                var curProperties = selectedLayers[0].selectedProperties[0];
                if(curProperties.canSetExpression && curProperties.selectedKeys.length >= 2){
                    var curKeys = curProperties.selectedKeys;
                    var influenceA = curProperties.keyOutTemporalEase(curKeys[0])[0].influence;
                    var influenceB = curProperties.keyInTemporalEase(curKeys[1])[0].influence;
                    
                    gr.gr1.influenceSlider.value = influenceA/10;
                    gr.gr1.influenceEt.text = influenceA;
                    influence = influenceA;
                    
                    space = 200 - influenceB - influenceA;
                    gr.gr2.spaceSlider.value = space/10;
                    gr.gr2.spaceEt.text = space;
                }
            }
            app.endUndoGroup;
        }
        
        gr.gr3.frameEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.frameSlider.value = Math.round(this.text);
            framenum = parseInt(this.text);
        }
        
        gr.gr3.minEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.frameSlider.minvalue = Math.round(this.text);
        }
        
        gr.gr3.maxEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.frameSlider.maxvalue = Math.round(this.text);
        }
        
        gr.gr3.frameSlider.onChange = gr.gr3.frameSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.frameEt.text = this.value;
            framenum = this.value;
        };
        
        gr.gr3.snapBox.onClick = function () {
            snapBox = this.value;
        }
        
        gr.gr3.frameBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            if(app.project.activeItem && app.project.activeItem.selectedLayers.length > 1){
                layerOffset();
            }
            app.endUndoGroup;
        };
        
        gr.gr4.bakeBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var i = 0;i<selectedLayers.length;i++){
                for(var j = 0;j<selectedLayers[i].selectedProperties.length;j++){
                    if(selectedLayers[i].selectedProperties[j].canSetExpression){
                        var prop = selectedLayers[i].selectedProperties[j];
                        if(prop.expression != "" && prop.expressionEnabled == 1){
                            for(var k = 0;k<prop.selectedKeys.length;k++){
                                var curKeys = prop.selectedKeys;
                                var newValue = prop.valueAtTime(prop.keyTime(curKeys[k]),0);
                                prop.setValueAtKey(curKeys[k],newValue);
                            }
                        }
                    }
                    selectedLayers[i].selectedProperties[j].expressionEnabled = 0;
                }
            }
            app.endUndoGroup;
        }
        
        gr.gr4.revSecLBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            reverseSeclect();
            app.endUndoGroup;
        }
        
        gr.gr4.idCreatBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            idcreat();
            app.endUndoGroup;
        }
        
        gr.extractMotionPanel.gr5.extractMotionToSliderBtn.onClick = function () {
            app.beginUndoGroup("提取运动到滑块");
            extractMotion(false);
            app.endUndoGroup();
        }
        
        gr.extractMotionPanel.gr5.extractMotionToNullBtn.onClick = function () {
            app.beginUndoGroup("提取运动到空对象");
            extractMotion(true);
            app.endUndoGroup();
        }
        
        return gr;
    }
    
    // 返回模块接口
    return {
        name: "KeyframesEase",
        displayName: "KeyframesEase",
        version: "1.0",
        buildUI: buildUI
    };
})();

// 独立运行模式 - 只在非启动器加载时运行
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "KeyframesEase by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        KeyframesEaseModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
