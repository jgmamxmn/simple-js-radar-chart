/* Copyright 2021, Maximon Ltd.

Website: https://www.maximon.ltd

simple-js-radar-chart (the "Work") is licensed under the Maximon Ltd. License, Version 2021-02 (the "License"); you may not use the Work or derivatives thereof except in compliance with the License. You may obtain a copy of the License at

  https://github.com/jgmamxmn/License/

If the above link does not contain or refer to a copy of the License, then the License is revoked, and all rights as to the Work are reserved.

Unless required by applicable law or agreed to in writing, the Work is distributed on an as-is basis, without warranties or conditions of any kind, either express or implied. See the License for the specific language governing permissions and limitations under the License.

The License, and these terms, are governed by the laws of England and Wales and subject to the exclusive jurisdiction of the courts of England and Wales.*/

class RadarNode {
    constructor(_ID, _Label, _Color, _Value, _Min, _Max) {
        this.ID = _ID;
        this.Label = _Label;
        this.Color = _Color;
        this.Value = _Value;
        this.Min = _Min;
        this.Max = _Max;
    }
    GetScaledValue(radius) {
        this.ScaleRatio = radius / (this.Max - this.Min);
        return this.Value * this.ScaleRatio;
    }
    SetValueFromScaledValue(valueScaled) {
        this.Value = valueScaled / this.ScaleRatio;
        if (this.Value < this.Min)
            this.Value = this.Min;
        if (this.Value > this.Max)
            this.Value = this.Max;
        return this.Value;
    }
}
class RadarParams {
}
class RadarPoint {
    constructor(_X, _Y) {
        this.X = _X;
        this.Y = _Y;
    }
}
class Radar {
    constructor(params) {
        this.Canvas = document.getElementById(params.CanvasID);
        this.Canvas.removeAttribute("width");
        this.Canvas.removeAttribute("height");
        this.Nodes = params.Nodes;
        this.Ctx = this.Canvas.getContext('2d');
        this.CanvasSize = this.scaleCanvas();
        this.Num = this.Nodes.length;
        if (this.CanvasSize.X == 0 || this.CanvasSize.Y == 0 || this.Num == 0) {
            throw new Error();
        }
        var IncrementRad = Math.PI * 2 / this.Num;
        var AngleRad = 0;
        this.Nodes.forEach(function (N) {
            N.AngleRads = AngleRad;
            AngleRad += IncrementRad;
        });
        this.Center = new RadarPoint(this.CanvasSize.X / 2, this.CanvasSize.Y / 2);
        this.Radius = Math.min(this.Center.X, this.Center.Y) * 0.8;
        this.MouseTracking = false;
        var R = this;
        this.Canvas.onmousedown = function (ev) {
            var MouseX = ev.offsetX / R.ScalingRatio, MouseY = ev.offsetY / R.ScalingRatio;
            R.Nodes.forEach(function (N) {
                var NodeX = N.Point.X + (R.ScalingDetails.x / R.ScalingRatio), NodeY = N.Point.Y + (R.ScalingDetails.y / R.ScalingRatio);
                if (Math.abs(MouseX - NodeX) < 4 && Math.abs(MouseY - NodeY) < 4) {
                    R.MouseTracking = true;
                    R.MouseTracked = N;
                    return true;
                }
                else {
                    return false;
                }
            });
        };
        this.Canvas.onmouseup = function (ev) {
            R.MouseTracking = false;
        };
        this.Canvas.onmouseout = this.Canvas.onmouseup;
        this.Canvas.onmousemove = function (ev) {
            if (R.MouseTracking) {
                var MouseX = ev.offsetX / R.ScalingRatio, MouseY = ev.offsetY / R.ScalingRatio;
                var OriginX = MouseX - R.Center.X - (R.ScalingDetails.x / R.ScalingRatio), OriginY = MouseY - R.Center.Y - (R.ScalingDetails.y / R.ScalingRatio);
                var CalculatedRadius = Math.sqrt(OriginX * OriginX + OriginY * OriginY);
                var AbsVal = R.MouseTracked.SetValueFromScaledValue(CalculatedRadius);
                R.Draw();
            }
        };
    }
    Draw() {
        this.Ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        this.DrawWeb();
        this.DrawNodes();
    }
    DrawWeb() {
        this.Ctx.beginPath();
        this.Ctx.strokeStyle = "rgb(120,120,120)";
        var IncrementRadiusPx = this.Radius / 4;
        var IncrementAngleRad = Math.PI * 2 / this.Num;
        var Theta;
        for (Theta = 0; Theta < (Math.PI * 2); Theta += IncrementAngleRad) {
            this.Ctx.moveTo(this.Center.X, this.Center.Y);
            this.Ctx.lineTo(this.Center.X + Math.sin(Theta) * this.Radius, this.Center.Y + Math.cos(Theta) * this.Radius);
        }
        for (var R = IncrementRadiusPx; R <= this.Radius; R += IncrementRadiusPx) {
            for (Theta = 0; Theta < (Math.PI * 2); Theta += IncrementAngleRad) {
                var x = this.Center.X + Math.sin(Theta) * R;
                var y = this.Center.Y + Math.cos(Theta) * R;
                if (Theta > 0)
                    this.Ctx.lineTo(x, y);
                if ((Theta + IncrementAngleRad) >= (Math.PI * 2))
                    this.Ctx.lineTo(this.Center.X + Math.sin(0) * R, this.Center.Y + Math.cos(0) * R);
                this.Ctx.moveTo(x, y);
            }
        }
        this.Ctx.stroke();
        this.Ctx.closePath();
    }
    DrawNodes() {
        this.Ctx.beginPath();
        this.Ctx.strokeStyle = "black";
        for (var i = 0; i < this.Num; ++i) {
            var n = this.Nodes[i];
            var value_scaled = n.GetScaledValue(this.Radius);
            n.Point = new RadarPoint(this.Center.X + Math.sin(n.AngleRads) * value_scaled, this.Center.Y + Math.cos(n.AngleRads) * value_scaled);
            if (i > 0) {
                this.Ctx.lineTo(n.Point.X, n.Point.Y);
            }
            if (i == (this.Num - 1)) {
                this.Ctx.lineTo(this.Nodes[0].Point.X, this.Nodes[0].Point.Y);
            }
            this.Ctx.moveTo(n.Point.X, n.Point.Y);
        }
        this.Ctx.stroke();
        this.Ctx.closePath();
        var point_size = 8;
        var R = this;
        var labelRadius = this.Radius * 0.92 / 0.8;
        R.Ctx.font = "10px Arial";
        this.Nodes.forEach(function (n) {
            R.Ctx.beginPath();
            R.Ctx.strokeStyle = n.Color;
            R.Ctx.fillStyle = n.Color;
            R.Ctx.arc(n.Point.X, n.Point.Y, (point_size / 2), 0, Math.PI * 2);
            R.Ctx.stroke();
            R.Ctx.fill();
            R.Ctx.closePath();
            R.Ctx.beginPath();
            var TxtPnt = new RadarPoint(R.Center.X + Math.sin(n.AngleRads) * labelRadius, R.Center.Y + Math.cos(n.AngleRads) * labelRadius);
            var tw = R.Ctx.measureText(n.Label).width;
            TxtPnt.X -= tw / 2;
            if (TxtPnt.X < 0)
                TxtPnt.X = 0;
            else if (TxtPnt.X + tw > R.Canvas.width)
                TxtPnt.X = R.Canvas.width - tw;
            R.Ctx.fillText(n.Label, TxtPnt.X, TxtPnt.Y);
        });
    }
    scaleCanvas() {
        var desiredSize = window.innerWidth * 0.9;
        if (desiredSize < 350)
            desiredSize = 350;
        this.Canvas.width = desiredSize;
        this.Canvas.height = desiredSize;
        const originalHeight = this.Canvas.height;
        const originalWidth = this.Canvas.width;
        var parentDiv = this.Canvas.parentElement;
        var placeInDom = parentDiv.parentElement;
        document.body.appendChild(parentDiv);
        this.ScalingDetails = this.getObjectFitSize(true, this.Canvas.offsetWidth, this.Canvas.offsetHeight, this.Canvas.width, this.Canvas.height);
        this.Canvas.width = this.ScalingDetails.width;
        this.Canvas.height = this.ScalingDetails.height;
        this.ScalingRatio = Math.min(this.Canvas.offsetWidth / originalWidth, this.Canvas.offsetHeight / originalHeight);
        this.Ctx.scale(this.ScalingRatio, this.ScalingRatio);
        placeInDom.appendChild(parentDiv);
        return new RadarPoint(originalWidth, originalHeight);
    }
    getObjectFitSize(contains, containerWidth, containerHeight, width, height) {
        var doRatio = width / height;
        var cRatio = containerWidth / containerHeight;
        var targetWidth = 0;
        var targetHeight = 0;
        var test = contains ? doRatio > cRatio : doRatio < cRatio;
        if (test) {
            targetWidth = containerWidth;
            targetHeight = targetWidth / doRatio;
        }
        else {
            targetHeight = containerHeight;
            targetWidth = targetHeight * doRatio;
        }
        var ret = {
            width: targetWidth,
            height: targetHeight,
            x: (containerWidth - targetWidth) / 2,
            y: (containerHeight - targetHeight) / 2
        };
        return ret;
    }
}
