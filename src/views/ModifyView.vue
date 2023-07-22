<template>
  <div>
    <h2>게시판 - 수정</h2>
    기본정보
    <form @submit.prevent enctype="multipart/form-data">
      <table>
        <tr>
          <th>카테고리</th>
          <td>{{ boardData.categoryName }}</td>
        </tr>
        <tr>
          <th>등록 일시</th>
          <td>{{ boardData.createdAt }}</td>
        </tr>
        <tr>
          <th>수정 일시</th>
          <td>{{ boardData.modifiedAt ? boardData.modifiedAt : '-' }}</td>
        </tr>
        <tr>
          <th>조회수</th>
          <td>{{ boardData.views }}</td>
        </tr>
        <tr>
          <th>작성자</th>
          <td>
            <input type="text" v-model="boardData.writer">
          </td>
        </tr>
        <tr>
          <th>비밀번호</th>
          <td>
            <input type="password" v-model="boardUpdateDto.password"
                   placeholder="비밀번호">
          </td>
        </tr>
        <tr>
          <th>제목</th>
          <td>
            <textarea class="text" rows="1" cols="100"
                      v-model="boardData.title">
            </textarea>
          </td>
        </tr>
        <tr>
          <th>내용</th>
          <td>
            <textarea class="text" rows="10" cols="60"
                      v-model="boardData.content"></textarea>
          </td>
        </tr>
        <tr>
          <th>파일 첨부</th>
          <td>
            <table id="fileTable">
              <tbody>
              <!-- 기존의 파일 행 -->
              <tr v-for="file in boardData.fileDtoList"
                  v-bind:key="file.fileId">
                <td>{{ file.originalName }}
                  <a @click="downloadFile(file.fileId)">
                    download
                  </a>
                  삭제
                  <input type="checkbox"
                         @change="handleFileDelete(file.fileId)">
                </td>
              </tr>
              <!-- 추가 입력란 -->
              <tr v-for="i in 3 - boardData.fileDtoList.length" :key="i"
                  v-if="boardData.fileDtoList.length < 3">
                <td>
                  <input type="file" @change="onFileChange($event)">
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div class="button-left">
              <router-link
                  :to="{ path: `/boards/free/view/${this.boardData.boardId}`,
                  query: this.$route.query }">
                <button>취소</button>
              </router-link>
            </div>
            <div class="button-right">
              <button @click="update" class="button">저장
              </button>
            </div>
          </td>
        </tr>
      </table>
    </form>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: 'ModifyView',
  data() {
    return {
      boardData: {},
      boardUpdateDto: {
        password: '',
        files: [],
        deleteFileIdList: []
      }
    }
  },
  created() {
    const storedData = sessionStorage.getItem('setBoardData');

    if (storedData) {
      this.boardData = JSON.parse(storedData);
    }
  },
  methods: {
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
    update() {
      // 유효성 검증 추가
      const isValid = this.validateUpdateForm();

      if (!isValid) {
        return;
      }

      const formData = new FormData();

      formData.append('writer', this.boardData.writer);
      formData.append('password', this.boardUpdateDto.password);
      formData.append('title', this.boardData.title);
      formData.append('content', this.boardData.content);

      // 개별 파일을 formData에 추가
      for (let i = 0; i < this.boardUpdateDto.files.length; i++) {
        formData.append('files', this.boardUpdateDto.files[i]);
      }

      // deleteFileIdList 배열의 각 아이디를 formData에 추가
      for (let i = 0; i < this.boardUpdateDto.deleteFileIdList.length; i++) {
        formData.append('deleteFileIdList', this.boardUpdateDto.deleteFileIdList[i]);
      }

      axios
          .patch(`http://localhost:8080/api/v1/board/free/modify/${this.boardData.boardId}`,
              formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
          .then((response) => {
            console.log(response)
            if (response.status === 200) {
              const boardId = response.data;

              this.$router.push({
                name: 'InfoView',
                params: {boardId: this.boardData.boardId}
              });
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
    },
    handleFileDelete(fileId) {
      const index = this.boardUpdateDto.deleteFileIdList.indexOf(fileId);

      if (index === -1) {
        // fileId가 deleteFileIdList에 없으면 배열에 추가
        this.boardUpdateDto.deleteFileIdList.push(fileId);
      } else {
        // fileId가 deleteFileIdList에 있으면 배열에서 삭제
        this.boardUpdateDto.deleteFileIdList.splice(index, 1);
      }
    },
    onFileChange(event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        this.boardUpdateDto.files.push(selectedFile);
      }
    },
    validateUpdateForm() {
      const errors = [];

      const {
        writer,
        title,
        content
      } = this.boardData;

      const {
        password
      } = this.boardUpdateDto;

      // 작성자 필수, 글자 수 검증
      if (writer.length < 3 || writer.length >= 5) {
        errors.push("작성자는 3글자 이상, 5글자 미만으로 입력해주세요.");
      }

      // 비밀번호 필수, 글자 수, 패턴 검증
      if (
          password.length < 4 ||
          password.length >= 16 ||
          !password.match(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/)
      ) {
        errors.push("비밀번호는 4글자 이상, 16글자 미만의 영문, 숫자, 특수문자 조합으로 입력해주세요.");
      }

      // 제목 필수, 글자 수 검증
      if (title.length < 4 || title.length >= 100) {
        errors.push("제목은 4글자 이상, 100글자 미만으로 입력해주세요.");
      }

      // 내용 필수, 글자 수 검증
      if (content.length < 4 || content.length >= 2000) {
        errors.push("내용은 4글자 이상, 2000글자 미만으로 입력해주세요.");
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));

        return false;
      }

      return true;
    }
  }
}
</script>
