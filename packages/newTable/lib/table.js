'use strict';
import SearchTablePagination from '../src/pkgs/search-table-pagination/index.js';
import SearchForm from '../src/pkgs/search/index.js';

const components = [
  SearchTablePagination,
  SearchForm
];

const install = function(Vue) {
  components.map(component => {
    Vue.component(component.name, component);
  });
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  SearchTablePagination,
  SearchForm
};
