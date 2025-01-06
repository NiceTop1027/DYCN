const express = require('express');
const path = require('path');
const app = express();

// public 폴더에서 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.redirect('/main'); // 기본 경로로 요청하면 로그인 페이지로 리디렉션
});

// 정적 파일 제공 (이미지, CSS, JS 등)
app.use(express.static(path.join(__dirname, 'images')));

// 로그인 페이지 렌더링
app.get('/login', (req, res) => {
    res.render('login');
});

// 이용약관 페이지 렌더링
app.get('/TermsofUse', (req, res) => {
    res.render('TermsofUse');
});

// 메인 페이지 렌더링
app.get('/main', (req, res) => {
    res.render('main');
});

// 소개 페이지 렌더링
app.get('/lntroduction', (req, res) => {
    res.render('lntroduction');
});

// 회원가입 페이지 렌더링
app.get('/signup', (req, res) => {
    res.render('signup');
});

// 학문적 경로 페이지 렌더링 (로그인 후 이동)
app.get('/academic-pathways', (req, res) => {
    res.render('academic-pathways');
});

// 커뮤니티 페이지 (게시물 데이터를 동적으로 전달)
app.get('/community', (req, res) => {
    const posts = [
        {
            category: '공지',
            title: '게시판 안내',
            author: '관리자',
            date: '2025-01-01',
            views: 10,
            likes: 5,
        },
        {
            category: '질문',
            title: '게시판 사용법',
            author: '사용자1',
            date: '2025-01-02',
            views: 20,
            likes: 15,
        },
        {
            category: '일반',
            title: '오늘의 공지',
            author: '사용자2',
            date: '2025-01-03',
            views: 30,
            likes: 25,
        },
    ];

    res.render('community', {
        posts
    }); // community.ejs 템플릿 렌더링
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});