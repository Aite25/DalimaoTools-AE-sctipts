/*
 * 模块名称: SliderCreator
 * 功能描述:滑块控制器创建工具，支持多种控制器类型和自动适配表达式
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var SliderCreatorModule = (function() {
    var moduleObj = {
        name: "SliderCreator",
        displayName: "Slider Creator",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 默认值
            var sc_sliderCount = 1;
            var sc_oneBox = 0;
            var sc_allBox = 1;
            var sc_nameBox = 0;
            var sc_slidertype = 0;
            var sc_sliderName = 'Dalimao';
            var sc_typeArr = ["ADBE Slider Control", "ADBE Point Control", "ADBE Point3D Control", "ADBE Color Control", "ADBE Angle Control", "ADBE Checkbox Control", "ADBE Layer Control"];

            // 原型方法
            Property.prototype.contaningLayer = function() {
                return this.propertyGroup(this.propertyDepth);
            };
            
            function findPropertyLayer(prop) {
                return prop.propertyGroup(prop.propertyDepth);
            }

            // 资源字符串
            var slider_creator_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { \
                        sc_createBtn: Button { text:'Create & Exp',alignment:['left','top'], preferredSize:[80,20] } \
                        sc_oneBox: Checkbox { text:'1 width',preferredSize:[60,17],value:"+sc_oneBox+"}    \
                        sc_allBox: Checkbox { text:'x y z = a',preferredSize:[80,17],value:"+sc_allBox+"}    \
                        sc_addaptBtn: Button { text:'Adapt Exp',alignment:['left','top'], preferredSize:[80,20] } \
                    }, \
                    gr2: Group {  alignment:['fill','top'],\
                        onlysc_createBtn: Button { text:'Only Create',alignment:['left','top'], preferredSize:[80,20] } \
                        sc_typeSlider: Slider { alignment:['fill','center'], preferredSize:[20,17],minvalue:0 ,maxvalue:6,value:" + sc_slidertype + " } \
                        sc_typeEt:EditText { text:'" + parseInt(sc_slidertype+1) + "',alignment:['right','top'] ,preferredSize:[25,20]} \
                        sc_typeSt: StaticText { text:'" + sc_typeArr[0].toString().slice(5) + "',alignment:['left','top'], preferredSize:[95,17] } \
                        crossSt: StaticText { text:'×',alignment:['left','top'], preferredSize:[17,17] } \
                        sc_countSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:1 ,maxvalue:10,value:" + sc_sliderCount + " } \
                        sc_countEt:EditText { text:'" + sc_sliderCount + "',alignment:['right','top'] ,preferredSize:[25,20]} \
                    }, \
                    gr3: Group { orientation:'row', alignment:['fill','top'], \
                        sc_nameBox: Checkbox { text:'Rename',preferredSize:[70,17],value:"+ sc_nameBox +"}    \
                        sc_sliderNameEt: EditText { text:'" + sc_sliderName + "',alignment:['fill','center'] ,preferredSize:[300,20] ,properties: { multiline: false }} \
                    }, \
                    gr4: Group { orientation:'row', alignment:['fill','fill'], \
                        thisLayerSt: StaticText { text:'thisLayer',alignment:['left','top'],preferredSize:[70,20] }    \
                        thisLayerEt: EditText { text:'effect',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
                    }, \
                    gr5: Group { orientation:'row', alignment:['fill','fill'], \
                        otherLayerSt: StaticText { text:'otherLayer',alignment:['left','top'],preferredSize:[70,20] }    \
                        otherLayerEt: EditText { text:'thisComp.layer',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
                    }, \
                }";
            
            var grp = container.add(slider_creator_res);
            
            // UI路径引用
            var sc_createBtn = grp.gr1.sc_createBtn;
            var sc_oneBox_ = grp.gr1.sc_oneBox;
            var sc_allBox_ = grp.gr1.sc_allBox;
            var sc_addaptBtn = grp.gr1.sc_addaptBtn;
            
            var sc_typeSlider = grp.gr2.sc_typeSlider;
            var onlysc_createBtn = grp.gr2.onlysc_createBtn;
            var sc_typeEt = grp.gr2.sc_typeEt;
            var sc_typeSt = grp.gr2.sc_typeSt;
            var sc_countSlider = grp.gr2.sc_countSlider;
            var sc_countEt = grp.gr2.sc_countEt;
            
            var sc_nameBox_ = grp.gr3.sc_nameBox;
            var sc_sliderNameEt = grp.gr3.sc_sliderNameEt;
            
            var thisLayerEt = grp.gr4.thisLayerEt;
            var otherLayerEt = grp.gr5.otherLayerEt;

            // 事件回调
            sc_createBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                var secL = thisComp.selectedLayers;
                var cursecL = secL[0];

                thisLayerEt.text = '';
                otherLayerEt.text = '';

                if (secP.length == 0) { // 不选属性只选图层
                    for (var i = 0; i < secL.length; i++) {
                        var eff = secL[i].Effects.addProperty(sc_typeArr[0]);
                        thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        otherLayerEt.text += 'thisComp.layer("' + secL[i].name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                    }
                } else { // 有选中属性
                    for (var j = 0; j < secP.length; j++) {
                        cursecL = findPropertyLayer(secP[j]);
                        if (secP[j].canSetExpression) {
                            var eff;
                            var valuewidth = 1;
                            if (secP[j].value.length != undefined) {
                                valuewidth = secP[j].value.length;
                            }

                            if (sc_oneBox == 1) { // 只加一个滑块
                                eff = cursecL.Effects.addProperty(sc_typeArr[0]);
                                try {
                                    if (sc_nameBox == 0) {
                                        var depth_idx_str = " " + secP[j].propertyDepth + "_" + secP[j].propertyIndex;
                                        eff.name = secP[j].name + depth_idx_str;
                                    } else {
                                        eff.name = sc_sliderName;
                                    }
                                } catch (e) {}
                                eff(1).setValue(secP[j].value[0]);
                                secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                                if (sc_allBox == 0) {
                                    if (valuewidth == 1) {
                                        secP[j].expression += '';
                                    } else if (valuewidth == 2) {
                                        secP[j].expression += '\nx = sld;\ny = 0;\n[x,y]';
                                    } else if (valuewidth == 3) {
                                        secP[j].expression += '\nx = sld;\ny = 0;z = 0;\n[x,y,z]';
                                    } else if (valuewidth == 4) {
                                        secP[j].expression += '\nx = sld;\nyg = 0;b = 0;\na = 1;\n[r,g,b,a]';
                                    }
                                } else {
                                    if (valuewidth == 1) {
                                        secP[j].expression += '';
                                    } else if (valuewidth == 2) {
                                        secP[j].expression += '\nx = sld;\ny = sld;\n[x,y]';
                                    } else if (valuewidth == 3) {
                                        secP[j].expression += '\nx = sld;\ny = sld;z = sld;\n[x,y,z]';
                                    } else if (valuewidth == 4) {
                                        secP[j].expression += '\nx = sld;\nyg = sld;b = sld;\na = 1;\n[r,g,b,a]';
                                    }
                                }
                                thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                                otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                            } else {
                                eff = cursecL.Effects.addProperty(sc_typeArr[valuewidth - 1]);
                                try {
                                    var depth_idx_str = " " + secP[j].propertyDepth + "_" + secP[j].propertyIndex;
                                    if (sc_nameBox == 0) {
                                        eff.name = secP[j].name + depth_idx_str;
                                    } else {
                                        eff.name = sc_sliderName;
                                    }
                                } catch (e) {}
                                
                                thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                                otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                                try {
                                    eff(1).setValue(secP[j].value);
                                    secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                                } catch (e) {}
                            }
                        }
                    }
                }
                thisLayerEt.text = thisLayerEt.text.slice(0, -1);
                otherLayerEt.text = otherLayerEt.text.slice(0, -1);

                app.endUndoGroup();
            };

            sc_addaptBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                var secL = thisComp.selectedLayers;
                
                for (var i = 0; i < secP.length; i++) {
                    if (secP[i].canSetExpression) {
                        if (secP[i].expressionError != "") {
                            var exp = secP[i].expression;
                            var exp_search = 0;
                            var slider_re_exp = /(?!\.)effect\(\"(.*)\"\)\(\"(.*)\"\)/;
                            var gr_arr = [];
                            while (exp_search != -1) {
                                exp_search = exp.search(slider_re_exp);
                                if (exp_search == -1) break;
                                exp_match = exp.match(slider_re_exp);
                                gr_arr.push(exp_match);
                                exp = exp.replace(exp_match[0], "eff#$1##$2");
                            }
                            
                            function same_name_detect(eff_name) {
                                var name_is_same = 0;
                                if (secL[0].Effects.property(eff_name) != null) {
                                    name_is_same = 1;
                                }
                                return name_is_same;
                            }
                            
                            function add_slider(type_str, slider_name) {
                                if (same_name_detect(slider_name) == 1) return;
                                var eff;
                                if (type_str == "Slider" || type_str == "滑块" || type_str == "ADBE Slider Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Slider Control");
                                    eff.name = slider_name;
                                } else if (type_str == "Point" || type_str == "点" || type_str == "ADBE Point Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Point Control");
                                    eff.name = slider_name;
                                } else if (type_str == "3D Point" || type_str == "3D点" || type_str == "ADBE Point3D Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Point3D Control");
                                    eff.name = slider_name;
                                } else if (type_str == "Angle" || type_str == "角度" || type_str == "ADBE Angle Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Angle Control");
                                    eff.name = slider_name;
                                } else if (type_str == "Checkbox" || type_str == "复选框" || type_str == "ADBE Checkbox Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Checkbox Control");
                                    eff.name = slider_name;
                                } else if (type_str == "Color" || type_str == "颜色" || type_str == "ADBE Color Control") {
                                    eff = secL[0].Effects.addProperty("ADBE Color Control");
                                    eff.name = slider_name;
                                }
                            }
                            
                            for (var j = 0; j < gr_arr.length; j++) {
                                add_slider(gr_arr[j][2], gr_arr[j][1]);
                            }
                        }
                    }
                }
                app.endUndoGroup();
            };

            onlysc_createBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                var secL = thisComp.selectedLayers;
                var cursecL;

                thisLayerEt.text = '';
                otherLayerEt.text = '';

                if (secP.length != 0) { // 有选择属性
                    for (var j = 0; j < secP.length; j++) {
                        var valuewidth = 1;
                        cursecL = findPropertyLayer(secP[j]);
                        if (secP[j].canSetExpression) {
                            if (secP[j].value.length != undefined) {
                                valuewidth = secP[j].value.length;
                            }
                            var eff;
                            for (var k = 0; k < sc_sliderCount; k++) {
                                eff = cursecL.Effects.addProperty(sc_typeArr[sc_slidertype]);
                                try {
                                    if (sc_nameBox == 0) {
                                        eff.name = secP[j].name;
                                    } else {
                                        eff.name = sc_sliderName;
                                    }
                                } catch (e) {}
                                eff.name += " " + parseInt(k + 1).toString();
                                
                                if (sc_slidertype == valuewidth || (valuewidth == 1 && sc_slidertype == 4)) {
                                    eff(1).setValue(secP[j].value);
                                }
                                
                                thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                                otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                            }
                        }
                    }
                } else { // 没有选择属性只选择层
                    for (var i = 0; i < secL.length; i++) {
                        for (var k = 0; k < sc_sliderCount; k++) {
                            var eff = secL[i].Effects.addProperty(sc_typeArr[sc_slidertype]);
                            if (sc_nameBox == 1) eff.name = sc_sliderName;
                            eff.name += " " + parseInt(k + 1).toString();
                            thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                            otherLayerEt.text += 'thisComp.layer("' + secL[i].name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        }
                    }
                }
                
                thisLayerEt.text = thisLayerEt.text.slice(0, -1);
                otherLayerEt.text = otherLayerEt.text.slice(0, -1);

                app.endUndoGroup();
            };

            // 滑块事件
            sc_typeSlider.onChange = sc_typeSlider.onChanging = function() {
                this.value = Math.round(this.value);
                this.parent.sc_typeSt.text = sc_typeArr[this.value].toString().slice(5);
                this.parent.sc_typeEt.text = this.value + 1;
                sc_slidertype = this.value;
            };

            sc_countSlider.onChange = sc_countSlider.onChanging = function() {
                this.value = Math.round(this.value);
                this.parent.sc_countEt.text = this.value;
                sc_sliderCount = this.value;
            };

            // EditText事件
            sc_typeEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                this.parent.sc_typeSlider.value = parseInt(this.text) - 1;
                this.parent.sc_typeSt.text = sc_typeArr[parseInt(this.text) - 1].toString().slice(5);
                sc_slidertype = parseInt(this.text) - 1;
            };

            sc_countEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 1;
                }
                this.parent.sc_countSlider.value = parseInt(this.text);
                sc_sliderCount = parseInt(this.text);
            };

            sc_sliderNameEt.onChange = function() {
                sc_sliderName = this.text;
            };

            // Checkbox事件
            sc_oneBox_.onClick = function() {
                sc_oneBox = this.value;
            };

            sc_nameBox_.onClick = function() {
                sc_nameBox = this.value;
            };

            sc_allBox_.onClick = function() {
                sc_allBox = this.value;
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
        var win = new Window("palette", "Slider Creator by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        SliderCreatorModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}