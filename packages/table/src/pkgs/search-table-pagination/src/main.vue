<template>
  <div class="search-table-pagination">
    <slot name="before-header"></slot>
    <transition v-if="flags.searchShow" name="el-zoom-in-top">
      <search-form
        v-if="formOptions && formOptions.forms && formOptions.forms.length && showData"
        ref="searchForm"
        :forms="formOptions.forms"
        :size="formOptions.size"
        :fuzzy="formOptions.fuzzy"
        :inline="formOptions.inline"
        :label-width="formOptions.labelWidth"
        :item-width="formOptions.itemWidth"
        :submit-handler="parentSearchHandler"
        :submit-loading="loading"
        :show-reset-btn="formOptions.showResetBtn"
        :show-submit-btn="formOptions.showSubmitBtn"
        :submit-btn-text="formOptions.submitBtnText"
        :reset-btn-text="formOptions.resetBtnText"
        v-bind="$attrs"
        :before-reset-btn="formOptions.beforeResetBtn"
        :reset-btn-callback="formOptions.resetBtnCallback"
        v-on="$listeners"
        :saveTableConfig="saveTableConfig"
        :formsConfig.sync="formsConfig"
        :permits="permits"
        :setConfig="setConfig"
        :collapse="formOptions.collapse"
      >
        <span slot="btn" slot-scope="{ node }">
          <slot name="btn" :node="node" />
        </span>
        <slot name="form-pre" />
        <div
          v-for="item in formOptionsSlots"
          :key="item.slotName"
          :slot="item.slotName"
        >
          <slot :name="item.slotName" />
        </div>
      </search-form>
    </transition>
    <slot name="info-card" :loading="loading" />
    <div v-if="showRightControlBtns" style="position: relative">
      <div style="display: inline-block; float: right; line-height: 36px">
        <span>右侧操作按钮:</span>
        <span class="control-btn" @click.stop="searchControlChange">{{
          texts.searchControl
        }}</span>
      </div>
      <slot name="form" :loading="loading" :search="parentSearchHandler" />
      <div v-if="showRefreshIcon" class="edit-table-columns" style="margin-left: 10px;">
        <el-button
          icon="el-icon-refresh"
          type="primary"
          @click="fetchHandler()"
        />
      </div>
    </div>
    <div v-else style="position: relative" class="table-form-container">
      <slot name="form" :loading="loading" :search="parentSearchHandler" />
      <div v-if="saveTableConfig" class="edit-table-columns">
        <el-button
          icon="el-icon-setting"
          type="primary"
          @click.stop="editColumnOpen"
        />
        <el-button
          v-if="showRefreshIcon"
          icon="el-icon-refresh"
          type="primary"
          @click="fetchHandler()"
        />
      </div>
      <div v-if="!saveTableConfig && showRefreshIcon" class="edit-table-columns table-form-container-refresh" style="margin-left: 10px;">
        <el-button
          icon="el-icon-refresh"
          type="primary"
          @click="fetchHandler()"
        />
      </div>
    </div>
    <slot />
    <u-table
      ref="table"
      v-bind="$attrs"
      v-on="$listeners"
      v-loading.lock="loading"
      :class="`el-table-container ${className}`"
      :border="border"
      :size="size"
      :stripe="stripe"
      :fit="fit"
      :show-header="showHeader"
      :highlight-current-row="highlightCurrentRow"
      :current-row-key="currentRowKey"
      :row-class-name="getRowClassName"
      :row-style="rowStyle"
      :cell-style="cellStyle"
      :row-key="rowKey"
      :empty-text="emptyText"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      :default-sort="defaultSort"
      tooltip-effect="light"
      :show-summary="showSummary"
      :sum-text="sumText"
      :summary-method="summaryMethod"
      :style="tableStyle"
      :tree-props="treeProps"
      :spanMethod="spanMethod"
      :maxHeight="maxHeight || 500"
      :data-changes-scroll-top="false"
      @select="(selection, row) => emitEventHandler('select', selection, row)"
      @select-all="(selection) => emitEventHandler('select-all', selection)"
      @selection-change="handleSelectionChange"
      @cell-mouse-enter="
        (row, column, cell, event) =>
          emitEventHandler('cell-mouse-enter', row, column, cell, event)
      "
      @cell-mouse-leave="
        (row, column, cell, event) =>
          emitEventHandler('cell-mouse-leave', row, column, cell, event)
      "
      @cell-click="
        (row, column, cell, event) =>
          emitEventHandler('cell-click', row, column, cell, event)
      "
      @cell-dblclick="
        (row, column, cell, event) =>
          emitEventHandler('cell-dblclick', row, column, cell, event)
      "
      @row-click="
        (row, event, column) =>
          emitEventHandler('row-click', row, event, column)
      "
      @row-dblclick="
        (row, event) => emitEventHandler('row-dblclick', row, event)
      "
      @row-contextmenu="
        (row, event) => emitEventHandler('row-contextmenu', row, event)
      "
      @header-click="
        (column, event) => emitEventHandler('header-click', column, event)
      "
      @filter-change="(filters) => emitEventHandler('filter-change', filters)"
      @current-change="
        (currentRow, oldCurrentRow) =>
          emitEventHandler('current-change', currentRow, oldCurrentRow)
      "
      @header-dragend="
        (newWidth, oldWidth, column, event) =>
          emitEventHandler('header-dragend', newWidth, oldWidth, column, event)
      "
      @sort-change="(args) => emitEventHandler('sort-change', args)"
      v-el-table-infinite-scroll:[scrollLoad]="tableBodyScroll"
      infinite-scroll-delay="400"
      infinite-scroll-distance="500"
      :infinite-scroll-immediate="false"
      style="height:auto;"
    >
      <slot name="prepend" />
      <template v-for="(item, columnIndex) in columnsNow">
        <!-- hidden 动态控制列的隐显 -->
        <template v-if="!item.hidden">
          <u-table-column
            v-if="item.type === undefined"
            :key="columnIndex"
            :column-key="item.columnKey"
            :prop="item.prop"
            :label="item.label"
            :min-width="item.width || 200"
            :fixed="item.fixed"
            :sortable="item.sortable"
            :sort-by="item.sortBy"
            :sort-method="item.method"
            :resizable="item.resizable"
            :formatter="item.formatter"
            :show-overflow-tooltip="item.label !== '操作' && !item.closeTooltip"
            :align="
              (columnIndex === columnsNow.length - 1 && item.slotName) ? 'right' : item.align
            "
            :header-align="item.headerAlign || item.align"
            :class-name="item.className"
            :label-class-name="item.labelClassName"
            :selectable="item.selectable"
            :reserve-selection="item.reserveSelection"
            :filters="item.filters"
            :filter-placement="item.filterPlacement"
            :filter-multiple="item.filterMultiple"
            :filter-method="item.filterMethod"
            :filtered-value="item.filteredValue"
            :treeNode = "item.treeNode"
          >
            <template v-if="item.headerSlot" slot="header">
                <slot :name="item.headerSlot" />
            </template>
            <template v-if="item.renderHeader" slot="header">
                <el-tooltip placement="top" :content="item.renderHeader">
                  <span style="border-bottom: 1px solid #e3e6ed; cursor: pointer;">{{item.label}}</span>
                </el-tooltip>
            </template>
            <!-- eslint-disable-next-line -->
            <template v-if="item.headerExpand && tableData && tableData.length" v-slot:header="scope">
                <i
                class="el-icon-arrow-down"
                style="cursor: pointer;"
                v-if="!expandAll"
                @click="handleExpandAll"
              />
              <i
                v-else
                class="el-icon-arrow-up"
                style="cursor: pointer;"
                @click="clearExpandAll"/>
              {{item.label}}
            </template>
            <template
              slot-scope="scope"
              :scope="newSlotScope ? 'scope' : false"
            >
              <span v-if="item.filter">
                {{ Vue.filter(column["filter"])(scope.row[item.prop]) }}
              </span>
              <!-- 是否可编辑 -->
              <span
                v-else-if="
                  item.editor &&
                  ((item.canEditor && item.canEditor(scope.row)) ||
                    !item.canEditor)
                "
                class="table-editor-span"
              >
                <span v-if="item.editing && scope.row.editing">
                  <el-input
                    v-if="item.editItemType === 'input'"
                    :key="item.editing + scope.row.editing"
                    v-model="editorParams"
                    class="table-editor-input"
                    ref="editInput"
                    @blur="saveEditor(scope.row, item, scope.$index)"
                    @click.native.stop="editorInputChange($event)"
                  />
                  <el-select
                    v-else-if="item.editItemType === 'select'"
                    :value="editorParams"
                    class="table-editor-select"
                    @change="
                      customerSelectChange($event, scope.row, item, scope.$index)
                    "
                    ref="editSelect"
                  >
                    <el-option
                      v-for="(op, opIndex) in selectOptions[
                        selectOptionPrefix + columnIndex
                      ]"
                      :key="opIndex + '_remote'"
                      :value="
                        typeof op === 'object'
                          ? op[item.valueKey || 'value']
                          : op
                      "
                      :label="
                        typeof op === 'object'
                          ? op[item.labelKey || 'label']
                          : op
                      "
                    />
                  </el-select>
                  <!-- <el-button
                    type="text"
                    icon="el-icon-check"
                    @click.stop="saveEditor(scope.row, item, scope.$index)"
                  />
                  <el-button
                    type="text"
                    icon="el-icon-close"
                    @click.stop="closeEditor(scope.row, item)"
                  /> -->
                </span>
                <div v-else class="table-editor-items">
                  <span v-if="item.render">{{ item.render(scope.row) }}</span>
                  <span v-else-if="item.slotName">
                    <slot
                      :name="item.slotName"
                      :row="scope.row"
                      :$index="scope.$index"
                    />
                  </span>
                  <span v-else>{{ scope.row[item.prop] }}</span>
                  <el-button
                    type="text"
                    class="table-editor-item_edit"
                    icon="el-icon-edit"
                    @click.stop="editor(scope.row, item, scope.$index, columnIndex)"
                  />
                </div>
              </span>
              <template v-else-if="item.slotName">
                <slot
                  :name="item.slotName"
                  :row="scope.row"
                  :$index="scope.$index"
                />
              </template>
              <!-- 是否显示原始值 -->
              <span v-else-if="scope.row.isShowDefault">
                {{ scope.row[item.prop] }}
              </span>
              <span v-else-if="item.render">
                {{ (item.before||'')+item.render(scope.row) }}
              </span>
              <span v-else-if="item.formatter">
                {{
                  item.formatter(
                    scope.row,
                    scope.column,
                    scope.row[item.prop],
                    scope.$index
                  )
                }}
              </span>
              <!-- 数据为空时显示 ‘-’ -->
              <span
                v-else-if="scope.row[item.prop] !== 0 && !scope.row[item.prop]"
                class="empty-default"
              >
                -
              </span>
              <span v-else>
                {{ (item.before||'')+scope.row[item.prop] }}
              </span>
            </template>
          </u-table-column>
          <u-table-column
            v-else-if="item.type === 'expand'"
            :key="columnIndex"
            width="1"
            class-name="expand-column-hidden"
            type="expand"
          >
            <template slot-scope="scope">
              <slot name="expandSlot" :row="scope.row" :$index="scope.$index" />
            </template>
          </u-table-column>
          <u-table-column
            v-else-if="item.type === 'selection'"
            :key="columnIndex"
            :selectable="item.selectable"
            :reserve-selection="item.reserveSelection"
            type="selection"
            :width="item.width || 70"
          />
          <u-table-column
            v-else-if="item.type === 'index'"
            :key="columnIndex"
            :label="item.label || '序号'"
            width="100"
            type="index"
          >
            <template slot-scope="scope">
              <!-- isShowDefault 行不显示序号 -->
              <span v-if="!scope.row.isShowDefault">
                {{ scope.$index + 1 }}
              </span>
            </template>
          </u-table-column>
          <u-table-column v-else :key="columnIndex" v-bind="column" />
        </template>
      </template>
      <slot name="append" />
      <div slot="empty" v-if="!loading">
        <EmptyContainer />
      </div>
    </u-table>
    <div class="pagination-table-bottom">
      <div class="pagination-table-bottom-selection">
        <span v-if="selectionList && selectionList.length">已选{{selectionList.length}}条</span>
      </div>
      <div
        v-if="showPagination && total > pageSizes[0] && !scrollLoad"
        style="margin-top: 10px; text-align: right;"
      >
        <el-pagination
          background
          :current-page="pagination.pageIndex"
          :page-sizes="pageSizes"
          :page-size="pagination.pageSize"
          :layout="paginationLayout"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <div
        v-if="total <= 10 && showTotals"
        style="margin-top: 10px; text-align: right; font-size: 13px; color: #323f53;"
        class="total"
      >
        共 {{total}} 条
      </div>
    </div>
    <el-dialog
      title="自定义显示列"
      :lock-scroll="false"
      :visible.sync="dialogVisible"
    >
      <div class="edit-table-column-dialog">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>拖动调整显示顺序</span>
          </div>
          <Draggable
            :list="checkedColumns"
            v-bind="$attrs"
            @start="drag = true"
            @end="drag = false"
            animation = 200
            class="board-column-content">
              <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                <div v-for="item in checkedColumns" :key="item" class="board-column-content_item">{{item}}</div>
              </transition-group>
          </Draggable>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>选择显示列</span>
          </div>
          <el-checkbox-group v-model="checkedColumns" class="edit-table-column-dialog-checkbox">
              <el-checkbox v-for="item in columnsDefault.filter(item =>  !item.type&& item.label !=='操作')" :label="item.label" :key="item.label"  border size="small">{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button
          type="primary"
          @click="dialogSubmit"
          :loading="loading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import Vue from "vue";
import props from "./props";
import searchForm from "../../search/src/main.vue";
import utils from "../../../utils/utils.js";
import { isObject } from "../../../utils/validate";
import Draggable from 'vuedraggable';
import { storage } from '../../../utils/local';
import { cloneDeep,isEmpty } from 'lodash';
import { UTable, UTableColumn } from 'umy-ui';
import EmptyContainer from './components/DataEmpty';
import elTableInfiniteScroll from './directive/scroll';

export default {
  name: "ElSearchTablePagination",
  components: {
    searchForm,
    Draggable,
    EmptyContainer,
    [UTable.name]: UTable,
    [UTableColumn.name]: UTableColumn
  },
  directives: {
    'el-table-infinite-scroll': elTableInfiniteScroll
  },
  props,
  data() {
    const _this = this;
    return {
      Vue,
      pagination: {
        pageIndex: 1,
        pageSize: (() => {
          const { pageSizes } = _this;
          if (pageSizes.length > 0) {
            return pageSizes[0];
          }
          return 20;
        })(),
      },
      total: 0,
      loading: false,
      cacheLocalData: [],
      showData: true,
      compHeight: 400,
      oldPage: 0,
      oldForm: "",
      flags: {
        searchShow: true,
      },
      texts: {
        searchControl: "隐藏搜索",
      },
      columnsNow: [],
      className: "",
      selectOptions: {},
      selectOptionPrefix: "select-option-prefix",
      editorParams: "",
      currentCoordinate: [],
      dialogVisible: false,
      checkedColumns: [],
      drag: false,
      columnsDefault: [],
      currentRow: {},
      currentItem: {},
      currentIndex: '',
      tableDataDefault: [],
      formsConfig: [],
      emptyText: '  ',
      columnsDefaultObj: {},
      selectionList: [],
      scrollDisable: true,
      headerExpand: false,
      expandAll: false
    };
  },
  computed: {
    newSlotScope() {
      return Number(Vue.version.replace(/\./g, "")) >= 250;
    },
    permits() {
      return this.$store ? this.$store.state.user.permits:{};
    },
    formOptionsSlots: {
      get() {
        return this.formOptions.forms.filter((i) => i.slotName);
      },
    },
    /**
     * 当table组件为tree类型时添加 返回默认的row class 方法 ，但这需要手动为返回的数据添加type('Parent', 'Child') 属性
     * data.forEach(item => {
     *  item.type = 'Parent';
     *  item.children && item.children.forEach(child => ({...child,type:'Child' }))
     * })
     */
    getRowClassName() {
        const rowClassName = this.rowClassName;
        const rowKey = this.rowKey;
        if(rowClassName) return rowClassName;
        if(rowKey) return ({row,rowIndex})=>{
            if(row.type==='Parent'&&row.expanded) return 'parent-row--expanded'
            if(row.type==='Parent') return 'parent-row'
            return 'child-row'
        }
        return undefined
    }
  },
  watch: {
    data(value) {
      this.loadLocalData(value);
    },
    tabs() {
      this.reLoad();
      this.columnsNow = [];
      setTimeout(() => {
        this.pagination.pageIndex = 1;
        this.init(true);
        this.$refs.table.doLayout();
      }, 0);
    },
    // 表格只有一条数据时，下面固定50px
    tableData(val) {
      this.className = val && val.length === 1 ? "one-data" : "";
    },
    currentCoordinate: {
      handler(_, old){
        if (!old || !old.length) return;
        const [x, y] = old;
        this.resetEdit(x, y);
      },
      deep: true
    },
  },
  mounted() {
    this.columnsDefault = cloneDeep(this.columns);
    this.columnsDefaultObj = this.columnsDefault.reduce((pre, next) => {
      next.label && (pre[next.label] = next);
      return pre;
    }, {});
    this.init();
    this.$el.addEventListener('click', this.clickListener);
  },
  methods: {
    editorInputChange(event){
      // const e = event.target;
      // if(e && e.stopPropagation) {
      //   e.stopPropagation();
      //   return;
      // }
      // window.event.cancelBubble = true;
    },
    clickListener() {
      if (!isEmpty(this.currentRow) && !isEmpty(this.currentItem) && this.currentIndex !== '') {
        this.checkIsChange();
        this.$nextTick(() => {
          this.closeEditor(this.currentRow, this.currentItem)
          this.currentRow = {};
          this.currentItem = {};
          this.currentIndex = '';
        })
      }
    },
    dialogClose() {
      this.dialogVisible = false;
    },
    editColumnOpen() {
      this.dialogVisible = true;
      const result = storage(2, `localTags${this.$route.path}${this.tabs}`);
      if (result && Array.isArray(result) && result.length) {
        this.$set(this, 'checkedColumns', result);
      } else {
        this.$set(this, 'checkedColumns', this.columnsDefault.filter(item =>  !item.type&& item.label !=='操作' && !this.excludeColumn.includes(item.label)).map(item => item.label));
      }
    },
    dialogSubmit() {
      this.loading = true;
      this.dialogClose();
      storage(2, `localTags${this.$route.path}${this.tabs}`, this.checkedColumns, 60 * 24 * 30)
      const result = this.setColumns();
      this.columnsNow = [...result];
      this.setTableConfig();
      this.$nextTick(() => {
        this.initSelectOptions();
        this.$refs["table"] && this.$refs["table"].$on("expand", (row, expanded) =>
          this.emitEventHandler("expand", row, expanded)
        );
        const { type, autoLoad, data, formOptions, params } = this;
        if (type === "remote" && autoLoad) {
          if (formOptions && this.$refs["searchForm"]) {
            this.$refs["searchForm"].getParams((error, formParams) => {
              if (!error) {
                this.fetchHandler(formParams);
              }
            });
          } else {
            this.fetchHandler(params);
          }
        } else if (type === "local") {
          this.loadLocalData(data);
        }
      })
    },
    // 返回渲染列;
    setColumns() {
      let result = [];
      if (this.columnsDefault.length && this.columnsDefault[0]) {
        if (this.columnsDefault[0].type) {
          result.push(this.columnsDefault[0])
        }
        const list = this.checkedColumns.reduce((pre, next) => {
          const column = this.columnsDefaultObj[next];
          column && pre.push(column);
          return pre;
        }, []);
        result.push(...list);
        let handleColumn = null;
        if (this.columnsDefault[this.columnsDefault.length - 1].label === '操作') {
          handleColumn = this.columnsDefault[this.columnsDefault.length - 1]
        } else {
          handleColumn = this.columnsDefault.find(item => item.label === '操作')
        }
        if (handleColumn) {
          result.push(handleColumn);
        }
      };
      return result;
    },
    customerSelectChange(val, row, item, index) {
      this.editorParams = val;
      this.saveEditor(row, item, index);
    },
    isObject(val) {
      return isObject(val);
    },
    resetEdit(x, y) {
      const currentTableData = this.tableData[x];
      const currentColumn = this.columnsNow[y];
      this.$set(
        this.tableData,
        x,
        Object.assign(currentTableData, { editing: false })
      );
      this.$set(
        this.columnsNow,
        y,
        Object.assign(currentColumn, { editing: false })
      );
      this.editorParams = "";
    },
    closeEditor(row, item) {
      this.$set(item, "editing", false);
      this.$set(row, "editing", false);
    },
    saveEditor(row, item, index) {
      this.$set(item, "editing", false);
      this.$set(row, "editing", false);
      const { exportSelectProp } = item;
      let result = { row, column: item };
      if (exportSelectProp) {
        result.params = {
          [exportSelectProp]: this.editorParams,
        };
      } else {
        result.params = {
          [item.prop]: this.editorParams,
        };
      }
      this.currentRow = {};
      this.currentItem = {};
      this.currentIndex = '';
      if (result.params && result.params.name === '') {
        return  this.$message({ type: 'warning', message: '姓名不能为空' });
      }
      this.$emit("editor-row", result, index);
    },
    checkIsChange() {
      let flag = false;
      if (this.currentItem.editItemType === "input") {
        flag = this.editorParams && this.editorParams !== this.currentRow[this.currentItem.prop];
      }
      if (this.currentItem.editItemType === "select") {
        flag = this.editorParams && this.editorParams !== this.currentRow[this.currentItem.exportSelectProp];
      }
      if (flag) {
        return this.saveEditor(this.currentRow, this.currentItem, this.currentIndex);
      }
    },
    editor(row, item, index, columnIndex) {
      if (!isEmpty(this.currentRow) && !isEmpty(this.currentItem) && this.currentIndex !== '') {
        this.checkIsChange();
      }
      this.closeEditor(row, item);
      this.currentRow = row;
      this.currentItem = item;
      this.currentIndex = index;
      this.currentCoordinate = [index, columnIndex];
      this.$nextTick(() => {
        if (!item.editItemType) {
          this.$emit("editor-row", { row, column: item }, index);
        } else {
          this.$set(item, "editing", true);
          this.$set(row, "editing", true);
          if (item.editItemType === "input") {
            this.editorParams = row[item.prop];
          }
          if (item.editItemType === "select") {
            this.editorParams = row[item.exportSelectProp];
          }
        }
      });
    },
    searchSet(key, val, type) {
      // 'begintime,endtime'
      if (type === "daterange") {
        this.$refs.searchForm.params[`daterange-prefix${key}`] = val;
      } else if (type === "reload") {
        this.$refs.searchForm.params[key[0]] = val[0];
        this.$refs.searchForm.params[key[1]] = val[1];
      } else {
        this.$refs.searchForm.params[key] = val;
      }
      this.loading = true;
      setTimeout(() => {
        this.$refs.searchForm.searchHandler();
      }, 10);
    },
    searchSetObj(searchForm){
       const forms = this.$refs.searchForm.forms;
       const params =  this.$refs.searchForm.params;

       for(const [label,formItemValue] of Object.entries(searchForm)){
            const formIndex = forms.findIndex(item => item.label === label);
            if(Array.isArray(formItemValue)){
                 params[`daterange-prefix${formIndex}`] = formItemValue
                 params[forms[formIndex].prop[0]] = formItemValue[0]
                params[forms[formIndex].prop[1]] = formItemValue[1]
            }else {
                params[forms[formIndex].prop] = formItemValue
            }
       }

        this.loading = true;
        setTimeout(() => {
            this.$refs.searchForm.searchHandler();
        }, 10);
    },
    searchSetDateRange(label, val) {
      const index = this.$refs.searchForm.forms.findIndex(item => item.label === label);
      if (index >= 0) {
        this.$refs.searchForm.params[`daterange-prefix${index}`] = val;
        this.$refs.searchForm.params[this.$refs.searchForm.forms[index].prop[0]] = val[0];
        this.$refs.searchForm.params[this.$refs.searchForm.forms[index].prop[1]] = val[1];
      }
      this.loading = true;
      setTimeout(() => {
        this.$refs.searchForm.searchHandler();
      }, 10);
    },
    searchSetDataOnly(type, val) {
      // 只回填值
      console.log(type, val);
      this.$refs.searchForm.params[type] = val;
    },
   // 如果有使用slot，请使用传入fetch方法获取导出参数
    getSearchParmas() {
      return this.$refs.searchForm.searchHandler();
    },
    reLoad() {
      this.showData = false;
      setTimeout(() => {
        this.showData = true;
      }, 0);
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.pageIndex = 1;
      this.dataChangeHandler();
      this.setTableConfig();
    },
    handleCurrentChange(pageIndex) {
      this.oldPage = this.pagination.pageIndex;
      this.pagination.pageIndex = pageIndex;
      this.dataChangeHandler();
    },
    handleSelectionChange (selection) {
      this.selectionList = selection;
      this.emitEventHandler('selection-change', selection)
    },
    parentSearchHandler(resetPageIndex = true) {
      if (resetPageIndex) {
        this.pagination.pageIndex = 1;
      }
      this.dataChangeHandler(arguments[0]);
    },
    dataChangeHandler() {
      const { type } = this;
      if (type === "local") {
        this.dataFilterHandler(arguments[0]);
      } else if (type === "remote") {
        this.fetchHandler(arguments[0]);
      }
    },
    dataFilter(data) {
      const { pageIndex, pageSize } = this.pagination;
      return data.filter((v, i) => {
        return i >= (pageIndex - 1) * pageSize && i < pageIndex * pageSize;
      });
    },
    dataFilterHandler(formParams) {
      const { cacheLocalData, params } = this;
      const mergeParams = Object.assign(params, formParams);
      const validParamKeys = Object.keys(mergeParams).filter((v) => {
        return mergeParams[v] !== undefined && mergeParams[v] !== "";
      });
      const searchForm = this.$refs["searchForm"];
      let paramFuzzy;
      if (searchForm) {
        paramFuzzy = searchForm.getParamFuzzy();
      }

      if (validParamKeys.length > 0) {
        const validData = cacheLocalData.filter((v) => {
          const valids = [];
          validParamKeys.forEach((vv) => {
            if (typeof v[vv] === "number") {
              valids.push(
                paramFuzzy && paramFuzzy[vv]
                  ? String(v[vv]).indexOf(String(mergeParams[vv])) !== -1
                  : String(v[vv]) === String(mergeParams[vv])
              );
            } else {
              valids.push(
                paramFuzzy && paramFuzzy[vv]
                  ? v[vv].indexOf(mergeParams[vv]) !== -1
                  : v[vv] === mergeParams[vv]
              );
            }
          });
          return valids.every((vvv) => {
            return vvv;
          });
        });

        this.tableData = this.dataFilter(validData);
        this.total = validData.length;
      } else {
        this.total = cacheLocalData.length;
        this.tableData = this.dataFilter(cacheLocalData);
      }
    },
      fetchHandler(formParams = {}, columnsChange= false, reset = false) {
      const noLoading = this.scrollLoad && this.pagination.pageIndex !== 1;
      this.loading = !noLoading;
      let {
        fetch,
        method,
        url,
        $axios,
        headers,
        listField,
        pageIndexKey,
        pageSizeKey,
        totalField,
        params,
        showPagination,
        pagination,
      } = this;
      params = JSON.parse(JSON.stringify(Object.assign(params, formParams)));
      // 遍历formoption,当prop是时间数组时，将其拆分出来
      let list = [];
      this.formOptions && this.formOptions.forms && this.formOptions.forms.length &&
        this.formOptions.forms.map((item) => {
          if (item.prop instanceof Array) {
            item.prop.forEach((ary) => {
              list.push(ary);
            });
          } else {
            list.push(item.prop);
          }
        });
      if (isEmpty(formParams)) {
        if (this.$refs["searchForm"]) {
            this.$refs["searchForm"].getParams((error, fParams) => {
              if (!error) {
                formParams = fParams
              }
            });
          }
      }
      this.$nextTick(() => {
        let resultParams = Object.keys(params).reduce((pre, next) => {
        if (
          params[next] === 0 || // params[next] === 0 为了满足:有些option的value是 0 的情况
          (params[next] != "" &&
            (formParams.hasOwnProperty(next) ||
              (utils.isEmpty(formParams) &&
                list.length &&
                list.includes(next))))
        ) {
          pre[next] = params[next];
        }
        return pre;
      }, {});
      if (showPagination) {
        resultParams = Object.assign(resultParams, {
          [pageIndexKey]: pagination.pageIndex,
          [pageSizeKey]: pagination.pageSize,
        });
      }

      let requestObject = null;

      if (fetch) {
        requestObject = fetch(resultParams);
      } else {
        $axios.interceptors.request.use(
          (config) => {
            Object.keys(headers).forEach((v) => {
              config.headers[v] = headers[v];
            });
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );

        method = method.toLowerCase();

        if (method === "get") {
          requestObject = $axios[method](url, { resultParams });
        } else {
          requestObject = $axios[method](url, resultParams);
        }
      }
      requestObject
        .then((response) => {
          let result = response;
          if (response && !(response instanceof Array)) {
            if (listField && listField.indexOf(".") !== -1) {
              listField.split(".").forEach((vv) => {
                result = result[vv];
              });
            } else {
              result = response[listField] || response.data.list;
            }
          }
          if (!result || !(result instanceof Array)) {
            if (!this.scrollLoad) {
              this.tableData = [];
            }
            this.loading = false;
            throw new Error(`The result of key:${listField} is not Array.`);
          }
          if (this.scrollLoad) {
            if (!this.tableData || reset) this.tableData = [];
            if (this.dataHandler) {
              this.tableData = [...this.tableData, ...result.map(this.dataHandler)];
            } else {
              this.tableData = [...this.tableData, ...result];
            }
          } else {
            if (this.dataHandler) {
              this.tableData = result.map(this.dataHandler);
            } else {
              this.tableData = result;
            }
          }
          if (!this.columnsNow.length || columnsChange) {
            this.columnsNow = this.columns;
            this.initSelectOptions()
          }
          this.setColumnWidth();
          this.$refs.table.reloadData(this.tableData)
          this.scrollDisable = false;
          this.emptyText = '暂无数据'
          let totalValue = response;
          if (Object.prototype.toString.call(response) === "[object Array]") {
            totalValue = response.length;
          } else if (typeof response === "object") {
            if (totalField && totalField.indexOf(".") !== -1) {
              totalField.split(".").forEach((vv) => {
                totalValue = totalValue[vv];
              });
            } else {
              totalValue = response[totalField];
            }
          } else {
            totalValue = 0;
          }
          this.total = totalValue;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          throw new Error(error)
        });
      })
    },
    setColumnWidth() {
      // 字段分析:以确定 width 等属性
      if (this.autoWidth) {
        // 配置是否使用字段分析的开关 autoWidth = null
        // 原理:遍历找出table数据中字段长度最长的值，根据值计算列宽
        // 检查每个字符是数字英文还是汉字 - 只检查是否汉字
        function everyCharCheck(check_str) {
          const chineseArray = [];
          String(check_str).replace(/[\u4e00-\u9fa5]/gm, function () {
            const text = arguments[0];
            const index = arguments[arguments.length - 2];
            chineseArray.push({
              text: text,
              index: index,
            });
            return text;
          });
          return chineseArray.length;
        }
        // 是否纯数字字母
        function checknum(value) {
          const Regx = /^[A-Za-z0-9]*$/;
          if (Regx.test(value)) {
            return true;
          } else {
            return false;
          }
        }
        // 获取宽度 offsetWidth 可以在列属性里手动追加宽度偏移量属性 负数时为缩短宽度 正数为增加宽度
        function getWidth(check_str, offsetWidth) {
          // 用于计算的长度
          let calNums = 0;
          if (everyCheckFlag) {
            // 是否纯数字
            if (checknum(check_str)) {
              // 纯数字字母
              calNums = check_str.length;
            } else {
              // 有汉字 统计汉字个数
              const chineseNums = everyCharCheck(check_str);
              // 汉字宽度1.3 其他算0.9
              calNums =
                (check_str.length - chineseNums) * 1.1 + chineseNums * 1.5;
            }
          } else {
            calNums = check_str.length;
          }
          // 计算width
          let resWidth = 0;
          if (offsetWidth) {
            resWidth = calNums * fontSize + offsetWidth;
          } else resWidth = calNums * fontSize;
          return resWidth > 80 ? resWidth : 80; // 最小120
        }
        // 长度对比
        function lengthCompare(a, b) {
          // a 可能为null
          if (!a || isObject(a)) a = "";
          if (!b || isObject(b)) b = "";
          return getWidth(a) > getWidth(b);
        }
        const {
          analysisKeys,
          fontSize = 14,
          everyCheckFlag = true,
        } = this.autoWidth;
        // 用于记录最长值的对象
        const analysisObjs = {};
        // 初始将标题设置为最长的值
        this.columnsNow = this.columnsNow.filter((i) => {
          if (!i.permit || i.permit && this.permits[i.permit]) {
            if (!i.width) analysisKeys.push(i.prop); // 如果此列没有width 自动加入宽度计算
              if (i.prop) {
                if (analysisKeys.includes(i.prop)) {
                  analysisObjs[i.prop] = i.label;
                }
              }
            return true;
          }
        });
        // 找到最长的值
        this.tableData && this.tableData.forEach((i) => {
          analysisKeys.forEach((j) => {
            if (lengthCompare(i[j], analysisObjs[j])) {
              // 找到最长的值
              analysisObjs[j] = i[j];
            }
          });
        });
        // 设置 width
        this.columnsNow.forEach((i) => {
          if (i.prop) {
            if (analysisKeys.includes(i.prop)) {
              i.width = getWidth(analysisObjs[i.prop], i.offsetWidth);
            }
          }
        });
      }
    },
    emitEventHandler(event) {
      if (event === 'header-dragend') {
        this.setTableConfig();
      }
      if (event === 'sort-change') {
        if (this.scrollLoad) {
          this.resetScrollTable();
          this.$emit('sort-reset-change', ...Array.from(arguments).slice(1))
        }
      }
      this.$emit(event, ...Array.from(arguments).slice(1));
    },
    resetScrollTable(){
      this.pagination.pageIndex = 1;
      this.tableData = [];
      this.expandAll = false;
      this.$refs.table.pagingScrollTopLeft();
    },
    loadLocalData(data) {
      const { autoLoad } = this;
      if (!data) {
        console.error(
          `When the type is 'local', you must set attribute 'data' and 'data' must be a array.`
        );
        this.showPagination = false;
        return false;
      }
      const cacheData = JSON.parse(JSON.stringify(data));
      this.cacheLocalData = cacheData;
      if (autoLoad) {
        this.columnsNow = this.columns;
        this.setColumnWidth();
        this.$refs.table.reloadData(this.dataFilter(cacheData))
        this.total = cacheData.length;
      }
    },
    initSelectOptions() {
      const list = this.columnsNow.length ? this.columnsNow : this.columns;
      list.forEach(({ editItemType, selectFetch }, i) => {
        if (editItemType !== "select") return;
        const dataKey = this.selectOptionPrefix + i;
        this.selectOptions[dataKey] = [];
        this.getRemoteData({
          fetch: selectFetch,
          dataKey,
        });
      });
    },
    getRemoteData({ fetch, dataKey }) {
      fetch().then((response) => {
        let result = response;
        if (!result || !(result instanceof Array)) {
          console.warn(
            `The column select options :is not Array. 接口返回的字段:不是一个数组`
          );
        }
        this.selectOptions[dataKey] = result;
      });
    },
    async init(change=false) {
      return new Promise(async() => {
        if (this.saveTableConfig) {
          try {
            const res = await this.getTableConfig();
            if (res) {
              const { columnsWidth, checkedColumns, pageSize} = JSON.parse(res);
              storage(2, `localTags${this.$route.path}${this.tabs}`, checkedColumns);
              const result = storage(2, `localTags${this.$route.path}${this.tabs}`);
              if (result && Array.isArray(result) && result.length) {
                this.$set(this, 'checkedColumns', result);
              } else {
                this.$set(this, 'checkedColumns', this.columnsDefault.filter(item =>  !item.type&& item.label !=='操作' && !this.excludeColumn.includes(item.label)).map(item => item.label));
              }
              if (this.checkedColumns.length) {
                this.columnsNow = this.setColumns();
              } else {
                this.columnsNow = this.columns;
              }
              if (columnsWidth && isObject(columnsWidth)) {
                this.columnsNow = this.columnsNow.map(i => {
                  return {
                    ...i,
                    width: columnsWidth[i.label] || i.width || ''
                  }
                })
              }
              if (pageSize) {
                this.pagination.pageSize = pageSize;
              }
            } else {
              this.columnsNow = this.columns;
            }

          } catch (error) {
            console.log(error);
          }
        }
        this.initSelectOptions();
        this.$refs["table"] && this.$refs["table"].$on("expand", (row, expanded) =>
          this.emitEventHandler("expand", row, expanded)
        );
        const { type, autoLoad, data, formOptions, params } = this;
        if (type === "remote" && autoLoad) {
          if (formOptions && this.$refs["searchForm"]) {
            this.$refs["searchForm"].getParams((error, formParams) => {
              if (!error) {
                this.fetchHandler(formParams, change);
              }
            });
          } else {
            this.fetchHandler(params, change);
          }
        } else if (type === "local") {
          this.loadLocalData(data);
        }
      });
    },
    searchControlChange() {
      const _self = this;
      _self.flags.searchShow = !_self.flags.searchShow;
      if (_self.flags.searchShow) {
        _self.texts.searchControl = "隐藏搜索";
      } else {
        _self.texts.searchControl = "显示搜索";
      }
    },
    clearSelection () {
      this.$refs.table.clearSelection();
    },
    setTableConfig() {
      if (!this.saveTableConfig) return;
      const columnsWidth = this.$refs.table.$children[0].columns.reduce((pre, next) => {
        const { label, width, realWidth } = next;
        if (label && (width || realWidth)) {
          pre[label] = width || realWidth;
        }
        return pre;
      }, {});
      const { pageSize } = this.pagination;
      const params = {
        columnsWidth,
        checkedColumns: this.checkedColumns,
        pageSize
      }
      this.updateTableConfig(JSON.stringify(params));
    },
    /**
     * 页面销毁或关闭
     */
    beforeunloadFn(e) {
      this.setTableConfig();
    },
    async updateTableConfig(params) {
      try {
        if (!this.setConfig) throw new Error('请传入表格配置方法 =>setConfig')
        await this.setConfig(params, 'other', this.saveTableConfig);
      } catch (error) {
        throw new Error(error);
      }
    },
    async getTableConfig() {
      return new Promise(async(resolve) => {
        try {
          if (!this.getConfig) throw new Error('请传入获取表格配置方法 =>getConfig')
          const res = await this.getConfig(this.saveTableConfig);
          if (Array.isArray(res) && res.length) {
            const other = res.find(item => item.configType === 'other');
            other && other.configData && resolve(other.configData);
            const formsConfig = res.find(item => item.configType === 'formsConfig');
            try {
              formsConfig && (this.formsConfig = JSON.parse(formsConfig.configData) || {})
            } catch (error) {
              console.log(error);
            }
            resolve()
          }
          resolve()
        } catch (error) {
          console.log(error, '本页面无表格配置');
        }
      })
    },
    tableBodyScroll() {
      if (!this.scrollLoad) return;
      if (this.total === this.tableData.length) {
        this.scrollDisable = true;
        return console.log('没有更多数据了')
      }
      console.log('加载中')
      this.pagination.pageIndex++;
      console.log('this.pagination.pageIndex', this.pagination.pageIndex);
      this.expandAll = false;
      this.dataChangeHandler();
    },
    /**
     * @description: 展开所有树
     */    
    setAllTreeExpansion() {
      this.$refs.table.setAllTreeExpansion();
    },
    /**
     * @description: 收起所有树
     */    
    clearTreeExpand() {
      this.$refs.table.clearTreeExpand();
    },
    handleExpandAll() {
      this.setAllTreeExpansion();
      this.expandAll = true;
      this.$refs.table.getUTreeData().forEach(item => {
        if(item.type==='Parent') item.expanded = true;
      })
    },
    clearExpandAll() {
      this.clearTreeExpand();
      this.expandAll = false;
    }
  },
  beforeDestroy() {
    // if (this.saveTableConfig) {
    //   this.beforeunloadFn();
    // }
  },
  destroyed() {
    this.$el.removeEventListener('click', this.clickListener);
  }
};
</script>
<style lang="less">
.search-table-pagination {
  .plTableBox .el-table th {
    background: #FAFAFB;
  }
  .plTableBox .el-table--border th {
    border-bottom: 1px solid #E3E6ED;
  }
  .plTableBox .el-table--border td, .plTableBox .el-table--border th, .plTableBox .el-table__body-wrapper .el-table--border.is-scrolling-left~.el-table__fixed {
    border-right: 1px solid #E3E6ED;
  }
  .el-table th.gutter {
    display: table-cell !important;
  }
  .el-table colgroup.gutter {
    display: table-cell !important;
  }
  .el-table .caret-wrapper {
    position: absolute;
    top: -4px;
  }

  table {
    width: 100% !important;
  }
  .el-table__row {
    .el-tooltip{
      width: auto !important;
      font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,微软雅黑,Arial!important;
    }
  }
  .child-row {
    animation: childRow .3s;
    @keyframes childRow {
      from {
        opacity: 0.4;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0px);
      }
    }
  }
  transition: all 1s;
  .table-form-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .edit-table-columns {
      button {
        padding: 0 10px !important;
      }
    } 
    .table-form-container-refresh {
      display: flex;
      flex: 1;
      justify-content: flex-end;
    }
  }
  .edit-table-column-dialog {
    .flip-list-move {
      transition: transform 0.5s;
    }
    .no-move {
      transition: transform 0s;
    }
    .board-column-content {
      >span {
        display: flex;
        flex-wrap: wrap;
      }
      .board-column-content_item{
        border: 1px solid #e3e6ed;
        padding: 16px;
        background: #FAFAFB;
        color: #7F8FA4;
        font-size: 14px;
        font-weight: 500;
        width: 120px;
        text-align: center;
       // line-height: 42px;
        cursor: pointer;
      }
    }
    .edit-table-column-dialog-checkbox {
      .el-checkbox {
        margin-left: 0;
        margin-bottom: 6px;
      }
    }
  }
  .control-btn {
    cursor: pointer;
  }
  .table-editor-span {
    display: flex;
    align-items: center;
    .table-editor-items {
      display: flex;
      width: 100%;
    }
    .table-editor-items > span {
      margin-right: 10px;
      width: 90%;
      overflow: hidden;
      line-height: 32px;
      * {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
      }
    }
    .el-button--text {
      padding-right: 4px !important;
    }
    .table-editor-item_edit {
      visibility: hidden;
    }
  }
  .table-editor-items:hover .table-editor-item_edit {
    visibility: visible;
  }
}
.expand-column-hidden {
  overflow: hidden;
}
.expand-hidden {
  .cell {
    .el-table__expand-icon,
    .el-table__indent,
    .el-table__placeholder {
      display: none !important;
    }
  }
}
// 处理自动列宽计算后 标题换行的问题
.el-table th > .cell {
  white-space: nowrap;
  text-overflow: clip;
}
.customer-input-popover {
  min-width: 88px !important;
}
.customer-dialog {
  .el-dialog-header {
    border-bottom: none;
  }
}
.el-pagination {
  padding-right: 0px;
  .el-pagination__sizes {
    margin-right: 0px;
    .el-input {
      margin-right: 0px;
    }
  }
}
// window x轴 电脑完全遮住一半滚动条
//.el-table__body-wrapper::-webkit-scrollbar {
//  width: 8px !important;
//  height: 8px !important;
//}
.el-table .el-table__fixed {
  margin-bottom: 0 !important;
}
.el-table .el-table__fixed-right {
  margin-bottom: 8px ;
}

.el-table .el-table__fixed::before {
  background: transparent;
}
.el-table .el-table__fixed-right::before {
  background: transparent;
}

.pagination-table-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.pagination-table-bottom-selection {
  font-size: 14px;
  font-weight: 500;
  color: #03BE75;
  min-width: 100px;
  height: 28px;
  line-height: 28px;
}
</style>
