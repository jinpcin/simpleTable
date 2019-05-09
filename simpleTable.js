Vue.component("customPagination", {
  props: [
      'totalCnt',
      'totalPage',
      'currentPage',
      'rowsPerPage',
      'pageNumLength'
  ],
  computed: {
      'first_page': function() {
          return (this.currentPage > 1) ? 1 : null;
      },
      'last_page': function() {
          return (this.currentPage < this.totalPage) ? this.totalPage : null;
      },
      'prev_seg_page': function() {
          var n_page = this.get_next_div();
          var prev_seg_page = null;
          if ((n_page - this.pageNumLength) > 1) {
              prev_seg_page = n_page - this.pageNumLength;
          }
          return prev_seg_page;
      },
      'next_seg_page' : function() {
          var n_page = this.get_next_div();
          var next_seg_page = null;
          if (n_page < (Math.floor(this.totalPage / this.pageNumLength) * this.pageNumLength) && this.totalPage > this.pageNumLength) {
              next_seg_page = n_page + this.pageNumLength;
          }
          return next_seg_page;
      },
      'pages': function() {
          var pages = [];
          var start_page = 1;
          var end_page = 1;
          var total_page = this.totalPage;
          var current_page = this.currentPage;

          if (current_page < 1) {
              current_page = 1;
          } else if (current_page > total_page) {
              current_page = total_page;
          }

          if (current_page > total_page - Math.floor(this.pageNumLength / 2)) {
              end_page = total_page;
              start_page = end_page - this.pageNumLength + 1;
              if (start_page < 1) {
                  start_page = 1;
              }
          } else {
              start_page = current_page - Math.floor(this.pageNumLength / 2);
              if (start_page < 1) {
                  start_page = 1;
              }
              end_page = start_page + this.pageNumLength - 1;
              if (end_page > total_page) {
                  end_page = total_page;
              }
          }

          if (end_page > total_page) {
              end_page = total_page;
          }

          for (var i=start_page;i<=end_page;i++) {
              pages.push({
                  num: i,
                  current: current_page == i,
                  link: i
              });
          }

          return pages;
      }
  },
  methods: {
      get_next_div: function() {
          return (Math.floor(this.currentPage / this.pageNumLength) * this.pageNumLength) + 1;
      },
      paging: function(p) {
          this.$emit('pm', p);
      }
  },
  template: "#customPagination"
});

Vue.component("customSearchBar", {
props: [
    'ikeyword'
],
data: function() {
    return {
        'select': '1',
        'keyword': this.ikeyword,
    }
},
methods: {
    'search': _.debounce(function() {
        this.$emit('sm', {page: 1, select: this.select, keyword: (this.keyword ? this.keyword : '_')});
    }, 300)
},
template: "#customSearchBar"
});

var customList = Vue.component("customList", {
props: [
    'items',
],
data: function() {
    return {
        'keyword': '',
        'sort': ''
    };
},
computed: {
    'dataList': function() {
        var result = this.items;
        var self = this;

        if (result.length > 0) {
          // result = _.filter(result, function(item) {
          //     var res = true;
          //     검색어
          //     if (self.keyword != undefined) {
          //         res = (res && (item['planiTitle'].toLowerCase().indexOf(self.keyword.toLowerCase()) != -1));
          //     }

          //     return res;
          // });

          // if (this.sort_key) {
          //     result = _.orderBy(result, this.sort_key, this.sort_type);
          // }
        }

        return result;
    }
},
methods: {
    sorting: function(obj, sortKey) {
      this.$emit('st', obj, sortKey);
    }
},
template: "#customList"
});


var router = new VueRouter({
  routes: [
    { path: '/', component: customList },
    { path: '/:page', component: customList },
    { path: '/:page/sort/:sort', component: customList },
    { path: '/:page/:select/:keyword', component: customList },
    { path: '/:page/:select/:keyword/sort/:sort', component: customList },
]
});


var app = new Vue({
el: '#page_container',
data: {
  'totalCnt': 0,
  'rowsPerPage': 2,
  'pageNumLength': 5,
  'items': [],
  'sortColumn': {},
},
created: function () {
  this.dataLoad();
},
updated: function() {
  this.sorted();
},
computed: {
  'currentPage': function() {
      return this.$route.params.page || 1;
  },
  'select': function() {
      return this.$route.params.select || '';
  },
  'sort': function() {
      return this.$route.params.sort || '';
  },
  'keyword': function() {
      return this.$route.params.keyword || '';
  },
  'totalPage': function() {
      return Math.ceil(this.totalCnt / this.rowsPerPage);
  }
},
methods: {
  url: function(obj) {
      var page = obj.page ? obj.page : this.currentPage;
      var select = obj.select ? obj.select: this.select;
      var keyword = obj.keyword ? obj.keyword: this.keyword;
      var sort = obj.sort ? obj.sort: this.sort;

      var url = '/' + page;
      if (keyword && keyword != '_') {
          url += '/' + select;
          url += '/' + keyword;
      }

      if (sort && sort != '_') {
          url += '/sort/' + sort;
      }

      return url;
  },
  dataLoad: function() {
      var self = this;
      $.ajax({
          url: '/testApi.es',
          data: {
              nPage: this.currentPage,
              select: this.select,
              keyWord: this.keyword,
              sort: this.sort,
          },
          dataType: 'json',
          success: function (res) {
              self.items = res.list;
              self.totalCnt = res.totalCount;
          }, error: function (err) {
              console.log(err);
          }
      });
  },
  pageMove: function(p) {
      this.$router.push(this.url({page : p}));
  },
  searchMove: function(search) {
      this.$router.push(this.url(search));
  },
  sorted: function() { // 컬럼 정렬 상태 꾸미기
      $("[data-column]").each(function() {
          $(this).find('i.fa').remove();
      });

      if (this.sort) {
          var sortVal = this.sort.split(':');
          var target = $("[data-column="+sortVal[0]+"]");
          if (sortVal[1] === 'desc') {
              target.append('<i class="fa fa-caret-down"></i>');
          } else if (sortVal[1] === 'asc') {
              target.append('<i class="fa fa-caret-up"></i>');
          }
      }
  },
  sorting: function(obj, sortKey) {
      if (!this.sortColumn[sortKey]) {
          this.sortColumn[sortKey] = 'desc';
      } else if (this.sortColumn[sortKey] === 'desc') {
          this.sortColumn[sortKey] = 'asc';
      } else {
          delete this.sortColumn[sortKey];
      }

      var sort = sortKey;
      if (this.sortColumn[sortKey] === 'desc') {
          sort += ':desc';
      } else if (this.sortColumn[sortKey] === 'asc') {
          sort += ':asc';
      } else {
          sort = '_';
      }

      this.$router.push(this.url({sort:sort}));
      this.sorted();
  }
},
router: router,
watch: {
  '$route' (to, from) {
    this.dataLoad();
  }
}
});

Vue.config.devtools = true;