<template>
  <el-form-item
    ref="formItem"
    :prop="prop"
    :label="label"
    class="nb-form-item-wrapper"
    :class="[
    required !== undefined ? 'is-required' : '',
    inline ? 'inline-item' : 'inline-item-none',
    type === 'editor' ? 'editor-z-index' : ''
    ]">
    <div v-if="preview && !boxed" class="show-value">
      <template v-if="type === 'image'">
        <img width="100" :src="cloneValue"/>
      </template>
      <template v-else>
        <div v-if="cloneValue" v-html="cloneValue" style="color: #333;"></div>
        <div v-else style="color: #999">{{cloneEmpty ? cloneEmpty : '-'}}</div>
      </template>
    </div>
    <div class="flex-wrapper" v-if="!preview && !boxed">
      <el-input
        :size="size"
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        v-model="cloneValue"
        :maxlength="max || maxs"
        @blur="blur"
        @focus="focus"
        @input="updateValue"
        v-if="!type || type === 'textarea' || type === 'password' || type === 'number'"
      >
        <template v-if="prepend" slot="prepend">{{prepend}}</template>
        <template v-if="append" slot="append">{{append}}</template>
        <template v-if="outter" slot="append" class="outter">{{outter}}</template>
        <el-select
          class="input-inner-select"
          v-if="preType === 'appendSelect'"
          v-model="select"
          slot="append"
          placeholder="请选择"
          @change="changeAppend"
        >
          <el-option
            v-for="item in options"
            :label="item[defaultKey.label]"
            :value="item[defaultKey.value]"
            :key="item[defaultKey.key || defaultKey.value]"
          ></el-option>
        </el-select>
      </el-input>
      <div
        v-if="type === 'click'"
        class="click-input"
        :class="{clickNone: disabled}"
        @click="inputClick"
      >
        <template v-if="cloneValue">
          <span>{{cloneValue}}</span>
        </template>
        <template v-else>
          <span style="color: #999">{{placeholder}}</span>
        </template>
      </div>
      <el-select
        :size="size"
        v-if="type === 'select'"
        v-model="cloneValue"
        :placeholder="placeholder || '请选择'"
        :clearable="!clearable"
        :value-key="defaultKey.value"
        :filter-method="handleFilter"
        :filterable="!search"
        :disabled="disabled"
        :multiple="multiple"
        @change="updateValue"
      >
        <el-option
          v-for="item in cloneOpts"
          :key="item[defaultKey.key || defaultKey.value]"
          :label="item[defaultKey.label]"
          :value="isSelectObj ? item : item[defaultKey.value]">
          <template>
            <span>{{item[defaultKey.label]}}</span>
            <span class="color-a m-l-20" v-if="showField">({{item[textField]}})</span>
          </template>
        </el-option>
      </el-select>

      <el-date-picker
        v-if="type === 'datetime' || type === 'date' || type === 'daterange' || type === 'datetimerange'"
        v-model="cloneValue"
        :type="type"
        :size="size"
        :editable="true"
        :disabled="disabled"
        :placeholder="placeholder || '选择日期时间'"
        @change="updateValue"
        :value-format="valueFormat"
        :picker-options="pickerOptions"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      >
      </el-date-picker>

      <el-checkbox-group
        v-if="type === 'checkbox'"
        v-model="cloneValue"
        :disabled="disabled"
        :size="size"
        @change="updateValue"
      >
        <el-checkbox v-for="item in options" :label="item[defaultKey.value]" :key="item[defaultKey.value]">
          {{item[defaultKey.label]}}
        </el-checkbox>
      </el-checkbox-group>

      <el-radio-group
        v-if="type === 'radio'"
        v-model="cloneValue"
        :disabled="disabled"
        :size="size"
        @change="updateValue"
      >
        <el-radio v-for="item in options" :label="item[defaultKey.value]" :key="item[defaultKey.value] + ''">
          {{item[defaultKey.label]}}
          <span type="text" v-if="item.slot" class="el-icon-info el-icon-tips" :title="item.slot"></span>
        </el-radio>
      </el-radio-group>

      <el-checkbox-group
        v-if="type === 'radioBox'"
        v-model="cloneValue"
        :disabled="disabled"
        :size="size"
        @change="updateValue"
      >
        <el-checkbox class="el-table_radio" v-for="item in options" :label="item[defaultKey.value]"
                     :key="item[defaultKey.value]">{{item[defaultKey.label]}}
        </el-checkbox>
      </el-checkbox-group>

      <!--<upload-img-->
      <!--v-if="type === 'image'"-->
      <!--:max="maxs"-->
      <!--:name="name"-->
      <!--v-model="cloneValue"-->
      <!--@updateValue="updateValue"-->
      <!--@imageValue="imageValue"-->
      <!--:upload="upload"-->
      <!--ref="formImg"-->
      <!--&gt;</upload-img>-->

      <slot name="in"></slot>
      <slot name="out"></slot>
      <transition name="error">
        <div v-if="showError && !cancelError" class="el-form-item__error">{{showError}}</div>
      </transition>
    </div>
    <slot name="box"></slot>
    <el-row class="tips" v-if="tips || max">
      <el-col class="tips-text" v-if="tips && !showError" :span="20">
        <el-tooltip class="item" effect="dark" :content="tips" placement="top">
          {{tips}}
        </el-tooltip>
      </el-col>
      <el-col class="value-num" v-if="max" :span="!tips ? 24 : 12">{{num}}/{{max}}</el-col>
    </el-row>
    <input v-if="type !== 'image' && type !== 'file' && type !== 'oss'" ref="ipt" hidden :name="name"/>
  </el-form-item>
</template>

<script>
import {
  isPhone,
  isInteger,
  isMoney,
  isDouDecimal,
  email,
  isSpell,
  isEcpInteger,
  checkType
} from './utils/validate'
import {cloneDeep} from 'lodash'
import Spell from './utils/spellChange'

export default {
  data () {
    return {
      cloneValue: this.value,
      validatorStatus: false,
      check: false,
      cancelError: false,
      mostError: '',
      patterns: '',
      oldValue: '',
      select: '',
      durations: '0',
      showOss: true,
      cloneOpts: cloneDeep(this.options),
      alertMessage: {
        'select': '请选择'
      },
      cloneEmpty: this.empty || this.$parent.$attrs.empty
    }
  },
  components: {},
  props: {
    label: String,
    empty: String,
    labelTips: String,
    labelTipsTwo: String,
    placeholder: String,
    value: [String, Number, Array, Date, Object],
    name: String,
    tips: String,
    prepend: String,
    append: String,
    outter: String,
    prop: {
      type: String,
      default: ''
    },
    max: [Number, String],
    maxs: [Number, String],
    type: {
      type: String,
      default: ''
    },
    required: [String, Function, RegExp],
    input: [String, Function, RegExp],
    disabled: Boolean,
    readonly: {
      type: Boolean,
      default: false
    },
    multiple: Boolean,
    resetNo: Boolean,
    inline: {
      type: Boolean,
      default: true
    },
    preview: Boolean,
    boxed: Boolean,
    options: {
      type: Array,
      default: () => []
    },
    defaultKey: {
      type: Object,
      default: () => {
        return {
          label: 'label',
          value: 'value'
        }
      }
    },
    pattern: String,
    valueFormat: String,
    documentType: [String, Number],
    upload: Boolean,
    fileType: {
      type: String,
      default: 'avi,mp4,wmv,mov,FLV'
    },
    valueNum: {
      type: String,
      default: '1'
    },
    accept: String,
    search: Boolean, // 下拉选择框 可搜索配置  true 可搜索  默认不可搜索
    customeType: {
      type: Boolean,
      default: false
    },
    isSelectObj: {
      type: Boolean,
      default: false
    },
    showField: {
      type: Boolean,
      default: false
    },
    textField: String,
    preType: String,
    clearable: Boolean,
    pickerOptions: Object,
    size: {
      type: String,
      default: ''
    }
  },
  watch: {
    /**
     * 观察父组件传递过来的value是否变化
     * 有变化时把最新值赋值给当前实例中的cloneValue
     * 因为当前实例初始化时会初始化data中的数据，将this.value赋值给cloneValue
     * 如果这个实例在当前页面中没有被销毁
     * 父组件参数变化时不会再执行data中的参数赋值动作，导致当前实例中的cloneValue不能得到更新
     */
    value (data) {
      this.cloneValue = data
      this.formatValue(data)
    },
    options (val) {
      this.cloneOpts = cloneDeep(val)
    }
  },
  methods: {
    handleFilter (value) {
      this.cloneOpts = this.options.filter(item => {
        return Spell.getCamelChars(item.label).match(Spell.getCamelChars(value))
      })
    },
    updateValue (val) {
      val && this.formatValue(val)
      this.check = false
      this.mostError = ''
      this.cancelError && (this.cancelError = false)
      !this.validatorStatus && (this.validatorStatus = true)
      this.$emit('input', val)
    },
    formatValue (value) {
      value = value || ''
      let input = this.$refs.ipt
      input && (input.value = value)
      return value
    },
    reset () {
      if (this.resetNo) return
      let _type = Object.prototype.toString.call(this.cloneValue)
      this.validatorStatus = false
      this.check = false
      switch (_type) {
        case '[object String]':
          this.cloneValue = ''
          break
        case '[object Date]':
          this.cloneValue = ''
          break
        case '[object Number]':
          this.cloneValue = ''
          break
        case '[object Array]':
          this.cloneValue = []
          break
        case '[object Object]':
          this.cloneValue = null
          break
      }
    },
    validator (type, value) {
      value = Object.prototype.toString.call(value) === '[object Undefined]' ? '' : value
      value = Object.prototype.toString.call(value) === '[object Array]' ? value.length > 0 ? value : '' : value
      if (checkType(type) === '[object RegExp]') {
        return type.test(value) ? '' : `请输入正确的${this.label || '数据'}`
      }
      if (checkType(type) === '[object Function]') {
        return type(value) ? '' : `请输入正确的${this.label || '数据'}`
      }
      if (checkType(type) !== '[object String]') return
      let typeArr = type ? type.split(':') : this.input ? this.input.split(':') : []
      if (this.input && !value) return false
      switch (typeArr[0] || '') {
        case '':
          return value ? '' : typeArr[1] ? typeArr[1] : this.defaultAlert
        case 'isPhone':
          return ((value.length >= 11) || this.check) && (isPhone(value) ? '' : !value ? '请输入手机号' : typeArr[1] || '手机号格式不正确')
        case 'isInteger':
          return isInteger(value) ? '' : typeArr[1] || '请输入整数'
        case 'isMoney':
          return isMoney(value) ? '' : typeArr[1] || '请输入正确的金额'
        case 'isDouDecimal':
          return isDouDecimal(value) ? '' : typeArr[1] || '请输入两位小数'
        case 'email':
          return email(value) ? '' : typeArr[1] || '邮箱格式错误，请重新输入'
        case 'isEcpInteger':
          return isEcpInteger(value) ? '' : typeArr[1] || '请输入正整数'
        case 'isSpell':
          return isSpell(value) ? '' : typeArr[1] || '请输入拼音码'
      }
    },
    focus () {
      this.oldValue = this.cloneValue
    },
    blur () {
      (!this.cloneValue && (this.required === undefined)) && (this.cancelError = true)
      this.$emit('onBlur')
    },
    checkValue () {
      this.validatorStatus = true
      this.check = true
      return this.showError
    },
    checkErrorValue () {
      return this.cloneValue && this.showError
    },
    inputClick () {
      if (this.disabled) return
      this.$emit('click')
    },
    changeAppend (val) {
      this.$emit('append', val)
    }
  },
  computed: {
    num () {
      return (this.cloneValue && this.cloneValue.length) || 0
    },
    showError () {
      return this.mostError || ((this.validatorStatus || this.check) && ((this.required !== undefined) || this.input) && this.validator(this.required, this.cloneValue))
    },
    defaultAlert () {
      return this.alertMessage[this.type] ? this.alertMessage[this.type] + this.labelText : `请输入${this.labelText}`
    },
    labelText () {
      return this.label ? this.label.replace(/(：|:)/g, '') : '内容'
    }
  },
  created () {
  },
  mounted () {
    this.patterns = this.pattern ? this.pattern.split('|') : []
    this.formatValue(this.value)
  }
}
</script>

<style lang="scss">
  .nb-form-item-wrapper {
    .el-form-item__label {
      color: #666;
      font-weight: normal !important;
    }
    .editor-z-index {
      position: relative;
      z-index: 99;
    }
    .input-inner-select {
      width: 100px !important;
      input {
      }
    }
    .tips {
      font-size: 12px;
      line-height: 200%;
      position: relative;
    }

    .tips-text {
      position: absolute;
      left: 0;
      top: 0px;
      color: #999;
      font-size: 12px;
      font-weight: 200;
    }

    .value-num {
      text-align: right;
      position: absolute;
      right: 0;
      top: 0px;
    }

    .show-value {
      padding-left: 10px;
    }

    .flex-wrapper {
      display: flex;
      position: relative;
      line-height: 40px;
      textarea {
        min-height: 90px !important;
      }
      .el-input {
        flex: 1;
      }

      .right-box {
        height: 38px;
        top: 1px;
        position: absolute;
        right: 1px;
        line-height: 38px;
        background: white;
        border-radius: 0 4px 4px 0;
        z-index: 20;
      }

      .outter {

        .el-input__inner {
          border-right: none;
        }

        .el-input-group__append {
          background-color: #fff;
          border: 1px solid #f1f1f1;
          border-left: none;
          text-align: right;
          padding-right: 5px;
          color: rgb(52, 151, 255);
        }

      }
      .out-box {
        padding: 0 15px;
      }

      .out-box.cursor {
        cursor: pointer;
      }

      .el-select, .wangEditor {
        width: 100%;
      }

      .el-radio-group {
        /*height: 40px;*/
        line-height: 50px !important;
      }

      .click-input {
        cursor: pointer;
        -webkit-appearance: none;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;
        border: 1px solid #d8dce5;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #5a5e66;
        /*display: inline-block;*/
        font-size: inherit;
        min-height: 40px;
        line-height: 37px;
        outline: 0;
        padding: 0 15px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
        transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
        width: 100%;

        .el-tag {
          margin: 5px 5px 5px 0;
        }

      }
      .click-input.clickNone {
        background-color: #f5f7fa;
        border-color: #dfe4ed;
        color: #b4bccc;
        cursor: not-allowed;
      }

      .el-checkbox-group, .el-radio-group {
        display: flex;
        flex-wrap: wrap;
        padding: 0 10px;
        align-items: center;
        min-height: 40px;
        /*border: 1px solid red;*/
        /*border: 1px solid #f1f1f1;*/
        width: 100%;
        border-radius: 4px;

        label {
          line-height: 25px;
          margin: 0 5px;
        }

      }
      .editor-btn {
        text-align: center;
        color: #409eff;
        cursor: pointer;

        .el-icon-success {
          float: right;
          position: relative;
          top: 13px;
        }

      }

    }
    .el-form-item__error {
      height: 16px;
      overflow: hidden;
    }

    .error-enter, .error-leave-to {
      /*opacity: 0;*/
      height: 0;
    }

    .error-enter-active, .error-leave-active {
      transition: all 0.2s linear;
    }

    .el-form-item {
      /*width: 540px;*/
      /*flex: 0 0 540px;*/
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      padding: 0 20px;
    }

  }
</style>
