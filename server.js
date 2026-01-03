import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

// 连接MongoDB Atlas
mongoose.connect('mongodb+srv://Luser:Dfufei6340@cluster0.nqitfdf.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB 已连接'))
  .catch(err => console.log(err));

// 定义打卡Schema
const recordSchema = new mongoose.Schema({
  name: String,
  date: String,   // YYYY-MM-DD
  clockIn: String,
  clockOut: String
});

const Record = mongoose.model('Record', recordSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 员工打卡
app.post('/api/clock', async (req, res) => {
  const { name, type } = req.body; // type: "in" 或 "out"
  const date = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2,'0');
    const day = String(now.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
  })();

  let record = await Record.findOne({ name, date });

  if(!record) {
    record = new Record({ name, date, clockIn: null, clockOut: null });
  }

  if(type === 'in') {
    if(record.clockIn) return res.status(400).json({ message: '已打卡上班' });
    record.clockIn = new Date().toLocaleTimeString();
  } else if(type === 'out') {
    if(record.clockOut) return res.status(400).json({ message: '已打卡下班' });
    record.clockOut = new Date().toLocaleTimeString();
  }

  await record.save();
  res.json(record);
});

// 获取所有打卡记录（管理员）
app.get('/api/records', async (req, res) => {
  const records = await Record.find().sort({ date: -1 });
  res.json(records);
});

app.listen(5000, () => console.log('Server running on port 5000'));