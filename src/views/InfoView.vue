<template>
  <div>
    <h2>게시판 - 보기</h2>
    <table>
      <tr>
        <td>{{ writer }}</td>
        <td>등록일시: {{ createdAt }} 수정일시: {{ modifiedAt ? modifiedAt : '-' }}</td>
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
          <a @click="downloadFile(file.fileId)">
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
    </table>
    <form @submit.prevent>
      <textarea rows="2" cols="250" placeholder="댓글을 입력해 주세요."
                v-model="comment.content"></textarea>
      <button @click="postComment">등록</button>
    </form>
    <table>
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
      comment: {content: ''},
      boardId: '',
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
    },
    postComment() {
      axios
          .post(`http://localhost:8080/api/v1/boards/free/view/${this.boardId}/comments`, this.comment)
          .then((response) => {
            if (response.status === 201) {
              this.getData();
            } else {
              alert("댓글 작성 실패");
            }
          })
          .catch((error) => {
            console.log(error);
          });
    },
    downloadFile(fileId) {
      axios
          .get(`http://localhost:8080/api/v1/boards/free/view/file/${fileId}`, {
            responseType: 'blob'
          })
          .then((response) => {
            console.log(response.headers)
            //header content-disposition 헤더에서 파일이름 추출.
            const encodedName = response.headers['content-disposition'].split('filename=')[1]

            // 이름 디코딩
            const name = decodeURIComponent(encodedName.replace(/^\"|\"$/g, ''));

            // 헤더로 받아온 content-type과 Blob 파일을 url로 지정 후 a태그에 url 지정
            const url = window.URL.createObjectURL(new Blob([response.data]
                , {type: response.headers['content-type']}))

            const link = document.createElement('a')

            link.href = url
            link.setAttribute('download', name)

            document.body.appendChild(link)

            link.click()
            link.remove();
          })
          .catch((error) => {
            console.log(error);
          })
    }
  }
}
</script>
