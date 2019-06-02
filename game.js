cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var map2d = this.Array2D(10, 10);
        map2d.data[4][0] = 1;
        map2d.data[4][1] = 1;
        map2d.data[4][2] = 1;
        map2d.data[4][3] = 1;
        map2d.data[4][4] = 1;
        map2d.data[4][5] = 1;
        map2d.data[4][6] = 1;
        map2d.showArray2D();
        // console.log(map2d.data[4][0]);
        var aStar = this.AStar(map2d,this.Point(0,0),this.Point(9,0));
        var pathList = aStar.start();
        for (var point of pathList){
            map2d.data[point.x][point.y]=8;
        }
        map2d.showArray2D();
    },

    /**
     * 二维数组
     * @param {*} w 地图宽度
     * @param {*} h 地图高度
     * @param {*} num 地图标记
     */
    Array2D (w, h ,num){
        var data = [];
        var default_num = num || 0;
        for (var x = 0; x < w; x++) {
            var temp = [];
            for (var y = 0; y < h; y++) {
                temp.push(default_num);
            }
            data.push(temp);
        }

        return {
            w : w,
            h : h,
            data : data,

            showArray2D () {
                var s = "";
                for (var y = 0; y < this.h; y++) {
                    for (var x = 0; x < this.w; x++) {
                        s += this.data[x][y] + "";
                    }
                    s += "\n"
                }
                console.log(s);
            }
        }
    },

    /**点 **/
    Point (x, y) {
        return {
            x : x,
            y : y,
            eq : function (other) {
                return this.x === other.x && this.y === other.y;
            }
        }
    },

    AStar (map2d, startPoint, endPoint, passTag) {
        var self = this;
        var tag = passTag || 0;
        var Node = function (point, endPoint, g) {
            var tG = g || 0;
            return {
                point : point, //节点坐标
                father : null, //父节点
                g : tG, //G值，用到时会重新计算
                h : (Math.abs(endPoint.x - point.x) + Math.abs(endPoint.y - point.y)) * 10 //曼哈顿距离
            }
        };

        return {
            map2d : map2d,
            startPoint : startPoint,
            endPoint : endPoint,
            passTag : tag,
            openList : [], //开启列表
            closeList : [], //关闭列表

            //获取开放列表中F值最小的节点
            getMinNode () {
                var currentNode = this.openList[0];
                for (var node of this.openList) {
                    if (node.g + node.h < currentNode.g + currentNode.h ) {
                        currentNode = node;
                    }
                }
                return currentNode;
            },

            //判断point是否在关闭列表中
            pointInCloseList (point) {
                for (var node of this.closeList) {
                    if (node.point.eq(point)) {
                        return true;
                    }
                }
                return false;
            },

            //判断point是否在开启列表中
            pointInOpenList (point) {
                for (var node of this.openList) {
                    if (node.point.eq(point)) {
                        return node;
                    }      
                }
                return null;
            },

            //判断终点是否在关闭列表中
            endPointInCloseList () {
                for (var node of this.closeList) {
                    if (node.point.eq(this.endPoint)) {
                        return node;
                    }
                }
                return null;
            },

            //搜索节点周围的点
            searchNear: function (minF, offsetX, offsetY) {
                //越界检测
                if (minF.point.x + offsetX < 0 || minF.point.x + offsetX > this.map2d.w - 1 || minF.point.y + offsetY < 0 || minF.point.y + offsetY > this.map2d.h - 1)
                    return null;
                //如果是障碍就忽略
                if (this.map2d.data[minF.point.x + offsetX][minF.point.y + offsetY] !== this.passTag)
                    return null;
                //如果在关闭表中就忽略
                var currentPoint = self.Point(minF.point.x + offsetX, minF.point.y + offsetY);
                if (this.pointInCloseList(currentPoint))
                    return null;
                //设置单位花费
                var step = 0;
                if (offsetX === 0 || offsetY === 0)
                    step = 10;
                else
                    step = 14;
                //如果不在openList中，就把它加入openList
                var currentNode = this.pointInOpenList(currentPoint);
                if (currentNode == null) {
                    currentNode = Node(currentPoint, this.endPoint, minF.g + step);
                    currentNode.father = minF;
                    this.openList.push(currentNode);
                    return null;
                }
                //如果在openList中，判断minF到当前点的G是否更小
                if (minF.g + step < currentNode.g) {
                    currentNode.g = minF + step;
                    currentNode.father = minF;
                }
    
            },

            //开始寻路
            start: function () {
                //1.将起点放入开启列表
                var startNode = Node(this.startPoint, this.endPoint);
                this.openList.push(startNode);
                //2.主循环逻辑
                while (true) {
                    //找到F值最小的节点
                    var minF = this.getMinNode();
                    //把这个点加入closeList中，并且在openList中删除它
                    this.closeList.push(minF);
                    var index = this.openList.indexOf(minF);
                    this.openList.splice(index, 1);
                    //搜索这个节点的上下左右节点
                    this.searchNear(minF, 0, -1);
                    this.searchNear(minF, 0, 1);
                    this.searchNear(minF, -1, 0);
                    this.searchNear(minF, 1, 0);
                    // 判断是否终止
                    var point = this.endPointInCloseList();
                    if (point) {  //如果终点在关闭表中，就返回结果
                        var cPoint = point;
                        var pathList = [];
                        while (true) {
                            if (cPoint.father) {
                                pathList.push(cPoint.point);
                                cPoint = cPoint.father;
                            } else {
                                return pathList.reverse();
                            }
                        }
                    }
                    //开启表为空
                    if (this.openList.length === 0)
                        return null;
                }
            }
        }
    }

    // update (dt) {},
});
