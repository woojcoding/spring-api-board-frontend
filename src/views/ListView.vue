<template>
  <div>
    <h1>자유게시판 - 목록</h1>
    <form>
      <table class="search">
        <tr>
          <td>등록일</td>
          <td>
            <input type="date" name="startDate"
                   v-model="boardSearch.startDate"/>
            ~
            <input type="date" name="endDate" v-model="boardSearch.endDate"/>
          </td>
          <td>
            <select name="category" v-model="boardSearch.category">
              <option :value="'ALL'" selected>전체 카테고리</option>
              <option v-for="category in categoryDtoList"
                      :key="category.categoryId" :value="category.categoryId">
                {{ category.categoryName }}
              </option>
            </select>
          </td>
          <td><input type="text" name="keyword" v-model="boardSearch.keyword"
                     placeholder="검색어를 입력해 주세요.(제목 + 작성자 + 내용)"></td>
          <td>
            <button @click="search">검색</button>
          </td>
        </tr>
      </table>
    </form>
    <br>
    총 &nbsp <span>{{ totalBoardCount }}</span> &nbsp 건
    <table class="boardList">
      <tr>
        <td>카테고리</td>
        <td>첨부</td>
        <td>제목</td>
        <td>작성자</td>
        <td>조회수</td>
        <td>등록 일시</td>
        <td>수정 일시</td>
      </tr>
      <tr v-for="board in boardResponseDtoList" v-bind:key="board.boardId">
        <td>{{ board.categoryName }}</td>
        <td>{{ board.attached ? '첨부됨' : '없음' }}</td>
        <td>
          <a v-on:click="$event => info(board)">{{ board.title }}</a>
        </td>
        <td>{{ board.writer }}</td>
        <td>{{ board.views }}</td>
        <td>{{ board.createdAt }}</td>
        <td>{{ board.modifiedAt ? board.modifiedAt : '-' }}</td>
      </tr>
    </table>
    <!-- 페이징 버튼 -->
    <div class="pagination">
      <a v-if="currentPage > 1" @click="changePage(1)">&lt;&lt;</a>
      <a v-if="currentPage > 1"
         @click="changePage(Math.max(startPage - pageLimit, 1))">&lt;</a>
      <a v-for="page in pages" :key="page" @click="changePage(page)">
        {{ page }}</a>
      <a v-if="currentPage < pageCount"
         @click="changePage(Math.min(startPage + pageLimit, pageCount))">&gt;</a>
      <a v-if="currentPage < pageCount"
         @click="changePage(pageCount)">&gt;&gt;</a>
    </div>
    <router-link :to="{path: '/board/free/write', query: boardSearch}">
      <button>등록</button>
    </router-link>
  </div>
</template>

<script>
import axios from "axios";
import store from "@/store/index"

export default {
  name: 'ListView',
  data() {
    return {
      boardSearch: {
        startDate: '',
        endDate: '',
        category: '',
        keyword: '',
        pageNum: ''
      },
      boardResponseDtoList: [],
      totalBoardCount: 0,
      categoryDtoList: [],
      currentPage: 1,
      pageSize: 10,
      pageLimit: 10,
      startPage: 1,
      endPage: 1,
    };
  },
  created() {
    this.$store.commit('setBoardData', {});

    sessionStorage.removeItem('setBoardData')

    this.getData();

    if (this.$route.query.pageNum) {
      this.currentPage = this.$route.query.pageNum;
    }
  },
  computed: {
    pageCount() {
      // 총 페이지 수를 계산하여 반환
      return Math.ceil(this.totalBoardCount / this.pageSize);
    },
    pages() {
      // 현재 페이지를 중심으로 페이징 버튼에 표시할 페이지 번호들을 계산하여 반환
      this.startPage = Math.floor((this.currentPage - 1) / this.pageLimit) * this.pageLimit + 1;

      this.endPage = this.startPage + this.pageLimit - 1;

      const pageCount = Math.ceil(this.totalBoardCount / this.pageSize);

      if (this.endPage > pageCount) {
        this.endPage = pageCount
      }

      const pages = [];
      for (let i = this.startPage; i <= this.endPage; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    getData() {
      const boardSearch = this.$route.query;

      axios
          .get("http://localhost:8080/api/v1/boards/free/list", {
            params: boardSearch
          })
          .then((response) => {
            this.boardSearch = boardSearch;
            this.boardResponseDtoList = response.data.boardResponseDtoList;
            this.totalBoardCount = response.data.totalBoardCount;
            this.categoryDtoList = response.data.categoryDtoList;
          })
          .catch((error) => {
            console.log(error)
          });
    },
    changePage(page) {
      this.boardSearch.pageNum = page;
      this.currentPage = page;
      this.getData();
    },
    info(board) {
      this.$router.push({
        name: 'InfoView',
        params: {boardId: board.boardId},
        query: this.boardSearch
      });
    },
    search() {
      const queryParams = new URLSearchParams(boardSearch).toString();
      this.$router.push({name: 'ListView', query: queryParams});
    },
  }
}
</script>
