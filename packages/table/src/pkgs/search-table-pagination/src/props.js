/*
 * @Author: your name
 * @Date: 2021-05-14 14:17:43
 * @LastEditTime: 2021-12-23 13:57:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /crm/src/components/TableContainer/packages/search-table-pagination/src/props.js
 */

const props = {
  // Element UI Table attributes
  height: [String, Number],
  maxHeight: [String, Number],
  size: String,
  stripe: Boolean,
  border: {
    type: Boolean,
    default: true
  },
  fit: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  highlightCurrentRow: Boolean,
  currentRowKey: [String, Number],
  rowClassName: [String, Function],
  rowStyle: [String, Function],
  cellStyle: [Object, Function],
  rowKey: [String, Function],
  defaultExpandAll: Boolean,
  expandRowKeys: Array,
  defaultSort: Object,
  tooltipEffect: String,
  showSummary: Boolean,
  sumText: String,
  summaryMethod: Function,
  spanMethod: Function,
  // custom attributes
  tableStyle: {
    type: String,
    default: 'width:100%;margin-top:10px;'
  },
  fetch: {
    type: Function
  },
  url: {
    type: String
  },
  method: {
    type: String,
    default: 'get',
    validator: value => {
      const methodTypes = ['get', 'post', 'put', 'delete'];
      return methodTypes.indexOf(value.toLowerCase()) !== -1;
    }
  },
  headers: {
    type: Object,
    default: () => {
      return {};
    }
  },
  listField: {
    type: String,
    default: 'pageList'
  },
  totalField: {
    type: String,
    default: 'totalSize'
  },
  params: {
    type: Object,
    default: () => {
      return {};
    }
  },
  formOptions: {
    type: Object
  },
  autoLoad: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'remote',
    validator(value) {
      const types = ['remote', 'local'];
      const validType = types.indexOf(value) !== -1;
      if (!validType) {
        throw new Error(`Invalid type of '${value}', please set one type of 'remote' or 'local'.`);
      }
      return validType;
    }
  },
  data: {
    type: Array
  },
  dataHandler: {
    type: Function
  },
  columns: {
    type: Array,
    required: true
    // // Element UI table-column attribute
    // columnKey: String,
    // label: {
    //   type: String,
    //   required: true
    // },
    // prop: {
    //   type: String,
    //   required: true
    // },
    // width: Number,
    // minWidth: Number,
    // fixed: [Boolean, String],
    // renderHeader: Function,
    // sortable: [Boolean, String],
    // sortMethod: Function,
    // resizable: {
    //   type: Boolean,
    //   default: true
    // },
    // formatter: Function,
    // showOverflowTooltip: Boolean,
    // align: {
    //   type: String,
    //   default: 'left'
    // },
    // headerAlign: String,
    // className: {
    //   type: String,
    //   default: ''
    // },
    // labelClassName: {
    //   type: String,
    //   default: ''
    // },
    // selectable: Function,
    // reserveSelection: Boolean,
    // filters: Array,
    // filterPlacement: String,
    // filterMultiple: {
    //   type: Boolean,
    //   default: true
    // },
    // filterMethod: Function,
    // filteredValue: Array,
    // // custom table-column attribute
    // filter: {
    //   type: String
    // },
    // render: {
    //   type: Function
    // },
    // slotName: {
    //   type: String
    // }
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  showTotals: {
    type: Boolean,
    default: true
  },
  pageSizes: {
    type: Array,
    default: () => {
      return [10, 20];
    }
  },
  paginationLayout: {
    type: String,
    default: 'total, prev, pager, next, jumper, sizes'
  },
  pageIndexKey: {
    type: String,
    default: 'pageNum'
  },
  pageSizeKey: {
    type: String,
    default: 'pageSize'
  },
  tabs: {
    type: [String, Number],
    default: ''
  },
  treeProps: {
    type: Object,
    default: () => {
      return { hasChildren: 'hasChildren', children: 'children' };
    }
  },
  showRightControlBtns: {
    type: Boolean,
    default: false
  },
  autoWidth: {
    type: Object,
    default: () => { // 必须属性
      return {
        analysisKeys: [], // 分析字段
        fontSize: 14, // 一个字符的宽度，一般用当前行的fontSize即可
        everyCheckFlag: true // 是否检测每个字符，如果是，会对中文英文数字进行区别计算
      };
    }
  },
  excludeColumn: {
    type: Array,
    default: () => []
  },
  saveTableConfig: {
    type: String,
    default: ''
  },
  getConfig: {
    type: Function
  },
  setConfig: {
    type: Function
  },
  showRefreshIcon: { // 展示独立的刷新按钮
    type: Boolean,
    default: Boolean
  },
  // 是否开启滚动下拉加载更多
  scrollLoad: {
    type: Boolean,
    default: false
  }
};

// Object.keys(formProps).forEach(v => {
//   props.formOptions[v] = formProps[v]
// })

export default props;
