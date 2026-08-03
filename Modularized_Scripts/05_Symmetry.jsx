/*
 * 模块名称: Symmetry & Repeater
 * 功能描述: 形状图层对称与重复器工具
 * 版本: 2.0.0
 * 作者: Dalimao Tools
 */

var SymmetryModule = (function() {
    var moduleObj = {
        name: "Symmetry",
        displayName: "Symmetry",
        version: "2.0.0",
        
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 创建分页面板
            var tpanel = container.add("tabbedpanel", undefined, undefined, {name: "symTabPanel"});
            tpanel.alignChildren = "fill";
            tpanel.orientation = "column";
            tpanel.alignment = ["fill","fill"];
            tpanel.margins = 5;
            
            // ==== Tab 1: Symmetry ====
            var symmetryTab = tpanel.add("tab", undefined, undefined, {name: "symmetryTab"});
            symmetryTab.text = "Symmetry";
            symmetryTab.orientation = "column";
            symmetryTab.alignChildren = ["left","top"];
            symmetryTab.spacing = 5;
            
            // Symmetry 按钮组
            var symGr1 = symmetryTab.add("group", undefined, {name: "symGr1"});
            symGr1.orientation = "row";
            symGr1.alignChildren = ["left","top"];
            symGr1.spacing = 3;
            
            var symXflipBtn = symGr1.add("button", undefined, "X <>");
            symXflipBtn.preferredSize = [40, 20];
            var symYflipBtn = symGr1.add("button", undefined, "Y ↑↓");
            symYflipBtn.preferredSize = [40, 20];
            var symXyflipBtn = symGr1.add("button", undefined, "XY ✕");
            symXyflipBtn.preferredSize = [40, 20];
            var symRingBtn = symGr1.add("button", undefined, "Ring ❋");
            symRingBtn.preferredSize = [50, 20];
            var symRot90Btn = symGr1.add("button", undefined, "90 ↻");
            symRot90Btn.preferredSize = [40, 20];
            var symRot180Btn = symGr1.add("button", undefined, "180 ↻");
            symRot180Btn.preferredSize = [40, 20];
            
            // 复选框组 - 第一行
            var symGr2 = symmetryTab.add("group", undefined, {name: "symGr2"});
            symGr2.orientation = "row";
            symGr2.alignChildren = ["left","top"];
            symGr2.spacing = 5;
            
            var symCompCenterBox = symGr2.add("checkbox", undefined, "Comp Center");
            symCompCenterBox.value = true;
            symCompCenterBox.helpTip = "以合成中心作为对称轴的参考点";
            var symScaleBox = symGr2.add("checkbox", undefined, "Scale");
            symScaleBox.value = true;
            symScaleBox.helpTip = "是否对复制图层的缩放属性进行镜像处理";
            var symRotationBox = symGr2.add("checkbox", undefined, "Rotation");
            symRotationBox.value = true;
            symRotationBox.helpTip = "是否对复制图层的旋转属性进行镜像处理";
            var symPositionBox = symGr2.add("checkbox", undefined, "Position");
            symPositionBox.value = true;
            symPositionBox.helpTip = "是否对复制图层的位置属性进行镜像/旋转位移";
            
            // 复选框组 - 第二行
            var symGr3 = symmetryTab.add("group", undefined, {name: "symGr3"});
            symGr3.orientation = "row";
            symGr3.alignChildren = ["left","top"];
            symGr3.spacing = 5;
            
            var symCreateNullBox = symGr3.add("checkbox", undefined, "Create Null");
            symCreateNullBox.value = true;
            symCreateNullBox.helpTip = "创建一个空对象作为对称中心（会生成唯一名称避免冲突）";
            var symExpressionBox = symGr3.add("checkbox", undefined, "Expression");
            symExpressionBox.value = true;
            symExpressionBox.helpTip = "勾选：用表达式绑定源图层属性（可联动修改）\n取消：直接设置数值（独立副本）";
            var symLayerParentBox = symGr3.add("checkbox", undefined, "Layer Parent");
            symLayerParentBox.value = false;
            symLayerParentBox.helpTip = "以最后一个选中的图层作为对称中心（该图层不会被复制）";
            
            // Symmetry 核心逻辑
            // flipX/Y/XY 定义：哪个轴翻转就是对称轴
            // X<> = 水平镜像（X轴翻转），对称轴是垂直的（Y轴）
            // Y↑↓ = 垂直镜像（Y轴翻转），对称轴是水平的（X轴）
            // XY✕ = 水平+垂直镜像（原点对称）
            
            function getLayersAndCenter(thisComp) {
                var sel = thisComp.selectedLayers;
                var layersToProcess = [];
                var centerLayer = null;
                
                if (symLayerParentBox.value && sel.length >= 2) {
                    // Last Layer 模式：最后一层作为中心，不复制
                    centerLayer = sel[sel.length - 1];
                    for (var i = 0; i < sel.length - 1; i++) {
                        layersToProcess.push(sel[i]);
                    }
                } else if (symCreateNullBox.value) {
                    // 创建空对象作为对称轴
                    var nullL = thisComp.layers.addNull();
                    var uid = new Date().getTime().toString(36) + Math.floor(Math.random() * 360).toString(36);
                    nullL.name = "SymCenter_" + uid;
                    nullL.label = 9;
                    nullL.position.setValue([thisComp.width / 2, thisComp.height / 2]);
                    centerLayer = nullL;
                    layersToProcess = sel;
                } else {
                    layersToProcess = sel;
                }
                
                return { layers: layersToProcess, center: centerLayer };
            }
            
            // 形状图层属性绑定：把副本 Contents 的尺寸/位置/路径绑定到源图层
            function bindShapeProps(layer, srcName) {
                var contents = layer.property("Contents");
                if (!contents) return;
                bindShapeContents(contents, 'thisComp.layer("' + srcName + '")', "");
            }
            
            function bindShapeContents(contents, srcBase, chain) {
                var i, p;
                for (i = 1; i <= contents.numProperties; i++) {
                    var item = contents.property(i);
                    var groupContents = item.property("Contents");
                    if (groupContents) {
                        bindShapeContents(groupContents, srcBase, chain + '.content("' + item.name + '")');
                        continue;
                    }
                    var sizeProp = item.property("Size");
                    var posProp = item.property("Position");
                    if (sizeProp && posProp) {
                        sizeProp.expression = srcBase + chain + '.content("' + item.name + '").size;';
                        posProp.expression = srcBase + chain + '.content("' + item.name + '").position;';
                        var roundProp = item.property("Roundness");
                        if (roundProp) roundProp.expression = srcBase + chain + '.content("' + item.name + '").roundness;';
                        continue;
                    }
                    if (item.property("Points")) {
                        var names = ["Points", "Position", "Inner Radius", "Outer Radius", "Inner Roundness", "Outer Roundness", "Rotation"];
                        var accessors = {
                            "Points": "points",
                            "Position": "position",
                            "Inner Radius": "innerRadius",
                            "Outer Radius": "outerRadius",
                            "Inner Roundness": "innerRoundness",
                            "Outer Roundness": "outerRoundness",
                            "Rotation": "rotation"
                        };
                        for (p = 0; p < names.length; p++) {
                            var sub = item.property(names[p]);
                            if (sub) sub.expression = srcBase + chain + '.content("' + item.name + '").' + accessors[names[p]] + ';';
                        }
                        continue;
                    }
                    if (item.numProperties == 0) {
                        item.expression = srcBase + chain + '.content("' + item.name + '").path;';
                    }
                }
            }
            
            function applySymmetry(srcLayer, dupLayer, scaleX, scaleY, rotDeg, centerLayer, thisComp) {
                var useExpr = symExpressionBox.value;
                var compCenter = [thisComp.width / 2, thisComp.height / 2];
                var centerPos = centerLayer ? centerLayer.position.value : compCenter;
                var hasRotation = (rotDeg !== 0);
                var rad = rotDeg * Math.PI / 180;
                
                // Position 对称（含旋转位移）
                if (symPositionBox.value || hasRotation) {
                    var srcPos = srcLayer.position.value;
                    var dx = srcPos[0] - centerPos[0];
                    var dy = srcPos[1] - centerPos[1];
                    
                    var newPos;
                    if (hasRotation) {
                        // 绕中心旋转：旋转公式
                        var cosR = Math.cos(rad);
                        var sinR = Math.sin(rad);
                        newPos = [
                            centerPos[0] + dx * cosR * scaleX - dy * sinR * scaleY,
                            centerPos[1] + dx * sinR * scaleX + dy * cosR * scaleY
                        ];
                    } else {
                        newPos = [centerPos[0] + dx * scaleX, centerPos[1] + dy * scaleY];
                    }
                    if (srcPos.length > 2) newPos[2] = srcPos[2];
                    
                    if (useExpr && centerLayer) {
                        dupLayer.position.expression =
                            'var center = thisComp.layer("' + centerLayer.name + '").position;\n' +
                            'var src = thisComp.layer("' + srcLayer.name + '").position;\n' +
                            'var d = src - center;\n' +
                            'var rad = degreesToRadians(' + rotDeg + ');\n' +
                            'center + [d[0] * Math.cos(rad) * (' + scaleX + ') - d[1] * Math.sin(rad) * (' + scaleY + '),\n' +
                            '           d[0] * Math.sin(rad) * (' + scaleX + ') + d[1] * Math.cos(rad) * (' + scaleY + ')];';
                    } else if (useExpr) {
                        dupLayer.position.expression =
                            'var center = [' + compCenter[0] + ', ' + compCenter[1] + '];\n' +
                            'var src = thisComp.layer("' + srcLayer.name + '").position;\n' +
                            'var d = src - center;\n' +
                            'var rad = degreesToRadians(' + rotDeg + ');\n' +
                            'center + [d[0] * Math.cos(rad) * (' + scaleX + ') - d[1] * Math.sin(rad) * (' + scaleY + '),\n' +
                            '           d[0] * Math.sin(rad) * (' + scaleX + ') + d[1] * Math.cos(rad) * (' + scaleY + ')];';
                    } else {
                        dupLayer.position.setValue(newPos);
                    }
                }
                
                // Scale 对称
                if (symScaleBox.value) {
                    var srcScale = srcLayer.scale.value;
                    var newScale = [srcScale[0] * scaleX, srcScale[1] * scaleY];
                    if (srcScale.length > 2) newScale[2] = srcScale[2];
                    
                    if (useExpr) {
                        dupLayer.scale.expression =
                            'var s = thisComp.layer("' + srcLayer.name + '").scale;\n' +
                            '[' + scaleX + ' * s[0], ' + scaleY + ' * s[1]];';
                    } else {
                        dupLayer.scale.setValue(newScale);
                    }
                }
                
                // Rotation 对称
                if (symRotationBox.value) {
                    var srcRot = srcLayer.rotation.value;
                    var newRot = srcRot * scaleX * scaleY + rotDeg;
                    
                    if (useExpr) {
                        dupLayer.rotation.expression =
                            'thisComp.layer("' + srcLayer.name + '").rotation * (' + (scaleX * scaleY) + ') + ' + rotDeg + ';';
                    } else {
                        dupLayer.rotation.setValue(newRot);
                    }
                }
                
                // 形状图层属性绑定：把副本 Contents 的尺寸/位置/路径绑定到源图层
                bindShapeProps(dupLayer, srcLayer.name);
            }
            
            // X<> 水平镜像
            symXflipBtn.onClick = function() {
                app.beginUndoGroup("Symmetry X");
                var thisComp = app.project.activeItem;
                var info = getLayersAndCenter(thisComp);
                if (info.layers.length == 0) { app.endUndoGroup(); return; }
                for (var i = 0; i < info.layers.length; i++) {
                    var dup = info.layers[i].duplicate();
                    dup.name = info.layers[i].name + " X";
                    dup.moveAfter(info.layers[i]);
                    dup.label = 6;
                    applySymmetry(info.layers[i], dup, -1, 1, 0, info.center, thisComp);
                }
                app.endUndoGroup();
            };
            
            // Y↑↓ 垂直镜像
            symYflipBtn.onClick = function() {
                app.beginUndoGroup("Symmetry Y");
                var thisComp = app.project.activeItem;
                var info = getLayersAndCenter(thisComp);
                if (info.layers.length == 0) { app.endUndoGroup(); return; }
                for (var i = 0; i < info.layers.length; i++) {
                    var dup = info.layers[i].duplicate();
                    dup.name = info.layers[i].name + " Y";
                    dup.moveAfter(info.layers[i]);
                    dup.label = 6;
                    applySymmetry(info.layers[i], dup, 1, -1, 0, info.center, thisComp);
                }
                app.endUndoGroup();
            };
            
            // XY✕ 三轴对称（X + Y + XY 共3份）
            symXyflipBtn.onClick = function() {
                app.beginUndoGroup("Symmetry XY");
                var thisComp = app.project.activeItem;
                var info = getLayersAndCenter(thisComp);
                if (info.layers.length == 0) { app.endUndoGroup(); return; }
                for (var i = 0; i < info.layers.length; i++) {
                    // X 对称
                    var dupX = info.layers[i].duplicate();
                    dupX.name = info.layers[i].name + " X";
                    dupX.moveAfter(info.layers[i]);
                    dupX.label = 6;
                    applySymmetry(info.layers[i], dupX, -1, 1, 0, info.center, thisComp);
                    
                    // Y 对称
                    var dupY = info.layers[i].duplicate();
                    dupY.name = info.layers[i].name + " Y";
                    dupY.moveAfter(info.layers[i]);
                    dupY.label = 6;
                    applySymmetry(info.layers[i], dupY, 1, -1, 0, info.center, thisComp);
                    
                    // XY 对称
                    var dupXY = info.layers[i].duplicate();
                    dupXY.name = info.layers[i].name + " XY";
                    dupXY.moveAfter(info.layers[i]);
                    dupXY.label = 6;
                    applySymmetry(info.layers[i], dupXY, -1, -1, 0, info.center, thisComp);
                }
                app.endUndoGroup();
            };
            
            // Ring❋ 环形对称（表达式环绕）
            symRingBtn.onClick = function() {
                try {
                    app.beginUndoGroup("Symmetry Ring");
                    var thisComp = app.project.activeItem;
                    var sel = thisComp.selectedLayers;
                    if (sel.length == 0) { app.endUndoGroup(); return; }
                    
                    var uid = new Date().getTime().toString(36) + Math.floor(Math.random() * 360).toString(36);
                    
                    // 记录选中图层的名字（后续 addNull 会改变 index，名字更可靠）
                    var srcNames = [];
                    for (var i = 0; i < sel.length; i++) {
                        srcNames.push(sel[i].name);
                    }
                    
                    // 1. 先创建计数空对象（会出现在 index 1，后续再移动）
                    var counterNull = thisComp.layers.addNull();
                    counterNull.name = "SymCounter_" + uid;
                    counterNull.label = 13;
                    counterNull.enabled = false;
                    
                    // 2. 复制选中图层（副本放在选中图层下方）
                    var bottomRing = null;
                    for (var i = 0; i < sel.length; i++) {
                        var dup = sel[i].duplicate();
                        dup.name = sel[i].name + " Ring";
                        dup.label = 6;
                        dup.moveAfter(sel[i]);
                        bottomRing = dup;
                    }
                    
                    // 3. 创建中心空对象（会出现在 index 1）
                    var centerNull = thisComp.layers.addNull();
                    centerNull.name = "SymCenter_" + uid;
                    centerNull.label = 9;
                    
                    // 4. 把计数空对象移到底部副本下方
                    if (bottomRing) counterNull.moveAfter(bottomRing);
                    
                    // 5. 计算 index 并创建滑块
                    var centerIdx = centerNull.index;
                    var counterIdx = counterNull.index;
                    
                    var countSlider = centerNull.Effects.addProperty("ADBE Slider Control");
                    countSlider.name = "Ring Count";
                    countSlider(1).expression = 'thisComp.layer("' + counterNull.name + '").index-index-1';
                    
                    // Angle gap 表达式 = 360 / Ring Count（带除零保护）
                    var angleGapSlider = centerNull.Effects.addProperty("ADBE Slider Control");
                    angleGapSlider.name = "Angle gap";
                    angleGapSlider(1).expression = 'ct = effect("Ring Count")(1);\nct == 0? 0 : 360 / ct;';
                    
                    // 6. 给复制图层添加 ID 滑块 + Position/Rotation/Scale 表达式
                    for (var li = centerIdx + 1; li < counterIdx; li++) {
                        var layer = thisComp.layer(li);
                        if (layer.name === centerNull.name || layer.name === counterNull.name) continue;
                        if (layer.name.indexOf(" Ring", layer.name.length - 5) === -1) continue;
                        
                        // 添加 ID 滑块（副本在源图层下方，index 偏移 1，减 1 保持 ID 序列一致）
                        var idSlider = layer.Effects.addProperty("ADBE Slider Control");
                        idSlider.name = "ID";
                        idSlider(1).expression = 'index - thisComp.layer("' + centerNull.name + '").index - 1';
                        
                        // Position 表达式：绕中心旋转
                        layer.position.expression =
                            'var center = thisComp.layer("' + centerNull.name + '").position;\n' +
                            'var angle_gap = thisComp.layer("' + centerNull.name + '").effect("Angle gap")(1);\n' +
                            'var id = effect("ID")(1);\n' +
                            'var src = thisComp.layer("' + srcNames[0] + '").position;\n' +
                            'var d = src - center;\n' +
                            'var rad = degreesToRadians(id * angle_gap);\n' +
                            'center + [d[0] * Math.cos(rad) - d[1] * Math.sin(rad), d[0] * Math.sin(rad) + d[1] * Math.cos(rad)];';
                        
                        // Rotation 表达式：参考 dulplicate layer 模式
                        layer.rotation.expression =
                            'id = effect("ID")(1);\n' +
                            'rot_delta = thisComp.layer("' + centerNull.name + '").effect("Angle gap")(1);\n' +
                            'or = thisComp.layer("' + srcNames[0] + '").transform.rotation;\n' +
                            'id * rot_delta + or;';
                        
                        // Scale 表达式：绑定选中源图层的缩放
                        layer.scale.expression = 'thisComp.layer("' + srcNames[0] + '").transform.scale;';
                        
                        // 形状图层属性绑定：把副本 Contents 绑定到其源图层
                        bindShapeProps(layer, thisComp.layer(li - 1).name);
                    }
                    
                    app.endUndoGroup();
                } catch(e) {
                    alert("Ring Error: " + e.toString());
                    app.endUndoGroup();
                }
            };
            
            // 90↻ 旋转90度镜像
            symRot90Btn.onClick = function() {
                app.beginUndoGroup("Symmetry Rot90");
                var thisComp = app.project.activeItem;
                var info = getLayersAndCenter(thisComp);
                if (info.layers.length == 0) { app.endUndoGroup(); return; }
                for (var i = 0; i < info.layers.length; i++) {
                    var dup = info.layers[i].duplicate();
                    dup.name = info.layers[i].name + " 90";
                    dup.moveBefore(info.layers[i]);
                    dup.label = 6;
                    applySymmetry(info.layers[i], dup, 1, 1, 90, info.center, thisComp);
                }
                app.endUndoGroup();
            };
            
            // 180↻ 旋转180度镜像
            symRot180Btn.onClick = function() {
                app.beginUndoGroup("Symmetry Rot180");
                var thisComp = app.project.activeItem;
                var info = getLayersAndCenter(thisComp);
                if (info.layers.length == 0) { app.endUndoGroup(); return; }
                for (var i = 0; i < info.layers.length; i++) {
                    var dup = info.layers[i].duplicate();
                    dup.name = info.layers[i].name + " 180";
                    dup.moveBefore(info.layers[i]);
                    dup.label = 6;
                    applySymmetry(info.layers[i], dup, 1, 1, 180, info.center, thisComp);
                }
                app.endUndoGroup();
            };
            
            // ==== Tab 2: Repeater（原有功能） ====
            var repeaterTab = tpanel.add("tab", undefined, undefined, {name: "repeaterTab"});
            repeaterTab.text = "Repeater";
            repeaterTab.orientation = "column";
            repeaterTab.alignChildren = ["left","top"];
            repeaterTab.spacing = 5;
            
            // 默认值
            var copiesNum = 5;
            var posXnum = 100;
            var posYnum = 0;
            var rotationNum = 0;
            var offsetBool = 0;

            // 资源字符串
            var repeater_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { \
                        xflipBtn: Button { text:'X <>',alignment:['left','top'], preferredSize:[40,20] } \
                        yflipBtn: Button { text:'Y ↑↓',alignment:['left','top'], preferredSize:[40,20] } \
                        xyflipBtn: Button { text:'XY ✕',alignment:['left','top'], preferredSize:[40,20] } \
                        ringBtn: Button { text:'Ring ❋',alignment:['left','top'], preferredSize:[50,20] } \
                        interposeBtn: Button { text:'Mid --¦--',alignment:['left','top'], preferredSize:[50,20] } \
                    }, \
                    gr2: Group { \
                        rot90Btn: Button { text:'90 ↻',alignment:['left','top'], preferredSize:[40,20] } \
                        rot180Btn: Button { text:'180 ↻',alignment:['left','top'], preferredSize:[40,20] } \
                        defultBtn: Button { text:'-',alignment:['left','top'], preferredSize:[10,20] } \
                        creatBoxBtn: Button { text:'Box □',alignment:['left','top'], preferredSize:[65,20] } \
                        creatCircleBtn: Button { text:'Circle ○',alignment:['left','top'], preferredSize:[65,20] } \
                    }, \
                    gr3: Group { \
                        copiesSt: StaticText { text:'Copies',alignment:['left','top'], preferredSize:[35,20] } \
                        copiesSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:1 ,maxvalue:10,value:" + copiesNum + " } \
                        copiesEt:EditText { text:'" + copiesNum + "',alignment:['right','top'] ,preferredSize:[25,20]} \
                        posSt:StaticText { text:'Pos',alignment:['left','top'], preferredSize:[30,20] } \
                        posXSt:StaticText { text:'X',alignment:['left','top'], preferredSize:[10,20] } \
                        posXEt:EditText { text:'" + posXnum + "',alignment:['right','top'] ,preferredSize:[30,20]} \
                        posYSt:StaticText { text:'Y',alignment:['left','top'], preferredSize:[10,20] } \
                        posYEt:EditText { text:'" + posYnum + "',alignment:['right','top'] ,preferredSize:[30,20]} \
                    }, \
                    gr4: Group { \
                        rotSt: StaticText { text:'Rot ↻',alignment:['left','top'], preferredSize:[35,20] } \
                        rotSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:0 ,maxvalue:8,value:" + rotationNum + " } \
                        rotEt:EditText { text:'" + rotationNum + "',alignment:['left','top'] ,preferredSize:[30,20]} \
                        offsetBox: Checkbox { text:'Mid',preferredSize:[40,20],value:"+ offsetBool +"}    \
                        applyBtn: Button { text:'Apply',alignment:['right','top'], preferredSize:[95,20] } \
                    }, \
                }";
            
            var grp = repeaterTab.add(repeater_res);
            
            // UI路径引用
            var repeater_defultBtn = grp.gr2.defultBtn;
            var repeater_xflipBtn = grp.gr1.xflipBtn;
            var repeater_yflipBtn = grp.gr1.yflipBtn;
            var repeater_xyflipBtn = grp.gr1.xyflipBtn;
            var repeater_ringBtn = grp.gr1.ringBtn;
            var repeater_interposeBtn = grp.gr1.interposeBtn;
            var repeater_rot90Btn = grp.gr2.rot90Btn;
            var repeater_rot180Btn = grp.gr2.rot180Btn;
            var repeater_creatBoxBtn = grp.gr2.creatBoxBtn;
            var repeater_creatCircleBtn = grp.gr2.creatCircleBtn;
            var repeater_applyBtn = grp.gr4.applyBtn;
            
            var repeater_copiesSlider = grp.gr3.copiesSlider;
            var repeater_copiesEt = grp.gr3.copiesEt;
            var repeater_posXEt = grp.gr3.posXEt;
            var repeater_posYEt = grp.gr3.posYEt;
            var repeater_rotSlider = grp.gr4.rotSlider;
            var repeater_rotEt = grp.gr4.rotEt;
            var repeater_offsetBox = grp.gr4.offsetBox;

            // 辅助函数
            function add_repeater() {
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                var secL = thisComp.selectedLayers;
                var repeaterArr = [];
                var rep_layerArr = [];
                var rep_lay = [];
                
                if (secP.length == 0 && secL.length != 0) {
                    for (var i = 0; i < secL.length; i++) {
                        if (secL[i].matchName == "ADBE Vector Layer") {
                            var repeater = secL[i]("Contents").addProperty("ADBE Vector Filter - Repeater");
                            repeaterArr.push(repeater);
                            rep_layerArr.push(secL[i]);
                        }
                    }
                } else if (secP.length != 0) {
                    for (var i = 0; i < secP.length; i++) {
                        var secObj = secP[i];
                        for (var j = 0; j < 5; j++) {
                            if (secObj.matchName == "ADBE Vector Group") {
                                var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                                repeaterArr.push(repeater);
                                var current_layer = repeater.propertyGroup(repeater.propertyDepth);
                                rep_layerArr.push(current_layer);
                                break;
                            } else if (secObj.matchName == "ADBE Vector Layer") {
                                break;
                            } else {
                                secObj = secObj.propertyGroup(1);
                            }
                        }
                    }
                }
                rep_lay.push(repeaterArr, rep_layerArr);
                return rep_lay;
            }

            function shape_xflip() {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([-100, 100]);
                    repeaterArr[i].name = "X flip - Repeater";
                }
            }

            function shape_yflip() {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([100, -100]);
                    repeaterArr[i].name = "Y flip - Repeater";
                }
            }

            function shape_xyflip() {
                // 形状层无法靠单个 repeater 实现点对称：改为两个 repeater（X 翻转 + Y 翻转），
                // 效果等同于连续按 X flip 和 Y flip 两个按钮
                shape_xflip();
                shape_yflip();
            }

            function shape_90_degree_duplicate() {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(90);
                    repeaterArr[i].name = "90 degree - Repeater";
                }
            }

            function shape_180_degree_duplicate() {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(180);
                    repeaterArr[i].name = "180 degree - Repeater";
                }
            }

            function ring_round_duplicate(copies) {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];

                for (var i = 0; i < repeaterArr.length; i++) {
                    var depth_idx_str = repeaterArr[i].propertyDepth + "_" + repeaterArr[i].propertyIndex;
                    var slider = rep_layerArr[i].Effects.addProperty("ADBE Slider Control");
                    slider.name = "Copies " + depth_idx_str;
                    slider(1).setValue(copies);
                    repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(1)";
                    repeaterArr[i].name = "Ring - Repeater " + depth_idx_str;
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").expression = "thisProperty.propertyGroup(2).copies == 0?0:360/thisProperty.propertyGroup(2).copies;";
                }
            }

            function interpose_duplicate(copies, pos) {
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    var slider = rep_layerArr[i].Effects.addProperty("ADBE Slider Control");
                    var depth_idx_str = repeaterArr[i].propertyDepth + "_" + repeaterArr[i].propertyIndex;
                    slider.name = "Copies " + depth_idx_str;
                    slider(1).setValue(copies);
                    repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(1)";
                    repeaterArr[i].property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                    
                    var position_slider = rep_layerArr[i].Effects.addProperty("ADBE Point Control");
                    position_slider.name = "Pos - Repeater " + depth_idx_str;
                    position_slider(1).setValue(pos);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Position").expression = "effect(\"" + position_slider.name + "\")(\"Point\")";
                    repeaterArr[i].name = "Interpose - Repeater " + depth_idx_str;
                }
            }

            // 事件回调
            repeater_xflipBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                shape_xflip();
                app.endUndoGroup();
            };

            repeater_yflipBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                shape_yflip();
                app.endUndoGroup();
            };

            repeater_xyflipBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                shape_xyflip();
                app.endUndoGroup();
            };

            repeater_ringBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                ring_round_duplicate(8);
                app.endUndoGroup();
            };

            repeater_interposeBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                interpose_duplicate(5, [100, 0]);
                app.endUndoGroup();
            };

            repeater_rot90Btn.onClick = function() {
                app.beginUndoGroup(scriptName);
                shape_90_degree_duplicate();
                app.endUndoGroup();
            };

            repeater_rot180Btn.onClick = function() {
                app.beginUndoGroup(scriptName);
                shape_180_degree_duplicate();
                app.endUndoGroup();
            };

            repeater_creatBoxBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                
                var shape = thisComp.layers.addShape();
                var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                sgroup1.name = "Retangle 1";
                var sRetengle = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");

                var depth_idx_str = sRetengle.propertyDepth + "_" + sRetengle.propertyIndex;
                var slider = shape.Effects.addProperty("ADBE Slider Control");
                slider.name = "Box Size " + depth_idx_str;
                slider(1).setValue(100);

                sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(1);\n[size,size]";
                
                var sgroup1Stroke = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                sgroup1Stroke.enabled = 0;
                var sgroup1Fill = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
                sgroup1Fill("ADBE Vector Fill Color").setValue([1, 1, 1, 1]);
                sgroup1Fill.enabled = 1;
                if (secL.length != 0) {
                    shape.moveBefore(secL[0]);
                }
                app.endUndoGroup();
            };

            repeater_creatCircleBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                
                var shape = thisComp.layers.addShape();
                var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                sgroup1.name = "Ellipse 1";
                var sRetengle = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");

                var depth_idx_str = sRetengle.propertyDepth + "_" + sRetengle.propertyIndex;
                var slider = shape.Effects.addProperty("ADBE Slider Control");
                slider.name = "Circle Size " + depth_idx_str;
                slider(1).setValue(100);

                sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(1);\n[size,size]";
                
                var sgroup1Stroke = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
                sgroup1Stroke.enabled = 0;
                var sgroup1Fill = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
                sgroup1Fill("ADBE Vector Fill Color").setValue([1, 1, 1, 1]);
                sgroup1Fill.enabled = 1;
                if (secL.length != 0) {
                    shape.moveBefore(secL[0]);
                }
                app.endUndoGroup();
            };

            repeater_applyBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];

                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(copiesNum);
                    if (offsetBool == 1) {
                        repeaterArr[i].property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                    }
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Position").setValue([posXnum, posYnum]);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(rotationNum);
                }
                app.endUndoGroup();
            };

            // 滑块事件
            repeater_copiesSlider.onChange = repeater_copiesSlider.onChanging = function() {
                this.value = Math.round(this.value);
                this.parent.copiesEt.text = this.value;
                copiesNum = this.value;
            };

            repeater_rotSlider.onChange = repeater_rotSlider.onChanging = function() {
                this.value = Math.round(this.value);
                this.parent.rotEt.text = Math.round(this.value * 45);
                rotationNum = Math.round(this.value * 45);
            };

            // EditText事件
            repeater_copiesEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                this.parent.copiesSlider.value = parseInt(this.text);
                copiesNum = parseInt(this.text);
            };

            repeater_posXEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                posXnum = parseInt(this.text);
            };

            repeater_posYEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                posYnum = parseInt(this.text);
            };

            repeater_rotEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                rotationNum = parseInt(this.text);
            };

            repeater_offsetBox.onClick = function() {
                offsetBool = this.value;
            };

            // 默认选中 Repeater tab
            tpanel.selection = symmetryTab;

            return container;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(SymmetryModule);
} else {
    (function() {
        var win = new Window("palette", "Symmetry by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        SymmetryModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}