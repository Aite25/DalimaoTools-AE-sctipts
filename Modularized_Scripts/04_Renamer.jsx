/*
 * 模块名称: Renamer
 * 功能描述: 图层和属性重命名工具，支持正则表达式、标签设置和批量编号
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var RenamerModule = (function() {
    var moduleObj = {
        name: "Renamer",
        displayName: "Renamer",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 默认值
            var na = "大狸猫图层";
            var la = 1;
            var labelbox = 1;
            var regexp = 0;
            var zeroBox = 0;
            var startnum = 0;
            var revBox = 0;

            // 辅助函数
            function clamp(min, max, val) {
                if (val > max) val = max;
                if (val < min) val = min;
                return val;
            }

            // 资源字符串
            var renamer_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { \
                        nameEt: EditText { text:'"+na+"',alignment:['left','center'], preferredSize:[195,20] } \
                        zeroBox: Checkbox { text:'',preferredSize:[15,17],value:"+zeroBox+"}    \
                        startnumEt: EditText { text:'"+startnum+"',alignment:['left','center'], preferredSize:[20,20] } \
                        RegExpBox: Checkbox { text:'RegExp',preferredSize:[60,17],value:"+regexp+"}    \
                    }, \
                    gr2: Group { \
                        labelSlider: Slider { alignment:['left','center'], preferredSize:[160,20],minvalue:0 ,maxvalue:16,value:"+la+" } \
                        labelEt: EditText { text:'"+la+"',preferredSize:[25,20] }    \
                        labelBox: Checkbox { text:'Label',preferredSize:[60,17],value:"+labelbox+"}    \
                    }, \
                    gr3: Group { \
                        ApplyBtn: Button { text:'Apply',alignment:['left','top'], preferredSize:[80,20] } \
                        SelectBtn: Button { text:'Select',alignment:['left','top'], preferredSize:[40,20] } \
                        revSelectBtn: Button { text:'revSel',alignment:['left','top'], preferredSize:[40,20] } \
                        ExtractNameBtn: Button { text:'Extract',alignment:['left','top'], preferredSize:[80,20] } \
                    }, \
                    gr4: Group { \
                        ApplyPropBtn: Button { text:'P_Apply',alignment:['left','top'], preferredSize:[80,20] } \
                        SelectPropBtn: Button { text:'P_Sel',alignment:['left','top'], preferredSize:[40,20] } \
                        revBox: Checkbox { text:'reP',preferredSize:[40,17],value:"+revBox+"}    \
                        ExtractPropNameBtn: Button { text:'P_Extract',alignment:['left','top'], preferredSize:[80,20] } \
                    }, \
                }";
            
            var grp = container.add(renamer_res);
            
            // UI路径引用
            var nameEt = grp.gr1.nameEt;
            var zeroBox_ = grp.gr1.zeroBox;
            var startnumEt = grp.gr1.startnumEt;
            var RegExpBox = grp.gr1.RegExpBox;
            
            var labelSlider = grp.gr2.labelSlider;
            var labelEt = grp.gr2.labelEt;
            var labelBox_ = grp.gr2.labelBox;
            
            var ApplyBtn = grp.gr3.ApplyBtn;
            var SelectBtn = grp.gr3.SelectBtn;
            var revSelectBtn = grp.gr3.revSelectBtn;
            var ExtractNameBtn = grp.gr3.ExtractNameBtn;
            
            var ApplyPropBtn = grp.gr4.ApplyPropBtn;
            var SelectPropBtn = grp.gr4.SelectPropBtn;
            var revBox_ = grp.gr4.revBox;
            var ExtractPropNameBtn = grp.gr4.ExtractPropNameBtn;

            // 辅助函数：重命名
            function rename() {
                var lays = app.project.activeItem.selectedLayers;
                for(var i = 0; i < lays.length; i++){
                    if(!zeroBox){
                        lays[i].name = na + " " + (i+1).toString();
                    }else{
                        lays[i].name = na + " " + (i+startnum).toString();
                    }

                    if(labelbox == 1){
                        lays[i].label = la;
                    }
                }
            }

            // 事件回调
            ApplyBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                rename();
                app.endUndoGroup();
            };

            SelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var tcomp = app.project.activeItem;
                
                for(var i = 1; i <= tcomp.layers.length; i++){
                    var curLayer = tcomp.layers[i];
                    if(regexp != 1){
                        if(curLayer.name.indexOf(na) != -1){
                            curLayer.selected = 1;
                        }
                    }else if(regexp == 1){
                        var reg = new RegExp(na,"g");
                        curLayer.selected = reg.test(curLayer.name);
                    }
                }
                app.endUndoGroup();
            };

            revSelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var tcomp = app.project.activeItem;
                var secL = tcomp.selectedLayers;
                for(var i=0; i<secL.length; i++) {
                    secL[i].selected = 0;
                }
                
                for(var i=0; i<secL.length; i++) {
                    secL[secL.length-1-i].selected = 1;
                }
                app.endUndoGroup();
            };

            ExtractNameBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var lays = app.project.activeItem.selectedLayers;
                na = lays[0].name.replace(/(\s*\d+)$/,"");
                la = lays[0].label;
                nameEt.text = na;
                labelEt.text = la;
                labelSlider.value = la;
                app.endUndoGroup();
            };

            ApplyPropBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;

                for(var i=0; i<secP.length; i++) {
                    if(!zeroBox){
                        try{
                            if(revBox == 0){
                                secP[i].name = nameEt.text + " " + (i+1).toString();
                            }else{
                                secP[i].name = nameEt.text + " " + (secP.length-i).toString();
                            }
                        }catch(e){continue;}
                    }else{
                        try{
                            if(revBox == 0){
                                secP[i].name = nameEt.text + " " + (i+startnum).toString();
                            }else{
                                secP[i].name = nameEt.text + " " + (secP.length-i+startnum-1).toString();
                            }
                        }catch(e){continue;}
                    }
                }
                app.endUndoGroup();
            };

            SelectPropBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                for(var i = 0; i <= secP.length; i++){
                    var curP = secP[i];
                    if(regexp != 1){
                        if(curP.name.indexOf(na) == -1){
                            curP.selected = 0;
                        }
                    }else if(regexp == 1){
                        var reg = new RegExp(na,"g");
                        curP.selected = !(reg.test(curP.name));
                    }
                }
                app.endUndoGroup();
            };

            ExtractPropNameBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                na = secP[0].name.replace(/(\s*\d+)$/,"");
                nameEt.text = na;
                app.endUndoGroup();
            };

            // EditText事件
            nameEt.onChange = function() {
                na = this.text;
            };

            labelEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 0;
                }
                this.parent.labelSlider.value = Math.round(this.text);
                la = clamp(0, 16, parseInt(this.text));
            };

            startnumEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) {
                    this.text = 0;
                }
                startnum = parseInt(this.text);
            };

            // 滑块事件
            labelSlider.onChange = labelSlider.onChanging = function() {
                this.value = Math.round(this.value);
                this.parent.labelEt.text = this.value;
                la = this.value;
            };

            // Checkbox事件
            zeroBox_.onClick = function() {
                zeroBox = this.value;
            };

            RegExpBox.onClick = function() {
                if(this.value == 1){
                    nameEt.text = '^' + nameEt.text + '.*(\\d+)*$';
                }else if(this.value == 0){
                    nameEt.text = nameEt.text.replace(".*(\\d+)*$","");
                    nameEt.text = nameEt.text.replace("^","");
                }
                na = nameEt.text;
                regexp = this.value;
            };

            revBox_.onClick = function() {
                revBox = this.value;
            };

            labelBox_.onClick = function() {
                labelbox = this.value;
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
        var win = new Window("palette", "Renamer by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        RenamerModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}