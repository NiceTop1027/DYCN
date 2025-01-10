const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://edenya:iIXa0qu8s3CTdKiB@cluster.sqzvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// 게시물 데이터 모델 정의
const postSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [{ type: String }]  // 댓글은 배열로 저장
});

const Post = mongoose.model('Post', postSchema);

// JSON 데이터 처리를 위한 미들웨어 설정
app.use(express.json());  // 클라이언트에서 JSON 데이터를 받을 수 있도록 설정
app.use(express.urlencoded({ extended: true }));  // URL 인코딩된 데이터 처리

// public 폴더에서 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// 마이페이지 (로그인하지 않은 경우 로그인 페이지로 리디렉션)
app.get('/mypage', (req, res) => {
    const user = req.session.user; // 세션에서 로그인된 사용자 확인
    if (!user) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
    }
    res.render('mypage', { user });
});

app.get('/community', (req, res) => {
    Post.find()  // MongoDB에서 모든 게시물을 조회
        .then(posts => {
            // 각 게시물에 번호를 추가
            const postsWithNumbers = posts.map((post, index) => {
                post.number = index + 1; // 번호 추가
                return post;
            });
            res.render('community', { posts: postsWithNumbers });  // 번호가 포함된 게시물 데이터 전달
        })
        .catch(err => {
            console.error("게시물 조회 실패:", err);
            res.status(500).send("게시물 조회 실패");
        });
});

// 게시물 작성 API (POST 요청으로 MongoDB에 게시물 추가)
app.post('/addPost', (req, res) => {
    const { category, title, author, content } = req.body;
    const newPost = new Post({
        category,
        title,
        author,
        content,
        date: new Date().toISOString().split("T")[0], // 현재 날짜
        views: 0,
        likes: 0,
        comments: []
    });

    newPost.save()
        .then(post => {
            res.status(201).json(post);  // 새 게시물 반환 (JSON 응답)
        })
        .catch(err => {
            console.error("게시물 작성 실패:", err);
            res.status(500).send("게시물 작성 실패");
        });
});

app.delete('/deletePost/:id', (req, res) => {
    const { id } = req.params;

    Post.findByIdAndDelete(id)
        .then(result => {
            if (result) {
                res.status(200).send({ message: '게시물이 삭제되었습니다.' });
            } else {
                res.status(404).send({ message: '게시물을 찾을 수 없습니다.' });
            }
        })
        .catch(err => {
            console.error("게시물 삭제 실패:", err);
            res.status(500).send("게시물 삭제 실패");
        });
});

// 댓글 추가 API (POST 요청으로 MongoDB에 댓글 추가)
app.post('/addComment/:postId', (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: '게시물을 찾을 수 없습니다.' });
            }

            post.comments.push(comment);
            post.save()
                .then(updatedPost => res.status(200).json(updatedPost))
                .catch(err => {
                    console.error("댓글 추가 실패:", err);
                    res.status(500).send("댓글 추가 실패");
                });
        })
        .catch(err => {
            console.error("게시물 조회 실패:", err);
            res.status(500).send("게시물 조회 실패");
        });
});

// 서버 실행
const PORT = process.env.PORT || 3000; // 환경 변수 또는 기본 포트 3000 사용
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
