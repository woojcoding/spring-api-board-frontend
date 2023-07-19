<template>
  <div>
    <h2>게시판 - 보기</h2>
    <table>
      <tr>
        <td>{{ writer }}</td>
        <td>{{ createdAt }}</td>
        <td>{{ modifiedAt }}</td>
      </tr>
      <tr>
        <td colspan="3">[{{ categoryName }}] {{ title }}</td>
        <td> 조회수: {{ views }}</td>
      </tr>
      <tr>
        <td colspan="4">{{ content }}</td>
      </tr>
      <tr v-for="file in fileDtoList" v-bind:key="file.fileId">
        <td colspan="4">
          <a>
            <span>{{ file.originalName }}</span>
          </a>
        </td>
      </tr>
      <tr v-for="(comment, index) in commentList" :key="index">
        <td colspan="4">
          <span>{{ comment.createdAt }}</span>
          <br>
          <span>{{ comment.content }}</span>
        </td>
      </tr>
      <form method="post">
        <tr class="commentEnd">
          <td colspan="3">
            <textarea rows="2" cols="250"></textarea>
          </td>
          <td>
            <button type="submit">등록</button>
          </td>
        </tr>
      </form>
      <td class="buttons" colspan="4">
        <router-link to="/boards/free/list">
          <button>목록</button>
        </router-link>
        <a>
          <button>수정</button>
        </a>
        <button id="deleteButton">삭제</button>
      </td>
    </table>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: 'InfoView',
  data() {
    return {
      boardId: null,
      writer: '',
      title: '',
      content: '',
      views: '',
      createdAt: '',
      modifiedAt: '',
      categoryName: '',
      commentList: [], // 댓글 List
      fileDtoList: [], // 파일 List
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      const boardId = this.$route.params.boardId;

      axios
          .get(`http://localhost:8080/api/v1/boards/free/view/${boardId}`)
          .then((response) => {
            this.boardId = response.data.boardId;
            this.writer = response.data.writer;
            this.title = response.data.title;
            this.content = response.data.content;
            this.views = response.data.views;
            this.createdAt = response.data.createdAt;
            this.modifiedAt = response.data.modifiedAt;
            this.categoryName = response.data.categoryName;
            this.commentList = response.data.commentList;
            this.fileDtoList = response.data.fileDtoList;
          })
          .catch((error) => {
            console.log(error)
          });
    }
  }
}
</script>
