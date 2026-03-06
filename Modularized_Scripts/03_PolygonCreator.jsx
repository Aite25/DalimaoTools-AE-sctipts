/*
 * 模块名称: PolygonCreator
 * 功能描述: 在合成中心创建正多边形形状层
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var PolygonCreatorModule = (function() {
    var moduleObj = {
        name: "PolygonCreator",
        displayName: "Polygon Creator",
        version: "1.0.0",
        
        /**
         * 构建UI界面
         * @param {Group} container - 父容器
         * @returns {Group} 创建的UI组
         */
        buildUI: function(container) {
            var scriptName = this.displayName;
            
            // 默认值
            var polygonSize = 100;
            var fillColor = [0.3, 0.6, 0.9]; // 蓝色
            var strokeColor = [0, 0, 0]; // 黑色
            var hasFill = true;
            var hasStroke = false;
            
            // 资源字符串
            var polygon_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['center','top'], \
                    gr1: Group { orientation:'row', alignment:['center','center'], \
                        circle: Group { preferredSize:[50,50], helpTip:'Circle' }, \
                        square: Group { preferredSize:[50,50], helpTip:'Square' }, \
                        triangle: Group { preferredSize:[50,50], helpTip:'Triangle (3 sides)' }, \
                    }, \
                    gr2: Group { orientation:'row', alignment:['center','center'], \
                        pentagon: Group { preferredSize:[50,50], helpTip:'Pentagon (5 sides)' }, \
                        hexagon: Group { preferredSize:[50,50], helpTip:'Hexagon (6 sides)' }, \
                        octagon: Group { preferredSize:[50,50], helpTip:'Octagon (8 sides)' }, \
                    }, \
                    gr3: Group { orientation:'row', alignment:['center','center'], \
                        sizeSt: StaticText { text:'Size:',preferredSize:[40,20] }, \
                        sizeSlider: Slider { preferredSize:[120,20], minvalue:10, maxvalue:500, value:100 }, \
                        sizeEt: EditText { text:'100',preferredSize:[50,20] }, \
                    }, \
                    gr4: Group { orientation:'row', alignment:['center','center'], \
                        fillCb: Checkbox { text:'Fill', value:true }, \
                        fillColorBtn: Group { preferredSize:[30,20] }, \
                        strokeCb: Checkbox { text:'Stroke', value:false }, \
                        strokeColorBtn: Group { preferredSize:[30,20] }, \
                    }, \
                }";
            
            var grp = container.add(polygon_res);
            
            // AE内置颜色选择器函数
            function pickColorAE(currentColor) {
                var comp = app.project.activeItem;
                var checkComp = comp && (comp instanceof CompItem);
                
                if (!checkComp) {
                    comp = app.project.items.addComp(" ", 100, 56, 1, 10, 30);
                }
                
                comp.openInViewer();
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = " ";
                shapeLayer.shy = true;
                var checkCompShySwitch = comp.hideShyLayers;
                comp.hideShyLayers = true;
                
                var colorEffect = shapeLayer.property("ADBE Effect Parade").addProperty("ADBE Color Control");
                colorEffect.name = " ";
                var colorProp = colorEffect.property("ADBE Color Control-0001");
                
                // 设置初始颜色
                if (currentColor) {
                    colorProp.setValue(currentColor.concat([1]));
                }
                
                colorProp.selected = true;
                app.executeCommand(2241); // 打开AE内置颜色选择器
                var colorValue = colorProp.value;
                
                // 清理临时对象
                if (checkComp) {
                    shapeLayer.remove();
                    comp.hideShyLayers = checkCompShySwitch;
                } else {
                    comp.remove();
                }
                
                return [colorValue[0], colorValue[1], colorValue[2]];
            }
            
            // UI路径引用
            var circleBtn = grp.gr1.circle;
            var squareBtn = grp.gr1.square;
            var triangleBtn = grp.gr1.triangle;
            var pentagonBtn = grp.gr2.pentagon;
            var hexagonBtn = grp.gr2.hexagon;
            var octagonBtn = grp.gr2.octagon;
            
            var sizeSlider = grp.gr3.sizeSlider;
            var sizeEt = grp.gr3.sizeEt;
            
            var fillCb = grp.gr4.fillCb;
            var fillColorBtn = grp.gr4.fillColorBtn;
            var strokeCb = grp.gr4.strokeCb;
            var strokeColorBtn = grp.gr4.strokeColorBtn;
            
            // 创建颜色显示控件
            function createColorBox(group, color) {
                var box = group.add('customBoundedValue', [0, 0, 30, 20]);
                box.color = color;
                box.fillBrightness = 1;
                
                box.onDraw = function() {
                    var g = this.graphics;
                    var colorBrush = g.newBrush(g.BrushType.SOLID_COLOR, this.color.concat([1]));
                    var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.2, 0.2, 1]);
                    g.backgroundColor = bgBrush;
                    g.rectPath(0, 0, 30, 20);
                    g.fillPath(colorBrush);
                };
                
                return box;
            }
            
            var fillColorBox = createColorBox(fillColorBtn, fillColor);
            var strokeColorBox = createColorBox(strokeColorBtn, strokeColor);
            fillColorBox.notify("onDraw");
            strokeColorBox.notify("onDraw");
            
            // 绘制多边形图标的函数
            function drawPolygonIcon(group, sides, isCircle, isRectangle, isSquare) {
                var icon = group.add('customBoundedValue', [0, 0, 50, 50]);
                icon.sides = sides;
                icon.isCircle = isCircle || false;
                icon.isRectangle = isRectangle || false;
                icon.isSquare = isSquare || false;
                icon.fillBrightness = 1;
                
                icon.onDraw = function() {
                    var g = this.graphics;
                    var cx = 25;
                    var cy = 25;
                    var r = 16;
                    
                    // 背景
                    var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.2, 0.2, 1]);
                    g.backgroundColor = bgBrush;
                    
                    if (this.isCircle) {
                        // 绘制圆形
                        var fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.3, 0.6, 0.9, 1]);
                        var strokePen = g.newPen(g.PenType.SOLID_COLOR, [0, 0, 0, 1], 2);
                        g.ellipsePath(cx - r, cy - r, r * 2, r * 2);
                        g.fillPath(fillBrush);
                        g.strokePath(strokePen);
                    } else if (this.isSquare) {
                        // 绘制正方形 (1:1比例)
                        var fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.3, 0.6, 0.9, 1]);
                        var strokePen = g.newPen(g.PenType.SOLID_COLOR, [0, 0, 0, 1], 2);
                        var size = r * 1.3;
                        g.newPath();
                        g.moveTo(cx - size, cy - size);
                        g.lineTo(cx + size, cy - size);
                        g.lineTo(cx + size, cy + size);
                        g.lineTo(cx - size, cy + size);
                        g.closePath();
                        g.fillPath(fillBrush);
                        g.strokePath(strokePen);
                    } else if (this.isRectangle) {
                        // 绘制矩形
                        var fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.3, 0.6, 0.9, 1]);
                        var strokePen = g.newPen(g.PenType.SOLID_COLOR, [0, 0, 0, 1], 2);
                        var rectW = r * 1.6;
                        var rectH = r * 1.1;
                        g.newPath();
                        g.moveTo(cx - rectW, cy - rectH);
                        g.lineTo(cx + rectW, cy - rectH);
                        g.lineTo(cx + rectW, cy + rectH);
                        g.lineTo(cx - rectW, cy + rectH);
                        g.closePath();
                        g.fillPath(fillBrush);
                        g.strokePath(strokePen);
                    } else {
                        // 绘制多边形
                        var points = [];
                        var startAngle = -Math.PI / 2; // 从顶部开始
                        
                        for (var i = 0; i < this.sides; i++) {
                            var angle = startAngle + (i * 2 * Math.PI / this.sides);
                            var x = cx + r * Math.cos(angle);
                            var y = cy + r * Math.sin(angle);
                            points.push({x: x, y: y});
                        }
                        
                        // 填充多边形
                        var fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.3, 0.6, 0.9, 1]);
                        var strokePen = g.newPen(g.PenType.SOLID_COLOR, [0, 0, 0, 1], 2);
                        
                        g.newPath();
                        g.moveTo(points[0].x, points[0].y);
                        for (var i = 1; i < points.length; i++) {
                            g.lineTo(points[i].x, points[i].y);
                        }
                        g.closePath();
                        g.fillPath(fillBrush);
                        g.strokePath(strokePen);
                    }
                };
                
                return icon;
            }
            
            // 创建所有图标
            var triangleIcon = drawPolygonIcon(triangleBtn, 3, false, false, false);
            var squareIcon = drawPolygonIcon(squareBtn, 0, false, false, true);
            var pentagonIcon = drawPolygonIcon(pentagonBtn, 5, false, false, false);
            var hexagonIcon = drawPolygonIcon(hexagonBtn, 6, false, false, false);
            var octagonIcon = drawPolygonIcon(octagonBtn, 8, false, false, false);
            var circleIcon = drawPolygonIcon(circleBtn, 0, true, false, false);
            
            // 初始化所有图标的绘制
            triangleIcon.notify("onDraw");
            squareIcon.notify("onDraw");
            pentagonIcon.notify("onDraw");
            hexagonIcon.notify("onDraw");
            octagonIcon.notify("onDraw");
            circleIcon.notify("onDraw");
            
            // 创建多边形形状层的函数
            function createPolygonShape(sides) {
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    alert("请打开一个合成！");
                    return;
                }
                
                app.beginUndoGroup("Create " + sides + "-sided Polygon");
                
                // 创建形状层
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = sides + "-sided Polygon";
                
                // 获取合成中心
                var centerX = comp.width / 2;
                var centerY = comp.height / 2;
                
                // 设置图层位置到合成中心
                shapeLayer.property("Transform").property("Position").setValue([centerX, centerY]);
                
                // 添加多边形路径组
                var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
                shapeGroup.name = "Polygon";
                
                // 添加多边形路径
                var polygonPath = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
                
                // 创建多边形顶点
                var vertices = [];
                var inTangents = [];
                var outTangents = [];
                var startAngle = -90; // 从顶部开始
                
                for (var i = 0; i < sides; i++) {
                    var angle = (startAngle + (i * 360 / sides)) * Math.PI / 180;
                    var x = Math.cos(angle) * polygonSize;
                    var y = Math.sin(angle) * polygonSize;
                    vertices.push([x, y]);
                    inTangents.push([0, 0]);
                    outTangents.push([0, 0]);
                }
                
                // 创建路径
                var shape = new Shape();
                shape.vertices = vertices;
                shape.inTangents = inTangents;
                shape.outTangents = outTangents;
                shape.closed = true;
                
                polygonPath.property("ADBE Vector Shape").setValue(shape);
                
                // 根据用户设置添加描边和填充
                if (hasStroke) {
                    var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
                    stroke.property("ADBE Vector Stroke Color").setValue(strokeColor.concat([1]));
                    stroke.property("ADBE Vector Stroke Width").setValue(3);
                }
                
                if (hasFill) {
                    var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                    fill.property("ADBE Vector Fill Color").setValue(fillColor.concat([1]));
                }
                
                app.endUndoGroup();
            }
            
            // 创建圆形形状层的函数
            function createCircleShape() {
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    alert("请打开一个合成！");
                    return;
                }
                
                app.beginUndoGroup("Create Circle");
                
                // 创建形状层
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = "Circle";
                
                // 获取合成中心
                var centerX = comp.width / 2;
                var centerY = comp.height / 2;
                
                // 设置图层位置到合成中心
                shapeLayer.property("Transform").property("Position").setValue([centerX, centerY]);
                
                // 添加椭圆路径组
                var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
                shapeGroup.name = "Circle";
                
                // 添加椭圆路径
                var ellipsePath = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
                ellipsePath.property("ADBE Vector Ellipse Size").setValue([polygonSize, polygonSize]);
                
                // 根据用户设置添加描边和填充
                if (hasStroke) {
                    var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
                    stroke.property("ADBE Vector Stroke Color").setValue(strokeColor.concat([1]));
                    stroke.property("ADBE Vector Stroke Width").setValue(3);
                }
                
                if (hasFill) {
                    var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                    fill.property("ADBE Vector Fill Color").setValue(fillColor.concat([1]));
                }
                
                app.endUndoGroup();
            }
            
            // 创建正方形形状层的函数
            function createSquareShape() {
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    alert("请打开一个合成！");
                    return;
                }
                
                app.beginUndoGroup("Create Square");
                
                // 创建形状层
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = "Square";
                
                // 获取合成中心
                var centerX = comp.width / 2;
                var centerY = comp.height / 2;
                
                // 设置图层位置到合成中心
                shapeLayer.property("Transform").property("Position").setValue([centerX, centerY]);
                
                // 添加正方形路径组
                var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
                shapeGroup.name = "Square";
                
                // 添加矩形路径 (正方形是1:1的矩形)
                var rectPath = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
                rectPath.property("ADBE Vector Rect Size").setValue([polygonSize, polygonSize]);
                
                // 根据用户设置添加描边和填充
                if (hasStroke) {
                    var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
                    stroke.property("ADBE Vector Stroke Color").setValue(strokeColor.concat([1]));
                    stroke.property("ADBE Vector Stroke Width").setValue(3);
                }
                
                if (hasFill) {
                    var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                    fill.property("ADBE Vector Fill Color").setValue(fillColor.concat([1]));
                }
                
                app.endUndoGroup();
            }
            
            // 按钮点击事件
            triangleIcon.addEventListener('mousedown', function() {
                createPolygonShape(3);
            });
            
            squareIcon.addEventListener('mousedown', function() {
                createSquareShape();
            });
            
            pentagonIcon.addEventListener('mousedown', function() {
                createPolygonShape(5);
            });
            
            hexagonIcon.addEventListener('mousedown', function() {
                createPolygonShape(6);
            });
            
            octagonIcon.addEventListener('mousedown', function() {
                createPolygonShape(8);
            });
            
            circleIcon.addEventListener('mousedown', function() {
                createCircleShape();
            });
            
            // 大小滑块事件
            sizeSlider.onChanging = sizeSlider.onChange = function() {
                polygonSize = Math.round(this.value);
                sizeEt.text = polygonSize.toString();
            };
            
            sizeEt.onChange = function() {
                var val = parseFloat(this.text);
                if (!isNaN(val)) {
                    val = Math.max(10, Math.min(500, val));
                    polygonSize = val;
                    sizeSlider.value = val;
                    this.text = val.toString();
                }
            };
            
            // 填充复选框事件
            fillCb.onClick = function() {
                hasFill = this.value;
            };
            
            // 描边复选框事件
            strokeCb.onClick = function() {
                hasStroke = this.value;
            };
            
            // 填充颜色按钮事件
            fillColorBox.addEventListener('mousedown', function() {
                var newColor = pickColorAE(fillColor);
                if (newColor) {
                    fillColor = newColor;
                    this.color = fillColor;
                    this.notify("onDraw");
                }
            });
            
            // 描边颜色按钮事件
            strokeColorBox.addEventListener('mousedown', function() {
                var newColor = pickColorAE(strokeColor);
                if (newColor) {
                    strokeColor = newColor;
                    this.color = strokeColor;
                    this.notify("onDraw");
                }
            });
            
            return grp;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(PolygonCreatorModule);
} else {
    (function() {
        var win = new Window("palette", "Polygon Creator by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        PolygonCreatorModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
