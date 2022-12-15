// @ts-nocheck

export const init = () => {
  if (document.querySelector('#myDiagramDiv')) {
    renderDiagram('myDiagramDiv');
  }
};

function renderDiagram(id) {
  // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
  // For details, see https://gojs.net/latest/intro/buildingObjects.html
  const $ = go.GraphObject.make; // for conciseness in defining templates

  const myDiagram = $(
    go.Diagram,
    id, // must be the ID or reference to div
    {
      'toolManager.hoverDelay': 100, // 100 milliseconds instead of the default 850
      allowCopy: false,
      // create a TreeLayout for the family tree
      layout: $(go.TreeLayout, {
        treeStyle: go.TreeLayout.StyleRootOnly,

        angle: 90,

        alternateAngle: 0,

        alternateLayerSpacing: 35,

        alternateAlignment: go.TreeLayout.AlignmentStart,

        alternateNodeIndent: 10,

        alternateNodeIndentPastParent: 1.0,

        alternateNodeSpacing: 10,

        alternateLayerSpacingParentOverlap: 1.0,

        alternatePortSpot: new go.Spot(0.01, 1, 10, 0),

        alternateChildPortSpot: go.Spot.Left,
        arrangement: go.TreeLayout.ArrangementVertical,
      }),
    }
  );

  const colors = {
    module: '#FFCCBC',
    service: '#E1F5FE',
    controller: '#B9F6CA',
    entity: '#C5E1A5',
    dto: '#ECEFF1',
    type: '#CFD8DC',
    guard: '#FFF176',
    middleware: '#D1C4E9',
  };

  var bluegrad = '#90CAF9';
  var pinkgrad = '#F48FB1';

  // get tooltip text from the object's data
  function tooltipTextConverter(node) {
    var str = '';
    // str += 'Born: ' + person.birthYear;
    // if (person.deathYear !== undefined) str += '\nDied: ' + person.deathYear;
    // if (person.reign !== undefined) str += '\nReign: ' + person.reign;
    return 'NODE';
  }

  // define tooltips for nodes
  var tooltiptemplate = $(
    'ToolTip',
    { 'Border.fill': 'whitesmoke', 'Border.stroke': 'black' },
    $(
      go.TextBlock,
      {
        font: 'bold 8pt Helvetica, bold Arial, sans-serif',
        wrap: go.TextBlock.WrapFit,
        margin: 5,
      },
      new go.Binding('text', '', tooltipTextConverter)
    )
  );

  // define Converters to be used for Bindings
  function typeBrushConverter(type) {
    return colors[type];
  }

  // replace the default Node template in the nodeTemplateMap
  myDiagram.nodeTemplate = $(
    go.Node,
    'Auto',
    { deletable: false, toolTip: tooltiptemplate },
    new go.Binding('text', 'name'),
    $(
      go.Shape,
      'Rectangle',
      {
        fill: 'lightgray',
        stroke: null,
        strokeWidth: 0,
        stretch: go.GraphObject.Fill,
        alignment: go.Spot.Center,
      },
      new go.Binding('fill', 'type', typeBrushConverter)
    ),
    $(
      go.TextBlock,
      {
        font: '700 12px Droid Serif, sans-serif',
        textAlign: 'center',
        margin: 10,
        maxSize: new go.Size(150, NaN),
      },
      new go.Binding('text', 'name')
    )
  );

  // define the Link template
  myDiagram.linkTemplate = $(
    go.Link, // the whole link panel
    { routing: go.Link.Orthogonal, corner: 5, selectable: false },
    $(go.Shape, { strokeWidth: 3, stroke: '#424242' })
  ); // the gray link shape

  // here's the family data
  var nodeDataArray = MODULES_TREE;

  // create the model for the family tree
  myDiagram.model = new go.TreeModel(nodeDataArray);

  // document
  //   .getElementById('zoomToFit')
  //   .addEventListener('click', () => myDiagram.commandHandler.zoomToFit());

  // document.getElementById('centerRoot').addEventListener('click', () => {
  //   myDiagram.scale = 1;
  //   myDiagram.scrollToRect(myDiagram.findNodeForKey(0).actualBounds);
  // });

  myDiagram.addDiagramListener('ObjectSingleClicked', function (e) {
    var part = e.subject.part;
    if (!(part instanceof go.Link)) console.log('Clicked on ');
    if (part.data.type === 'module') {
      window.open(`/docs/modules/${part.data.linkId}.html`, '_top');
    }
    if (part.data.type === 'service') {
      window.open(`/docs/services/${part.data.linkId}.html`, '_top');
    }
    if (part.data.type === 'controller') {
      window.open(`/docs/controllers/${part.data.linkId}.html`, '_top');
    }
    if (part.data.type === 'entity') {
      window.open(`/docs/entities/${part.data.linkId}.html`, '_top');
    }
    if (part.data.type === 'dto') {
      window.open(`/docs/dto/${part.data.linkId}.html`, '_top');
    }
    if (part.data.type === 'type') {
      window.open(`/docs/types/${part.data.linkId}.html`, '_top');
    }
  });
}
