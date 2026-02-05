/*
 * 模块名称: PropertyTracer
 * 功能描述: 属性路径追踪和批量应用工具，支持路径提取、值设置和表达式应用
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var PropertyTracerModule = (function() {
    var moduleObj = {
        name: "PropertyTracer",
        displayName: "PropertyTracer",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 默认值
            var propPath = '("Transform")("Opacity")';
            var property_value = 0;
            var pt_exp = "'value'";
            var pt_expBox = 1;
            var changeValueBox = 1;
            var matchBox = 0;
            var lastExp = '';
            var expReverseInvert = 0;

            // 资源字符串
            var propertyTracer_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { alignment:['fill','top'],\
                        matchBox: Checkbox { text:'Match',preferredSize:[59,17],value:"+matchBox+" }, \
                        pathEt: EditText { text:'"+propPath+"',alignment:['fill','fill'], preferredSize:[190,20],properties: { multiline: true } } \
                    }, \
                    gr2: Group { alignment:['fill','top'], \
                        changeValueBox: Checkbox { text:'Value', value:"+changeValueBox+" , preferredSize:[59,17] }, \
                        valueEt: EditText { text:'"+property_value+"',alignment:['left','center'], preferredSize:[190,20],alignment:['fill','fill'] } \
                    }, \
                    gr3: Group { alignment:['fill','top'], \
                        shapeExpBtn: Button { text:'ShapeRelaExp ↑↓', preferredSize:[120,20],alignment:['right','top'] } \
                        ApplyBtn: Button { text:'Apply', preferredSize:[60,20],alignment:['right','top'] } \
                        SelectBtn: Button { text:'Select', preferredSize:[60,20],alignment:['right','top'] } \
                        ExtractBtn: Button { text:'Extract', preferredSize:[60,20],alignment:['right','top'] } \
                    }, \
                    gr4: Group { orientation:'row', alignment:['fill','top'], \
                        pt_expBox: Checkbox { text:'Expression',value:"+pt_expBox+",alignment:['left','top']}    \
                        propApplyBtn: Button { text:'P_Apply', preferredSize:[60,20],alignment:['right','top'] } \
                        propSelectBtn: Button { text:'P_Select', preferredSize:[60,20],alignment:['right','top'] } \
                        propAddBtn: Button { text:'P_Add', preferredSize:[60,20],alignment:['right','top'] } \
                    }, \
                    gr5: Group { orientation:'row', alignment:['fill','fill'], \
                        expEt: EditText { text:'value',alignment:['fill','fill'] ,preferredSize:[300,300] ,properties: { multiline: true }} \
                    }, \
                }";
            
            var grp = container.add(propertyTracer_res);
            
            // UI路径引用
            var propertyTracer_matchBox = grp.gr1.matchBox;
            var propertyTracer_pathEt = grp.gr1.pathEt;
            var propertyTracer_changeValueBox = grp.gr2.changeValueBox;
            var propertyTracer_valueEt = grp.gr2.valueEt;
            var propertyTracer_shapeExpBtn = grp.gr3.shapeExpBtn;
            var propertyTracer_ApplyBtn = grp.gr3.ApplyBtn;
            var propertyTracer_SelectBtn = grp.gr3.SelectBtn;
            var propertyTracer_ExtractBtn = grp.gr3.ExtractBtn;
            var propertyTracer_pt_expBox = grp.gr4.pt_expBox;
            var propertyTracer_propApplyBtn = grp.gr4.propApplyBtn;
            var propertyTracer_propSelectBtn = grp.gr4.propSelectBtn;
            var propertyTracer_propAddBtn = grp.gr4.propAddBtn;
            var propertyTracer_expEt = grp.gr5.expEt;

            // 辅助函数
            function expslice(pt_exp, cutpointword) {
                return pt_exp.slice(0, pt_exp.search(cutpointword) + 1);
            }

            function nametrans(namestr) {
                namestr = namestr.toLowerCase();
                var outputStr = '';
                var last_is_Space = 0;
                for (var i = 0; i < namestr.length; i++) {
                    if (namestr[i] == ' ') {
                        last_is_Space = 1;
                        continue;
                    }
                    if (last_is_Space == 1) {
                        last_is_Space = 0;
                        outputStr += namestr[i].toUpperCase();
                    } else {
                        outputStr += namestr[i];
                    }
                }
                return outputStr;
            }

            function relaPathExp(bool, cover) {
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                
                var propPathArr0 = [];
                var propPathArr1 = [];
                var curP0, curP1;

                // 排除选到组
                for (var i = 0; i < secP.length; i++) {
                    if (secP[i].canSetExpression == 0) continue;
                    if (secP[i].canSetExpression && (curP0 == undefined)) {
                        curP0 = secP[i];
                        continue;
                    }
                    if (secP[i].canSetExpression && (curP1 == undefined) && (curP0 != undefined)) {
                        curP1 = secP[i];
                        break;
                    }
                }
                
                if (curP0 == undefined || curP1 == undefined) return;

                var booleanbox = 0 ^ expReverseInvert;

                if (booleanbox == 0) {
                    if (curP0.expression != "") {
                        curP0.expression = expslice(curP0.expression, lastExp);
                    }
                } else {
                    if (curP1.expression != "") {
                        curP1.expression = expslice(curP1.expression, lastExp);
                    }
                }

                var curPs;
                if (bool) {
                    curPs = curP0;
                    curP0 = curP1;
                    curP1 = curPs;
                }
                var curP0c = curP0;
                var curP1c = curP1;
                var depth0 = curP0.propertyDepth;
                var depth1 = curP1.propertyDepth;
                
                // 提取路径数组
                for (var i = 0; i < depth0; i++) {
                    propPathArr0.push(curP0);
                    curP0 = curP0.propertyGroup(1);
                }
                propPathArr0.reverse();
                
                for (var i = 0; i < depth1; i++) {
                    propPathArr1.push(curP1);
                    curP1 = curP1.propertyGroup(1);
                }
                propPathArr1.reverse();
                
                // 比较数组，删除相同部分
                var minlength = propPathArr0.length > propPathArr1.length ? propPathArr1.length : propPathArr0.length;
                var deletenum = 0;
                var last_is_Contents = 0;

                for (var i = 0; i < minlength; i++) {
                    if (propPathArr0[i] == propPathArr1[i]) {
                        if ((propPathArr0[i].name == "Contents" || propPathArr0[i].name == "内容") && 
                            (propPathArr1[i].name == "Contents" || propPathArr1[i].name == "内容")) {
                            last_is_Contents = 1;
                        } else {
                            last_is_Contents = 0;
                        }
                        continue;
                    } else {
                        if (last_is_Contents == 1) {
                            deletenum = i - 1;
                        } else {
                            deletenum = i;
                        }
                        break;
                    }
                }
                
                var propPathArr0 = propPathArr0.slice(deletenum);
                var propPathArr1 = propPathArr1.slice(deletenum);
                
                // 表达式字符串生成
                var pgroup = propPathArr0.length;
                var expstr = "thisProperty.propertyGroup(" + pgroup + ").";
                last_is_Contents = 0;

                for (var i = 0; i < propPathArr1.length; i++) {
                    if (propPathArr1[i].name == "Contents" || propPathArr1[i].name == "内容") {
                        expstr += "content(\"";
                        last_is_Contents = 1;
                        continue;
                    }
                    if (last_is_Contents == 1) {
                        expstr += propPathArr1[i].name;
                        expstr += "\").";
                        last_is_Contents = 0;
                        continue;
                    }
                    if (i != propPathArr1.length - 1) {
                        expstr += nametrans(propPathArr1[i].name) + '.';
                    } else {
                        expstr += nametrans(propPathArr1[i].name);
                    }
                }
                
                var finProp = curP0c;
                
                if (cover) {
                    finProp.expression = expstr;
                } else {
                    finProp.expression += expstr;
                }
                lastExp = expstr;
                pt_exp = lastExp;
            }

            // 事件回调
            propertyTracer_ApplyBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var slayers = app.project.activeItem.selectedLayers;
                var cut = app.project.activeItem.time;
                var nval;
                if (property_value instanceof Array) {
                    nval = "[" + property_value.toString() + "]";
                } else {
                    nval = property_value;
                }
                
                // 修改值
                if (changeValueBox == 1) {
                    eval(
                        "for(var i = 0;i<slayers.length;i++){ \
                            try{\
                                if(slayers[i] " + propPath + ".canSetExpression){ \
                                    if(slayers[i]  " + propPath + ".numKeys == 0){ \
                                        slayers[i]  " + propPath + " .setValue(  " + nval + "  ) ; \
                                    }else{\
                                        slayers[i]  " + propPath + " .setValueAtTime( " + cut + " ," + nval + "  ) ;\
                                    } \
                                } \
                            }catch(e){continue;}\
                        }"
                    );
                }
                
                // 表达式
                if (pt_expBox == 1) {
                    eval("\
                        for(var i = 0;i<slayers.length;i++){ \
                            try{\
                                slayers[i] " + propPath + " .expression = \'" + pt_exp.toString() + "\'; \
                            }catch(e){continue;}\
                        } \
                    ");
                }
                app.endUndoGroup();
            };

            propertyTracer_SelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var secP = thisComp.selectedProperties;
                if (secP.length != 0) {
                    for (var i = 0; i < secP.length; i++) {
                        secP[i].selected = 0;
                    }
                }
                eval(
                    "for(var i = 0;i<secL.length;i++){ \
                    try{\
                        secL[i]" + propPath + ".selected = 1; \
                        }catch(e){continue;}\
                    }"
                );
                app.endUndoGroup();
            };

            propertyTracer_ExtractBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                var pathstr = "";
                var thisP;
                
                // 找到可以打表达式的属性
                for (var i = 0; i < secP.length; i++) {
                    if (secP[i].canSetExpression) {
                        thisP = secP[i];
                        break;
                    }
                    if (i == secP.length - 1) {
                        thisP = secP[i];
                    }
                }
                if (thisP == undefined) thisP = secP[0];
                if (thisP.value != undefined) {
                    property_value = thisP.value;
                } else {
                    property_value = thisP.matchName;
                }
                var depth = thisP.propertyDepth;
                var curP = thisP;
                
                // 生成路径str
                for (var i = 0; i < depth; i++) {
                    if (matchBox == 1) {
                        pathstr = "(\"" + curP.matchName + "\")" + pathstr;
                    } else {
                        pathstr = "(\"" + curP.name + "\")" + pathstr;
                    }
                    curP = curP.propertyGroup(1);
                }
                
                propPath = pathstr;
                propertyTracer_pathEt.text = pathstr;
                propertyTracer_valueEt.text = property_value;
                propertyTracer_expEt.text = thisP.expression;
                pt_exp = "'" + thisP.expression + "'";
                app.endUndoGroup();
            };

            propertyTracer_shapeExpBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                relaPathExp(1 ^ expReverseInvert, 0);
                propertyTracer_expEt.text = pt_exp;
                expReverseInvert = !expReverseInvert;
                app.endUndoGroup();
            };

            propertyTracer_propApplyBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var secP = app.project.activeItem.selectedProperties;
                var cut = app.project.activeItem.time;
                var nval;
                if (property_value instanceof Array) {
                    nval = "[" + property_value.toString() + "]";
                } else {
                    nval = property_value;
                }
                
                if (changeValueBox == 1) {
                    eval(
                        "for(var i = 0;i<secP.length;i++){ \
                            try{ \
                                if(secP[i] " + propPath + ".canSetExpression){ \
                                    if(secP[i]  " + propPath + ".numKeys == 0){ \
                                        secP[i]  " + propPath + " .setValue(  " + nval + "  ) ; \
                                    }else{\
                                        secP[i]  " + propPath + " .setValueAtTime( " + cut + " ," + nval + "  ) ;\
                                    } \
                                } \
                            }catch(e){continue;}\
                        }"
                    );
                }
                
                if (pt_expBox == 1) {
                    eval("\
                        for(var i = 0;i<secP.length;i++){ \
                            try{ \
                                secP[i] " + propPath + " .expression = \'" + pt_exp.toString() + "\'; \
                            }catch(e){continue;}\
                        }\
                    ");
                }
                app.endUndoGroup();
            };

            propertyTracer_propSelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                eval(
                    "var secPc = [];\
                    for(var i = 0;i<secP.length;i++){ \
                        secPc.push(secP[i])\
                        secP[i].selected = 0;\
                    }\
                    for(var i = 0;i<secPc.length;i++){ \
                        try{\
                            secPc[i]" + propPath + ".selected = 1; \
                        }catch(e){continue;}\
                    }"
                );
                app.endUndoGroup();
            };

            propertyTracer_propAddBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                eval(
                    "for(var i = 0;i<secP.length;i++){ \
                        try{\
                            secP[i]" + propPath + ".addProperty(\"" + property_value + "\"); \
                        }catch(e){continue;}\
                    }"
                );
                app.endUndoGroup();
            };

            // EditText事件
            propertyTracer_pathEt.onChange = function() {
                propPath = this.text;
            };

            propertyTracer_valueEt.onChange = function() {
                if (/,/.test(this.text)) {
                    property_value = this.text.split(",");
                } else {
                    this.text = eval(this.text);
                    property_value = parseFloat(this.text);
                }
            };

            propertyTracer_expEt.onChange = function() {
                pt_exp = this.text;
            };

            // Checkbox事件
            propertyTracer_matchBox.onClick = function() {
                matchBox = this.value;
            };

            propertyTracer_changeValueBox.onClick = function() {
                changeValueBox = this.value;
            };

            propertyTracer_pt_expBox.onClick = function() {
                pt_expBox = this.value;
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
        var win = new Window("palette", "PropertyTracer by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        PropertyTracerModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}