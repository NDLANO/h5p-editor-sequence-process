/** Class for Passive List Widget */
export default class SequenceProcessPassiveList {

  /**
   * @class
   * @param {H5PEditor.List} list List.
   */
  constructor(list) {
    this.list = list;
    this.items = [];

    // DOM
    this.$container = H5P.jQuery('<div>', {
      class: 'h5peditor-sequence-process-passive-list',
    });

    this.list.on('addedItem', (event) => {
      this.overrideColorSelectorValidationInDropzoneGroup(event.data);
    });

    this.list.ready(() => {
      this.list.forEachChild((group) => {
        this.overrideColorSelectorValidationInDropzoneGroup(group);
      });
    });
  }

  /**
   * Override color selector validation for all color selectors in a dropzone group.
   * @param {H5PEditor.Group} groupInstance H5P group instance representing a dropzone group.
   */
  overrideColorSelectorValidationInDropzoneGroup(groupInstance) {
    groupInstance.children?.forEach((fieldInstance) => {
      this.overrideColorSelectorValidation(fieldInstance);

      if (fieldInstance.field?.name === 'enumeration') {
        /*
         * Back hack, but we cannot get to the colorSelector widget instance. Boo, H5P!
         * Always returning true for enumaration group now without calling original validation of children.
         * @see https://github.com/h5p/h5p-editor-show-when/pull/12
         */
        fieldInstance.validate = () => true;
      }
    });
  }

  /**
   * Override color selector validation to allow empty values if configured.
   * Workaround for bug in widget.
   * @see https://github.com/h5p/h5p-editor-color-selector/pull/5
   * @param {object} fieldInstance H5P field instance.
   */
  overrideColorSelectorValidation(fieldInstance) {
    if (fieldInstance.field?.widget !== 'colorSelector') {
      return;
    }

    const originalValidate = fieldInstance.validate.bind(fieldInstance);
    fieldInstance.validate = () => {
      if (fieldInstance.config.allowEmpty && ['', null].includes(fieldInstance.params)) {
        return true;
      }

      return originalValidate();
    };
  }

  /**
   * Get all items.
   * @returns {object[]} Items.
   */
  getItems() {
    const items = [];
    this.list.forEachChild((child) => {
      items.push(child);
    });

    return items;
  }

  /**
   * Add UI item to the widget.
   * @param {object} item Item.
   */
  addItem(item) {
    item.appendTo(this.$container);
  }

  /**
   * Update order of items
   */
  updateOrder() {
    this.list.forEachChild((item) => {
      item.remove();
      this.addItem(item);
    });
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
  }
}
