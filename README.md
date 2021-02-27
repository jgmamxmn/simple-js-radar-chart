# simple-js-radar-chart

A simple radar chart written in TypeScript / JavaScript. Even works in IE11.

### Legal

(C) Maximon Ltd., 2021

Distibuted under the Maximon Ltd. License, Version 2021-02. See LICENSE.

### Core concept

A radar object is initialized with an arbitrary number of "Nodes" (axes). Each node has the following properties:

* __string ID__: a user-defined arbitrary ID string, which the user code can use to relate values to particular node later.
* __string Label__: the human-readable label (if any) that will be displayed against the axis on the visual chart.
* __string Color__: a color, in HTML-compatible format (e.g. a valid color name, or rgb code), which will be applied both to the axis and to the label.
* __number Value__: initial value of the node.
* __number Min, Max__: the minimum and maximum possible values of the node. This is used to normalize and scale all the nodes, so that their outmost point on the chart corresponds to Max, and the innermost point to Min.

### Usage

* In the HTML, insert an empty canvas contained in two layers of div container (see example below).
* In the JavaScript, define the nodes in an array of RadarNode objects.
* Define the RadarParams object, which contains the following:
  * __RadarNode\[\] Nodes__: a list of the defined nodes
  * __string CanvasID__: ID of the canvas element.
* Create a Radar object, passing the RadarParams to the constructor.
* Call Draw() on the Radar object to draw the chart.
* To retrieve the values at any time, iterate the Nodes\[\] array on the Radar object, and retrieve the Value object of each element.

### Example

To create a radar chart:

* HTML:

        <!-- Both the inner and outer divs here are important - do not delete. Inner div maintains the canvas's form
        and status in a block element; outer div is a reference container, from which the inner container will be 
        removed when we need to calculate offsetWidth and offsetHeight (for which the canvas must be visible in some
        browsers, so not inside a hidden tab page), and into which the inner container will be returned after we've 
        done that calculation - see notes. -->
        <div>
            <div style="display:block;">
                <canvas width="300" height="600" id="my-radar"></canvas>
            </div>
        </div>
    
    Note on the above: the radar chart uses the element's offsetWidth and offsetHeight to calculate the size of the target canvas. In order to guarantee that these have meaningful values (even if, in particular, the canvas is not initially visible on the page), the canvas is temporarily moved out of its existing position in the DOM, and appended directly to document.body. Once the dimensions are retrieved, it is put back where it belongs. That is why there is on outer div wrapper - it holds the position of the div block element (which is mandatory to ensure the canvas's dimensions are respected).
    
* JavaScript:

        var myRadarNodes =
        [
            // One node has an ID of "myfirstnode", will be visually labelled "Apples", will be colored green (#00ff00),
            // will have a potential value between 0 and 100, and an initial value of 50.
            new RadarNode("myfirstnode", "Apples", "#00ff00", 50, 0, 100),
            // The next node has an ID of "mysecondnode", will be visually labelled "Oranges", will be colored orange (#ffa500),
            // will have a potential value between 0 and 1, and an initial value of 0.75
            new RadarNode("mysecondnode", "Oranges", "#ffa500", 0.75, 0, 1),
            // The final node has an ID of "mythirdnode", will be visually labelled "Bananas", will be colored dark yellow (#cccc00),
            // will have a potential value between 0 and 28, and an initial value of 26.5
            new RadarNode("mythirdnode", "Bananas", "#cccc00", 26.5, 0, 28)
        ];
        
        var myRadarParams = 
        {
            CanvasID: "my-radar",
            Nodes: myRadarNodes
        };
        
        var myRadarChart = new Radar(myRadarParams);
        myRadarChart.Draw();

To get the node values at any time:

    R.Nodes.forEach(function (aNode)
	  {
        doSomething(aNode.ID, aNode.Value);
    });
    
    
where doSomething is a function to process the ID/Value pairs. ID corresponds to the ID specified when constructing the Radar object.

See also
https://jsfiddle.net/68d74b91/1/

### TODO

* The source code is not encapsulated.
* Gets a bit weird if the "Min" value of a node is not zero.
* The drag-and-drop system estimates the intended position of a node based on linear distance between the mouse pointer and the origin (center) of the chart. This superficially works well higher values but is not especially suitable for values close to the center, which become hard to control. A perpendicular intersection of the relevant node's axis would be a much more logical approach; but I coludn't remember how to do 2D maths.

