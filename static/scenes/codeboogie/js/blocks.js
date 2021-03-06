/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// Extensions to Blockly's language and JavaScript generator.

goog.provide('app.blocks');

goog.require('Blockly.Blocks');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.JavaScript');
goog.require('app.Patterns');
goog.require('app.Step');

/**
 * Utility function to create a mini block e.g. for the toolbar.
 * @param {string} type of block to create
 * @return {string} XML of block definition
 */
app.blocks.miniBlockXml = function(type) {
  return '<block type="' + type + '_mini">' +
    '<clone>' + app.blocks.blockXml(type) + '</clone>' +
    '</block>';
};

/**
 * Utility function to define a block.
 * @param {string} type of block to create
 * @param {Object.<string>=} opt_attrs map of block attributes
 * @param {Object.<string>=} opt_fields map of field keys to values
 * @param {?string=} opt_child block to run as DO statement.
 * @param {?string=} opt_next block to run after this one.
 * @return {string} XML of block definition
 */
app.blocks.blockXml = function(type, opt_attrs, opt_fields, opt_child, opt_next) {
  var xml = '<block type="' + type + '"';
  if (opt_attrs) {
    for (var key in opt_attrs) {
      if (opt_attrs.hasOwnProperty(key) && opt_attrs[key] != null) {
        xml += ' ' + key + '="' + opt_attrs[key] + '"';
      }
    }
  }
  xml += '>';
  if (opt_fields) {
    for (key in opt_fields) {
      if (opt_fields.hasOwnProperty(key)) {
        xml += '<field name="' + key + '">' + opt_fields[key] + '</field>';
      }
    }
  }
  if (opt_child) {
    xml += '<statement name="DO">' + opt_child + '</statement>';
  }
  if (opt_next) {
    xml += '<next>' + opt_next + '</next>';
  }
  xml += '</block>';
  return xml;
};

/**
 * Install our blocks into blockly when ready.
 */
app.blocks.install = function() {
  /**
   * Create simple move blocks
   */
  (function() {
    var STEP_CONFIGS = {
      [app.Step.LEFT_ARM]: {
        letter: _msg`codeboogie-block-leftarm`,
        image: 'img/block-point-left.svg',
        tooltip: _msg`codeboogie-block-leftarm-tooltip`
      },
      [app.Step.RIGHT_ARM]: {
        letter: _msg`codeboogie-block-rightarm`,
        image: 'img/block-point-right.svg',
        tooltip: _msg`codeboogie-block-rightarm-tooltip`
      },
      [app.Step.LEFT_FOOT]: {
        letter: _msg`codeboogie-block-leftfoot`,
        image: 'img/block-step-left.svg',
        tooltip: _msg`codeboogie-block-leftfoot-tooltip`
      },
      [app.Step.RIGHT_FOOT]: {
        letter: _msg`codeboogie-block-rightfoot`,
        image: 'img/block-step-right.svg',
        tooltip: _msg`codeboogie-block-rightfoot-tooltip`
      },
      [app.Step.JUMP]: {
        letter: _msg`codeboogie-block-jump`,
        image: 'img/block-jump.svg',
        tooltip: _msg`codeboogie-block-jump-tooltip`
      },
      [app.Step.SPLIT]: {
        letter: _msg`codeboogie-block-split`,
        image: 'img/block-splits.svg',
        tooltip: _msg`codeboogie-block-split-tooltip`
      },
      [app.Step.SHAKE]: {
        letter: _msg`codeboogie-block-shake`,
        image: 'img/block-hip-shake.svg',
        tooltip: _msg`codeboogie-block-shake-tooltip`
      }
    };

    var generateBlocksForStep = function(step) {
      Blockly.Blocks['dance_' + step] = generateStepBlock(step);
      Blockly.Blocks['dance_' + step + '_mini'] = generateMiniBlock(step);
      Blockly.JavaScript['dance_' + step] = generateCodeGenerator(step);
    };

    var generateStepBlock = function(step) {
      var stepConfig = STEP_CONFIGS[step];
      var image = stepConfig.image;
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.contextMenu = false;
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(null, 23, 32))
              .appendField(new Blockly.FieldLabel(stepConfig.letter));
          this.setFillPattern(
              app.Patterns.addPattern('pat_' + step, image, 48, 43, -28, 0));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(stepConfig.tooltip);
        }
      };
    };

    var generateMiniBlock = function(step) {
      var stepConfig = STEP_CONFIGS[step];
      var image = stepConfig.image;
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.contextMenu = false;
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(null, 48 - 24, 43 - 10));
          this.setFillPattern(
              app.Patterns.addPattern('minipat_' + step, image, 48, 43, 0, 0));
          this.setMini(true);
          this.setTooltip(stepConfig.tooltip);
        }
      };
    };

    var generateCodeGenerator = function(step) {
      return function() {
        return 'api.' + step + '(\'block_id_' + this.id + '\');\n';
      };
    };

    generateBlocksForStep(app.Step.LEFT_ARM);
    generateBlocksForStep(app.Step.RIGHT_ARM);
    generateBlocksForStep(app.Step.LEFT_FOOT);
    generateBlocksForStep(app.Step.RIGHT_FOOT);
    generateBlocksForStep(app.Step.JUMP);
    generateBlocksForStep(app.Step.SPLIT);
    generateBlocksForStep(app.Step.SHAKE);
  })();

  function optionNumberRange(min, max) {
    var results = [];
    for (var i = min; i <= max; i++) {
      results.push([i.toString(), i]);
    }
    return results;
  }

  /**
   * Dummy block to signal start of code.
   */
  Blockly.Blocks['when_run'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.contextMenu = false;
      this.setHSV(26, 0.77, 0.96);
      this.appendDummyInput()
          .appendField(_msg`codelab-block-whenrun`);
      this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['when_run'] = function() {
    return '\n';
  };

  Blockly.Blocks['controls_repeat'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.contextMenu = false;
      this.setHSV(187, 1, 0.753);
      this.appendDummyInput()
          .appendField(new Blockly.FieldImage('img/block-repeat.svg', 28, 32))
          .appendField(new Blockly.FieldDropdown(optionNumberRange(2, 6)), 'TIMES')
          .appendField(_msg`codelab-block-repeat-times`);
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(_msg`codelab-block-repeat-tooltip`);
    }
  };

  Blockly.Blocks['controls_repeat_mini'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.contextMenu = false;
      this.setHSV(187, 1, 0.753);
      this.appendDummyInput()
          .appendField(new Blockly.FieldImage('img/block-repeat.svg', 23, 32));
      this.setMini(true);
      this.setTooltip(_msg`codelab-block-repeat-tooltip`);
    }
  };

  /**
   * @this {Blockly.Block}
   * @returns {string}
   */
  Blockly.JavaScript['controls_repeat'] = function() {
    // Repeat n times (internal number).
    var repeats = Number(this.getFieldValue('TIMES'));
    var branch = Blockly.JavaScript.statementToCode(this, 'DO');
    if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
      branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
          '\'' + this.id + '\'') + branch;
    }
    var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
        'count', Blockly.Variables.NAME_TYPE);
    var code = 'for (var ' + loopVar + ' = 0; ' +
        loopVar + ' < ' + repeats + '; ' +
        loopVar + '++) {\n' +
        branch + '}\n';
    return code;
  };
};
