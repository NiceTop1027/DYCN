let posts = [];  // 서버에서 불러온 게시물 데이터를 저장할 변수
let currentPage = 1;
const postsPerPage = 10;
let currentPostId = null; // 삭제할 게시물 ID 저장

// 게시물 로드 (서버에서 데이터 받아오기)
document.addEventListener("DOMContentLoaded", () => {
    fetchPosts();  // 페이지 로드 시 게시물 데이터를 서버에서 가져오기
});

// 게시물 데이터를 서버에서 불러오기
function fetchPosts() {
    fetch('/community')
        .then(response => response.json())
        .then(data => {
            posts = data;
            showAllPosts(); // 데이터가 로드되면 게시물 보여주기
        })
        .catch(error => {
            console.error("게시물 로딩 실패:", error);
        });
}

// 게시물 저장
function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts)); // 로컬스토리지에 게시물 저장
}

// 관리자만 삭제 버튼 보이기
function checkAdmin() {
    const userRole = localStorage.getItem("userRole");
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
        if (userRole === 'admin') {
            button.style.display = 'inline-block'; // 관리자만 삭제 버튼을 보이게 함
        } else {
            button.style.display = 'none'; // 일반 사용자는 삭제 버튼을 숨김
        }
    });
}

// 전체 게시물 보여주기
function showAllPosts() {
    currentPage = 1;
    renderPosts();
}

// 게시물 렌더링
function renderPosts() {
    const postTable = document.getElementById("postTable");
    postTable.innerHTML = "";  // 기존 게시물 내용 초기화

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    currentPosts.forEach((post, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${post.category}</td>
            <td><a href="#" onclick="openModal(${index})">${post.title}</a></td>
            <td>${post.author}</td>
            <td>${post.date}</td>
            <td>${post.views}</td>
            <td><button class="deleteButton" onclick="confirmDelete(${index})" style="display:none;">삭제</button></td>
        `;
        postTable.appendChild(row);
    });

    checkAdmin();  // 관리자 여부 체크 후 삭제 버튼 보이기
    updatePagination(Math.ceil(posts.length / postsPerPage));  // 페이지네이션 업데이트
}

// 게시물 조회수 증가
function incrementView(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.views += 1;
        savePosts();
    }
}

// 게시물 모달 열기
function openModal(index) {
    const post = posts[index];
    currentPostId = index; // 현재 게시물 ID 저장
    document.getElementById("modalTitle").innerText = post.title;
    document.getElementById("modalAuthor").innerText = `작성자: ${post.author}`;
    document.getElementById("modalDate").innerText = `작성일: ${post.date}`;
    document.getElementById("modalContent").innerText = post.content;

    incrementView(post.id);
    document.getElementById("myModal").style.display = "block"; // 모달 열기
}

// 댓글 작성 및 표시
function submitComment() {
    const commentText = document.getElementById("commentInput").value.trim();
    if (!commentText) {
        alert("댓글을 작성해주세요.");
        return;
    }

    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId || !userEmail) {
        alert("로그인 후 댓글을 작성할 수 있습니다.");
        return;
    }

    const comment = {
        userId: userId,
        userEmail: userEmail,
        content: commentText,
        timestamp: Date.now()
    };

    const postId = posts[currentPostId].id;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(comment);
        savePosts(); // 로컬스토리지에 저장
        renderComments(postId); // 댓글 갱신
    }

    document.getElementById("commentInput").value = '';  // 댓글 입력창 비우기
}

// 댓글을 게시물 모달에 표시하는 함수
function renderComments(postId) {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = ''; // 기존 댓글 삭제

    const post = posts.find(p => p.id === postId);
    if (post && post.comments) {
        post.comments.forEach((comment, index) => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment-item");
            commentElement.innerHTML = `
                <p><strong>${comment.userId}</strong></p>
                <p>${comment.content}</p>
                <p><small>${new Date(comment.timestamp).toLocaleString()}</small></p>
            `;

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "삭제";
            deleteButton.classList.add("deleteCommentButton");
            deleteButton.style.display = localStorage.getItem("userRole") === "admin" ? "inline-block" : "none";
            deleteButton.onclick = () => deleteComment(postId, index);

            commentElement.appendChild(deleteButton);
            commentsList.appendChild(commentElement);
        });
    }
}

// 댓글 삭제
function deleteComment(postId, commentIndex) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.splice(commentIndex, 1); // 댓글 삭제
        savePosts(); // 로컬스토리지에 새로 저장
        renderComments(postId); // 댓글 갱신
    }
}

// 게시물 삭제 확인 모달
function confirmDelete(index) {
    currentPostId = index;
    document.getElementById("deleteModal").style.display = "block";  // 삭제 모달 열기
}

// 게시물 삭제
function deletePost() {
    fetch(`/deletePost/${posts[currentPostId].id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            posts.splice(currentPostId, 1);
            savePosts(); // 로컬스토리지에 새로 저장
            closeDeleteModal(); // 삭제 모달 닫기
            renderPosts(); // 게시물 렌더링
        })
        .catch(error => console.error("게시물 삭제 실패:", error));
}

// 삭제 모달 닫기
function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

// 게시물 모달 닫기
function closeModal() {
    document.getElementById("myModal").style.display = "none";  // 게시물 모달 닫기
}

// 게시물 작성 모달 열기
function openPostForm() {
    document.getElementById("postModal").style.display = "block";  // 게시물 작성 모달 열기
}

// 게시물 작성 모달 닫기
function closePostModal() {
    document.getElementById("postModal").style.display = "none";  // 게시물 작성 모달 닫기
}

// 게시물 작성하기
function submitPost() {
    const category = document.getElementById("category").value;
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const content = document.getElementById("content").value.trim();
    const date = new Date().toISOString().split("T")[0];

    if (!title || !content) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    const newPost = {
        category,
        title,
        author,
        content,
        date,
        views: 0,
        likes: 0,
        comments: []  // 댓글 추가
    };

    fetch('/addPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
    })
    .then(response => response.json())
    .then(data => {
        posts.push(data); // 새로 작성된 게시물 추가
        savePosts();  // 게시물 저장
        document.getElementById("postForm").reset();
        closePostModal();  // 모달 닫기
        showAllPosts();  // 새로 작성된 게시물 보여주기
    })
    .catch(error => console.error("게시물 작성 실패:", error));
}

// 페이지 변경
function changePage(direction) {
    currentPage += direction;
    renderPosts();
}

// 페이지네이션 업데이트
function updatePagination(totalPages) {
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement("span");
        pageNumber.innerText = i;
        pageNumber.className = i === currentPage ? "active" : "";
        pageNumber.onclick = () => {
            currentPage = i;
            renderPosts();
        };
        pageNumbers.appendChild(pageNumber);
    }

    document.getElementById("prevPage").style.display = currentPage === 1 ? "none" : "inline";
    document.getElementById("nextPage").style.display = currentPage === totalPages ? "none" : "inline";
}
