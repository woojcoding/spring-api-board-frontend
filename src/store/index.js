import {createStore} from 'vuex';

export default createStore({
    state: {
        boardData: {}, // 데이터를 저장할 상태 변수
    },
    mutations: {
        setBoardData(state, data) {
            state.boardData = data;
        },
    },
    actions: {
        // 세션 스토리지에 데이터를 저장하는 액션
        saveToSessionStorage({state}) {
            sessionStorage.setItem('boardData', JSON.stringify(state.boardData));
        },
    }
});
