const express = require('express');
const path = require('path');
const fs = require('fs'); // 파일 시스템 모듈
const app = express();

// public 폴더에서 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 게시물 데이터를 JSON 파일로 관리
const postsFilePath = path.join(__dirname, 'posts.json');

// 게시물을 로드하는 함수
function loadPosts() {
    if (fs.existsSync(postsFilePath)) {
        const data = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(data);
    } else {
        return []; // 파일이 없으면 빈 배열 반환
    }
}

// 게시물을 저장하는 함수
function savePosts(posts) {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
}

// 기본 경로에서 /main으로 리디렉션
app.get('/', (req, res) => {
    res.redirect('/main');
});

// 로그인 페이지
app.get('/login', (req, res) => {
    res.render('login');
});

// 이용약관 페이지
app.get('/TermsofUse', (req, res) => {
    res.render('TermsofUse');
});

// 메인 페이지
app.get('/main', (req, res) => {
    res.render('main');
});

// 소개 페이지
app.get('/lntroduction', (req, res) => {
    res.render('lntroduction');
});

// 회원가입 페이지
app.get('/signup', (req, res) => {
    res.render('signup');
});

// 학문적 경로 페이지
app.get('/academic-pathways', (req, res) => {
    res.render('academic-pathways');
});

// 커뮤니티 페이지 (게시물 데이터를 동적으로 전달)
app.get('/community', (req, res) => {
    const posts = loadPosts(); // 게시물 데이터 로드
    res.render('community', {
        posts: posts
    });
});

// 게시물 작성 API (POST 요청으로 게시물 추가)
app.post('/addPost', express.json(), (req, res) => {
    const { category, title, author, content } = req.body;
    const newPost = {
        id: Date.now(),
        category,
        title,
        author,
        content,
        date: new Date().toISOString().split("T")[0],
        views: 0,
        likes: 0,
        comments: []
    };

    const posts = loadPosts(); // 게시물 로드
    posts.push(newPost); // 새로운 게시물 추가
    savePosts(posts); // 게시물 저장

    res.status(201).send(newPost); // 새 게시물 반환
});

// 게시물 삭제 API (DELETE 요청으로 게시물 삭제)
app.delete('/deletePost/:id', (req, res) => {
    const { id } = req.params;
    let posts = loadPosts();
    posts = posts.filter(post => post.id !== parseInt(id)); // 해당 ID의 게시물 삭제
    savePosts(posts); // 게시물 저장

    res.status(200).send({ message: '게시물이 삭제되었습니다.' });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
