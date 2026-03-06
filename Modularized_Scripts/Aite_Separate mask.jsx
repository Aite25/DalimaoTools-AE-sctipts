// 分离蒙版脚本 - Separate Masks
// 功能：将选中图层的每个蒙版分离到单独的图层副本中
// 作者：GitHub Copilot
// 版本：1.1.0

(function() {
    // 用户配置选项
    var CONFIG = {
        keepOriginalMaskMode: true,    // 是否保留原始蒙版模式
        newMaskMode: MaskMode.ADD,      // 不保留原始模式时使用的新模式
                                        // 可选值: MaskMode.ADD, MaskMode.SUBTRACT, MaskMode.INTERSECT, MaskMode.LIGHTEN, 
                                        // MaskMode.DARKEN, MaskMode.DIFFERENCE, MaskMode.NONE
        showCompletionAlert: false      // 是否显示完成提示弹窗
    };
    
    // 检查是否有项目打开
    if (app.project === null) {
        alert("请先打开一个项目！");
        return;
    }

    // 检查是否有合成打开
    if (app.project.activeItem === null || !(app.project.activeItem instanceof CompItem)) {
        alert("请先打开一个合成！");
        return;
    }
    
    // 获取当前合成
    var comp = app.project.activeItem;
    
    // 检查是否有选中的图层
    if (comp.selectedLayers.length === 0) {
        alert("请先选择至少一个图层！");
        return;
    }
    
    // 开始撤销组
    app.beginUndoGroup("分离蒙版到单独图层");
    
    try {
        // 处理每个选中的图层
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            
            // 检查图层是否有蒙版
            if (layer.mask && layer.mask.numProperties > 0) {
                processMasks(layer);
            } else {
                alert("图层 '" + layer.name + "' 没有蒙版，已跳过。");            }
        }
        
        // 可选：显示完成提示
        if (CONFIG.showCompletionAlert) {
            alert("蒙版分离完成！");
        }
    } catch (e) {
        alert("执行过程中发生错误: " + e.toString());
    } finally {
        // 结束撤销组
        app.endUndoGroup();
    }    
    // 处理图层的蒙版
    function processMasks(layer) {
        // 获取图层的所有蒙版
        var masks = layer.mask;
        var numMasks = masks.numProperties;
        
        // 如果只有一个蒙版，不需要分离
        if (numMasks <= 1) {
            alert("图层 '" + layer.name + "' 只有一个或没有蒙版，无需分离。");
            return;
        }
        
        // 存储所有蒙版的引用和属性
        var masksData = [];
        for (var i = 1; i <= numMasks; i++) { // After Effects的属性索引从1开始
            var mask = masks(i);
            masksData.push({
                name: mask.name,
                maskMode: mask.maskMode,
                inverted: mask.inverted,
                rotoBezier: mask.rotoBezier,
                maskFeather: [mask.maskFeather.value[0], mask.maskFeather.value[1]],
                maskExpansion: mask.maskExpansion.value,
                maskOpacity: mask.maskOpacity.value,
                maskShape: mask.maskShape.value
            });
        }
          // 为每个蒙版创建一个图层副本
        for (var i = 0; i < masksData.length; i++) {
            // 复制原始图层
            var newLayer = layer.duplicate();
            
            // 获取蒙版模式的文本表示
            var maskModeText = getMaskModeText(masksData[i].maskMode);
            
            // 重命名新图层，加上蒙版名称和模式
            newLayer.name = layer.name + " - " + maskModeText + " - " + masksData[i].name;
            
            // 设置图层标签颜色，根据蒙版模式
            newLayer.label = getMaskModeColor(masksData[i].maskMode);
            
            // 删除新图层上的所有蒙版
            while (newLayer.mask.numProperties > 0) {
                newLayer.mask(1).remove();
            }
              // 创建新的蒙版，使用保存的数据
            var newMask = newLayer.mask.addProperty("Mask");
            newMask.name = masksData[i].name;
            
            // 根据配置设置蒙版模式
            if (CONFIG.keepOriginalMaskMode) {
                newMask.maskMode = masksData[i].maskMode;
            } else {
                newMask.maskMode = CONFIG.newMaskMode;
            }
            
            newMask.inverted = masksData[i].inverted;
            newMask.rotoBezier = masksData[i].rotoBezier;
              // 设置蒙版形状
            newMask.maskShape.setValue(masksData[i].maskShape);
            
            // 设置其他蒙版属性
            if (masksData[i].maskFeather) {
                newMask.maskFeather.setValue([masksData[i].maskFeather[0], masksData[i].maskFeather[1]]);
            }
            newMask.maskExpansion.setValue(masksData[i].maskExpansion);
            newMask.maskOpacity.setValue(masksData[i].maskOpacity);
        }
          // 可选：隐藏原始图层
        layer.enabled = false;
        layer.name = layer.name + " (原始)";
    }
    
    // 获取蒙版模式的文本表示
    function getMaskModeText(maskMode) {
        switch (maskMode) {
            case MaskMode.ADD:
                return "加";
            case MaskMode.SUBTRACT:
                return "减";
            case MaskMode.INTERSECT:
                return "交";
            case MaskMode.LIGHTEN:
                return "亮";
            case MaskMode.DARKEN:
                return "暗";
            case MaskMode.DIFFERENCE:
                return "差";
            case MaskMode.NONE:
                return "无";
            default:
                return "未知";
        }
    }
    
    // 获取蒙版模式对应的图层标签颜色
    function getMaskModeColor(maskMode) {
        switch (maskMode) {
            case MaskMode.ADD:
                return 1; // 红色
            case MaskMode.SUBTRACT:
                return 2; // 黄色
            case MaskMode.INTERSECT:
                return 3; // 绿色
            case MaskMode.LIGHTEN:
                return 4; // 青色
            case MaskMode.DARKEN:
                return 5; // 蓝色
            case MaskMode.DIFFERENCE:
                return 6; // 紫色
            case MaskMode.NONE:
                return 7; // 橙色
            default:
                return 0; // 无
        }
    }
})();