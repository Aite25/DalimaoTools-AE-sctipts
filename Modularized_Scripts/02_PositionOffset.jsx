/*
 * Position_offset - 位置偏移工具
 * 可单独运行，也可被 DalimaoTools 调用
 * Author: 大狸猫
 */

var PositionOffsetModule = (function() {
    
    var scriptName = "Position_offset";
    var angst = "→";
    var angle = 90;
    var angleVector = [0,0];
    var distance = 100;
    var frames = 10;
    var keyB = 1;
    var opacityB = 1;
    var directionB = 1;
    
    function angstc(pos_offset_angSt){
        angst = ["↑","↗","→","↘","↓","↙","←","↖"][Math.round((angle%360)/45)];
        if(pos_offset_angSt) pos_offset_angSt.text = angst;
    }
    
    function buildUI(container) {
        // 角度选择器数据
        var angleData = {
            isDragging: false,
            centerX: 35,
            centerY: 35,
            radius: 28
        };
        
        // 规范化角度到 0-360
        function normalizeAngle(ang) {
            ang = ang % 360;
            if (ang < 0) ang += 360;
            return ang;
        }
        
        // 从鼠标位置计算角度
        function calculateAngleFromPoint(x, y, useShift) {
            var dx = x - angleData.centerX;
            var dy = y - angleData.centerY;
            var rad = Math.atan2(dy, dx);
            var ang = rad * 180 / Math.PI;
            ang = ang + 90;
            ang = normalizeAngle(ang);
            
            if (useShift) {
                ang = Math.round(ang / 45) * 45;
                ang = normalizeAngle(ang);
            }
            return ang;
        }
        
        var pos_offset_res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['center','center'], \
            grAngle: Group { orientation:'row', alignment:['center','center'], \
                angleWheel: Group { preferredSize:[70,70] }, \
                angleInputGr: Group { orientation:'column', alignment:['left','center'], \
                    angleRow: Group { orientation:'row', \
                        angleSt: StaticText { text:'角度:' ,preferredSize:[35,17]}    \
                        angleEt: EditText { text:'90',alignment:['center','center'], preferredSize:[50,20] } \
                        degreeSt: StaticText { text:'°' ,preferredSize:[15,17]}    \
                    }, \
                    shiftBox: Checkbox { text:'吸附45°',preferredSize:[100,17],value:1}    \
                }, \
            }, \
            gr1: Group { alignment:['center','center'], \
                applyBtn: Button { text:'Apply',alignment:['center','center'],preferredSize:[70,17] } \
                keyBox: Checkbox { text:'key',preferredSize:[60,17],value:1}    \
            }, \
            gr2: Group { \
                distanceSt: StaticText { text:'Distance',preferredSize:[50,17] }    \
                distanceSlider: Scrollbar { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:100,value:100 } \
                distanceEt: EditText { text:'100',alignment:['left','center'], preferredSize:[40,17] } \
                refreezeBtn: Button { text:'Refreeze',alignment:['left','top'],preferredSize:[70,17] } \
                opacityBox: Checkbox { text:'Opacity',preferredSize:[60,17],value:1}    \
            }, \
            gr3: Group { orientation:'row', alignment:['fill','fill'], \
                frameSt: StaticText { text:'Frames',preferredSize:[50,17] }    \
                frameSlider: Scrollbar { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:10,value:10 } \
                frameEt: EditText { text:'10',alignment:['left','center'], preferredSize:[40,17] } \
                expressionBtn: Button { text:'Expression',alignment:['left','top'], preferredSize:[70,17] }    \
                directionBox: Checkbox { text:'→',preferredSize:[60,17],value:1}    \
            }, \
            gr4: Group { orientation:'row', alignment:['fill','fill'], \
                extractBtn: Button { text:'Extract',alignment:['left','top'], preferredSize:[210,17] }    \
                transformBtn: Button { text:'Effect',alignment:['left','top'], preferredSize:[70,17] }    \
                resetBtn: Button { text:'Reset',alignment:['left','top'], preferredSize:[50,17] }    \
            }, \
        }"; 
        
        var gr = container.add(pos_offset_res);
        
        // 创建圆形角度选择器
        var angleWheel = gr.grAngle.angleWheel.add('customBoundedValue', [0, 0, 70, 70]);
        angleWheel.fillBrightness = 1;
        
        // 绘制角度选择器
        angleWheel.onDraw = function() {
            var g = this.graphics;
            var cx = angleData.centerX;
            var cy = angleData.centerY;
            var r = angleData.radius;
            
            // 背景
            var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.15, 0.15, 0.15, 1]);
            g.backgroundColor = bgBrush;
            
            // 绘制外圆环
            var outerBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.25, 0.25, 0.25, 1]);
            var outerPen = g.newPen(g.PenType.SOLID_COLOR, [0.4, 0.4, 0.4, 1], 2);
            g.ellipsePath(cx - r, cy - r, r * 2, r * 2);
            g.fillPath(outerBrush);
            g.strokePath(outerPen);
            
            // 绘制内圆
            var innerR = r - 12;
            var innerBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.18, 0.18, 0.18, 1]);
            g.ellipsePath(cx - innerR, cy - innerR, innerR * 2, innerR * 2);
            g.fillPath(innerBrush);
            
            // 绘制8个刻度线
            var tickPen = g.newPen(g.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 2);
            for (var i = 0; i < 8; i++) {
                var tickAngle = i * 45;
                var rad = (tickAngle - 90) * Math.PI / 180;
                var x1 = cx + Math.cos(rad) * (r - 10);
                var y1 = cy + Math.sin(rad) * (r - 10);
                var x2 = cx + Math.cos(rad) * (r - 2);
                var y2 = cy + Math.sin(rad) * (r - 2);
                
                g.newPath();
                g.moveTo(x1, y1);
                g.lineTo(x2, y2);
                g.strokePath(tickPen);
            }
            
            // 绘制角度指示线
            var currentRad = (angle - 90) * Math.PI / 180;
            var lineEndX = cx + Math.cos(currentRad) * (r - 6);
            var lineEndY = cy + Math.sin(currentRad) * (r - 6);
            
            var linePen = g.newPen(g.PenType.SOLID_COLOR, [0.2, 0.5, 1, 1], 3);
            g.newPath();
            g.moveTo(cx, cy);
            g.lineTo(lineEndX, lineEndY);
            g.strokePath(linePen);
            
            // 绘制中心点
            var centerBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.5, 1, 1]);
            g.ellipsePath(cx - 4, cy - 4, 8, 8);
            g.fillPath(centerBrush);
            
            // 绘制光标
            var cursorSize = 10;
            var cursorPen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1, 1], 2);
            g.ellipsePath(lineEndX - cursorSize/2, lineEndY - cursorSize/2, cursorSize, cursorSize);
            g.strokePath(cursorPen);
            
            var cursorBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.5, 1, 1]);
            g.ellipsePath(lineEndX - cursorSize/2 + 2, lineEndY - cursorSize/2 + 2, cursorSize - 4, cursorSize - 4);
            g.fillPath(cursorBrush);
        };
        
        // 更新角度显示
        function updateAngleDisplay() {
            gr.grAngle.angleInputGr.angleRow.angleEt.text = angle.toFixed(1);
            angleWheel.notify("onDraw");
        }
        
        // 设置角度
        function setAngle(ang, useShift) {
            ang = normalizeAngle(ang);
            if (useShift || gr.grAngle.angleInputGr.shiftBox.value) {
                ang = Math.round(ang / 45) * 45;
                ang = normalizeAngle(ang);
            }
            angle = ang;
            updateAngleDisplay();
        }
        
        // 鼠标事件处理
        var handleMouseEvent = function(event) {
            if (event.type === "mousedown") {
                angleData.isDragging = true;
                var ang = calculateAngleFromPoint(event.clientX, event.clientY, event.shiftKey);
                setAngle(ang, event.shiftKey);
            } 
            else if (event.type === "mousemove" && angleData.isDragging) {
                var ang = calculateAngleFromPoint(event.clientX, event.clientY, event.shiftKey);
                setAngle(ang, event.shiftKey);
            }
            else if (event.type === "mouseup") {
                angleData.isDragging = false;
            }
        };
        
        angleWheel.addEventListener('mousedown', handleMouseEvent);
        angleWheel.addEventListener('mousemove', handleMouseEvent);
        angleWheel.addEventListener('mouseup', handleMouseEvent);
        
        // 角度输入框事件
        gr.grAngle.angleInputGr.angleRow.angleEt.onChange = function () {
            var val = parseFloat(this.text);
            if (!isNaN(val)) {
                setAngle(val, false);
            }
        };
        
        // 吸附模式切换
        gr.grAngle.angleInputGr.shiftBox.onClick = function() {
            if (this.value) {
                setAngle(angle, true);
            }
        };
        
        // 初始化显示
        updateAngleDisplay();
        
        // Angle - 保留原有滑块逻辑作为备用（已移除）
        
        // Distance
        gr.gr2.distanceEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.distanceSlider.value = Math.round(this.text);
            distance = parseFloat(this.text);
        }
        
        gr.gr2.distanceSlider.onChange = gr.gr2.distanceSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.distanceEt.text = this.value;  
            distance = this.value;
        };
        
        // Frames
        gr.gr3.frameEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.frameSlider.value = parseFloat(this.text);  
            frames = parseFloat(this.text);
        };

        gr.gr3.frameSlider.onChange = gr.gr3.frameSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.frameEt.text = this.value;  
            frames = this.value;
        };
        
        // Expression
        gr.gr3.expressionBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;
            var dire = directionB*2-1;
            var timeDelta = (frames*curComp.frameDuration)*dire;
            
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Angle") == null){
                    var anglesl = selectedLayers[i].Effects.addProperty("ADBE Angle Control");
                    anglesl.name = "Angle";
                }else{
                    var anglesl = selectedLayers[i].Effects.property("Angle");
                }
                selectedLayers[i].Effects.property("ADBE Angle Control").property(1).setValue(angle);
                
                if(selectedLayers[i].Effects.property("Distance") == null){
                    var dissl = selectedLayers[i].Effects.addProperty("ADBE Slider Control");
                    dissl.name = "Distance";
                }else{
                    dissl = selectedLayers[i].Effects.property("Distance");
                }
                dissl(1).setValue(distance);
                
                if(keyB == 1){
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);
                    dissl(1).setValuesAtTimes([curComp.time,curComp.time + timeDelta],[distance,0]);
                    dissl(1).setTemporalEaseAtKey(1,[easeIn],[easeOut]);
                    dissl(1).setTemporalEaseAtKey(2,[easeIn],[easeOut]);
                    
                    if(opacityB == 1){
                        var keyAI = selectedLayers[i].opacity.addKey(curComp.time);
                        var keyBI = selectedLayers[i].opacity.addKey(curComp.time+timeDelta);
                        selectedLayers[i].opacity.setValueAtTime(curComp.time+(frames*curComp.frameDuration)*(-!directionB),0);
                    }
                }

                selectedLayers[i].position.expression = 'angle = degreesToRadians(effect("Angle")(1)-90);\ndistance = effect("Distance")(1);\n[Math.cos(angle),Math.sin(angle)]*distance+value;';
            }
            app.endUndoGroup;
        };
        
        // Apply
        gr.gr1.applyBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;
            var angR = (angle+90)*Math.PI/180;
            var offset = [Math.round(Math.cos(angR)*distance),Math.round(Math.sin(angR)*distance),0];
            
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") == null){
                    selectedLayers[i].Effects.addProperty("ADBE Point3D Control");
                    selectedLayers[i].Effects.property("ADBE Point3D Control").name = "Original Position";
                    selectedLayers[i].Effects.property("Original Position").property(1).setValue(selectedLayers[i].position.value);
                }
                var origin = selectedLayers[i].position.value;
                if(keyB == 1){
                    var dire = directionB*2-1;
                    var timeDelta = (frames*curComp.frameDuration)*dire;
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);

                    var keyAI = selectedLayers[i].position.addKey(curComp.time);
                    selectedLayers[i].position.setTemporalEaseAtKey(keyAI,[easeIn],[easeOut]);

                    var keyBI = selectedLayers[i].position.addKey(curComp.time+timeDelta);
                    selectedLayers[i].position.setTemporalEaseAtKey(keyBI,[easeIn],[easeOut]);

                    selectedLayers[i].position.setValueAtTime(curComp.time+timeDelta*!directionB,[origin[0]+offset[0],origin[1]+offset[1],origin[2]+offset[2]]);
                    selectedLayers[i].position.setValueAtTime(curComp.time+timeDelta*directionB,origin);

                    if(opacityB == 1){
                        var keyAI = selectedLayers[i].opacity.addKey(curComp.time);
                        var keyBI = selectedLayers[i].opacity.addKey(curComp.time+timeDelta);
                        selectedLayers[i].opacity.setValueAtTime(curComp.time+(frames*curComp.frameDuration)*(-!directionB),0);
                    }
                }else{
                    selectedLayers[i].position.setValue([origin[0]+offset[0],origin[1]+offset[1],origin[2]+offset[2]]);
                }
            }
            app.endUndoGroup;
        };
        
        // Extract
        gr.gr4.extractBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var curComp = app.project.activeItem;
            var selectedLayers = curComp.selectedLayers;
            if(selectedLayers.length > 0 && selectedLayers[0].position.selectedKeys.length >= 2){
                var akeyv = selectedLayers[0].position.keyValue(selectedLayers[0].position.selectedKeys[0]);
                var bkeyv = selectedLayers[0].position.keyValue(selectedLayers[0].position.selectedKeys[1]);
                var subv = [akeyv[0]-bkeyv[0],akeyv[1]-bkeyv[1],akeyv[2]-bkeyv[2]];
                var angleS = (Math.atan2(subv[1],subv[0])*180/Math.PI)-90;
                var moveDistance = Math.sqrt(subv[0]*subv[0]+subv[1]*subv[1]);
                var fDuration = (selectedLayers[0].position.keyTime(selectedLayers[0].position.selectedKeys[1])-selectedLayers[0].position.keyTime(selectedLayers[0].position.selectedKeys[0]))*curComp.frameRate;
                
                gr.gr1.angleEt.text = angleS%1 == 0 ? angleS : angleS.toFixed(1);
                gr.gr1.angleSlider.value = angleS/45;
                angstc(gr.gr1.angSt);
                
                gr.gr2.distanceEt.text = moveDistance%1 == 0 ? moveDistance : moveDistance.toFixed(1);
                gr.gr2.distanceSlider.value = moveDistance;
                distance = moveDistance;
                
                gr.gr3.frameEt.text = parseInt(fDuration);
                gr.gr3.frameSlider.value = parseInt(fDuration);
                frames = parseInt(fDuration);
            }
            app.endUndoGroup;
        }
        
        // Transform Effect
        gr.gr4.transformBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;
            var angR = (angle+90)*Math.PI/180;
            var offset = [Math.round(Math.cos(angR)*distance),Math.round(Math.sin(angR)*distance),0];
            
            for(var i = 0;i<selectedLayers.length;i++){
                var transeff;
                if(selectedLayers[i].Effects.property("Transform") == null){
                    transeff = selectedLayers[i].Effects.addProperty("ADBE Geometry2");
                    transeff.property(1).setValue([0,0]);
                    transeff.property(2).setValue([0,0]);
                }else{
                    transeff = selectedLayers[i].Effects.property("Transform");
                }
                
                if(keyB == 1){
                    var dire = directionB*2-1;
                    var timeDelta = (frames*curComp.frameDuration)*dire;
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);

                    var keyAI = transeff.property(2).addKey(curComp.time);
                    transeff.property(2).setTemporalEaseAtKey(keyAI,[easeIn],[easeOut]);

                    var keyBI = transeff.property(2).addKey(curComp.time+timeDelta);
                    transeff.property(2).setTemporalEaseAtKey(keyBI,[easeIn],[easeOut]);

                    transeff.property(2).setValueAtTime(curComp.time+timeDelta*!directionB,[offset[0],offset[1]]);
                    transeff.property(2).setValueAtTime(curComp.time+timeDelta*directionB,[0,0]);

                    if(opacityB == 1){
                        var keyAI = transeff.property(9).addKey(curComp.time);
                        var keyBI = transeff.property(9).addKey(curComp.time+timeDelta);
                        transeff.property(9).setValueAtTime(curComp.time+(frames*curComp.frameDuration)*(-!directionB),0);
                    }
                }else{
                    transeff.property(2).setValue([offset[0],offset[1]]);
                }
            }
            app.endUndoGroup;
        };
        
        // Reset
        gr.gr4.resetBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") != null){
                    for(var j = selectedLayers[i].position.numKeys;j>=1;j--){
                        selectedLayers[i].position.removeKey(j);
                    }
                    selectedLayers[i].position.setValue(selectedLayers[i].Effects.property("Original Position").property(1).value);
                    for(var j = selectedLayers[i].opacity.numKeys;j>=1;j--){
                        selectedLayers[i].opacity.removeKey(j);
                    }
                    selectedLayers[i].opacity.setValue(100);
                }
            }
            app.endUndoGroup;
        };
        
        // Refreeze
        gr.gr2.refreezeBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") == null){
                    selectedLayers[i].Effects.addProperty("ADBE Point3D Control");
                    selectedLayers[i].Effects.property("ADBE Point3D Control").name = "Original Position";
                }
                selectedLayers[i].Effects.property("Original Position").property(1).setValue(selectedLayers[i].position.value);
            }
            app.endUndoGroup;
        };
        
        // Checkboxes
        gr.gr1.keyBox.onClick = function () { keyB = this.value; }
        gr.gr2.opacityBox.onClick = function () { opacityB = this.value; }
        gr.gr3.directionBox.onClick = function () { directionB = this.value; }
        
        return gr;
    }
    
    return {
        name: "PositionOffset",
        displayName: "Position_offset",
        version: "1.0",
        buildUI: buildUI
    };
})();

// 独立运行模式 - 只在非启动器加载时运行
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "Position Offset by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        PositionOffsetModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
