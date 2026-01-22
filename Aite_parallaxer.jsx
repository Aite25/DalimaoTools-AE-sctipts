//Copyright © 2024 改进版相机对齐脚本
//基于 Parallaxer 的主要功能，针对1920x1080合成优化

// 创建可停靠的UI界面
function createDockableUI(thisObj) {
    var dialog = thisObj instanceof Panel ? thisObj : new Window("window", undefined, undefined, { resizeable: true });
    dialog.onResizing = dialog.onResize = function () {
        this.layout.resize();
    };
    return dialog;
}

function showWindow(myWindow) {
    if (myWindow instanceof Window) {
        myWindow.center();
        myWindow.show();
    }
    if (myWindow instanceof Panel) {
        myWindow.layout.layout(true);
        myWindow.layout.resize();
    }
}

// 创建主界面
var dialog = createDockableUI(this);
dialog.orientation = "column";
dialog.alignChildren = ["left", "top"];
dialog.spacing = 10;
dialog.margins = 16;

// 主标题
var titleText = dialog.add("statictext", undefined, "相机对齐工具");
titleText.graphics.font = ScriptUI.newFont(titleText.graphics.font.name, ScriptUI.FontStyle.BOLD, 14);

// 分隔线
var sep1 = dialog.add("panel", undefined, "", {borderStyle: "gray"});
sep1.alignment = ["fill", "top"];
sep1.preferredSize.height = 2;

// 主功能按钮行
var mainButtonRow = dialog.add("group");
mainButtonRow.orientation = "row";
mainButtonRow.alignChildren = ["left", "center"];
mainButtonRow.spacing = 10;

var setupCameraButton = mainButtonRow.add("button", undefined, "设置相机对齐");
setupCameraButton.preferredSize = [150, 35];
setupCameraButton.helpTip = "为当前合成创建优化的3D相机";

var convertLayerButton = mainButtonRow.add("button", undefined, "转换图层");
convertLayerButton.preferredSize = [100, 35];
convertLayerButton.helpTip = "将选中的2D图层转换为3D图层";

// 分隔线
var sep2 = dialog.add("panel", undefined, "", {borderStyle: "gray"});
sep2.alignment = ["fill", "top"];
sep2.preferredSize.height = 2;

// 调整按钮行
var adjustButtonRow = dialog.add("group");
adjustButtonRow.orientation = "row";
adjustButtonRow.alignChildren = ["left", "center"];
adjustButtonRow.spacing = 5;

var minusButton = adjustButtonRow.add("button", undefined, "距离 -");
minusButton.preferredSize = [60, 30];

var flatButton = adjustButtonRow.add("button", undefined, "平面化");
flatButton.preferredSize = [50, 30];

var plusButton = adjustButtonRow.add("button", undefined, "距离 +");
plusButton.preferredSize = [60, 30];

// 重置按钮行
var resetButtonRow = dialog.add("group");
resetButtonRow.orientation = "row"; 
resetButtonRow.alignChildren = ["left", "center"];
resetButtonRow.spacing = 10;

var resetCameraButton = resetButtonRow.add("button", undefined, "重置相机");
resetCameraButton.preferredSize = [100, 28];

var convert2DButton = resetButtonRow.add("button", undefined, "转为2D");
convert2DButton.preferredSize = [100, 28];

var bakeButton = resetButtonRow.add("button", undefined, "烘焙");
bakeButton.preferredSize = [50, 28];

// 帮助按钮
var helpButton = dialog.add("button", undefined, "帮助");
helpButton.preferredSize = [250, 25];

showWindow(dialog);

// ================== 核心功能函数 ==================

// 计算相机参数（针对1920x1080优化）
function calculateCameraParams(comp) {
    if (!comp || !(comp instanceof CompItem)) {
        return null;
    }
    
    try {
        // 基础参数
        var params = {
            width: comp.width,
            height: comp.height,
            centerX: comp.width / 2,
            centerY: comp.height / 2,
            // 针对1920x1080的优化值
            cameraZ: 2666.7,  // 基于FOV计算的Z轴位置
            // Y轴偏移量按比例计算（相对于原Parallaxer的15000偏移）
            offsetY: (comp.height / 1080) * 1000,  // 按高度比例调整偏移量
            offsetZ: 0  // 不使用过大的Z轴偏移
        };
        
        return params;
    } catch (e) {
        return null;
    }
}

// 主相机设置功能
function setupCamera() {
    app.beginUndoGroup("设置相机对齐");
    
    var comp = app.project.activeItem;
    
    // 检查是否有活动合成
    if (!comp || !(comp instanceof CompItem)) {
        alert("请选择一个合成然后运行脚本。");
        app.endUndoGroup();
        return;
    }
    
    // 检查是否已存在相机
    var existingCamera = null;
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === "对齐相机" && comp.layer(i) instanceof CameraLayer) {
            existingCamera = comp.layer(i);
            break;
        } else if (comp.layer(i) instanceof CameraLayer) {
            alert("请删除现有相机。此脚本将创建自己的相机。");
            app.endUndoGroup();
            return;
        }
    }
    
    // 确认对话框
    var confirmation = confirm(
        "此脚本将为合成创建优化的3D相机和图层设置。\n\n" +
        "• 锁定的图层将保持2D状态\n" +
        "• 之后仍可添加和转换图层\n\n" +
        "是否继续？"
    );
    
    if (!confirmation) {
        app.endUndoGroup();
        return;
    }
    
    var params = calculateCameraParams(comp);
    
    if (!params) {
        alert("无法计算相机参数，请确保选择了有效的合成。");
        app.endUndoGroup();
        return;
    }
    
    // 创建相机 - 使用one-node camera避免图层倾斜
    if (!existingCamera) {
        try {
            // 创建相机
            var camera = comp.layers.addCamera("对齐相机", [params.centerX, params.centerY]);
            camera.name = "对齐相机";
            
            // 设置相机位置和属性
            camera.position.setValueAtTime(0, [params.centerX, params.centerY, -params.cameraZ]);
            camera.property("Zoom").setValue(params.cameraZ);
            camera.property("Focus Distance").setValue(params.cameraZ);
            camera.label = 13; // 红色标签
            
            // 设置Point of Interest表达式，让相机始终向前看
            // Point of Interest = 相机位置 + [0, 0, 相机Z轴距离]
            var poiExpression = "transform.position + [0, 0, " + params.cameraZ + "];";
            camera.property("Point of Interest").expression = poiExpression;
        } catch (e) {
            app.endUndoGroup();
            return;
        }
    }
    
    // 收集所有需要转换的图层（按照在合成中的顺序，即遮挡顺序）
    var layersToConvert = [];
    
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (layer.name !== "对齐相机" && !layer.locked) {
            layersToConvert.push(layer);
        }
    }
    
    // 转换图层为3D并应用Parallaxer风格的表达式
    for (var i = 0; i < layersToConvert.length; i++) {
        var layer = layersToConvert[i];
        
        // 转换为3D
        layer.threeDLayer = true;
        layer.property("Position").dimensionsSeparated = false;
        
        // 应用Parallaxer风格的缩放表达式
        layer.property("Scale").expression = 
            "camzoom = thisComp.activeCamera.zoom;\n" +
            "scalefactor = 100 * transform.position[2] / camzoom + 100;\n" +
            "[scalefactor * value[0] / 100, scalefactor * value[1] / 100, scalefactor * value[2] / 100];";
        
        // 应用Parallaxer风格的位置表达式
        layer.property("Position").expression =
            "camzoom = thisComp.activeCamera.zoom;\n" +
            "scalefactor = 100 + transform.position[2] / camzoom * 100;\n" +
            "camPosX = (thisComp.width / 2) + (scalefactor / 100) * (transform.position[0] - (thisComp.width / 2));\n" +
            "camPosY = (thisComp.height / 2) + (scalefactor / 100) * (transform.position[1] - (thisComp.height / 2));\n" +
            "camPosZ = transform.position[2];\n" +
            "[camPosX, camPosY, camPosZ];";
    }
    
    // 显示场景深度选择对话框并分配Z轴位置
    showSceneDepthDialog(comp, layersToConvert);
    
    // 创建标识图层
    createIndicatorLayer(comp);
    
    app.endUndoGroup();
}

// 转换图层为3D并应用表达式
function convertLayerTo3D(layer, params) {
    // 记录原始2D位置和缩放
    var original2DPos = layer.property("Position").value;
    var original2DScale = layer.property("Scale").value;
    
    // 转换为3D
    layer.threeDLayer = true;
    layer.property("Position").dimensionsSeparated = false;
    
    // 保持原始位置不变，只是转为3D（Z=0）
    layer.property("Position").setValue([original2DPos[0], original2DPos[1], 0]);
    
    // 不应用任何表达式 - 让图层在Z=0时保持完全一致的外观
    // 用户可以手动移动图层到不同Z深度后，再应用透视表达式
}

// 场景深度选择对话框（参考Parallaxer方式）
function showSceneDepthDialog(comp, layersToConvert) {
    var depthWindow = new Window("dialog", "选择场景深度");
    depthWindow.add("statictext", undefined, "选择您的场景类型：");
    
    var smallButton = depthWindow.add("button", undefined, "小场景 (小房间)");
    var mediumButton = depthWindow.add("button", undefined, "中等场景 (大房间)"); 
    var largeButton = depthWindow.add("button", undefined, "大场景 (户外)");
    
    smallButton.onClick = function() {
        var zEnd = 4285 * ((comp.width + comp.height) / 4820);
        depthWindow.close();
        distributeLayersInDepth(comp, layersToConvert, zEnd);
    };
    
    mediumButton.onClick = function() {
        var zEnd = 9285 * ((comp.width + comp.height) / 4820);
        depthWindow.close();
        distributeLayersInDepth(comp, layersToConvert, zEnd);
    };
    
    largeButton.onClick = function() {
        var zEnd = 22585 * ((comp.width + comp.height) / 4820);
        depthWindow.close();
        distributeLayersInDepth(comp, layersToConvert, zEnd);
    };
    
    depthWindow.show();
}

// 简化的表达式应用函数
function applySimpleExpressions(layer, original2DPos, original2DScale, params) {
    try {
        // 简单的缩放表达式
        layer.property("Scale").expression = 
            "cam = thisComp.activeCamera;\n" +
            "if (cam != null) {\n" +
            "  camZ = cam.transform.position[2];\n" +
            "  layerZ = transform.position[2];\n" +
            "  if (layerZ == 0) {\n" +
            "    value;\n" +
            "  } else {\n" +
            "    distance = Math.abs(camZ - layerZ);\n" +
            "    baseDist = Math.abs(camZ);\n" +
            "    scaleFactor = baseDist / distance;\n" +
            "    value * scaleFactor;\n" +
            "  }\n" +
            "} else {\n" +
            "  value;\n" +
            "}";
        
        // 简单的位置表达式
        layer.property("Position").expression = 
            "cam = thisComp.activeCamera;\n" +
            "if (cam != null) {\n" +
            "  layerZ = transform.position[2];\n" +
            "  if (layerZ == 0) {\n" +
            "    [" + original2DPos[0] + ", " + original2DPos[1] + ", 0];\n" +
            "  } else {\n" +
            "    camPos = cam.transform.position;\n" +
            "    camZ = camPos[2];\n" +
            "    distance = Math.abs(camZ - layerZ);\n" +
            "    baseDist = Math.abs(camZ);\n" +
            "    factor = distance / baseDist;\n" +
            "    camCenterX = camPos[0];\n" +
            "    camCenterY = camPos[1];\n" +
            "    offsetX = (" + original2DPos[0] + " - camCenterX) * factor;\n" +
            "    offsetY = (" + original2DPos[1] + " - camCenterY) * factor;\n" +
            "    [camCenterX + offsetX, camCenterY + offsetY, layerZ];\n" +
            "  }\n" +
            "} else {\n" +
            "  value;\n" +
            "}";
    } catch (e) {
        alert("应用表达式时出错: " + e.toString());
    }
}

// 应用透视表达式
function applyPerspectiveExpressions(layer, original2DPos, original2DScale, params) {
    // 应用缩放表达式 - 确保在Z=0时保持原始缩放
    layer.property("Scale").expression = 
        "cam = thisComp.activeCamera;\n" +
        "if (cam != null && cam.name == '对齐相机') {\n" +
        "  camZ = cam.transform.position[2];\n" +
        "  layerZ = transform.position[2];\n" +
        "  \n" +
        "  // 当图层在Z=0时，保持原始缩放\n" +
        "  if (Math.abs(layerZ) < 0.1) {\n" +
        "    [" + original2DScale[0] + ", " + original2DScale[1] + ", " + original2DScale[2] + "];\n" +
        "  } else {\n" +
        "    // 透视缩放：基于相机焦距的透视效果\n" +
        "    distance = Math.abs(camZ - layerZ);\n" +
        "    baseDist = Math.abs(camZ);\n" +
        "    scaleFactor = baseDist / distance;\n" +
        "    original = [" + original2DScale[0] + ", " + original2DScale[1] + ", " + original2DScale[2] + "];\n" +
        "    [original[0] * scaleFactor, original[1] * scaleFactor, original[2] * scaleFactor];\n" +
        "  }\n" +
        "} else {\n" +
        "  [" + original2DScale[0] + ", " + original2DScale[1] + ", " + original2DScale[2] + "];\n" +
        "}";
    
    // 应用位置表达式 - 确保在Z=0时保持原始位置
    layer.property("Position").expression = 
        "cam = thisComp.activeCamera;\n" +
        "if (cam != null && cam.name == '对齐相机') {\n" +
        "  layerZ = transform.position[2];\n" +
        "  \n" +
        "  // 当图层在Z=0时，保持原始位置\n" +
        "  if (Math.abs(layerZ) < 0.1) {\n" +
        "    [" + original2DPos[0] + ", " + original2DPos[1] + ", layerZ];\n" +
        "  } else {\n" +
        "    // 透视位置计算\n" +
        "    camPos = cam.transform.position;\n" +
        "    camZ = camPos[2];\n" +
        "    \n" +
        "    // 原始2D位置（目标位置）\n" +
        "    target2DX = " + original2DPos[0] + ";\n" +
        "    target2DY = " + original2DPos[1] + ";\n" +
        "    \n" +
        "    // 透视投影计算\n" +
        "    distance = Math.abs(camZ - layerZ);\n" +
        "    baseDist = Math.abs(camZ);\n" +
        "    perspectiveFactor = distance / baseDist;\n" +
        "    \n" +
        "    // 相机中心\n" +
        "    camCenterX = camPos[0];\n" +
        "    camCenterY = camPos[1];\n" +
        "    \n" +
        "    // 计算透视偏移\n" +
        "    offsetX = (target2DX - camCenterX) * perspectiveFactor;\n" +
        "    offsetY = (target2DY - camCenterY) * perspectiveFactor;\n" +
        "    \n" +
        "    // 最终3D位置\n" +
        "    finalX = camCenterX + offsetX;\n" +
        "    finalY = camCenterY + offsetY;\n" +
        "    \n" +
        "    [finalX, finalY, layerZ];\n" +
        "  }\n" +
        "} else {\n" +
        "  [" + original2DPos[0] + ", " + original2DPos[1] + ", transform.position[2]];\n" +
        "}";
}

// 分布图层深度（参考Parallaxer的Z轴分配方式）
function distributeLayersInDepth(comp, layersToConvert, zEnd) {
    if (layersToConvert.length === 0) return;
    
    // 使用Parallaxer的Z轴分布算法
    var zStart = 35 * ((comp.width + comp.height) / 4820);
    var zRange = zEnd - zStart;
    var count = 0;
    
    // 按照图层在合成中的顺序分配Z轴位置（越靠上的图层越靠前）
    for (var i = 0; i < layersToConvert.length; i++) {
        var layer = layersToConvert[i];
        
        // 根据图层在数组中的索引计算Z轴位置
        var layerZ = zStart + (zRange * count / Math.max(1, layersToConvert.length - 1));
        
        // 保持原有的X、Y位置，只设置新的Z轴位置
        var currentPos = layer.property("Position").value;
        layer.property("Position").setValue([currentPos[0], currentPos[1], layerZ]);
        
        count++;
    }
}

// 创建标识图层
function createIndicatorLayer(comp) {
    var indicator = comp.layers.addText("相机对齐已激活");
    indicator.sourceText.setValue("相机对齐已激活");
    
    var textDoc = indicator.sourceText.value;
    textDoc.fontSize = Math.max(24, comp.height / 45);
    textDoc.fillColor = [1, 0, 0];
    textDoc.strokeColor = [1, 1, 1];
    textDoc.strokeWidth = 2;
    textDoc.applyStroke = true;
    textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    indicator.sourceText.setValue(textDoc);
    
    indicator.transform.position.setValue([comp.width / 2, comp.height / 20, 0]);
    indicator.guideLayer = true;
    indicator.locked = true;
    indicator.shy = true;
    
    comp.hideShyLayers = true;
}

// ================== 按钮事件 ==================

// 主相机设置按钮
setupCameraButton.onClick = setupCamera;

// 转换图层按钮
convertLayerButton.onClick = function() {
    app.beginUndoGroup("转换选中图层");
    
    var comp = app.project.activeItem;
    if (!comp) {
        alert("请选择一个合成。");
        app.endUndoGroup();
        return;
    }
    
    // 检查是否有相机
    var hasCamera = false;
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === "对齐相机") {
            hasCamera = true;
            break;
        }
    }
    
    if (!hasCamera) {
        alert("请先运行'设置相机对齐'功能。");
        app.endUndoGroup();
        return;
    }
    
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("请选择要转换的图层。");
        app.endUndoGroup();
        return;
    }
    
    var params = calculateCameraParams(comp);
    
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (!layer.threeDLayer && layer.name !== "对齐相机") {
            // 记录原始2D位置和缩放
            var original2DPos = layer.property("Position").value;
            var original2DScale = layer.property("Scale").value;
            
            // 转换为3D
            layer.threeDLayer = true;
            layer.property("Position").dimensionsSeparated = false;
            layer.property("Position").setValue([original2DPos[0], original2DPos[1], 0]);
            
            // 应用简化表达式
            applySimpleExpressions(layer, original2DPos, original2DScale, params);
        }
    }
    
    app.endUndoGroup();
};

// 距离调整按钮
minusButton.onClick = function() {
    adjustLayerDistances(0.85);
};

plusButton.onClick = function() {
    adjustLayerDistances(1.15);
};

flatButton.onClick = function() {
    flattenSelectedLayers();
};

// 调整图层距离
function adjustLayerDistances(factor) {
    app.beginUndoGroup("调整图层距离");
    
    var comp = app.project.activeItem;
    var selectedLayers = comp.selectedLayers;
    
    if (selectedLayers.length < 2) {
        alert("请选择至少两个3D图层。");
        app.endUndoGroup();
        return;
    }
    
    // 计算平均Z位置
    var totalZ = 0;
    var count = 0;
    for (var i = 0; i < selectedLayers.length; i++) {
        if (selectedLayers[i].threeDLayer) {
            totalZ += selectedLayers[i].transform.position.value[2];
            count++;
        }
    }
    
    if (count === 0) {
        alert("请选择3D图层。");
        app.endUndoGroup();
        return;
    }
    
    var avgZ = totalZ / count;
    
    // 调整距离
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.threeDLayer) {
            var pos = layer.transform.position.value;
            var newZ = avgZ + (pos[2] - avgZ) * factor;
            layer.transform.position.setValue([pos[0], pos[1], newZ]);
        }
    }
    
    app.endUndoGroup();
}

// 平面化选中图层
function flattenSelectedLayers() {
    app.beginUndoGroup("平面化图层");
    
    var comp = app.project.activeItem;
    var selectedLayers = comp.selectedLayers;
    
    if (selectedLayers.length < 2) {
        alert("请选择至少两个3D图层。");
        app.endUndoGroup();
        return;
    }
    
    // 计算平均Z位置
    var totalZ = 0;
    var count = 0;
    for (var i = 0; i < selectedLayers.length; i++) {
        if (selectedLayers[i].threeDLayer) {
            totalZ += selectedLayers[i].transform.position.value[2];
            count++;
        }
    }
    
    if (count === 0) {
        alert("请选择3D图层。");
        app.endUndoGroup();
        return;
    }
    
    var avgZ = totalZ / count;
    
    // 设置所有图层到平均Z位置
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.threeDLayer) {
            var pos = layer.transform.position.value;
            layer.transform.position.setValue([pos[0], pos[1], avgZ]);
        }
    }
    
    app.endUndoGroup();
}

// 重置相机按钮
resetCameraButton.onClick = function() {
    app.beginUndoGroup("重置相机");
    
    var comp = app.project.activeItem;
    var camera = null;
    
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === "对齐相机") {
            camera = comp.layer(i);
            break;
        }
    }
    
    if (camera) {
        var params = calculateCameraParams(comp);
        
        // 确保相机是one-node类型
        try {
            var cameraOptions = camera.property("ADBE Camera Options Group");
            if (cameraOptions) {
                var cameraType = cameraOptions.property("ADBE Camera Type");
                if (cameraType) {
                    cameraType.setValue(0); // 0 = one-node camera
                }
            }
        } catch (e) {
            // 如果无法设置相机类型，忽略错误
        }
        
        // 重置位置
        camera.position.setValueAtTime(0, [params.centerX, params.centerY, -params.cameraZ]);
        
        alert("相机已重置到默认位置。");
    } else {
        alert("未找到对齐相机。");
    }
    
    app.endUndoGroup();
};

// 转为2D按钮
convert2DButton.onClick = function() {
    app.beginUndoGroup("转换为2D");
    
    var comp = app.project.activeItem;
    var selectedLayers = comp.selectedLayers;
    
    if (selectedLayers.length === 0) {
        alert("请选择要转换的图层。");
        app.endUndoGroup();
        return;
    }
    
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.threeDLayer && layer.name !== "对齐相机") {
            layer.threeDLayer = false;
            layer.property("Position").expression = "";
            layer.property("Scale").expression = "";
        }
    }
    
    app.endUndoGroup();
};

// 烘焙按钮
bakeButton.onClick = function() {
    app.beginUndoGroup("烘焙表达式");
    
    var comp = app.project.activeItem;
    var confirmation = confirm(
        "烘焙将移除所有表达式并固化当前值。\n\n" +
        "这将提高性能但失去动态调整能力。\n\n" +
        "是否继续？"
    );
    
    if (!confirmation) {
        app.endUndoGroup();
        return;
    }
    
    // 烘焙所有3D图层的表达式
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (layer.threeDLayer && layer.name !== "对齐相机") {
            // 获取当前值并移除表达式
            var scaleValue = layer.property("Scale").value;
            var positionValue = layer.property("Position").value;
            
            layer.property("Scale").expression = "";
            layer.property("Position").expression = "";
            
            layer.property("Scale").setValue(scaleValue);
            layer.property("Position").setValue(positionValue);
        }
    }
    
    alert("烘焙完成！所有表达式已转换为关键帧。");
    app.endUndoGroup();
};

// 帮助按钮
helpButton.onClick = function() {
    var helpText = 
        "相机对齐工具 v1.0\n\n" +
        "针对1920x1080合成优化的3D相机对齐工具\n\n" +
        "主要功能：\n" +
        "• 设置相机对齐：为合成创建优化的3D相机\n" +
        "• 转换图层：将2D图层转换为3D图层\n" +
        "• 距离调整：调整选中图层间的距离\n" +
        "• 平面化：将选中图层移到同一Z位置\n" +
        "• 重置相机：重置相机到默认位置\n" +
        "• 转为2D：将3D图层转回2D\n" +
        "• 烘焙：固化表达式为关键帧\n\n" +
        "使用步骤：\n" +
        "1. 在Illustrator或Photoshop中准备分层文件\n" +
        "2. 导入AE作为合成\n" +
        "3. 运行'设置相机对齐'\n" +
        "4. 选择场景深度类型\n" +
        "5. 设置双视图模式：顶视图+相机视图\n\n" +
        "优化特性：\n" +
        "• 相机Z轴位置：2666.7（基于FOV计算）\n" +
        "• 更稳定的表达式\n" +
        "• 合理的偏移量\n" +
        "• 支持不同场景深度";
    
    var helpWindow = new Window("window", "帮助");
    var textArea = helpWindow.add("edittext", [0, 0, 600, 400], helpText, {multiline: true, readonly: true});
    textArea.graphics.font = ScriptUI.newFont("Consolas", ScriptUI.FontStyle.REGULAR, 11);
    
    helpWindow.center();
    helpWindow.show();
};
