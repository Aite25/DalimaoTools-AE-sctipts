// 合并蒙版脚本 - Combine Masks
// 功能：将选中图层的蒙版合并到最后选中的图层中，保持蒙版在合成中的绝对位置，并删除源图层
// 作者：GitHub Copilot
// 版本：1.3.0

(function() {
    // 用户配置
    var CONFIG = {
        mergeByLabel: true    // 是否按图层标签颜色进行分组合并，如果为true，则按相同标签颜色分组合并
    };
    
    // 检查是否有项目打开
    if (app.project === null) {
        return;
    }

    // 检查是否有合成打开
    if (app.project.activeItem === null || !(app.project.activeItem instanceof CompItem)) {
        return;
    }    // 获取当前合成
    var comp = app.project.activeItem;
    
    // 检查是否选中了至少两个图层
    if (comp.selectedLayers.length < 2) {
        return;
    }
    
    // 开始撤销组
    app.beginUndoGroup("合并蒙版");
      try {
        if (CONFIG.mergeByLabel) {
            // 按标签颜色分组合并
            mergeLayersByLabel(comp);
        } else {
            // 原始逻辑：将所有图层合并到最后选中的图层
            // 获取所有选中的图层，最后选中的图层在索引0
            var targetLayer = comp.selectedLayers[0]; // 最后选中的图层（目标图层）
            var sourceLayers = [];
            
            // 收集所有源图层（除最后选中的图层外）
            for (var i = 1; i < comp.selectedLayers.length; i++) {
                sourceLayers.push(comp.selectedLayers[i]);
            }
            
            // 检查目标图层是否有蒙版
            if (!targetLayer.mask || targetLayer.mask.numProperties === 0) {
                return;
            }
            
            // 检查每个源图层是否有蒙版并进行合并
            var mergedCount = 0;
            var layersToRemove = [];
            
            for (var i = 0; i < sourceLayers.length; i++) {
                var sourceLayer = sourceLayers[i];
                if (sourceLayer.mask && sourceLayer.mask.numProperties > 0) {
                    combineMasks(sourceLayer, targetLayer);
                    mergedCount++;
                    layersToRemove.push(sourceLayer);
                }
            }
            
            // 删除已合并的源图层（从后往前删除，避免索引变化问题）
            for (var i = layersToRemove.length - 1; i >= 0; i--) {
                layersToRemove[i].remove();
            }
        }} catch (e) {
        // 发生错误时静默处理
    } finally {
        // 结束撤销组
        app.endUndoGroup();
    }
      // 合并蒙版函数
    function combineMasks(sourceLayer, targetLayer) {
        // 获取源图层和目标图层的位置和锚点信息
        var sourcePosition = sourceLayer.transform.position.value;
        var sourceAnchorPoint = sourceLayer.transform.anchorPoint.value;
        var targetPosition = targetLayer.transform.position.value;
        var targetAnchorPoint = targetLayer.transform.anchorPoint.value;
        
        // 计算两个图层之间的偏移量
        var offsetX = (sourcePosition[0] - sourceAnchorPoint[0]) - (targetPosition[0] - targetAnchorPoint[0]);
        var offsetY = (sourcePosition[1] - sourceAnchorPoint[1]) - (targetPosition[1] - targetAnchorPoint[1]);
        
        // 获取源图层的所有蒙版
        var sourceMasks = sourceLayer.mask;
        var numSourceMasks = sourceMasks.numProperties;
        
        // 遍历并复制每个蒙版到目标图层
        for (var i = 1; i <= numSourceMasks; i++) {
            var sourceMask = sourceMasks(i);
            var sourceMaskShape = sourceMask.maskShape.value;
            
            // 创建新蒙版
            var newMask = targetLayer.mask.addProperty("Mask");
            newMask.name = sourceLayer.name + " - " + sourceMask.name;
            
            // 复制蒙版模式和其他属性
            newMask.inverted = sourceMask.inverted;
            newMask.maskMode = sourceMask.maskMode;
            try {
                newMask.rotoBezier = sourceMask.rotoBezier;
            } catch (e) {
                // 某些蒙版可能没有rotoBezier属性，忽略错误
            }
            
            try {
                newMask.maskFeather.setValue(sourceMask.maskFeather.value);
            } catch (e) {
                // 忽略可能的错误
            }
            
            try {
                newMask.maskExpansion.setValue(sourceMask.maskExpansion.value);
            } catch (e) {
                // 忽略可能的错误
            }
            
            try {
                newMask.maskOpacity.setValue(sourceMask.maskOpacity.value);
            } catch (e) {
                // 忽略可能的错误
            }
            
            // 调整蒙版形状坐标以适应目标图层
            var adjustedShape = adjustMaskShape(sourceMaskShape, offsetX, offsetY);
            newMask.maskShape.setValue(adjustedShape);
        }
    }
      // 调整蒙版形状坐标
    function adjustMaskShape(shape, offsetX, offsetY) {
        // 创建一个新的形状对象
        var newShape = new Shape();
        
        // 复制原始形状的属性
        newShape.closed = shape.closed;
        
        // 复制并调整顶点位置
        var vertices = [];
        for (var i = 0; i < shape.vertices.length; i++) {
            vertices.push([shape.vertices[i][0] + offsetX, shape.vertices[i][1] + offsetY]);
        }
        newShape.vertices = vertices;
        
        // 复制切线
        var inTangents = [];
        var outTangents = [];
        for (var i = 0; i < shape.inTangents.length; i++) {
            inTangents.push(shape.inTangents[i]);
            outTangents.push(shape.outTangents[i]);
        }
        newShape.inTangents = inTangents;
        newShape.outTangents = outTangents;
        
        return newShape;
    }
      // 按标签颜色分组合并函数
    function mergeLayersByLabel(comp) {
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length < 2) return;
        
        // 按索引从小到大排序选中的图层（选择顺序的反向）
        var layersByIndex = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            layersByIndex.push(selectedLayers[i]);
        }
        
        // 按图层索引从小到大排序
        layersByIndex.sort(function(a, b) {
            return a.index - b.index;
        });
        
        // 遍历并查找相同标签颜色的图层组
        var layerGroups = [];
        var currentGroup = [];
        var currentLabel = null;
        
        for (var i = 0; i < layersByIndex.length; i++) {
            var layer = layersByIndex[i];
            
            // 第一个图层，开始新的组
            if (currentLabel === null) {
                currentLabel = layer.label;
                currentGroup.push(layer);
                continue;
            }
            
            // 如果标签相同，则该图层不属于当前组（按要求"不包含标签颜色相同的图层"）
            if (layer.label === currentLabel) {
                // 结束当前组并开始新的组
                if (currentGroup.length > 0) {
                    layerGroups.push(currentGroup);
                }
                currentLabel = layer.label;
                currentGroup = [layer];
            } else {
                // 标签不同，添加到当前组
                currentGroup.push(layer);
            }
        }
        
        // 添加最后一组
        if (currentGroup.length > 0) {
            layerGroups.push(currentGroup);
        }
        
        // 处理每个组
        for (var i = 0; i < layerGroups.length; i++) {
            var group = layerGroups[i];
            if (group.length > 1) {
                // 使用每组中索引最小的图层作为目标图层
                var targetLayer = group[0];
                var sourceLayers = group.slice(1); // 其余图层作为源图层
                
                // 检查目标图层是否有蒙版
                if (!targetLayer.mask || targetLayer.mask.numProperties === 0) {
                    continue; // 跳过此组
                }
                
                // 合并蒙版并记录要删除的图层
                var layersToRemove = [];
                for (var j = 0; j < sourceLayers.length; j++) {
                    var sourceLayer = sourceLayers[j];
                    if (sourceLayer.mask && sourceLayer.mask.numProperties > 0) {
                        combineMasks(sourceLayer, targetLayer);
                        layersToRemove.push(sourceLayer);
                    }
                }
                
                // 删除已合并的源图层
                for (var j = layersToRemove.length - 1; j >= 0; j--) {
                    layersToRemove[j].remove();
                }
            }
        }
    }
})();