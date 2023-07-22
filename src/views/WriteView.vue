<template>
  <div>
    <h2>게시판 - 등록</h2>
    <form @submit.prevent enctype="multipart/form-data">
      <table>
        <tr>
          <th>카테고리</th>
          <td colspan="2">
            <select name="categoryId" v-model="boardPostRequestDto.categoryId">
              <option :value="'ALL'" selected>카테고리 선택</option>
              <option v-for="category in categoryDtoList"
                      :key="category.categoryId" :value="category.categoryId">
                {{ category.categoryName }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>작성자</th>
          <td>
            <input type="text" name="writer"
                   v-model="boardPostRequestDto.writer">
          </td>
        </tr>
        <tr>
          <th>비밀번호</th>
          <td>
            <input type="password" placeholder="비밀번호" name="password"
                   v-model="boardPostRequestDto.password">
          </td>
          <td>
            <input type="password" placeholder="비밀번호 확인" name="rePassword"
                   v-model="boardPostRequestDto.rePassword">
          </td>
        </tr>
        <tr>
          <th>제목</th>
          <td colspan="3">
        <textarea rows="1" cols="60" name="title"
                  v-model="boardPostRequestDto.title"></textarea>
          </td>
        </tr>
        <tr>
          <th>내용</th>
          <td colspan="3">
        <textarea rows="10" cols="60" name="content"
                  v-model="boardPostRequestDto.content"></textarea>
          </td>
        </tr>
        <tr>
          <th>파일첨부</th>
          <td>
            <input type="file" ref="fileInput1" @change="onFileChange(1)">
            <input type="file" ref="fileInput2" @change="onFileChange(2)">
            <input type="file" ref="fileInput3" @change="onFileChange(3)">
          </td>
        </tr>
        <tr>
          <td colspan="3" class="button">
            <div class="button-left">
              <router-link
                  :to="{path:'/boards/free/list',query: this.$route.query}">
                <button>취소</button>
              </router-link>
            </div>
            <div class="button-right">
              <button @click="postBoard">저장</button>
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
  name: 'WriteView',
  data() {
    return {
      categoryDtoList: [],
      boardPostRequestDto: {
        categoryId: 'ALL',
        writer: '',
        password: '',
        rePassword: '',
        title: '',
        content: '',
        files: [],
      }
    }
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      axios
          .get("http://localhost:8080/api/v1/categories")
          .then((response) => {
            this.categoryDtoList = response.data;
          }).catch((error) => {
        console.log(error);
      });
    },
    onFileChange(inputNumber) {
      const fileInput = this.$refs[`fileInput${inputNumber}`];

      const selectedFile = fileInput.files[0]; // 하나의 파일만 선택됨

      this.boardPostRequestDto.files.push(selectedFile);
    },
    postBoard() {
      // 유효성 검증 추가
      const isValid = this.validateForm();
      if (!isValid) {
        return;
      }

      const formData = new FormData();

      formData.append('categoryId', this.boardPostRequestDto.categoryId);
      formData.append('writer', this.boardPostRequestDto.writer);
      formData.append('password', this.boardPostRequestDto.password);
      formData.append('rePassword', this.boardPostRequestDto.rePassword);
      formData.append('title', this.boardPostRequestDto.title);
      formData.append('content', this.boardPostRequestDto.content);

      // 각각의 선택된 파일들을 formData에 직접 추가
      for (let i = 0; i < this.boardPostRequestDto.files.length; i++) {
        formData.append(`files[${i}]`, this.boardPostRequestDto.files[i]);
      }

      axios
          .post("http://localhost:8080/api/v1/board/free/write", formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((response) => {
            console.log(response)
            if (response.status === 201) {
              const boardId = response.data;

              this.$router.push({
                name: 'InfoView',
                params: {boardId: boardId},
                query: this.$route.query
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
    validateForm() {
      const {
        categoryId,
        writer,
        password,
        rePassword,
        title,
        content
      } = this.boardPostRequestDto;

      const errors = [];

      // 카테고리 필수 선택 검증
      if (categoryId === "all") {
        errors.push("카테고리를 선택해주세요.");
      }

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

      // 비밀번호 확인 일치 검증
      if (password !== rePassword) {
        errors.push("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
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
