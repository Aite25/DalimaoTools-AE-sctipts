/*
 * 模块名称: LayerPreset
 * 功能描述: 储存/管理图层预设，快速添加到当前合成（JSON 跨工程存储）
 * 版本: 2.0.0
 * 作者: Dalimao Tools
 */

var LayerPresetModule = (function() {
    var moduleObj = {
        name: "LayerPreset",
        displayName: "Layer Preset",
        version: "2.0.0",

        buildUI: function(container) {
            var scriptName = this.displayName;

            // 获取脚本所在目录
            var scriptFile = new File($.fileName);
            var presetDir = new Folder(scriptFile.parent.fsName + "/Presets");
            if (!presetDir.exists) presetDir.create();

            // ======== JSON 序列化/反序列化 ========

            // 序列化形状图层的属性组
            function serializePropertyGroup(propGroup) {
                var result = { _type: "PropertyGroup", properties: [] };
                for (var i = 1; i <= propGroup.numProperties; i++) {
                    var prop = propGroup.property(i);
                    result.properties.push(serializeProperty(prop));
                }
                return result;
            }

            // 序列化单个属性
            function serializeProperty(prop) {
                var obj = {
                    matchName: prop.matchName,
                    name: prop.name,
                    enabled: prop.enabled,
                    isGroup: prop.isModified // 用于判断是否是组
                };

                if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                    obj._type = "group";
                    obj.properties = [];
                    for (var i = 1; i <= prop.numProperties; i++) {
                        obj.properties.push(serializeProperty(prop.property(i)));
                    }
                } else {
                    obj._type = "property";
                    // 保存关键帧或静态值
                    if (prop.numKeys > 0) {
                        obj.keys = [];
                        for (var k = 1; k <= prop.numKeys; k++) {
                            obj.keys.push({
                                time: prop.keyTime(k),
                                value: prop.keyValue(k),
                                inInterp: prop.keyInInterpolationType(k),
                                outInterp: prop.keyOutInterpolationType(k),
                                // 空间切线（用于路径）
                                inSpatialTangent: prop.isSpatial ? prop.keyInSpatialTangent(k) : null,
                                outSpatialTangent: prop.isSpatial ? prop.keyOutSpatialTangent(k) : null
                            });
                        }
                    } else {
                        try {
                            obj.value = prop.value;
                        } catch(e) {
                            obj.value = null;
                        }
                    }
                }
                return obj;
            }

            // 序列化完整图层
            function serializeLayer(layer) {
                var data = {
                    name: layer.name,
                    layerType: "unknown",
                    inPoint: layer.inPoint,
                    outPoint: layer.outPoint,
                    startTime: layer.startTime,
                    transform: {}
                };

                // 图层类型
                if (layer instanceof ShapeLayer) {
                    data.layerType = "shape";
                    data.contents = serializePropertyGroup(layer.property("Contents"));
                } else if (layer instanceof TextLayer) {
                    data.layerType = "text";
                    data.sourceText = serializeProperty(layer.property("Source Text"));
                } else if (layer instanceof AVLayer) {
                    if (layer.nullLayer) data.layerType = "null";
                    else if (layer.adjustmentLayer) data.layerType = "adjustment";
                    else data.layerType = "footage";
                } else if (layer instanceof CameraLayer) {
                    data.layerType = "camera";
                } else if (layer instanceof LightLayer) {
                    data.layerType = "light";
                }

                // 变换属性
                var tf = layer.property("Transform");
                if (tf) {
                    data.transform = {
                        anchorPoint: serializeProperty(tf.property("Anchor Point")),
                        position: serializeProperty(tf.property("Position")),
                        scale: serializeProperty(tf.property("Scale")),
                        rotation: serializeProperty(tf.property("Rotation")),
                        opacity: serializeProperty(tf.property("Opacity"))
                    };
                }

                return data;
            }

            // ======== 反序列化（重建图层）========

            // 反序列化属性组
            function deserializePropertyGroup(propGroup, data) {
                for (var i = 0; i < data.properties.length; i++) {
                    var propData = data.properties[i];
                    var prop = findPropertyByMatchName(propGroup, propData.matchName, i + 1);
                    if (prop) {
                        deserializeProperty(prop, propData);
                    }
                }
            }

            // 查找属性（按 matchName 或索引）
            function findPropertyByMatchName(group, matchName, fallbackIndex) {
                // 先按 matchName 查找
                for (var i = 1; i <= group.numProperties; i++) {
                    if (group.property(i).matchName === matchName) {
                        return group.property(i);
                    }
                }
                // 回退到索引
                if (fallbackIndex <= group.numProperties) {
                    return group.property(fallbackIndex);
                }
                return null;
            }

            // 反序列化单个属性
            function deserializeProperty(prop, data) {
                if (data._type === "group") {
                    for (var i = 0; i < data.properties.length; i++) {
                        var childData = data.properties[i];
                        var childProp = findPropertyByMatchName(prop, childData.matchName, i + 1);
                        if (childProp) {
                            deserializeProperty(childProp, childData);
                        }
                    }
                } else if (data._type === "property") {
                    if (data.keys && data.keys.length > 0) {
                        // 添加关键帧
                        for (var k = 0; k < data.keys.length; k++) {
                            var kf = data.keys[k];
                            prop.setValueAtTime(kf.time, kf.value);
                            // 设置插值类型
                            if (kf.inInterp !== undefined) {
                                try {
                                    prop.setTemporalEaseAtKey(k + 1, 
                                        kf.inInterp === KeyframeInterpolationType.BEZIER ? [new KeyframeEase(0, 50)] : [new KeyframeEase(0, 33)],
                                        kf.outInterp === KeyframeInterpolationType.BEZIER ? [new KeyframeEase(0, 50)] : [new KeyframeEase(0, 33)]
                                    );
                                } catch(e) {}
                            }
                        }
                    } else if (data.value !== undefined && data.value !== null) {
                        try {
                            prop.setValue(data.value);
                        } catch(e) {}
                    }
                }
            }

            // 反序列化形状图层
            function deserializeShapeLayer(comp, data, insertIndex) {
                var layer = comp.layers.addShape();
                layer.name = data.name;
                
                if (data.contents) {
                    var contents = layer.property("Contents");
                    deserializePropertyGroup(contents, data.contents);
                }

                applyTransform(layer, data);
                layer.moveTo(insertIndex);
                return layer;
            }

            // 应用变换属性
            function applyTransform(layer, data) {
                if (!data.transform) return;
                var tf = layer.property("Transform");
                if (!tf) return;

                var props = ["Anchor Point", "Position", "Scale", "Rotation", "Opacity"];
                for (var i = 0; i < props.length; i++) {
                    var prop = tf.property(props[i]);
                    var propData = data.transform[props[i].replace(" ", "")] || 
                                   data.transform[props[i]];
                    if (prop && propData) {
                        deserializeProperty(prop, propData);
                    }
                }
            }

            // ======== 预设管理 ========

            // 读取预设列表
            function loadPresets() {
                var presets = [];
                var files = presetDir.getFiles("*.json");
                for (var i = 0; i < files.length; i++) {
                    presets.push({
                        name: decodeURI(files[i].name).replace(".json", ""),
                        file: files[i]
                    });
                }
                return presets;
            }

            // 刷新列表显示
            function refreshList(list, presets) {
                list.removeAll();
                for (var i = 0; i < presets.length; i++) {
                    list.add("item", presets[i].name);
                }
            }

            // 读取 JSON 文件
            function readJSON(file) {
                file.open("r");
                var content = file.read();
                file.close();
                return eval("(" + content + ")");
            }

            // 写入 JSON 文件
            function writeJSON(file, data) {
                file.open("w");
                file.write(data.toSource());
                file.close();
            }

            // ======== UI ========

            var presets = loadPresets();

            var ui_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'], " +
                    "grList: Group { " +
                        "orientation:'column', alignment:['fill','fill'], " +
                        "lb: ListBox { alignment:['fill','fill'], preferredSize:[280,200], properties:{multiselect:false} } " +
                    "}, " +
                    "grBtn: Group { " +
                        "orientation:'row', alignment:['fill','center'], " +
                        "importBtn: Button { text:'导入预设', preferredSize:[90,25] } " +
                        "addBtn: Button { text:'加入到列表', preferredSize:[90,25] } " +
                        "delBtn: Button { text:'删除', preferredSize:[90,25] } " +
                    "}, " +
                "}";

            var grp = container.add(ui_res);
            var presetList = grp.grList.lb;
            var importBtn = grp.grBtn.importBtn;
            var addBtn = grp.grBtn.addBtn;
            var delBtn = grp.grBtn.delBtn;

            refreshList(presetList, presets);

            // 导入预设
            importBtn.onClick = function() {
                app.beginUndoGroup(scriptName + " - 导入预设");
                try {
                    var idx = presetList.selection ? presetList.selection.index : -1;
                    if (idx < 0 || idx >= presets.length) {
                        alert("请先选择一个预设");
                        return;
                    }

                    var comp = app.project.activeItem;
                    if (!(comp instanceof CompItem)) {
                        alert("请先打开一个合成");
                        return;
                    }

                    var data = readJSON(presets[idx].file);
                    var insertIndex = 1;
                    if (comp.selectedLayers.length > 0) {
                        insertIndex = comp.selectedLayers[0].index;
                    }

                    // 反向遍历保持顺序
                    for (var i = data.layers.length - 1; i >= 0; i--) {
                        var layerData = data.layers[i];
                        var newLayer;

                        switch (layerData.layerType) {
                            case "shape":
                                newLayer = deserializeShapeLayer(comp, layerData, insertIndex);
                                break;
                            case "text":
                                newLayer = comp.layers.addText();
                                newLayer.name = layerData.name;
                                applyTransform(newLayer, layerData);
                                newLayer.moveTo(insertIndex);
                                break;
                            case "null":
                                newLayer = comp.layers.addNull();
                                newLayer.name = layerData.name;
                                applyTransform(newLayer, layerData);
                                newLayer.moveTo(insertIndex);
                                break;
                            case "adjustment":
                                newLayer = comp.layers.addSolid([0,0,0], layerData.name, comp.width, comp.height, 1);
                                newLayer.adjustmentLayer = true;
                                applyTransform(newLayer, layerData);
                                newLayer.moveTo(insertIndex);
                                break;
                            case "solid":
                                newLayer = comp.layers.addSolid([0,0,0], layerData.name, comp.width, comp.height, 1);
                                applyTransform(newLayer, layerData);
                                newLayer.moveTo(insertIndex);
                                break;
                            default:
                                // 普通素材 - 尝试在项目中查找
                                var item = findProjectItemByName(layerData.name);
                                if (item) {
                                    newLayer = comp.layers.add(item);
                                    applyTransform(newLayer, layerData);
                                    newLayer.moveTo(insertIndex);
                                }
                        }
                    }

                    alert("已导入预设「" + presets[idx].name + "」");
                } catch(e) {
                    alert("错误: " + e.toString() + "\n" + e.line);
                }
                app.endUndoGroup();
            };

            // 查找项目中的素材
            function findProjectItemByName(name) {
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i).name === name) {
                        return app.project.item(i);
                    }
                }
                return null;
            }

            // 保存预设
            addBtn.onClick = function() {
                app.beginUndoGroup(scriptName + " - 保存预设");
                try {
                    var comp = app.project.activeItem;
                    if (!(comp instanceof CompItem)) {
                        alert("请先打开一个合成");
                        return;
                    }

                    var selectedLayers = comp.selectedLayers;
                    if (selectedLayers.length === 0) {
                        alert("请先选择要保存的图层");
                        return;
                    }

                    var name = prompt("请输入预设名称:", "预设 " + (presets.length + 1));
                    if (name === null || name === "") return;

                    var presetData = {
                        version: "2.0",
                        compWidth: comp.width,
                        compHeight: comp.height,
                        layers: []
                    };

                    for (var i = 0; i < selectedLayers.length; i++) {
                        presetData.layers.push(serializeLayer(selectedLayers[i]));
                    }

                    var file = new File(presetDir.fsName + "/" + name + ".json");
                    writeJSON(file, presetData);

                    presets = loadPresets();
                    refreshList(presetList, presets);
                    alert("已保存预设「" + name + "」");
                } catch(e) {
                    alert("错误: " + e.toString() + "\nLine: " + e.line);
                }
                app.endUndoGroup();
            };

            // 删除预设
            delBtn.onClick = function() {
                try {
                    var idx = presetList.selection ? presetList.selection.index : -1;
                    if (idx < 0 || idx >= presets.length) {
                        alert("请先选择要删除的预设");
                        return;
                    }

                    var name = presets[idx].name;
                    if (confirm("确定删除预设「" + name + "」吗？")) {
                        presets[idx].file.remove();
                        presets = loadPresets();
                        refreshList(presetList, presets);
                    }
                } catch(e) {
                    alert("错误: " + e.toString());
                }
            };

            return grp;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(LayerPresetModule);
} else {
    (function() {
        var win = new Window("palette", "Layer Preset by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;

        LayerPresetModule.buildUI(win);

        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }

        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}