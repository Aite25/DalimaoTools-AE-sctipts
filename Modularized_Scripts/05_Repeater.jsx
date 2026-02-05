/*
 * 模块名称: Repeater
 * 功能描述: 形状图层重复器工具，支持翻转、环形、插值等多种复制模式
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var RepeaterModule = (function() {
    var moduleObj = {
        name: "Repeater",
        displayName: "Repeater",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
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
            
            var grp = container.add(repeater_res);
            
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
                var repeaterArr = [];
                var rep_layerArr = [];
                var patharr = add_repeater();
                repeaterArr = patharr[0];
                rep_layerArr = patharr[1];
                
                for (var i = 0; i < repeaterArr.length; i++) {
                    repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                    repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([-100, -100]);
                    repeaterArr[i].name = "XY flip - Repeater";
                }
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
                    repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
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
                    repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
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

                sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(\"Slider\");\n[size,size]";
                
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

                sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(\"Slider\");\n[size,size]";
                
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
        var win = new Window("palette", "Repeater by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        RepeaterModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}