import './h5peditor-sequence-process.scss';

/** Class for SequenceProcessPropertiesList widget */
export default class SequenceProcess {

  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    // DOM
    this.$container = H5P.jQuery('<div>', {
      class: 'h5peditor-sequence-process',
    });

    // Instantiate original field (or create your own and call setValue)
    this.fieldInstance = new H5PEditor.widgets[this.field.type](this.parent, this.field, this.params, this.setValue);
    this.fieldInstance.appendTo(this.$container);

    // Errors (or add your own)
    this.$errors = this.$container.find('.h5p-errors');

    this.parent.ready(() => {
      this.initialize();
    });
  }

  /**
   * Initialize.
   */
  initialize() {
    this.statementsList = this.findField('statementsList/statementsList', this.fieldInstance);

    this.statementsList.on('addedItem', (event) => {
      this.handleStatementAdded(event.data);
    });

    this.statementsList.on('removedItem', (event) => {
      this.handleStatementRemoved(event.data);
    });

    this.dropzonesList = this.findField('dropzonesList/dropzonesList', this.fieldInstance);
  }

  /**
   * Handle added property in list.
   */
  handleStatementAdded() {
    clearTimeout(this.mouseUpTimeout);

    this.dropzonesList.addItem();
  }

  /**
   * Handle removed property in list.
   */
  handleStatementRemoved() {
    clearTimeout(this.mouseUpTimeout);

    this.dropzonesList.removeItem(this.dropzonesList.getValue().length - 1);
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
  }

  /**
   * Find field from path.
   * @param {string} path Path.
   * @param {object} parent Parent field.
   * @returns {object|boolean} Field or false.
   */
  findField(path, parent) {
    if (typeof path === 'string') {
      path = path.split('/');
    }

    if (path[0] === '..') {
      path.splice(0, 1);
      return this.findField(path, parent.parent);
    }

    if (!parent.children) {
      return false;
    }

    for (var i = 0; i < parent.children.length; i++) {
      if (parent.children[i].field.name === path[0]) {
        // Regular Field
        path.splice(0, 1);
        if (path.length) {
          return this.findField(path, parent.children[i]);
        }
        else {
          return parent.children[i];
        }
      }
      else if (typeof parent.children[i].getName === 'function' && parent.children[i].getName() === path[0]) {
        // List, children are instances of same type, diving deeper not possible
        return parent.children[i];
      }
    }

    return false;
  }
}
