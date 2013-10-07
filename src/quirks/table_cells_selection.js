wysihtml5.quirks.tableCellsSelection = (function() {
  
  var dom = wysihtml5.dom,
      select = {
          table: null,
          start: null,
          end: null
      },
      editable = null,
      selection_class = "wysiwyg-tmp-selected-cell",
      moveHandler = null,
      upHandler = null,
      editor = null;
      
  function init (element, edit) {
      editable = element;
      editor = edit;
      
      dom.observe(editable, "mousedown", function(event) {
        var target   = event.target,
            nodeName = target.nodeName;
        if (nodeName == "TD" || nodeName == "TH") {
            handleSelectionMousedown(target);
        }    
        
      });
      
      return select;
  }
  
  function handleSelectionMousedown (target) {
    select.start = target;
    select.table = dom.getParentElement(select.start, { nodeName: ["TABLE"] });
    
    if (select.table) {
      removeCellSelections();
      dom.addClass(target, selection_class);
      moveHandler = dom.observe(editable, "mousemove", handleMouseMove);
      upHandler = dom.observe(editable, "mouseup", handleMouseUp);
    }
  }
  
  // remove all selection classes
  function removeCellSelections () {
      if (editable) {
          var selectedCells = editable.querySelectorAll('.' + selection_class);
          if (selectedCells.length > 0) {
            for (var i = 0; i < selectedCells.length; i++) {
                dom.removeClass(selectedCells[i], selection_class);
            }
          }
      }
  }
  
  function addSelections (cells) {
    for (var i = 0; i < cells.length; i++) {
      dom.addClass(cells[i], selection_class);
    }
  }
  
  function handleMouseMove (event) {
    var curTable = null,
        cell = dom.getParentElement(event.target, { nodeName: ["TD","TH"] }),
        selectedCells;
        
    if (cell && select.table && select.start && select.start != cell) {
      curTable =  dom.getParentElement(cell, { nodeName: ["TABLE"] });
      if (curTable && curTable === select.table) {
        removeCellSelections();
        select.end = cell;
        selectedCells = dom.table.getCellsBetween(select.start, cell);
        addSelections(selectedCells);
      }
    }
  }
  
  function handleMouseUp (event) {
    moveHandler.stop();
    upHandler.stop();
    editor.fire("table_tools", "show");
    setTimeout(function() {
      var sideClickHandler = dom.observe(editable.ownerDocument, "click", function() {
        sideClickHandler.stop();
        removeCellSelections();
        setTimeout(function() {
            select.table = null;
            select.start = null;
            select.end = null;
        }, 0);
        editor.fire("table_tools", "hide");
        
      });
    });
  }
  
  return init;

})();
