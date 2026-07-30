/*
 * 模块名称: ExpressionManager
 * 功能描述: 扫描表达式错误 & 批量替换表达式
 * 版本: 1.8.0
 * 作者: Dalimao Tools
 */

var ExpressionManagerModule = (function() {
    var moduleObj = {
        name: "ExpressionManager",
        displayName: "Expression Manager",
        version: "1.8.0",

        buildUI: function(container) {
            var scriptName = this.displayName;
            var allExpressions = [];

            // ======== 扫描所有表达式 ========

            function collectAllExpressions() {
                allExpressions = [];
                try {
                    var numItems = app.project.numItems;
                    for (var i = 1; i <= numItems; i++) {
                        var item = null;
                        try {
                            item = app.project.item(i);
                        } catch(e) {
                            continue;
                        }
                        if (!item || !(item instanceof CompItem)) continue;

                        var compName = "Unknown";
                        var compId = 0;
                        try {
                            compName = item.name || "Unknown";
                            compId = item.id || 0;
                        } catch(e) {
                            continue;
                        }

                        var numLayers = 0;
                        try {
                            numLayers = item.numLayers;
                        } catch(e) {
                            continue;
                        }

                        for (var j = 1; j <= numLayers; j++) {
                            var layer = null;
                            var layerName = "Unknown";
                            try {
                                layer = item.layer(j);
                                if (layer) {
                                    layerName = layer.name || ("Layer_" + j);
                                }
                            } catch(e) {
                                continue;
                            }
                            if (!layer) continue;

                            try {
                                checkProperties(layer, compName, layerName, compId, j);
                            } catch(e) {
                                // 忽略单个图层的错误
                            }
                        }
                    }
                } catch(e) {
                    alert("扫描项目错误: " + e.toString());
                }
                return allExpressions;
            }

            function checkProperties(propGroup, compName, layerName, compId, layerIndex) {
                if (!propGroup) return;

                var numProps = 0;
                try {
                    numProps = propGroup.numProperties;
                } catch(e) {
                    return;
                }
                if (!numProps || numProps <= 0) return;

                for (var i = 1; i <= numProps; i++) {
                    var prop = null;
                    try {
                        prop = propGroup.property(i);
                    } catch(e) {
                        continue;
                    }
                    if (!prop) continue;

                    var propType = null;
                    try {
                        propType = prop.propertyType;
                    } catch(e) {
                        continue;
                    }

                    // 如果是组，递归
                    if (propType === PropertyType.INDEXED_GROUP ||
                        propType === PropertyType.NAMED_GROUP) {
                        try {
                            checkProperties(prop, compName, layerName, compId, layerIndex);
                        } catch(e) {
                            continue;
                        }
                        continue;
                    }

                    // 检查是否有表达式
                    var hasExpression = false;
                    var expr = "";
                    try {
                        expr = prop.expression;
                        if (expr && typeof expr === "string" && expr.length > 0) {
                            hasExpression = true;
                        }
                    } catch(e) {
                        continue;
                    }

                    if (!hasExpression) continue;

                    // 检查是否有错误
                    var hasError = false;
                    var errorText = "";

                    // 方法1: expressionError
                    try {
                        var errText = prop.expressionError;
                        if (errText && typeof errText === "string" && errText.length > 0) {
                            hasError = true;
                            errorText = errText;
                        }
                    } catch(e) {}

                    // 方法2: value
                    if (!hasError) {
                        try {
                            var val = prop.value;
                        } catch(e) {
                            hasError = true;
                            errorText = e.toString();
                        }
                    }

                    // 获取属性名
                    var propName = "Property_" + i;
                    try {
                        propName = prop.name || propName;
                    } catch(e) {}

                    var propMatchName = "";
                    try {
                        propMatchName = prop.matchName || "";
                    } catch(e) {}

                    allExpressions.push({
                        compName: compName,
                        layerName: layerName,
                        propName: propName,
                        propMatchName: propMatchName,
                        expression: expr,
                        hasError: hasError,
                        errorText: errorText,
                        compId: compId,
                        layerIndex: layerIndex
                    });
                }
            }

            // ======== UI ========

            var ui_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'], " +
                    "grScan: Group { " +
                        "orientation:'row', alignment:['fill','center'], " +
                        "scanBtn: Button { text:'扫描表达式', preferredSize:[120,25] } " +
                        "countText: StaticText { text:'共 0 个表达式，0 个错误', preferredSize:[300,25] } " +
                    "}, " +
                    "grFilter: Group { " +
                        "orientation:'row', alignment:['fill','center'], " +
                        "filterAll: RadioButton { text:'全部' } " +
                        "filterError: RadioButton { text:'仅错误', value:true } " +
                        "filterNormal: RadioButton { text:'仅正常' } " +
                    "}, " +
                    "grList: Group { " +
                        "orientation:'column', alignment:['fill','fill'], " +
                        "errorList: ListBox { alignment:['fill','fill'], preferredSize:[500,180], properties:{multiselect:true} } " +
                    "}, " +
                    "grInfo: Group { " +
                        "orientation:'column', alignment:['fill','top'], " +
                        "grExpr: Group { " +
                            "orientation:'column', alignment:['fill','top'], " +
                            "exprLabel: StaticText { text:'表达式内容:', alignment:['left','top'] } " +
                            "exprEt: EditText { text:'', preferredSize:[500,60], alignment:['fill','top'], properties:{multiline:true, readonly:true, scrolling:true} } " +
                        "}, " +
                        "grErr: Group { " +
                            "orientation:'column', alignment:['fill','top'], " +
                            "errLabel: StaticText { text:'错误信息 (双击定位):', alignment:['left','top'] } " +
                            "errEt: EditText { text:'', preferredSize:[500,40], alignment:['fill','top'], properties:{multiline:true, readonly:true, scrolling:true} } " +
                        "}, " +
                    "}, " +
                    "grReplace: Group { " +
                        "orientation:'column', alignment:['fill','top'], spacing:5, " +
                        "grFind: Group { " +
                            "orientation:'row', alignment:['fill','center'], " +
                            "findLabel: StaticText { text:'查找:', preferredSize:[50,20] } " +
                            "findEt: EditText { text:'', preferredSize:[300,25], alignment:['fill','center'] } " +
                        "}, " +
                        "grReplaceText: Group { " +
                            "orientation:'row', alignment:['fill','center'], " +
                            "replaceLabel: StaticText { text:'替换:', preferredSize:[50,20] } " +
                            "replaceEt: EditText { text:'', preferredSize:[300,25], alignment:['fill','center'] } " +
                        "}, " +
                        "grBtn: Group { " +
                            "orientation:'row', alignment:['fill','center'], spacing:10, " +
                            "replaceBtn: Button { text:'替换所有', preferredSize:[90,25] } " +
                            "replaceSelectedBtn: Button { text:'替换选中', preferredSize:[90,25] } " +
                            "selectedCompCb: Checkbox { text:'仅选中合成', value:false } " +
                        "}, " +
                    "}, " +
                    "grLang: Group { " +
                        "orientation:'row', alignment:['fill','center'], spacing:10, " +
                        "langLabel: StaticText { text:'中英文转换:', preferredSize:[80,25] } " +
                        "cnToEnBtn: Button { text:'中转英', preferredSize:[80,25] } " +
                        "enToCnBtn: Button { text:'英转中', preferredSize:[80,25] } " +
                        "selectedOnlyCb: Checkbox { text:'仅选中项', value:false } " +
                    "}, " +
                    "grUndo: Group { " +
                        "orientation:'row', alignment:['fill','center'], spacing:10, " +
                        "undoBtn: Button { text:'一键撤回', preferredSize:[100,25] } " +
                        "undoTip: StaticText { text:'撤回上一次脚本操作', alignment:['left','center'] } " +
                    "}, " +
                "}";

            var grp = container.add(ui_res);
            var scanBtn = grp.grScan.scanBtn;
            var countText = grp.grScan.countText;
            var filterAll = grp.grFilter.filterAll;
            var filterError = grp.grFilter.filterError;
            var filterNormal = grp.grFilter.filterNormal;
            var errorList = grp.grList.errorList;
            var exprEt = grp.grInfo.grExpr.exprEt;
            var errEt = grp.grInfo.grErr.errEt;
            var findEt = grp.grReplace.grFind.findEt;
            var replaceEt = grp.grReplace.grReplaceText.replaceEt;
            var replaceBtn = grp.grReplace.grBtn.replaceBtn;
            var replaceSelectedBtn = grp.grReplace.grBtn.replaceSelectedBtn;
            var selectedCompCb = grp.grReplace.grBtn.selectedCompCb;
            var cnToEnBtn = grp.grLang.cnToEnBtn;
            var enToCnBtn = grp.grLang.enToCnBtn;
            var selectedOnlyCb = grp.grLang.selectedOnlyCb;
            var undoBtn = grp.grUndo.undoBtn;

            // 撤回按钮功能
            undoBtn.onClick = function() {
                try {
                    // AE的撤销命令ID是1674
                    app.executeCommand(1674);
                } catch(e) {
                    alert("撤回失败: " + e.toString());
                }
            };

            // ======== 中英文效果名映射表 ========
            var effectNameMap = {
                // 滑块控制
                "滑块控制": "Slider Control",
                "Slider Control": "滑块控制",
                // 角度控制
                "角度控制": "Angle Control",
                "Angle Control": "角度控制",
                // 复选框控制
                "复选框控制": "Checkbox Control",
                "Checkbox Control": "复选框控制",
                // 颜色控制
                "颜色控制": "Color Control",
                "Color Control": "颜色控制",
                // 点控制
                "点控制": "Point Control",
                "Point Control": "点控制",
                // 3D点控制
                "3D 点控制": "3D Point Control",
                "3D Point Control": "3D 点控制",
                // 下拉菜单控制
                "下拉菜单控制": "Dropdown Menu Control",
                "Dropdown Menu Control": "下拉菜单控制",
                // 马赛克
                "马赛克": "Mosaic",
                "Mosaic": "马赛克",
                // 高斯模糊
                "高斯模糊": "Gaussian Blur",
                "Gaussian Blur": "高斯模糊",
                // 色阶
                "色阶": "Levels",
                "Levels": "色阶",
                // 曲线
                "曲线": "Curves",
                "Curves": "曲线",
                // 色相/饱和度
                "色相/饱和度": "Hue/Saturation",
                "Hue/Saturation": "色相/饱和度",
                // 发光
                "发光": "Glow",
                "Glow": "发光",
                // 投影
                "投影": "Drop Shadow",
                "Drop Shadow": "投影",
                // 边缘检测
                "边缘检测": "Find Edges",
                "Find Edges": "边缘检测",
                // 浮雕
                "浮雕": "Emboss",
                "Emboss": "浮雕",
                // 锐化
                "锐化": "Sharpen",
                "Sharpen": "锐化",
                // 杂色
                "杂色": "Noise",
                "Noise": "杂色",
                // 亮度和对比度
                "亮度和对比度": "Brightness & Contrast",
                "Brightness & Contrast": "亮度和对比度",
                // 色彩平衡
                "色彩平衡": "Color Balance",
                "Color Balance": "色彩平衡",
                // 色彩平衡 (HLS)
                "色彩平衡 (HLS)": "Color Balance (HLS)",
                "Color Balance (HLS)": "色彩平衡 (HLS)",
                // 照片滤镜
                "照片滤镜": "Photo Filter",
                "Photo Filter": "照片滤镜",
                // 三色调
                "三色调": "Tritone",
                "Tritone": "三色调",
                // CC Lens
                "CC 镜头": "CC Lens",
                "CC Lens": "CC 镜头",
                // 运动模糊
                "运动模糊": "CC Radial Blur",
                "CC Radial Blur": "运动模糊",
                // 径向擦除
                "径向擦除": "CC Radial Fast Blur",
                "CC Radial Fast Blur": "径向擦除",
                // 时间置换
                "时间置换": "Time Displacement",
                "Time Displacement": "时间置换",
                // 置换映射
                "置换映射": "Displacement Map",
                "Displacement Map": "置换映射",
                // 毛边
                "毛边": "Roughen Edges",
                "Roughen Edges": "毛边",
                // 分形杂色
                "分形杂色": "Fractal Noise",
                "Fractal Noise": "分形杂色",
                // 镜头光晕
                "镜头光晕": "Lens Flare",
                "Lens Flare": "镜头光晕",
                // 闪电
                "闪电": "Advanced Lightning",
                "Advanced Lightning": "闪电",
                // 涟漪
                "涟漪": "Ripple",
                "Ripple": "涟漪",
                // 球面化
                "球面化": "Spherize",
                "Spherize": "球面化",
                // 极坐标
                "极坐标": "Polar Coordinates",
                "Polar Coordinates": "极坐标",
                // 梯度渐变
                "梯度渐变": "Gradient Ramp",
                "Gradient Ramp": "梯度渐变",
                // 四色渐变
                "四色渐变": "4-Color Gradient",
                "4-Color Gradient": "四色渐变",
                // 无线电波
                "无线电波": "Radio Waves",
                "Radio Waves": "无线电波",
                // 书写
                "书写": "Write-on",
                "Write-on": "书写",
                // 偏移
                "偏移": "Offset",
                "Offset": "偏移",
                // 动态拼贴
                "动态拼贴": "Motion Tile",
                "Motion Tile": "动态拼贴",
                // CC Composite
                "CC 合成": "CC Composite",
                "CC Composite": "CC 合成",
                // CC Glass
                "CC 玻璃": "CC Glass",
                "CC Glass": "CC 玻璃",
                // CC Page Turn
                "CC 翻页": "CC Page Turn",
                "CC Page Turn": "CC 翻页",
                // CC Particle World
                "CC 粒子世界": "CC Particle World",
                "CC Particle World": "CC 粒子世界",
                // CC Star Burst
                "CC 星爆": "CC Star Burst",
                "CC Star Burst": "CC 星爆"
            };

            // ======== 效果属性索引映射表 ========
            // 格式: effectName: { "中文属性名": 索引 }
            var effectPropertyMap = {
                "滑块控制": { "滑块": 1 },
                "Slider Control": { "滑块": 1 },
                "角度控制": { "角度": 1 },
                "Angle Control": { "角度": 1 },
                "复选框控制": { "复选框": 1 },
                "Checkbox Control": { "复选框": 1 },
                "颜色控制": { "颜色": 1 },
                "Color Control": { "颜色": 1 },
                "点控制": { "点": 1 },
                "Point Control": { "点": 1 },
                "3D 点控制": { "3D 点": 1 },
                "3D Point Control": { "3D 点": 1 },
                "下拉菜单控制": { "菜单": 1 },
                "Dropdown Menu Control": { "菜单": 1 },
                "马赛克": { "水平块": 1, "垂直块": 2, "锐化色块": 3 },
                "Mosaic": { "水平块": 1, "垂直块": 2, "锐化色块": 3 },
                "高斯模糊": { "模糊度": 1, "模糊方向": 2, "重复边缘像素": 3 },
                "Gaussian Blur": { "模糊度": 1, "模糊方向": 2, "重复边缘像素": 3 },
                "色阶": { "直方图": 1, "输入黑色": 2, "输入白色": 3, "灰度系数": 4, "输出黑色": 5, "输出白色": 6 },
                "Levels": { "直方图": 1, "输入黑色": 2, "输入白色": 3, "灰度系数": 4, "输出黑色": 5, "输出白色": 6 },
                "曲线": { "曲线": 1, "通道": 2 },
                "Curves": { "曲线": 1, "通道": 2 },
                "色相/饱和度": { "通道范围": 1, "主色相": 2, "主饱和度": 3, "主亮度": 4 },
                "Hue/Saturation": { "通道范围": 1, "主色相": 2, "主饱和度": 3, "主亮度": 4 },
                "发光": { "发光阈值": 1, "发光半径": 2, "发光强度": 3, "发光颜色": 4, "颜色循环": 5, "色彩循环": 6 },
                "Glow": { "发光阈值": 1, "发光半径": 2, "发光强度": 3, "发光颜色": 4, "颜色循环": 5, "色彩循环": 6 },
                "投影": { "不透明度": 1, "方向": 2, "距离": 3, "柔和度": 4 },
                "Drop Shadow": { "不透明度": 1, "方向": 2, "距离": 3, "柔和度": 4 },
                "亮度和对比度": { "亮度": 1, "对比度": 2 },
                "Brightness & Contrast": { "亮度": 1, "对比度": 2 },
                "色彩平衡": { "阴影红色平衡": 1, "阴影绿色平衡": 2, "阴影蓝色平衡": 3, "中间调红色平衡": 4, "中间调绿色平衡": 5, "中间调蓝色平衡": 6, "高光红色平衡": 7, "高光绿色平衡": 8, "高光蓝色平衡": 9, "保持发光度": 10 },
                "Color Balance": { "阴影红色平衡": 1, "阴影绿色平衡": 2, "阴影蓝色平衡": 3, "中间调红色平衡": 4, "中间调绿色平衡": 5, "中间调蓝色平衡": 6, "高光红色平衡": 7, "高光绿色平衡": 8, "高光蓝色平衡": 9, "保持发光度": 10 },
                "照片滤镜": { "滤镜颜色": 1, "密度": 2, "保持发光度": 3 },
                "Photo Filter": { "滤镜颜色": 1, "密度": 2, "保持发光度": 3 },
                "偏移": { "将中心移位到": 1, "在边缘折回": 2 },
                "Offset": { "将中心移位到": 1, "在边缘折回": 2 },
                "动态拼贴": { "拼贴宽度": 1, "拼贴高度": 2, "输出宽度": 3, "输出高度": 4, "镜像边缘": 5, "相位": 6, "水平位移": 7 },
                "Motion Tile": { "拼贴宽度": 1, "拼贴高度": 2, "输出宽度": 3, "输出高度": 4, "镜像边缘": 5, "相位": 6, "水平位移": 7 }
            };

            // 中转英函数
            function cnToEn(expr) {
                var result = expr;

                // 匹配 effect("中文名")("中文属性名") 或 effect("中文名")(数字)
                var regex = /effect\("([^"]+)"\)\("([^"]+)"\)/g;
                result = result.replace(regex, function(match, effectName, propName) {
                    // 检查是否是中文效果名
                    if (/[\u4e00-\u9fa5]/.test(effectName)) {
                        // 处理带数字后缀的效果名，如 "滑块控制 2"
                        var baseName = effectName.replace(/\s*\d+$/, "");
                        var numSuffix = effectName.match(/\s*(\d+)$/);
                        var suffix = numSuffix ? " " + numSuffix[1] : "";

                        // 查找英文效果名
                        var enEffect = effectNameMap[baseName];
                        if (enEffect) {
                            // 查找属性索引
                            var propIndex = null;
                            if (effectPropertyMap[baseName] && effectPropertyMap[baseName][propName]) {
                                propIndex = effectPropertyMap[baseName][propName];
                            }
                            // 如果找到索引，用数字替换属性名
                            if (propIndex !== null) {
                                return 'effect("' + enEffect + suffix + '")(' + propIndex + ')';
                            }
                            // 否则只替换效果名
                            return 'effect("' + enEffect + suffix + '")("' + propName + '")';
                        }
                    }
                    return match;
                });

                // 也处理 effect("中文名")(数字) 格式（只替换效果名）
                var regex2 = /effect\("([^"]+)"\)\((\d+)\)/g;
                result = result.replace(regex2, function(match, effectName, index) {
                    if (/[\u4e00-\u9fa5]/.test(effectName)) {
                        var baseName = effectName.replace(/\s*\d+$/, "");
                        var numSuffix = effectName.match(/\s*(\d+)$/);
                        var suffix = numSuffix ? " " + numSuffix[1] : "";
                        var enEffect = effectNameMap[baseName];
                        if (enEffect) {
                            return 'effect("' + enEffect + suffix + '")(' + index + ')';
                        }
                    }
                    return match;
                });

                // 处理独立的中文属性名（如单独的 "滑块"）
                // 遍历所有效果的属性映射，将中文属性名替换为数字
                for (var effectName in effectPropertyMap) {
                    if (effectPropertyMap.hasOwnProperty(effectName)) {
                        var props = effectPropertyMap[effectName];
                        for (var cnProp in props) {
                            if (props.hasOwnProperty(cnProp)) {
                                var idx = props[cnProp];
                                // 匹配独立的 "中文属性名"（在引号内）
                                var propRegex = new RegExp('"' + cnProp + '"', 'g');
                                result = result.replace(propRegex, '' + idx);
                            }
                        }
                    }
                }

                return result;
            }

            // 英转中函数
            function enToCn(expr) {
                var result = expr;

                // 匹配 effect("英文名")(数字) 格式
                var regex = /effect\("([^"]+)"\)\((\d+)\)/g;
                result = result.replace(regex, function(match, effectName, index) {
                    if (!/[\u4e00-\u9fa5]/.test(effectName)) {
                        var baseName = effectName.replace(/\s*\d+$/, "");
                        var numSuffix = effectName.match(/\s*(\d+)$/);
                        var suffix = numSuffix ? " " + numSuffix[1] : "";
                        var cnEffect = effectNameMap[baseName];
                        if (cnEffect) {
                            // 查找中文属性名
                            var propName = null;
                            if (effectPropertyMap[baseName]) {
                                for (var cn in effectPropertyMap[baseName]) {
                                    if (effectPropertyMap[baseName][cn] === parseInt(index)) {
                                        propName = cn;
                                        break;
                                    }
                                }
                            }
                            if (propName) {
                                return 'effect("' + cnEffect + suffix + '")("' + propName + '")';
                            }
                            return 'effect("' + cnEffect + suffix + '")(' + index + ')';
                        }
                    }
                    return match;
                });

                // 也处理 effect("英文名")("英文属性名") 格式
                var regex2 = /effect\("([^"]+)"\)\("([^"]+)"\)/g;
                result = result.replace(regex2, function(match, effectName, propName) {
                    if (!/[\u4e00-\u9fa5]/.test(effectName)) {
                        var baseName = effectName.replace(/\s*\d+$/, "");
                        var numSuffix = effectName.match(/\s*(\d+)$/);
                        var suffix = numSuffix ? " " + numSuffix[1] : "";
                        var cnEffect = effectNameMap[baseName];
                        if (cnEffect) {
                            return 'effect("' + cnEffect + suffix + '")("' + propName + '")';
                        }
                    }
                    return match;
                });

                // 处理独立的数字属性索引（转换为中文属性名）
                // 这需要根据上下文判断属于哪个效果
                // 暂时不处理这种情况，因为需要更多上下文信息

                return result;
            }

            // 应用中英文转换
            function applyLangConversion(convertFn) {
                app.beginUndoGroup(scriptName + " - 中英文转换");
                try {
                    var sel = errorList.selection;
                    var useSelected = selectedOnlyCb.value;

                    if (useSelected && (!sel || sel.length === 0)) {
                        alert("请先选择要转换的项目");
                        return;
                    }

                    var count = 0;
                    var indices = [];

                    if (useSelected) {
                        for (var i = 0; i < sel.length; i++) {
                            indices.push(sel[i].index);
                        }
                    } else {
                        for (var i = 0; i < allExpressions.length; i++) {
                            indices.push(i);
                        }
                    }

                    for (var i = 0; i < indices.length; i++) {
                        var idx = indices[i];
                        if (idx < 0 || idx >= allExpressions.length) continue;
                        var item = allExpressions[idx];
                        var newExpr = convertFn(item.expression);
                        if (newExpr !== item.expression) {
                            // 找到对应的属性并更新
                            var comp = null;
                            for (var j = 1; j <= app.project.numItems; j++) {
                                try {
                                    var testItem = app.project.item(j);
                                    if (testItem instanceof CompItem && testItem.id === item.compId) {
                                        comp = testItem;
                                        break;
                                    }
                                } catch(e) {}
                            }
                            if (comp) {
                                var layer = null;
                                try { layer = comp.layer(item.layerIndex); } catch(e) {}
                                if (layer) {
                                    var prop = findPropByMatchName(layer, item.propMatchName);
                                    if (prop) {
                                        try {
                                            prop.expression = newExpr;
                                            count++;
                                        } catch(e) {}
                                    }
                                }
                            }
                        }
                    }

                    alert("已转换 " + count + " 个表达式");
                    collectAllExpressions();
                    refreshList();
                } catch(e) {
                    alert("转换错误: " + e.toString());
                }
                app.endUndoGroup();
            }

            // 中转英按钮
            cnToEnBtn.onClick = function() {
                applyLangConversion(cnToEn);
            };

            // 英转中按钮
            enToCnBtn.onClick = function() {
                applyLangConversion(enToCn);
            };

            // 过滤显示
            function refreshList() {
                errorList.removeAll();
                var errorCount = 0;
                var totalCount = allExpressions.length;

                for (var i = 0; i < totalCount; i++) {
                    var item = allExpressions[i];
                    if (item.hasError) errorCount++;

                    var show = false;
                    if (filterAll.value) show = true;
                    else if (filterError.value && item.hasError) show = true;
                    else if (filterNormal.value && !item.hasError) show = true;

                    if (show) {
                        var prefix = item.hasError ? "[错误] " : "[正常] ";
                        var text = prefix + "[" + item.compName + "] " + item.layerName + " - " + item.propName;
                        errorList.add("item", text);
                    }
                }

                countText.text = "共 " + totalCount + " 个表达式，" + errorCount + " 个错误";
            }

            // 扫描
            scanBtn.onClick = function() {
                try {
                    collectAllExpressions();
                    refreshList();
                } catch(e) {
                    alert("扫描错误: " + e.toString() + "\nLine: " + e.line);
                }
            };

            // 过滤切换
            filterAll.onClick = function() { refreshList(); };
            filterError.onClick = function() { refreshList(); };
            filterNormal.onClick = function() { refreshList(); };

            // 列表选择变化时显示表达式
            errorList.onChange = function() {
                try {
                    var sel = errorList.selection;
                    if (!sel || sel.length === 0) {
                        exprEt.text = "";
                        errEt.text = "";
                        return;
                    }
                    var idx = sel[0].index;
                    if (idx >= 0 && idx < allExpressions.length) {
                        var item = allExpressions[idx];
                        // 显示表达式
                        exprEt.text = item.expression;
                        // 显示错误信息
                        if (item.hasError) {
                            errEt.text = item.errorText;
                        } else {
                            errEt.text = "无错误";
                        }
                    } else {
                        exprEt.text = "";
                        errEt.text = "";
                    }
                } catch(e) {
                    exprEt.text = "";
                    errEt.text = "显示错误: " + e.toString();
                }
            };

            // 双击错误文本框定位到图层
            errEt.onDoubleClick = function() {
                try {
                    var sel = errorList.selection;
                    if (!sel || sel.length === 0) return;
                    var idx = sel[0].index;
                    if (idx < 0 || idx >= allExpressions.length) return;

                    var err = allExpressions[idx];
                    // 查找合成
                    var comp = null;
                    for (var i = 1; i <= app.project.numItems; i++) {
                        try {
                            var item = app.project.item(i);
                            if (item instanceof CompItem && item.id === err.compId) {
                                comp = item;
                                break;
                            }
                        } catch(e) {}
                    }
                    if (!comp) {
                        alert("找不到合成: " + err.compName);
                        return;
                    }

                    // 打开合成并选中图层
                    comp.openInViewer();
                    var layer = null;
                    try {
                        layer = comp.layer(err.layerIndex);
                    } catch(e) {}
                    if (layer) {
                        // 取消所有选中
                        for (var j = 1; j <= comp.numLayers; j++) {
                            try {
                                comp.layer(j).selected = false;
                            } catch(e) {}
                        }
                        // 选中目标图层
                        layer.selected = true;
                    }
                } catch(e) {
                    alert("定位错误: " + e.toString());
                }
            };

            // 替换所有
            replaceBtn.onClick = function() {
                app.beginUndoGroup(scriptName + " - 替换所有");
                try {
                    var findText = findEt.text;
                    var replaceText = replaceEt.text;

                    if (!findText) {
                        alert("请输入查找内容");
                        return;
                    }

                    var count = 0;
                    var numItems = app.project.numItems;
                    for (var i = 1; i <= numItems; i++) {
                        var item = null;
                        try { item = app.project.item(i); } catch(e) { continue; }
                        if (!item || !(item instanceof CompItem)) continue;

                        if (selectedCompCb.value) {
                            var isSelected = false;
                            try {
                                for (var s = 0; s < app.project.selection.length; s++) {
                                    if (app.project.selection[s] === item) {
                                        isSelected = true;
                                        break;
                                    }
                                }
                            } catch(e) {}
                            if (!isSelected) continue;
                        }

                        var numLayers = 0;
                        try { numLayers = item.numLayers; } catch(e) { continue; }

                        for (var j = 1; j <= numLayers; j++) {
                            var layer = null;
                            try { layer = item.layer(j); } catch(e) { continue; }
                            if (!layer) continue;

                            count += replaceInGroup(layer, findText, replaceText);
                        }
                    }

                    alert("已替换 " + count + " 个表达式");
                    collectAllExpressions();
                    refreshList();
                } catch(e) {
                    alert("替换错误: " + e.toString());
                }
                app.endUndoGroup();
            };

            // 替换选中项
            replaceSelectedBtn.onClick = function() {
                app.beginUndoGroup(scriptName + " - 替换选中");
                try {
                    var findText = findEt.text;
                    var replaceText = replaceEt.text;

                    if (!findText) {
                        alert("请输入查找内容");
                        return;
                    }

                    var sel = errorList.selection;
                    if (!sel || sel.length === 0) {
                        alert("请先选择要替换的项目");
                        return;
                    }

                    var count = 0;
                    for (var i = 0; i < sel.length; i++) {
                        var idx = sel[i].index;
                        if (idx >= 0 && idx < allExpressions.length) {
                            var err = allExpressions[idx];
                            try {
                                var item = null;
                                for (var j = 1; j <= app.project.numItems; j++) {
                                    try {
                                        var testItem = app.project.item(j);
                                        if (testItem instanceof CompItem && testItem.id === err.compId) {
                                            item = testItem;
                                            break;
                                        }
                                    } catch(e) {}
                                }
                                if (item) {
                                    var layer = null;
                                    try { layer = item.layer(err.layerIndex); } catch(e) {}
                                    if (layer) {
                                        var prop = findPropByMatchName(layer, err.propMatchName);
                                        if (prop) {
                                            try {
                                                var currentExpr = prop.expression;
                                                if (currentExpr && currentExpr.indexOf(findText) >= 0) {
                                                    prop.expression = currentExpr.split(findText).join(replaceText);
                                                    count++;
                                                }
                                            } catch(e) {}
                                        }
                                    }
                                }
                            } catch(e) {}
                        }
                    }

                    alert("已替换 " + count + " 个表达式");
                    collectAllExpressions();
                    refreshList();
                } catch(e) {
                    alert("替换错误: " + e.toString());
                }
                app.endUndoGroup();
            };

            // 递归替换
            function replaceInGroup(propGroup, findText, replaceText) {
                var count = 0;
                if (!propGroup) return count;

                var numProps = 0;
                try { numProps = propGroup.numProperties; } catch(e) { return count; }
                if (!numProps || numProps <= 0) return count;

                for (var i = 1; i <= numProps; i++) {
                    var prop = null;
                    try { prop = propGroup.property(i); } catch(e) { continue; }
                    if (!prop) continue;

                    var propType = null;
                    try { propType = prop.propertyType; } catch(e) { continue; }

                    if (propType === PropertyType.INDEXED_GROUP ||
                        propType === PropertyType.NAMED_GROUP) {
                        count += replaceInGroup(prop, findText, replaceText);
                    } else {
                        try {
                            var expr = prop.expression;
                            if (expr && typeof expr === "string" && expr.length > 0 && expr.indexOf(findText) >= 0) {
                                prop.expression = expr.split(findText).join(replaceText);
                                count++;
                            }
                        } catch(e) {}
                    }
                }
                return count;
            }

            // 查找属性
            function findPropByMatchName(propGroup, matchName) {
                if (!propGroup || !matchName) return null;
                var numProps = 0;
                try { numProps = propGroup.numProperties; } catch(e) { return null; }
                if (!numProps || numProps <= 0) return null;

                for (var i = 1; i <= numProps; i++) {
                    var prop = null;
                    try { prop = propGroup.property(i); } catch(e) { continue; }
                    if (!prop) continue;

                    try {
                        if (prop.matchName === matchName) return prop;
                    } catch(e) { continue; }

                    var propType = null;
                    try { propType = prop.propertyType; } catch(e) { continue; }

                    if (propType === PropertyType.INDEXED_GROUP ||
                        propType === PropertyType.NAMED_GROUP) {
                        var found = findPropByMatchName(prop, matchName);
                        if (found) return found;
                    }
                }
                return null;
            }

            return grp;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(ExpressionManagerModule);
} else {
    (function() {
        var win = new Window("palette", "Expression Manager by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;

        ExpressionManagerModule.buildUI(win);

        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }

        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}