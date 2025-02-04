(function () {
  angular.module('BitriseWorkflowEditor').directive('orderByDrag', function ($parse) {
    return {
      restrict: 'A',
      link(scope, element, attrs) {
        let draggableSelector = $parse(attrs.draggableSelector)(scope);
        if (draggableSelector === undefined) {
          draggableSelector = '*';
        }

        let selectedElement;
        let cursorPositionYOnLastStableOrder;
        let isDragInProgress = false;

        function mousedownHandler(event) {
          if (event.which !== 1) {
            return;
          }

          if (attrs.disableOrderOn && $parse(attrs.disableOrderOn)(scope)) {
            return;
          }

          if (event.target.hasAttribute('skip-drag-order')) {
            return;
          }

          for (
            selectedElement = event.target;
            selectedElement && !_.contains($(element).children(draggableSelector), selectedElement);
            selectedElement = selectedElement.parentNode
          );
          $(selectedElement).off('mousedown', mousedownHandler);

          cursorPositionYOnLastStableOrder = event.pageY;

          $(document).on('mousemove', mousemoveHandler);
          $(document).on('mouseup', mouseupHandler);
        }

        function mousemoveHandler(event) {
          if (!isDragInProgress && $(selectedElement).is(draggableSelector)) {
            $(element).addClass('drag-in-progress');
            $(selectedElement).addClass('dragged-element');
            isDragInProgress = true;
          }

          const moveOffsetY = event.pageY - cursorPositionYOnLastStableOrder;

          if (moveOffsetY > 0) {
            const nextElement = $(selectedElement).next(draggableSelector);
            if (nextElement.length === 0) {
              $(selectedElement).css('top', `${0}px`);

              return;
            }

            $(selectedElement).css('top', `${moveOffsetY}px`);

            const offsetYBetweenSiblings = $(selectedElement).offset().top - $(nextElement).offset().top;
            if (offsetYBetweenSiblings > 0) {
              const index = $(element).children().index(selectedElement);
              const models = $parse(attrs.models)(scope);
              const model = models[index];
              models.splice(index, 1);
              if (_.last(models) === model) {
                models.push(model);
              } else {
                models.splice(index + 1, 0, model);
              }
              $(selectedElement).insertAfter(nextElement);
              $(selectedElement).css('top', `${offsetYBetweenSiblings}px`);
              cursorPositionYOnLastStableOrder = event.pageY - offsetYBetweenSiblings;

              scope.$apply();
            }
          } else {
            const previousElement = $(selectedElement).prev(draggableSelector);
            if (previousElement.length === 0) {
              $(selectedElement).css('top', `${0}px`);

              return;
            }

            $(selectedElement).css('top', `${moveOffsetY}px`);

            const offsetYBetweenSiblings = $(selectedElement).offset().top - $(previousElement).offset().top;
            if (offsetYBetweenSiblings < 0) {
              const index = $(element).children().index(selectedElement);
              const models = $parse(attrs.models)(scope);
              const model = models[index];
              models.splice(index, 1);
              if (_.first(models) === model) {
                models.unshift(model);
              } else {
                models.splice(index - 1, 0, model);
              }
              $(selectedElement).insertBefore(previousElement);
              $(selectedElement).css('top', `${offsetYBetweenSiblings}px`);
              cursorPositionYOnLastStableOrder = event.pageY - offsetYBetweenSiblings;

              scope.$apply();
            }
          }
        }

        function mouseupHandler(event) {
          $(selectedElement).css('top', '');

          $(element).removeClass('drag-in-progress');
          $(selectedElement).removeClass('dragged-element');

          $(document).off('mousemove', mousemoveHandler);
          $(document).off('mouseup', mouseupHandler);
          $(selectedElement).on('mousedown', mousedownHandler);

          isDragInProgress = false;
          scope.$apply();
        }

        scope.$watchCollection(attrs.models, function (newModels, oldModels) {
          _.each($(element).children(draggableSelector), function (aChild) {
            $(aChild).off('mousedown', mousedownHandler).on('mousedown', mousedownHandler);
          });

          if (attrs.modelsChangedCallback) {
            $parse(attrs.modelsChangedCallback)(scope)(newModels, oldModels);
          }
        });

        scope.$on('$destroy', function () {
          $(document).off('mousemove', mousemoveHandler);
          $(document).off('mouseup', mouseupHandler);
        });
      },
    };
  });
})();
