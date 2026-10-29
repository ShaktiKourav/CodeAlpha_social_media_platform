// require("dotenv").config();

// const express=require("express"),cors=require("cors"),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken"),fs=require("fs"),path=require("path"),crypto=require("crypto");
// const app=express(),PORT=process.env.PORT||3000,SECRET=process.env.JWT_SECRET||"development-secret-change-me";
// const multer=require("multer");
// const mongoose = require("mongoose");


// const userSchema = new mongoose.Schema({
//   id: { type: String, unique: true, required: true },
//   name: String,
//   username: { type: String, unique: true },
//   email: { type: String, unique: true },
//   password: String,
//   bio: String,
//   avatar: String,
//   createdAt: String,
//   following: [String],
//   followers: [String]
// }, { versionKey: false });

// const postSchema = new mongoose.Schema({
//   id: { type: String, unique: true, required: true },
//   userId: String,
//   content: String,
//   image: String,
//   createdAt: String,
//   likes: [String],
//   comments: [{
//     id: String,
//     userId: String,
//     text: String,
//     createdAt: String
//   }]
// }, { versionKey: false });

// const User = mongoose.model("User", userSchema);
// const Post = mongoose.model("Post", postSchema);

// const DATA=path.join(__dirname,"data","db.json"),UPLOAD_DIR=path.join(__dirname,"public","uploads");
// fs.mkdirSync(UPLOAD_DIR,{recursive:true});
// const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,UPLOAD_DIR),filename:(_,file,cb)=>{const ext=({"image/jpeg":".jpg","image/png":".png","image/webp":".webp","image/gif":".gif"})[file.mimetype];cb(null,crypto.randomUUID()+ext)}});
// const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(_,file,cb)=>cb(null,["image/jpeg","image/png","image/webp","image/gif"].includes(file.mimetype))});
// app.use(cors());app.use(express.json({limit:"1mb"}));app.use(express.static(path.join(__dirname,"public")));
// const id=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
// function init(){fs.mkdirSync(path.dirname(DATA),{recursive:true});if(!fs.existsSync(DATA)){let a="user-ava",n="user-noah",d="user-demo";fs.writeFileSync(DATA,JSON.stringify({users:[
// {id:d,name:"Alex Morgan",username:"alexmorgan",email:"demo@socially.dev",password:bcrypt.hashSync("Demo123!",10),bio:"Building little things, learning every day ✨",avatar:"https://i.pravatar.cc/160?img=12",createdAt:now(),following:[a],followers:[a]},
// {id:a,name:"Ava Patel",username:"avapatel",email:"ava@example.com",password:bcrypt.hashSync("Demo123!",10),bio:"Design, coffee, and slow mornings ☕",avatar:"https://i.pravatar.cc/160?img=47",createdAt:now(),following:[d],followers:[d,n]},
// {id:n,name:"Noah Williams",username:"noahw",email:"noah@example.com",password:bcrypt.hashSync("Demo123!",10),bio:"Photographer | Finding stories in ordinary days.",avatar:"https://i.pravatar.cc/160?img=11",createdAt:now(),following:[a],followers:[]}],
// posts:[
// {id:"post-1",userId:a,content:"A little reminder to make room for the things that make you feel alive. What made you smile today? 🌿",image:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80",createdAt:new Date(Date.now()-3600000).toISOString(),likes:[d,n],comments:[{id:id(),userId:d,text:"Such a lovely reminder 💚",createdAt:now()}]},
// {id:"post-2",userId:n,content:"Chasing the golden hour. The world looks softer when you slow down and look around. 📷",image:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",createdAt:new Date(Date.now()-7200000).toISOString(),likes:[a],comments:[]},
// {id:"post-3",userId:d,content:"Hello, Socially! 👋 Trying out this little corner of the internet. Drop a hello below!",image:"",createdAt:new Date(Date.now()-86400000).toISOString(),likes:[a],comments:[]}]},null,2));}}
// const read=()=>{init();return JSON.parse(fs.readFileSync(DATA,"utf8"))},write=db=>fs.writeFileSync(DATA,JSON.stringify(db,null,2));
// const safe=u=>({id:u.id,name:u.name,username:u.username,email:u.email,bio:u.bio||"",avatar:u.avatar||"",createdAt:u.createdAt,followersCount:u.followers.length,followingCount:u.following.length});
// const token=u=>jwt.sign({id:u.id},SECRET,{expiresIn:"7d"});
// function auth(req,res,next){let t=(req.headers.authorization||"").replace(/^Bearer /,"");try{if(!t)throw 0;let d=jwt.verify(t,SECRET),u=read().users.find(x=>x.id===d.id);if(!u)throw 0;req.uid=u.id;next()}catch{return res.status(401).json({error:"Please sign in to continue."})}}
// function pub(p,db,uid){let u=db.users.find(x=>x.id===p.userId);if(!u)return null;return{id:p.id,content:p.content,image:p.image||"",createdAt:p.createdAt,likesCount:p.likes.length,liked:p.likes.includes(uid),comments:p.comments.map(c=>({id:c.id,text:c.text,createdAt:c.createdAt,user:safe(db.users.find(x=>x.id===c.userId)||{id:"",name:"Deleted user",username:"unknown",followers:[],following:[]})})),user:{...safe(u),isFollowing:u.followers.includes(uid)}}}
// function optionalUid(req){try{return jwt.verify((req.headers.authorization||"").replace(/^Bearer /,""),SECRET).id}catch{return ""}}
// app.get("/api/health",(_,r)=>r.json({status:"ok"}));
// // Upload an image from the user's device; return its automatically generated public URL.
// app.post("/api/upload/image",auth,(req,res)=>upload.single("image")(req,res,err=>{
//  if(err){const msg=err.code==="LIMIT_FILE_SIZE"?"Image must be 5 MB or smaller.":"Could not upload this image.";return res.status(400).json({error:msg})}
//  if(!req.file)return res.status(400).json({error:"Choose a JPG, PNG, WEBP or GIF image."});
//  res.status(201).json({url:"/uploads/"+req.file.filename,filename:req.file.filename});
// }));
// app.post("/api/auth/register",async(req,res)=>{let name=String(req.body.name||"").trim(),username=String(req.body.username||"").trim().toLowerCase().replace(/^@/,""),email=String(req.body.email||"").trim().toLowerCase(),password=String(req.body.password||"");if(name.length<2)return res.status(400).json({error:"Name must be at least 2 characters."});if(!/^[a-z0-9_]{3,20}$/.test(username))return res.status(400).json({error:"Username must be 3–20 letters, numbers or underscores."});if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:"Enter a valid email."});if(password.length<6)return res.status(400).json({error:"Password must be at least 6 characters."});let db=read();if(db.users.some(u=>u.email===email))return res.status(409).json({error:"Email is already registered."});if(db.users.some(u=>u.username===username))return res.status(409).json({error:"Username is already taken."});let u={id:id(),name,username,email,password:await bcrypt.hash(password,10),bio:"New to Socially ✨",avatar:"https://i.pravatar.cc/160?u="+encodeURIComponent(username),createdAt:now(),following:[],followers:[]};db.users.push(u);write(db);res.status(201).json({token:token(u),user:safe(u)})});
// app.post("/api/auth/login",async(req,res)=>{let db=read(),email=String(req.body.email||"").trim().toLowerCase(),u=db.users.find(x=>x.email===email);if(!u||!(await bcrypt.compare(String(req.body.password||""),u.password)))return res.status(401).json({error:"Email or password is incorrect."});res.json({token:token(u),user:safe(u)})});
// app.get("/api/auth/me",auth,(req,res)=>res.json({user:safe(read().users.find(u=>u.id===req.uid))}));
// app.get("/api/posts",(req,res)=>{let db=read(),uid=optionalUid(req),q=String(req.query.q||"").toLowerCase().trim(),posts=db.posts.map(p=>pub(p,db,uid)).filter(p=>p&&(!q||p.content.toLowerCase().includes(q)||p.user.name.toLowerCase().includes(q)||p.user.username.includes(q)));posts.sort(req.query.sort==="popular"?(a,b)=>b.likesCount-a.likesCount:newer);res.json({posts})});
// function newer(a,b){return new Date(b.createdAt)-new Date(a.createdAt)}
// app.post("/api/posts",auth,(req,res)=>{let content=String(req.body.content||"").trim(),image=String(req.body.image||"").trim();if(!content)return res.status(400).json({error:"Write something before posting."});if(content.length>1000)return res.status(400).json({error:"Posts must be 1000 characters or fewer."});if(image&&!(/^https?:\/\/\S+$/i.test(image)||/^\/uploads\/[a-zA-Z0-9._-]+$/.test(image)))return res.status(400).json({error:"Image must be a valid URL or uploaded image."});let db=read(),p={id:id(),userId:req.uid,content,image,createdAt:now(),likes:[],comments:[]};db.posts.push(p);write(db);res.status(201).json({post:pub(p,db,req.uid)})});
// app.delete("/api/posts/:id",auth,(req,res)=>{let db=read(),p=db.posts.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:"Post not found."});if(p.userId!==req.uid)return res.status(403).json({error:"You can only delete your own posts."});db.posts=db.posts.filter(x=>x.id!==p.id);write(db);res.json({success:true})});
// app.post("/api/posts/:id/like",auth,(req,res)=>{let db=read(),p=db.posts.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:"Post not found."});let i=p.likes.indexOf(req.uid);if(i<0)p.likes.push(req.uid);else p.likes.splice(i,1);write(db);res.json({liked:i<0,likesCount:p.likes.length})});
// app.post("/api/posts/:id/comments",auth,(req,res)=>{let text=String(req.body.text||"").trim();if(!text)return res.status(400).json({error:"Comment cannot be empty."});if(text.length>400)return res.status(400).json({error:"Comment is too long."});let db=read(),p=db.posts.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:"Post not found."});let c={id:id(),userId:req.uid,text,createdAt:now()};p.comments.push(c);write(db);res.status(201).json({comment:{...c,user:safe(db.users.find(u=>u.id===req.uid))}})});
// app.get("/api/users",(req,res)=>{let db=read(),uid=optionalUid(req),q=String(req.query.q||"").toLowerCase().trim();res.json({users:db.users.filter(u=>u.id!==uid&&(!q||u.name.toLowerCase().includes(q)||u.username.includes(q))).map(u=>({...safe(u),isFollowing:u.followers.includes(uid)}))})});
// app.get("/api/users/:id",(req,res)=>{let db=read(),u=db.users.find(x=>x.id===req.params.id||x.username===req.params.id);if(!u)return res.status(404).json({error:"User not found."});let uid=optionalUid(req);res.json({user:{...safe(u),isFollowing:u.followers.includes(uid),isMe:uid===u.id},posts:db.posts.filter(p=>p.userId===u.id).sort(newer).map(p=>pub(p,db,uid))})});
// app.patch("/api/users/me",auth,(req,res)=>{let db=read(),u=db.users.find(x=>x.id===req.uid),name=req.body.name===undefined?u.name:String(req.body.name).trim(),bio=req.body.bio===undefined?u.bio:String(req.body.bio).trim(),avatar=req.body.avatar===undefined?u.avatar:String(req.body.avatar).trim();if(name.length<2||name.length>50)return res.status(400).json({error:"Name must be 2–50 characters."});if(bio.length>180)return res.status(400).json({error:"Bio must be 180 characters or fewer."});if(avatar&&!(/^https?:\/\/\S+$/i.test(avatar)||/^\/uploads\/[a-zA-Z0-9._-]+$/.test(avatar)))return res.status(400).json({error:"Avatar must be a valid URL or uploaded image."});Object.assign(u,{name,bio,avatar});write(db);res.json({user:safe(u)})});
// app.post("/api/users/:id/follow",auth,(req,res)=>{let db=read(),me=db.users.find(u=>u.id===req.uid),u=db.users.find(x=>x.id===req.params.id);if(!u)return res.status(404).json({error:"User not found."});if(u.id===me.id)return res.status(400).json({error:"You cannot follow yourself."});let i=me.following.indexOf(u.id);if(i>=0){me.following.splice(i,1);u.followers=u.followers.filter(x=>x!==me.id)}else{me.following.push(u.id);if(!u.followers.includes(me.id))u.followers.push(me.id)}write(db);res.json({following:i<0,followersCount:u.followers.length})});
// app.get("*",(req,res,next)=>req.path.startsWith("/api/")?res.status(404).json({error:"API route not found."}):res.sendFile(path.join(__dirname,"public","index.html"),e=>e&&next(e)));
// app.listen(PORT,()=>{init();console.log(`Socially running at http://localhost:${PORT}\\nDemo: demo@socially.dev / Demo123!`)});
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB error:", err));




require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

const DATA = path.join(__dirname, "data", "db.json");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  createdAt: String,
  following: { type: [String], default: [] },
  followers: { type: [String], default: [] }
}, { versionKey: false });

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  content: String,
  image: { type: String, default: "" },
  createdAt: String,
  likes: { type: [String], default: [] },
  comments: [{
    id: String,
    userId: String,
    text: String,
    createdAt: String
  }]
}, { versionKey: false });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);


const storySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    required: true
  },
  caption: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { versionKey: false });

const Story = mongoose.model("Story", storySchema);



const safe = (u) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  email: u.email,
  bio: u.bio || "",
  avatar: u.avatar || "",
  createdAt: u.createdAt,
  followersCount: (u.followers || []).length,
  followingCount: (u.following || []).length
});

const token = (u) =>
  jwt.sign({ id: u.id }, SECRET, { expiresIn: "7d" });

function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

async function auth(req, res, next) {
  try {
    const t = (req.headers.authorization || "")
      .replace(/^Bearer /, "");

    if (!t) {
      return res.status(401).json({
        error: "Please sign in to continue."
      });
    }

    const decoded = jwt.verify(t, SECRET);
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      return res.status(401).json({
        error: "Please sign in to continue."
      });
    }

    req.uid = user.id;
    next();
  } catch {
    res.status(401).json({
      error: "Please sign in to continue."
    });
  }
}

function optionalUid(req) {
  try {
    return jwt.verify(
      (req.headers.authorization || "").replace(/^Bearer /, ""),
      SECRET
    ).id;
  } catch {
    return "";
  }
}

async function pub(p, uid) {
  const user = await User.findOne({ id: p.userId }).lean();
  if (!user) return null;

  const comments = await Promise.all(
    (p.comments || []).map(async (c) => {
      const commentUser = await User.findOne({
        id: c.userId
      }).lean();

      return {
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        user: commentUser
          ? safe(commentUser)
          : safe({
              id: "",
              name: "Deleted user",
              username: "unknown",
              followers: [],
              following: []
            })
      };
    })
  );

  return {
    id: p.id,
    content: p.content,
    image: p.image || "",
    createdAt: p.createdAt,
    likesCount: (p.likes || []).length,
    liked: (p.likes || []).includes(uid),
    comments,
    user: {
      ...safe(user),
      isFollowing: (user.followers || []).includes(uid)
    }
  };
}

// Import existing JSON data once, without overwriting
// collections that already contain records.
async function migrateJsonData() {
  if (!fs.existsSync(DATA)) {
    console.log("No db.json found; skipping migration.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(DATA, "utf8"));

  if (
    data.users?.length &&
    await User.countDocuments() === 0
  ) {
    await User.insertMany(data.users);
    console.log(`Imported ${data.users.length} users.`);
  }

  if (
    data.posts?.length &&
    await Post.countDocuments() === 0
  ) {
    await Post.insertMany(data.posts);
    console.log(`Imported ${data.posts.length} posts.`);
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

// Image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif"
    };

    const ext = extensions[file.mimetype];
    if (!ext) return cb(new Error("Unsupported image type."));
    cb(null, id() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, [
      "image/jpeg", "image/png",
      "image/webp", "image/gif"
    ].includes(file.mimetype));
  }
});

app.post("/api/upload/image", auth, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller."
          : "Could not upload this image."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Choose a JPG, PNG, WEBP or GIF image."
      });
    }

    res.status(201).json({
      url: "/uploads/" + req.file.filename,
      filename: req.file.filename
    });
  });
});


const storyStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "video/mp4": ".mp4",
      "video/webm": ".webm"
    };

    const ext = extensions[file.mimetype];
    if (!ext) return cb(new Error("Unsupported story media."));
    cb(null, crypto.randomUUID() + ext);
  }
});

const storyUpload = multer({
  storage: storyStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, [
      "image/jpeg", "image/png", "image/webp",
      "image/gif", "video/mp4", "video/webm"
    ].includes(file.mimetype));
  }
});

// Create a story; it expires after 24 hours.
app.post("/api/stories", auth, (req, res) => {
  storyUpload.single("media")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          error: err.code === "LIMIT_FILE_SIZE"
            ? "Story file must be 20 MB or smaller."
            : "Choose a supported image or video."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Please select an image or video."
        });
      }

      const isVideo = req.file.mimetype.startsWith("video/");
      const createdAt = new Date();

      const story = await Story.create({
        id: crypto.randomUUID(),
        userId: req.uid,
        mediaUrl: "/uploads/" + req.file.filename,
        mediaType: isVideo ? "video" : "image",
        caption: String(req.body.caption || "").trim().slice(0, 150),
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
      });

      res.status(201).json({ story });
    } catch (error) {
      console.error("Story upload error:", error);
      res.status(500).json({ error: "Could not save story." });
    }
  });
});

// Get all active stories, grouped by user on the frontend.
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: 1 }).lean();

    const userIds = [...new Set(stories.map(s => s.userId))];
    const users = await User.find({
      id: { $in: userIds }
    }).lean();

    const userMap = new Map(users.map(u => [u.id, u]));

    res.json({
      stories: stories
        .filter(s => userMap.has(s.userId))
        .map(s => ({
          ...s,
          user: safe(userMap.get(s.userId))
        }))
    });
  } catch (error) {
    console.error("Fetch stories error:", error);
    res.status(500).json({ error: "Could not load stories." });
  }
});

// Delete your own story.
app.delete("/api/stories/:id", auth, async (req, res) => {
  try {
    const story = await Story.findOne({
      id: req.params.id,
      userId: req.uid
    });

    if (!story) {
      return res.status(404).json({
        error: "Story not found or you cannot delete it."
      });
    }

    await Story.deleteOne({ id: story.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ error: "Could not delete story." });
  }
});


// Register
app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const username = String(req.body.username || "")
    .trim().toLowerCase().replace(/^@/, "");
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2)
    return res.status(400).json({ error: "Name must be at least 2 characters." });

  if (!/^[a-z0-9_]{3,20}$/.test(username))
    return res.status(400).json({ error: "Username must be 3–20 letters, numbers or underscores." });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Enter a valid email." });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  if (await User.findOne({ $or: [{ email }, { username }] }))
    return res.status(409).json({ error: "Email or username is already registered." });

  const user = await User.create({
    id: id(),
    name,
    username,
    email,
    password: await bcrypt.hash(password, 10),
    bio: "New to Socially ✨",
    avatar: "https://i.pravatar.cc/160?u=" + encodeURIComponent(username),
    createdAt: now(),
    following: [],
    followers: []
  });

  res.status(201).json({
    token: token(user),
    user: safe(user)
  });
}));

// Login
app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(
    String(req.body.password || ""), user.password
  ))) {
    return res.status(401).json({
      error: "Email or password is incorrect."
    });
  }

  res.json({ token: token(user), user: safe(user) });
}));

app.get("/api/auth/me", auth, asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.uid });
  res.json({ user: safe(user) });
}));

function newer(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

// List/search posts
app.get("/api/posts", asyncHandler(async (req, res) => {
  const uid = optionalUid(req);
  const q = String(req.query.q || "").toLowerCase().trim();
  const documents = await Post.find().lean();
  documents.sort(
    req.query.sort === "popular"
      ? (a, b) => b.likes.length - a.likes.length
      : newer
  );

  let posts = await Promise.all(
    documents.map(p => pub(p, uid))
  );

  posts = posts.filter(p =>
    p && (
      !q ||
      p.content.toLowerCase().includes(q) ||
      p.user.name.toLowerCase().includes(q) ||
      p.user.username.includes(q)
    )
  );

  res.json({ posts });
}));

// Create post
app.post("/api/posts", auth, asyncHandler(async (req, res) => {
  const content = String(req.body.content || "").trim();
  const image = String(req.body.image || "").trim();

  if (!content)
    return res.status(400).json({ error: "Write something before posting." });

  if (content.length > 1000)
    return res.status(400).json({ error: "Posts must be 1000 characters or fewer." });

  if (image && !(
    /^https?:\/\/\S+$/i.test(image) ||
    /^\/uploads\/[a-zA-Z0-9._-]+$/.test(image)
  )) {
    return res.status(400).json({
      error: "Image must be a valid URL or uploaded image."
    });
  }

  const post = await Post.create({
    id: id(),
    userId: req.uid,
    content,
    image,
    createdAt: now(),
    likes: [],
    comments: []
  });

  res.status(201).json({ post: await pub(post.toObject(), req.uid) });
}));

// Delete own post
app.delete("/api/posts/:id", auth, asyncHandler(async (req, res) => {
  const post = await Post.findOne({ id: req.params.id });

  if (!post)
    return res.status(404).json({ error: "Post not found." });

  if (post.userId !== req.uid)
    return res.status(403).json({ error: "You can only delete your own posts." });

  await Post.deleteOne({ id: post.id });
  res.json({ success: true });
}));

// Toggle like
app.post("/api/posts/:id/like", auth, asyncHandler(async (req, res) => {
  const post = await Post.findOne({ id: req.params.id });

  if (!post)
    return res.status(404).json({ error: "Post not found." });

  const index = post.likes.indexOf(req.uid);

  if (index < 0) post.likes.push(req.uid);
  else post.likes.splice(index, 1);

  await post.save();

  res.json({
    liked: index < 0,
    likesCount: post.likes.length
  });
}));

// Add comment
app.post("/api/posts/:id/comments", auth, asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim();

  if (!text)
    return res.status(400).json({ error: "Comment cannot be empty." });

  if (text.length > 400)
    return res.status(400).json({ error: "Comment is too long." });

  const post = await Post.findOne({ id: req.params.id });

  if (!post)
    return res.status(404).json({ error: "Post not found." });

  const comment = {
    id: id(),
    userId: req.uid,
    text,
    createdAt: now()
  };

  post.comments.push(comment);
  await post.save();

  const user = await User.findOne({ id: req.uid });

  res.status(201).json({
    comment: { ...comment, user: safe(user) }
  });
}));

// List/search users

app.get("/api/users", asyncHandler(async (req, res) => {
  const uid = optionalUid(req);
  const q = String(req.query.q || "").trim().toLowerCase();

  const users = await User.find().lean();

  const filteredUsers = users
    .filter((u) => {
      const name = String(u.name || "").toLowerCase();
      const username = String(u.username || "").toLowerCase();

      return (
        u.id !== uid &&
        (!q || name.includes(q) || username.includes(q))
      );
    })
    .map((u) => ({
      ...safe({
        ...u,
        followers: u.followers || [],
        following: u.following || []
      }),
      isFollowing: (u.followers || []).includes(uid)
    }));

  res.json({ users: filteredUsers });
}));


// User profile and their posts
app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findOne({
    $or: [{ id: req.params.id }, { username: req.params.id }]
  }).lean();

  if (!user)
    return res.status(404).json({ error: "User not found." });

  const uid = optionalUid(req);
  const documents = await Post.find({ userId: user.id }).lean();
  documents.sort(newer);

  const posts = await Promise.all(
    documents.map(p => pub(p, uid))
  );

  res.json({
    user: {
      ...safe(user),
      isFollowing: user.followers.includes(uid),
      isMe: uid === user.id
    },
    posts: posts.filter(Boolean)
  });
}));

// Update profile
app.patch("/api/users/me", auth, asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.uid });

  if (!user)
    return res.status(404).json({ error: "User not found." });

  const name = req.body.name === undefined
    ? user.name : String(req.body.name).trim();
  const bio = req.body.bio === undefined
    ? user.bio : String(req.body.bio).trim();
  const avatar = req.body.avatar === undefined
    ? user.avatar : String(req.body.avatar).trim();

  if (name.length < 2 || name.length > 50)
    return res.status(400).json({ error: "Name must be 2–50 characters." });

  if (bio.length > 180)
    return res.status(400).json({ error: "Bio must be 180 characters or fewer." });

  if (avatar && !(
    /^https?:\/\/\S+$/i.test(avatar) ||
    /^\/uploads\/[a-zA-Z0-9._-]+$/.test(avatar)
  )) {
    return res.status(400).json({
      error: "Avatar must be a valid URL or uploaded image."
    });
  }

  Object.assign(user, { name, bio, avatar });
  await user.save();

  res.json({ user: safe(user) });
}));

// Toggle follow
app.post("/api/users/:id/follow", auth, asyncHandler(async (req, res) => {
  const me = await User.findOne({ id: req.uid });
  const user = await User.findOne({ id: req.params.id });

  if (!user)
    return res.status(404).json({ error: "User not found." });

  if (user.id === me.id)
    return res.status(400).json({ error: "You cannot follow yourself." });

  const index = me.following.indexOf(user.id);

  if (index >= 0) {
    me.following.splice(index, 1);
    user.followers = user.followers.filter(x => x !== me.id);
  } else {
    me.following.push(user.id);
    if (!user.followers.includes(me.id)) user.followers.push(me.id);
  }

  await Promise.all([me.save(), user.save()]);

  res.json({
    following: index < 0,
    followersCount: user.followers.length
  });
}));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found." });
  }

  res.sendFile(
    path.join(__dirname, "public", "index.html"),
    err => err && next(err)
  );
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Server error. Check the terminal logs." });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !SECRET) {
      throw new Error("Set MONGODB_URI and JWT_SECRET in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    await migrateJsonData();

    app.listen(PORT, () => {
      console.log(`Socially running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

startServer();
