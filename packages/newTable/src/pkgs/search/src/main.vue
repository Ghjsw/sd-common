<template>
<div class="table-search-wrap">
    <el-button
        v-if="saveTableConfig"
        icon="el-icon-setting"
        class="table-search-edit"
        type="primary"
        @click.stop="editOpen"
        />
  <el-form
    v-if="isNotEmptyParams && reLoad"
    ref="form"
    :model="params"
    :inline="inline"
    class="new-table-form"
    :class="{isCollapse : isCollapse}"
    :label-width="labelWidth ? labelWidth + 'px' : ''"
    label-position='right'
    v-loading="loading"
    @submit.native.prevent="searchHandler()"
  >
    <slot name="form-pre" />
    <!-- {{$slots}} -->
    <transition-group name="list">
    <el-form-item
      v-for="(form, index) in defaultForms"
      v-show="!collapse || (isCollapse && index < 7) || (!isCollapse)"
      :key="index"
      :prop="(form.itemType != 'daterange' && form.itemType != 'daterangeFlat' && form.itemType != 'datetimerange') ? form.prop : datePrefix + index"
      :label="form.label"
      :rules="form.rules || []"
      :label-width="form.labelWidth ? form.labelWidth + 'px' : ''"
      :class="{
        'radio-warp': ['radio', 'daterangeFlat'].includes(form.itemType),
        'focus':formItemsStateList[index]
      }"
    >
      <label v-if="form.labelContent" slot="label" >
        {{ form.label }}
        <el-tooltip style="display: inline-block;cursor: pointer" effect="dark" :content="form.labelContent" placement="top">
          <i class="el-icon-question" />
        </el-tooltip>
      </label>
      <slot v-if="form.slotName" :name="form.slotName" />
      <el-input
        v-else-if="form.itemType === 'input' || form.itemType === undefined"
        v-model.trim="params[form.modelValue]"
        :size="form.size ? form.size : size"
        :readonly="form.readonly"
        :disabled="form.disabled"
        :maxlength="form.maxlength || 50"
        :placeholder="form.placeholder || '请输入'"
        :trigger-on-focus="false"
        :style="itemStyleList[index]"
        clearable
        @focus="handleFocus($event,index)"
        @blur="handleBlur($event,index,form)"
        @clear="handleClear($event,index)"
        @mouseover.native="handleMouseOver($event,index)"
        @mouseout.native="handleMouseOut($event,index)"
      />
      <el-input
        v-else-if="form.itemType === 'inputPreSelect'"
        v-model.trim="params[form.modelValue]"
        :size="form.size ? form.size : size"
        :readonly="form.readonly"
        :disabled="form.disabled"
        :maxlength="form.maxlength || 50"
        :placeholder="form.placeholder || '请输入'"
        clearable
      >
        <el-select slot="prepend" v-model="params[form.selectProp]" placeholder="请选择" class="input-select-pre">
          <el-option
            v-for="(option, optionIndex) in form.options"
            :key="optionIndex + '_local'"
            :value="
              typeof option === 'object'
                ? option[form.valueKey || 'value']
                : option
            "
            :label="
              typeof option === 'object'
                ? option[form.labelKey || 'label']
                : option
            "
          />
<!--          <el-option-->
<!--            v-for="(op, opIndex) in selectOptions[selectOptionPrefix + index]"-->
<!--            :key="opIndex + '_remote'"-->
<!--            :value="typeof op === 'object' ? op[form.valueKey || 'value'] : op"-->
<!--            :label="typeof op === 'object' ? op[form.labelKey || 'label'] : op"-->
<!--          />-->
        </el-select>
      </el-input>

      <el-radio-group  v-model="params[form.modelValue]" v-if="form.itemType === 'radio'" @change="selectChange">
         <el-radio-button
              v-for="(option, optionIndex) in form.options"
                      :label="typeof option === 'object'
                        ? option[form.valueKey || 'value']
                          : option"
                      :key="optionIndex + '_local'">
             {{typeof option === 'object' ? option[form.labelKey || 'label'] : option}}
          </el-radio-button>
          <el-radio-button
              v-for="(option, optionIndex) in selectOptions[selectOptionPrefix + index]"
                      :label="typeof option === 'object'
                        ? option[form.valueKey || 'value']
                          : option"
                      :name="typeof option === 'object'
                        ? option[form.labelKey || 'value']
                          : option"
                      :key="optionIndex + '_local'">
            {{typeof option === 'object' ? option[form.labelKey || 'value'] : option}}
          </el-radio-button>
      </el-radio-group >
      <el-cascader
          :ref="form.ref"
          v-if="form.itemType === 'cascaderOrg'"
          v-model="params[form.modelValue]"
          :disabled="form.disabled"
          filterable
          :options="selectOptions[selectOptionPrefix + index]"
          :props="form.itemProps"
          clearable
          @change="selectChange(form.ref)"
          :filter-method="dataFilter"
          @clearCheckedNodes="selectChange(form.ref)"
      />
      <el-select
        v-else-if="form.itemType === 'select'"
        v-model.lazy="params[form.modelValue]"
        :filterable="form.filterable"
        :remote="form.remote"
        :remote-method="form.remoteMethod"
        :popper-append-to-body="false"
        :filter-method="form.selectRemoteMethod"
        :size="form.size ? form.size : size"
        :disabled="form.disabled"
        :placeholder="form.placeholder"
        :multiple="form.multiple"
        :clearable="form.clearable"
        :loading="form.loading"
        collapse-tags
        :style="itemStyleList[index]"
        @change="selectChange($event, index, form)"
        @focus="handleFocus($event,index)"
        @blur="handleBlur($event,index,form)"
        @clear="handleClear($event,index)"
        @mouseover.native="handleMouseOver($event,index)"
        @mouseout.native="handleMouseOut($event,index)"
        :ref="`selectItemRefs${index}`"
      >
        <el-option
          v-for="(option, optionIndex) in form.options"
          :key="optionIndex + '_local'"
          :value="
            typeof option === 'object'
              ? option[form.valueKey || 'value']
              : option
          "
          :label="
            typeof option === 'object'
              ? option[form.labelKey || 'label']
              : option
          "
        />
        <el-option
          v-for="(op, opIndex) in selectOptions[selectOptionPrefix + index]"
          :key="opIndex + '_remote'"
          :value="typeof op === 'object' ? op[form.valueKey || 'value'] : op"
          :label="typeof op === 'object' ? op[form.labelKey || 'label'] : op"
        />
      </el-select>
      <el-cascader
        v-else-if="form.itemType === 'cascader' && form.selectFetch"
        v-model="params[form.modelValue]"
        :filterable="form.filterable"
        :clearable="form.clearable || true"
        :size="form.size ? form.size : size"
        :disabled="form.disabled"
        :placeholder="form.placeholder"
        collapse-tags

        :options="selectOptions[selectOptionPrefix + index]"
        :props="{
          expandTrigger: form.trigger||'hover' ,
          value:[form.valueKey || 'value'],
          label:[form.labelKey || 'label'],
          children:[form.children || 'children'],
          checkStrictly:form.checkStrictly||false
        }"
        @change="selectChange"
      />
      <el-date-picker
        v-else-if="form.itemType === 'date'"
        v-model="params[form.modelValue]"
        type="date"
        :placeholder="form.placeholder"
        :size="form.size ? form.size : size"
        :disabled="form.disabled"
        :readonly="form.readonly"
        :value-format="form.valueFormat"
        :editable="form.editable"

        :picker-options="form.pickerOptions || {}"
        @change="selectChange"
      />
      <!--daterangeFlat-->
      <div v-else-if="form.itemType === 'daterangeFlat'">
        <el-radio-group v-model="params[form.prop[2]]" @change="date => onChangeTimeRadio(date, form.prop[0], form.prop[1],form.modelValue)">
          <el-radio-button v-for="(item, index) in  form.timeRadioList" :key="index" :label="item.label">{{item.name}}</el-radio-button>
        </el-radio-group >
        <el-date-picker
            v-model="params[form.modelValue]"
            :size="form.size ? form.size : size"
            type="daterange"
            :disabled="form.disabled"
            :readonly="form.readonly"
            :editable="form.editable"
            :placeholder="form.placeholder"
            :start-placeholder="form.startPlaceholder || '开始时间'"
            :end-placeholder="form.endPlaceholder || '结束时间'"

            :picker-options="form.pickerOptions || {}"
            @change="date => changeDate(date, form.prop[0], form.prop[1],form.prop)"
        >
        </el-date-picker>
      </div>
      <el-date-picker
          v-else-if="form.itemType === 'daterange'"
          v-model="params[form.modelValue]"
          :ref='form.ref || null'
          :size="form.size ? form.size : size"
          type="daterange"
          :disabled="form.disabled"
          :readonly="form.readonly"
          range-separator="~"
          :clearable="form.clearable !== 'undefined' ? form.clearable: true"
          :editable="form.editable"
          :placeholder="form.placeholder"
          :start-placeholder="form.startPlaceholder || '开始时间'"
          :end-placeholder="form.endPlaceholder || '结束时间'"
          @focus="handleFocus($event,index)"
          @blur="handleBlur($event,index)"
          @clear="handleClear($event,index)"
          @mouseover.native="handleMouseOver($event,index)"
          @mouseout.native="handleMouseOut($event,index)"
          :picker-options="form.pickerOptions || {}"
          @change="date => changeDate(date, form.prop[0], form.prop[1])"
      />
      <el-date-picker
          v-else-if="form.itemType === 'datetimerange'"
          v-model="params[form.modelValue]"
          :ref='form.ref || null'
          :size="form.size ? form.size : size"
          type="datetimerange"
          :disabled="form.disabled"
          :readonly="form.readonly"
          :editable="form.editable"
          :placeholder="form.placeholder"
          :default-time="['00:00:00','23:59:59']"
          :range-separator="form.rangeSeparator || '-'"
          :start-placeholder="form.startPlaceholder || '开始时间'"
          :end-placeholder="form.endPlaceholder || '结束时间'"

          :picker-options="form.pickerOptions || {
            disabledDate(time) {
              return time.getTime() > new Date().setHours(23, 59, 59, 59);
            },
          }"
          :rules="form.rules || []"
          @change="date => changeTimeDate(date, form.prop[0], form.prop[1])"
      />
    </el-form-item>
    </transition-group>
    <div class="search-bar-btns">
      <el-form-item label="">
        <el-button
          class="search-btn"
          type="primary"
          size="mini"
          :loading="submitLoading"
          v-on="{...$listeners, click:()=>searchHandler()}"
        >
          {{ submitBtnText }}
        </el-button>
        <el-button
          v-if="showResetBtn"
          size="mini"
          type="text"
          :loading="submitLoading"
          @click="resetForm"
        >
          {{ resetBtnText }}
        </el-button>
         <el-button
          v-if="collapse"
          size="mini"
          type="text"
          @click="isCollapse = !isCollapse"
          class="collapse-btn"
        >
          {{collapseText}}
          <!-- <i class="el-icon--right" :class="isCollapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i> -->
         </el-button>
        <slot name="btn" />
      </el-form-item>
    </div>
    <div style="clear: both" />
    <el-dialog
      title="自定义显示筛选项"
      :lock-scroll="false"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      @close="dialogClose"
    >
      <div class="edit-forms-dialog">
        <el-card class="box-card">
          <el-checkbox-group v-model="checkedForms" class="edit-forms-dialog_check">
              <el-checkbox v-for="item in forms.filter(i => i.label)" :label="item.label" :key="item.label"  border size="small">{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button
          type="primary"
          @click="dialogSubmit"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </el-form>
</div>

</template>

<script>
import { formProps } from './props';
import { cloneDeep } from 'lodash';
import utils from '../../../utils/utils.js';
import moment from 'moment';

const INPUT_MAX_WIDTH = 160;

export default {
  name: 'ElSearchForm',
  props: formProps,
  data() {
    const {
      params,
      datePrefix,
      selectOptionPrefix,
      dataObj,
      format,
      fuzzyOps,
      defaultForms
    } = this.init();
    const formItemsStateList = defaultForms.map(n => false);

    const inputsWidth = defaultForms.map((form, index) => {
      if (['select', 'input', 'daterange', undefined].includes(form.itemType)) {
        return this.getInputWidth('init', { form });
      } else {
        return 0;
      }
    });
    return {
      inputsWidth,
      formItemsStateList, // 各个表单状态
      params,
      datePrefix,
      selectOptionPrefix,
      ...dataObj,
      format,
      fuzzyOps,
      dialogVisible: false,
      checkedForms: [],
      defaultForms,
      reLoad: true,
      loading: !!this.formsConfig.length,
      isCollapse: true
      // inputWidth: defaultForms.placeholder
    };
  },
  computed: {
    itemStyleList() {
      const widthList = this.inputsWidth.map((value, index) => {
        return { width: value > 0 ? `${value}px` : '' };
      });
      return widthList;
    },
    isNotEmptyParams() {
      return true;
    },
    collapseText() {
      return this.isCollapse ? '展开' : '收起';
    }
  },
  mounted() {
    this.enterKeyup();
    this.$once('hook:beforeDestory', () => {
      this.enterKeyupDestroyed();
    });
  },
  watch: {
    formsConfig: {
      handler(n, o) {
        if (Array.isArray(this.formsConfig) && this.formsConfig.length) {
          if (this.formsChangeListener) {
            this.checkedForms = [...this.formsConfig];
          } else {
            !this.checkedForms.length && (this.checkedForms = [...this.formsConfig]);
          }
          this.setFormsConfig();
          this.$nextTick(() => {
            this.loading = false;
          });
        }
      },
      immediate: true
    },
    forms: {
      handler() {
        const {
          params,
          datePrefix,
          selectOptionPrefix,
          dataObj,
          format,
          fuzzyOps,
          defaultForms
        } = this.init();
        this.$data.params = { ...params, ...this.$data.params };
        this.$data.datePrefix = datePrefix;
        this.$data.selectOptionPrefix = selectOptionPrefix;
        this.$data.format = format;
        this.$data.fuzzyOps = fuzzyOps;
        this.$data.selectOptions = dataObj.selectOptions;
        this.$data.defaultForms = defaultForms;
      },
      deep: true
    }
  },
  methods: {
    init(list = []) {
      const { forms, fuzzy } = this.$props;
      const datePrefix = 'daterange-prefix';
      const selectOptionPrefix = 'select-option-prefix';
      const dataObj = {
        selectOptions: {}
      };
      let defaultForms = [];

      const params = {};
      const format = {};
      const fuzzyOps = {};
      defaultForms = cloneDeep(Array.isArray(list) && list.length ? list : forms);
      defaultForms = defaultForms.filter(item => {
        return !item.permit || !!this.permits[item.permit];
      });
      defaultForms.forEach(async(v, i) => {
        const propType = typeof v.prop;
        if (propType === 'string') {
          v.modelValue = v.prop;
          params[v.prop] = '';

          fuzzyOps[v.prop] = v.fuzzy ? v.fuzzy : fuzzy;
          if (v.format) {
            format[v.prop] = v.format;
          }
        } else if (propType === 'object' && Object.prototype.toString.call(v.prop) === '[object Array]') {
          v.prop.forEach(vv => {
            params[vv] = '';
            if (v.format) {
              format[vv] = v.format;
            }

            fuzzyOps[vv] = v.fuzzy ? v.fuzzy : fuzzy;
          });
        }
        // if (v.itemType === 'daterange') {
        //   params[datePrefix + i] = '';
        //   v.modelValue = datePrefix + i;
        // }
        if (['daterange', 'datetimerange'].includes(v.itemType)) {
          const val = v.defaultValue || [];
          const prop = v.prop || [];
          const [start, end] = prop;
          params[datePrefix + i] = val;
          params[start] = val[0];
          params[end] = val[1];
          v.modelValue = datePrefix + i;
        }
        if (v.itemType === 'inputPreSelect') {
          params[v.selectProp] = v.options[0].value;
        }
        if (v.itemType === 'daterangeFlat') {
          // 如果有defaultValue,修改默认值
          const target = v.timeRadioList.find((v) => v.defaultValue);
          if (target) {
            params[v.prop[2]] = target['label'];
          } else {
            params[v.prop[2]] = 'all';
          }
        }
        if (v.itemType === 'daterangeFlat') {
          const target = v.timeRadioList.find((v) => v.defaultValue);
          if (target) {
            const val = v.defaultValue || [];
            const prop = v.prop || [];
            const [start, end] = prop;
            params[datePrefix + i] = val;
            params[start] = val[0];
            params[end] = val[1];
          } else {
            params[datePrefix + i] = '';
          }
          v.modelValue = datePrefix + i;
        }
        if (['select', 'radio', 'cascader', 'cascaderOrg'].includes(v.itemType) && (v.selectFetch || v.selectUrl)) {
          const dataKey = selectOptionPrefix + i;
          dataObj.selectOptions[dataKey] = [];
          const { $axios } = this;
          if (!v.selectMethod) {
            v.selectMethod = 'get';
          }
          await this.getRemoteData({
            fetch: v.selectFetch ? v.selectFetch : () => {
              return $axios[v.selectMethod](v.selectUrl, v.selectMethod.toLowerCase() === 'get'
                ? { params: v.selectParams } : v.selectParams);
            },
            dataKey,
            resultField: v.selectResultField || 'result',
            resultHandler: v.selectResultHandler
          });
        }
        if (v.itemType === 'select') {
          const value = v.defaultValue || '';
          params[v.prop] = value;
        }
      });
      return {
        params,
        datePrefix,
        selectOptionPrefix,
        dataObj,
        format,
        fuzzyOps,
        defaultForms
      };
    },
    dialogClose() {
      this.checkedForms = this.defaultForms.map(i => i.label);
      this.dialogVisible = false;
    },
    /**
     * @description:修改筛选项提交
     * @param {*}
     * @return {*}
     */
    dialogSubmit() {
      this.setFormsConfig();
      this.updateTableConfig(JSON.stringify(this.checkedForms));
      this.dialogVisible = false;
    },
    setFormsConfig() {
      if (!this.checkedForms.length) {
        this.reLoad = false;
        this.$nextTick(() => {
          this.reLoad = true;
        });
      } else {
        this.defaultForms = this.forms.filter(i => this.checkedForms.includes(i.label));
        const {
          params,
          datePrefix,
          selectOptionPrefix,
          dataObj,
          format,
          fuzzyOps,
          defaultForms
        } = this.init(this.defaultForms);
        this.$data.params = params;
        this.$data.datePrefix = datePrefix;
        this.$data.selectOptionPrefix = selectOptionPrefix;
        this.$data.format = format;
        this.$data.fuzzyOps = fuzzyOps;
        this.$data.selectOptions = dataObj.selectOptions;
        this.$data.defaultForms = defaultForms;
        this.reLoad = false;
        this.$nextTick(() => {
          this.reLoad = true;
        });
      };
    },
    async updateTableConfig(params) {
      try {
        if (!this.setConfig) throw new Error('请传入表格配置方法 =>setConfig');
        await this.setConfig(params, 'formsConfig', this.saveTableConfig);
      } catch (error) {
        throw new Error(error);
      }
    },
    editOpen() {
      this.dialogVisible = true;
    },
    enterKey(event) {
      const code = event.keyCode;
      if (+code === 13) {
        this.searchHandler();
      }
    },
    // 树模糊搜索大小写不敏感
    dataFilter(node, val) {
      if (node.text.toUpperCase().indexOf(val.toUpperCase()) !== -1) {
        return true;
      }
    },
    selectChange(e, index) {
      this.searchHandler(e);
      // element select的blur有bug，必须手动找input触发原生blur
      setTimeout(() => {
        const inputs = document.body.querySelectorAll('form .el-select input.el-input__inner');
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].blur();
        }
      }, 0);
    },
    enterKeyupDestroyed() {
      this.$el.removeEventListener('keyup', this.enterKey);
    },
    enterKeyup() {
      this.$el.addEventListener('keyup', this.enterKey);
    },
    isArray(value) {
      return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]';
    },
    searchHandler(e) {
      let result;
      this.getParams((error, params) => {
        if (error) return;
        const { submitHandler } = this;
        if (submitHandler) {
          const obj = utils.trimObj(params);
          e && this.$nextTick(() => {
            const item = this.$refs[e] && this.$refs[e][0] && this.$refs[e][0].getCheckedNodes();
            this.$emit('cascaderOrg', item);
          });
          this.$emit('searchFormChange', { ...obj });
          submitHandler(obj);
          result = { ...obj };
        } else {
          throw new Error('Need to set attribute: submitHandler !');
        }
      });
      return result;
    },
    getParamFuzzy() {
      return this.fuzzyOps;
    },
    getParams(callback) {
      this.$nextTick(() => {
        if (this.$refs['form']) {
          this.$refs['form'].validate(valid => {
            if (valid) {
              const { params, datePrefix, format } = this;
              const formattedForm = {};
              Object.keys(params).forEach(v => {
                if (v.indexOf(datePrefix) === -1) {
                  formattedForm[v] = format[v] ? format[v](params[v], v) : params[v];
                }
              });
              const { customerSelectSearch, customerSelected } = formattedForm;
              if (!customerSelectSearch) {
                Reflect.deleteProperty(formattedForm, 'customerSelected');
              } else {
                formattedForm[customerSelected] = customerSelectSearch;
                Reflect.deleteProperty(formattedForm, 'customerSelectSearch');
                Reflect.deleteProperty(formattedForm, 'customerSelected');
              }
              if (callback) callback(null, formattedForm);
            } else {
              if (callback) callback(new Error());
            }
          });
        }
      });
    },
    resetForm() {
      this.$refs['form'].resetFields();
      Object.keys(this.params).forEach(item => {
        if (item.endsWith('Date')) {
          item.endsWith('Date') && (this.params[item] = '');
        } else if (item.startsWith('createTime')) {
          item.startsWith('createTime') && (this.params[item] = '');
        } else if (item.endsWith('TimeRadio')) {
          this.params[item] = ('all' || 'empty');
          // 重置清空默认值
          Object.keys(this.params).filter(key => key.includes('daterange-prefix')).map((v) => {
            this.params[v] = '';
          });
        } else {
          item.endsWith('Time') && (this.params[item] = '');
        }
      });
      // 设置datetimerange类型的默认值
      // 后续如果有其他类型也可以补充
      this.forms.map((item) => {
        const prop = item.prop;
        const defaultValue = item.defaultValue;
        if (['daterange', 'datetimerange'].includes(item.itemType) && prop && prop.length && defaultValue && defaultValue.length) {
          this.params[prop[0]] = defaultValue[0];
          this.params[prop[1]] = defaultValue[1];
        }
      });
      const { resetBtnCallback, beforeResetBtn } = this;
      if (this.beforeResetBtn) beforeResetBtn();
      if (resetBtnCallback) resetBtnCallback();
      this.searchHandler();
    },
    changeDate(date, startDate, endDate, props) {
      let dates;
      if (date === null) {
        this.params[startDate] = '';
        this.params[endDate] = '';
        return;
      }
      if (date === 'empty') {
        this.params[startDate] = '2000-01-01 00:00:00';
        this.params[endDate] = '2000-01-01 00:00:00';
        return;
      }
      if (props && Array.isArray(props) && this.params[props[2]] === 'all') {
        this.params[props[2]] = '';
      }
      if (props && Array.isArray(props)) {
        this.params[props[2]] = '';
      }
      if (typeof date === 'string') {
        dates = date.split(' - ');
        // eslint-disable-next-line
      } else if (date && date.hasOwnProperty('length')) {
        const firstDate = date[0];
        const secondDate = date[1];
        dates = [
          `${firstDate.getFullYear()}-${('0' + (firstDate.getMonth() + 1)).substr(-2)}-${('0' + firstDate.getDate()).substr(-2)}`,
          `${secondDate.getFullYear()}-${('0' + (secondDate.getMonth() + 1)).substr(-2)}-${('0' + secondDate.getDate()).substr(-2)}`
        ];
      }
      this.params[startDate] = dates[0] + ' 00:00:00';
      this.params[endDate] = dates[1] + ' 23:59:59';
      this.selectChange();
    },
    changeTimeDate(date, startDate, endDate) {
      let dates;
      if (date === null) {
        this.params[startDate] = '';
        this.params[endDate] = '';
        return;
      }
      if (typeof date === 'string') {
        dates = date.split(' - ');
        // eslint-disable-next-line
      } else if (date && date.hasOwnProperty('length')){
        dates = [
          utils.formatDate(date[0], null, true),
          utils.formatDate(date[1], null, true)
        ];
      }
      this.params[startDate] = dates[0];
      this.params[endDate] = dates[1];
      this.selectChange();
    },
    // 点击时间快捷选择器
    onChangeTimeRadio(v, prop1, prop2, key) {
      if (v === 'all') {
        this.changeDate(null, prop1, prop2);
        this.params[key] = [];
        this.searchHandler();
      }
      if (v === 'empty') {
        this.changeDate('empty', prop1, prop2);
        this.params[key] = [];
        this.searchHandler();
      }
      if (v === 'today') {
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 0);
        this.changeDate([start, start], prop1, prop2);
        this.params[key] = [start, start];
      }
      // 昨天
      if (v === 'yesterday') {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
        end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      //  明日
      if (v === 'Tomorrow') {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() + 3600 * 1000 * 24 * 1);
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 1);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 未来3天
      if (v === 'nextThreeDays') {
        const end = new Date();
        const start = new Date();
        end.setTime(start.getTime() + 3600 * 1000 * 24 * 3);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 未来7天
      if (v === 'nextSevenDay') {
        const end = new Date();
        const start = new Date();
        end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 最近三天
      if (v === 'lastThreeDay') {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 最近7天
      if (v === 'lastSevenDay') {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 本周
      if (v === 'week') {
        const start = new Date();
        const end = new Date();
        const nows = start.getDay() || 7; // 注意周日算第一天，如果周日查询本周的话，天数是0，所有如果是0，默认设置为7
        start.setTime(start.getTime() - 3600 * 1000 * 24 * ((nows - 1)));
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 上周
      if (v === 'lastWeek') {
        const dataValue = new Date();
        const year = dataValue.getFullYear();
        const month = dataValue.getMonth() + 1;
        const day = dataValue.getDate();
        let thisWeekStart; // 本周周一的时间
        if (dataValue.getDay() === 0) {
          // 周天的情况；
          thisWeekStart =
              new Date(year + '/' + month + '/' + day).getTime() -
              (dataValue.getDay() + 6) * 86400000;
        } else {
          thisWeekStart =
              new Date(year + '/' + month + '/' + day).getTime() -
              (dataValue.getDay() - 1) * 86400000;
        }
        const prevWeekStart = thisWeekStart - 7 * 86400000; // 上周周一的时间
        const prevWeekEnd = thisWeekStart - 1 * 86400000; // 上周周日的时间
        const start = new Date(prevWeekStart); // 开始时间
        const end = new Date(prevWeekEnd); // 结束时间
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 本月
      if (v === 'month') {
        const end = new Date();
        const start = new Date();
        start.setDate(1);
        this.changeDate([start, end], prop1, prop2);
        this.params[key] = [start, end];
      }
      // 上月
      if (v === 'lastMonth') {
        const startDate = moment().month(moment().month() - 1).startOf('month').format();
        const endDate = moment().month(moment().month() - 1).endOf('month').format();
        this.changeDate([new Date(startDate), new Date(endDate)], prop1, prop2);
        this.params[key] = [new Date(startDate), new Date(endDate)];
      }
    },
    getRemoteData({ fetch, dataKey, resultField, resultHandler }) {
      return new Promise(resolve => {
        fetch().then(response => {
          let result = response;
          if (typeof response === 'object' && !this.isArray(response)) {
            if (resultField.indexOf('.') !== -1) {
              resultField.split('.').forEach(vv => {
                result = result[vv];
              });
            } else {
              result = response[resultField];
            }
          }
          if (!result || !(result instanceof Array)) {
            console.warn(`The result of key:${resultField} is not Array. 接口返回的字段:${resultField} 不是一个数组`);
          }

          if (resultHandler) {
            this.selectOptions[dataKey] = result.map(resultHandler);
          } else {
            this.selectOptions[dataKey] = result;
          }
          resolve(this.selectOptions[dataKey]);
        });
      });
    },
    handleMouseOver(e, index) {
      this.$set(this.formItemsStateList, index, true);
    },
    handleMouseOut(e, index) {
      console.log(e);
      if (e.target !== document.activeElement) {
        this.$set(this.formItemsStateList, index, false);
      }
    },
    handleFocus(e, index) {
      this.$set(this.formItemsStateList, index, true);
      if (e && e.target) {
        const { width } = e.target.getBoundingClientRect();
        if (['input', undefined].includes(this.defaultForms[index].itemType) && width < 230) {
          this.$set(this.inputsWidth, index, INPUT_MAX_WIDTH);
        }
      }
    },
    handleBlur(e, index) {
      console.log(e);
      if (e._isVue) return;
      const that = this;
      const target = e.target;
      setTimeout(() => {
        that.$set(this.formItemsStateList, index, false);
        const newWidth = that.getInputWidth('blur', { value: target.value, form: that.defaultForms[index] });
        const value = target.value;
        if (!value) {
          that.$set(that.inputsWidth, index, newWidth + 14);
        } else {
          that.$set(that.inputsWidth, index, Math.min(newWidth, INPUT_MAX_WIDTH));
        }
      }, 100);
    },
    handleClear(e, index) {
      const newWidth = this.getInputWidth('clear', { form: this.defaultForms[index] });
      this.$set(this.inputsWidth, index, newWidth);
    },
    // 设置input框宽度，第二参数：0 初始宽度取placeholder 1 blur时取输入文本宽度，若无内容取placeholder宽度 2 返回最大宽度
    getInputWidth(action, params) {
      try {
        const { form } = params;
        if (action === 'init') {
          const w = this.getTextWidth(params.value || form.placeholder || '请输入');
          return w + 26;
        } else if (action === 'clear') {
          const w = this.getTextWidth(form.placeholder || '请输入');
          return w + 26;
        } else if (action === 'blur') {
          const w = this.getTextWidth(params.value || form.placeholder || '请输入');
          const { value } = params;
          return w + (value.length ? 26 : 0);
        }
      } catch (e) {
        console.log(e);
      }
    },
    getTextWidth(text) {
      const fakeEl = document.createElement('span');
      fakeEl.style.visibility = 'hidden';
      fakeEl.innerHTML = text;
      document.body.appendChild(fakeEl);
      const { width } = fakeEl.getBoundingClientRect();
      document.body.removeChild(fakeEl);
      return width;
    }
  }
};
</script>
<style lang="less" scoped>
.new-search-table-pagination .table-search-wrap{
  padding-left: 16px;
}
.table-search-wrap {
  position: relative;
  .table-search-edit {
    padding: 0 10px !important;
    position: absolute;
    right: 0;
    top: 0;
  }
.list-enter-active, .list-leave-active {
    transition: all .4s;
  }
  .list-enter, .list-leave-to{
    opacity: 0;
    transform: translateY(10px);
  }
  .search-bar-form {
    position: relative;
  }
}
.edit-forms-dialog {
    .edit-forms-dialog_check {
      .el-checkbox {
        margin-left: 0;
        margin-bottom: 6px;
      }
      .el-checkbox.is-bordered + .el-checkbox.is-bordered {
        margin-left: 0;
      }
    }
  }
.search-bar-btns {
  display: inline-block;
  .el-button {
    font-size: 14px;
  }
  .search-btn {
    color: #FEA13A;
    background-color: #fff;
    border-color: #FEA13A;
  }
  .search-btn:hover {
    color: #fff;
    background-color: #FEA13A;
    border-color: #FEA13A;
  }
  .el-form-item__content {
    text-align: right;
    justify-content: flex-end;
  }
}
.input-select-pre {
  width: 90px !important;
}
.radio-warp{
  display: flex !important;
  flex-wrap: wrap ;
  width: inherit !important;
  max-width: inherit !important;
   .el-radio-button__inner{
    border: 0;
    padding: 0px;
    margin: 6px 10px;
    font-weight: 400;
  }
  .el-radio-button:first-child .el-radio-button__inner{
    border-left: 0;
  }
  .el-radio-button {
    margin: 4px;
    border: 1px solid transparent;
  }
  .el-radio-group .el-radio-button .el-radio-button__inner{
    color: #687281 !important;
  }
  .el-radio-group .is-active .el-radio-button__inner{
    color: #FF8600 !important;
    font-weight: 400;
  }
   .el-form-item__label{
    color: #687281 !important;
    font-size: 14px !important;
    width: 104px !important;
  }
   .el-form-item__content {
    width: calc(100% - 130px) !important;
  }
   .el-radio-button.is-checked .el-radio-button__inner{
    border: 1px solid #FFEDD8;
    color: #FF8600;
    box-shadow: 0 0;
  }
  .el-radio-button__inner{
    background: transparent;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner{
    background: #FFF6EB;
    box-shadow: -1px 0 0 0 transparent;
  }
  .is-active {
    background: #FFF6EB;
    border: 1px solid #FFEDD8;
    border-radius: 3px !important;
  }
}

@input-bg:#EBEEF0;
/deep/ .new-table-form{
  .el-form-item {
    padding:0px 0 0 4px;
    margin-bottom: 3px;
    border-radius: 3px;
    .el-form-item__label{
      padding:0px 6px 0px 4px;
    }
    &.focus{
      background: @input-bg;
      input{
           background: @input-bg;
      }
      .el-select,.el-input{
        //  transition: width 0.8s;
         background: @input-bg;
         input{
           background: @input-bg;
         }
      }
      .el-date-editor,el-range-editor {
          background: @input-bg;
      }

    }
    .el-select,.el-input{
      background:transparent;
      transition: width 0.3s;
      border-radius: 3px;
      input{
        border:none !important;
        padding-left:0px;
        padding-right:20px;
        border-radius: 3px;
      }

    }
    .el-input, .el-select {
        .el-input__suffix {
            right: 0px;
        }
    }
    .el-date-editor,el-range-editor {
        border: none !important;
        width: 200px;
        padding: 0px;
        .el-icon-date {
            display: none;
        }
        .el-range-separator {
            padding: 0px;
            line-height: 32px;
        }
        input {
            border: none !important;
            width: 90px;
        }
        .el-input__icon.el-range__close-icon{
          right: 5px;
          bottom: 0px;
          position: relative;
          line-height: 32px !important;
        }
    }
  }
  // codesign
  /deep/.el-form-item{
  margin:6px 16px;
  height:28px;
  padding:4px !important;
  font-size: 14px;
  .el-form-item__content,
  .el-input, .el-input__inner{
    height:20px;
    line-height: 20px;;
  }
  .el-form-item__label{
    height:20px;
    line-height: 16px;
  }

   .el-date-editor,el-range-editor{
      .el-range-separator {
        padding: 0px;
        line-height: 20px;
      }
   }
  .el-button{
    padding: 7px 12px !important;
    height: auto;
    font-size: 13px;
   }
}
/deep/.search-bar-btns .el-form-item{
   padding:0px !important;
//    .el-button{
//      padding: 7px 12px!important;;
//      height:28px;
//      font-size: 12px;
//      letter-spacing: 0;
//      line-height: 14px;
//    }
}
}

</style>

