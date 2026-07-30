/*
 * 模块名称: Renamer
 * 功能描述: 图层和属性重命名工具，支持正则表达式、标签设置和批量编号
 * 版本: 1.1.0
 * 作者: Dalimao Tools
 */

var RenamerModule = (function() {
    var moduleObj = {
        name: "Renamer",
        displayName: "Renamer",
        version: "1.1.0",

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

            function clamp(min, max, val) {
                if (val > max) val = max;
                if (val < min) val = min;
                return val;
            }

            // AE 标签颜色表
            var labelColors = [
                [0.35, 0.35, 0.35],  // 0 None
                [0.85, 0.35, 0.35],  // 1 Red
                [0.85, 0.79, 0.20],  // 2 Yellow
                [0.27, 0.82, 0.82],  // 3 Aqua
                [1.00, 0.51, 0.78],  // 4 Pink
                [0.63, 0.55, 1.00],  // 5 Lavender
                [1.00, 0.63, 0.35],  // 6 Peach
                [0.39, 0.86, 0.59],  // 7 Sea Foam
                [0.31, 0.59, 1.00],  // 8 Blue
                [0.27, 0.78, 0.27],  // 9 Green
                [0.71, 0.39, 1.00],  // 10 Purple
                [1.00, 0.63, 0.16],  // 11 Orange
                [0.24, 0.82, 0.94],  // 12 Cyan
                [1.00, 0.47, 0.20],  // 13 Red-Orange
                [0.71, 0.86, 0.24],  // 14 Yellow-Green
                [1.00, 0.39, 0.71],  // 15 Pink-Purple
                [0.39, 0.71, 1.00]   // 16 Light Blue
            ];

            // 资源字符串
            var renamer_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
                    gr1: Group { \
                        nameEt: EditText { text:'" + na + "',alignment:['left','center'], preferredSize:[195,20] } \
                        zeroBox: Checkbox { text:'',preferredSize:[15,17],value:" + zeroBox + "}    \
                        startnumEt: EditText { text:'" + startnum + "',alignment:['left','center'], preferredSize:[20,20] } \
                        RegExpBox: Checkbox { text:'RegExp',preferredSize:[60,17],value:" + regexp + "}    \
                    }, \
                    gr2: Group { \
                        labelBox: Checkbox { text:'Label',preferredSize:[60,17],value:" + labelbox + "}    \
                        labelSwatchGr: Group { preferredSize:[290,16] } \
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
                        revBox: Checkbox { text:'reP',preferredSize:[40,17],value:" + revBox + "}    \
                        ExtractPropNameBtn: Button { text:'P_Extract',alignment:['left','top'], preferredSize:[80,20] } \
                    }, \
                }";

            var grp = container.add(renamer_res);

            // UI路径引用
            var nameEt = grp.gr1.nameEt;
            var zeroBox_ = grp.gr1.zeroBox;
            var startnumEt = grp.gr1.startnumEt;
            var RegExpBox = grp.gr1.RegExpBox;
            var labelBox_ = grp.gr2.labelBox;
            var ApplyBtn = grp.gr3.ApplyBtn;
            var SelectBtn = grp.gr3.SelectBtn;
            var revSelectBtn = grp.gr3.revSelectBtn;
            var ExtractNameBtn = grp.gr3.ExtractNameBtn;
            var ApplyPropBtn = grp.gr4.ApplyPropBtn;
            var SelectPropBtn = grp.gr4.SelectPropBtn;
            var revBox_ = grp.gr4.revBox;
            var ExtractPropNameBtn = grp.gr4.ExtractPropNameBtn;

            // === 颜色矩形按钮（在 Label 同行） ===
            var labelSwatchGr = grp.gr2.labelSwatchGr;

            var dotSize = 12;
            var dotGap = 1;
            var totalDots = labelColors.length;
            var dots = [];

            // 绘制单个矩形色块
            function drawDot(index) {
                var dot = dots[index];
                if (!dot) return;
                dot.onDraw = function() {
                    var g = this.graphics;
                    g.backgroundColor = g.newBrush(g.BrushType.SOLID_COLOR, [0.18, 0.18, 0.18, 1]);

                    var c = labelColors[index];
                    var colorBrush = g.newBrush(g.BrushType.SOLID_COLOR, c.concat([1]));

                    // 填充颜色矩形
                    g.rectPath(1, 1, dotSize - 2, dotSize - 2);
                    g.fillPath(colorBrush);

                    // 选中状态：亮色外框
                    if (index === la) {
                        var borderPen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1, 1], 1);
                        g.rectPath(0, 0, dotSize, dotSize);
                        g.strokePath(borderPen);
                    }
                };
                dot.notify("onDraw");
            }

            // 重绘所有圆点
            function redrawAllDots() {
                for (var i = 0; i < totalDots; i++) {
                    drawDot(i);
                }
            }

            // 创建圆点控件
            for (var i = 0; i < totalDots; i++) {
                var dot = labelSwatchGr.add('customBoundedValue', [0, 0, dotSize, dotSize]);
                dot.fillBrightness = 1;
                dot._labelIndex = i;
                dots.push(dot);

                // 点击事件（闭包）
                (function(idx) {
                    dot.addEventListener('mousedown', function() {
                        la = idx;
                        redrawAllDots();
                    });
                })(i);

                drawDot(i);
            }

            // === 辅助函数 ===
            function rename() {
                var lays = app.project.activeItem.selectedLayers;
                for (var i = 0; i < lays.length; i++) {
                    lays[i].name = zeroBox ? na + " " + (i + startnum) : na + " " + (i + 1);
                    if (labelbox == 1) lays[i].label = la;
                }
            }

            // === 事件回调 ===
            ApplyBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                rename();
                app.endUndoGroup();
            };

            SelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var tcomp = app.project.activeItem;
                for (var i = 1; i <= tcomp.layers.length; i++) {
                    var curLayer = tcomp.layers[i];
                    if (regexp != 1) {
                        curLayer.selected = (curLayer.name.indexOf(na) != -1) ? 1 : 0;
                    } else {
                        var reg = new RegExp(na, "g");
                        curLayer.selected = reg.test(curLayer.name);
                    }
                }
                app.endUndoGroup();
            };

            revSelectBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var tcomp = app.project.activeItem;
                var secL = tcomp.selectedLayers;
                for (var i = 0; i < secL.length; i++) secL[i].selected = 0;
                for (var i = 0; i < secL.length; i++) secL[secL.length - 1 - i].selected = 1;
                app.endUndoGroup();
            };

            ExtractNameBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var lays = app.project.activeItem.selectedLayers;
                na = lays[0].name.replace(/(\s*\d+)$/, "");
                la = lays[0].label;
                nameEt.text = na;
                redrawAllDots();
                app.endUndoGroup();
            };

            ApplyPropBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                for (var i = 0; i < secP.length; i++) {
                    try {
                        var num = revBox == 0 ? (zeroBox ? i + startnum : i + 1) : (zeroBox ? secP.length - i + startnum - 1 : secP.length - i);
                        secP[i].name = nameEt.text + " " + num;
                    } catch (e) { continue; }
                }
                app.endUndoGroup();
            };

            SelectPropBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                for (var i = 0; i <= secP.length; i++) {
                    var curP = secP[i];
                    if (regexp != 1) {
                        curP.selected = (curP.name.indexOf(na) != -1) ? 1 : 0;
                    } else {
                        var reg = new RegExp(na, "g");
                        curP.selected = reg.test(curP.name);
                    }
                }
                app.endUndoGroup();
            };

            ExtractPropNameBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                var thisComp = app.project.activeItem;
                var secP = thisComp.selectedProperties;
                na = secP[0].name.replace(/(\s*\d+)$/, "");
                nameEt.text = na;
                app.endUndoGroup();
            };

            // EditText事件
            nameEt.onChange = function() { na = this.text; };

            startnumEt.onChange = function() {
                this.text = eval(this.text);
                if (isNaN(this.text)) this.text = 0;
                startnum = parseInt(this.text);
            };

            // Checkbox事件
            zeroBox_.onClick = function() { zeroBox = this.value; };

            RegExpBox.onClick = function() {
                if (this.value == 1) {
                    nameEt.text = '^' + nameEt.text + '.*(\\d+)*$';
                } else {
                    nameEt.text = nameEt.text.replace(".*(\\d+)*$", "").replace("^", "");
                }
                na = nameEt.text;
                regexp = this.value;
            };

            revBox_.onClick = function() { revBox = this.value; };
            labelBox_.onClick = function() { labelbox = this.value; };

            return grp;
        }
    };
    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(RenamerModule);
} else {
    (function() {
        var win = new Window("palette", "Renamer by 大狸猫", undefined, {resizeable: true});
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 10;
        RenamerModule.buildUI(win);
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() { this.layout.resize(); };
        if (win instanceof Window) { win.center(); win.show(); }
    })();
}