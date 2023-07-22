<template>
  <div>
    <h2>게시판 - 보기</h2>
    <table>
      <tr>
        <td>{{ boardData.writer }}</td>
        <td>등록일시: {{ boardData.createdAt }} 수정일시:
          {{ boardData.modifiedAt ? boardData.modifiedAt : '-' }}
        </td>
        <td>{{ boardData.modifiedAt }}</td>
      </tr>
      <tr>
        <td colspan="3">[{{ boardData.categoryName }}] {{ title }}</td>
        <td> 조회수: {{ boardData.views }}</td>
      </tr>
      <tr>
        <td colspan="4">{{ boardData.content }}</td>
      </tr>
      <tr v-for="file in boardData.fileDtoList" v-bind:key="file.fileId">
        <td colspan="4">
          <a @click="downloadFile(file.fileId)">
            <span>{{ file.originalName }}</span>
          </a>
        </td>
      </tr>
      <tr v-for="(comment, index) in boardData.commentList" :key="index">
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
        <button @click="list">목록</button>
        <router-link to="/board/free/modify">
          <button>수정</button>
        </router-link>
        <button v-on:click="modalOpen = true">삭제</button>
      </td>
    </table>
    <div v-if="modalOpen === true" class="modal-container">
      <form @submit.prevent>
        <table>
          <tr>
            <td>비밀번호</td>
            <td>
              <input type="password" v-model="inputPassword"
                     placeholder="비밀번호를 입력해 주세요">
            </td>
          </tr>
        </table>
        <button v-on:click="modalOpen = false">취소</button>
        <button @click="deleteBoard">확인</button>
      </form>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import store from "@/store/index"

export default {
  name: 'InfoView',
  data() {
    return {
      boardData: {},
      comment: {content: ''},
      modalOpen: false,
      inputPassword: ''
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
            sessionStorage.setItem('setBoardData', JSON.stringify(response.data));

            store.commit('setBoardData', response.data);

            this.boardData = this.$store.state.boardData;
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
    },
    list() {
      this.$store.commit('setBoardData', {});

      this.$router.push({name: 'ListView'});
    },
    deleteBoard() {
      axios
          .delete(`http://localhost:8080/api/v1/board/free/delete/${this.boardData.boardId}`,{
            params: {password: this.inputPassword}})
          .then((response) => {
            console.log(response.status)
            if (response.status === 200) {
              this.$router.push({name: 'ListView'});
            }
          })
          .catch((error) => {
            // 유효성 검증 실패시
            if (error.response && error.response.status === 400) {
              let alertMessage = "서버측 유효성 검증 오류:\n\n";

              error.response.data.forEach((message, index) => {
                alertMessage += `${index + 1}. ${message}\n`;
              });

              alert(alertMessage);
            } else {
              // 그 외 서버와의 통신 오류 처리
              alert("서버와 통신 중 오류가 발생했습니다.");

              console.error(error);
            }
          });
    }
  }
}
</script>
<style>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
</style>
