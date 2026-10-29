const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={token:localStorage.getItem("socially_token")||"",user:null,view:"feed",authMode:"login",search:"",sort:"latest",profile:null};
const api=async(url,options={})=>{let headers={...(state.token?{Authorization:"Bearer "+state.token}:{}),...(options.headers||{})};if(!(options.body instanceof FormData))headers["Content-Type"]="application/json";let res=await fetch("/api"+url,{...options,headers});let data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||"Something went wrong.");return data};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const getAvatarLetter = u => {
  const username = (u?.username || "").trim();
  return username
    ? username.charAt(0).toUpperCase()
    : (u?.name || "S").trim().charAt(0).toUpperCase();
};

const initials = u => getAvatarLetter(u);

const avatar = u =>
  `<div class="avatar">${esc(getAvatarLetter(u))}</div>`;

const time=s=>{let d=Math.max(0,Date.now()-new Date(s).getTime()),m=Math.floor(d/60000);if(m<1)return"just now";if(m<60)return m+"m ago";let h=Math.floor(m/60);if(h<24)return h+"h ago";let days=Math.floor(h/24);return days<7?days+"d ago":new Date(s).toLocaleDateString()};
function toast(msg,error=false){let el=document.createElement("div");el.className="toast"+(error?" bad":"");el.textContent=msg;$("#toast").append(el);setTimeout(()=>el.remove(),3200)}
function requireAuth(){if(!state.user){openAuth("login");toast("Sign in to do that.");return false}return true}
function openAuth(mode="login"){$("#authBackdrop").hidden=false;setMode(mode);setTimeout(()=>$("#email").focus(),50)}
function closeAuth(){$("#authBackdrop").hidden=true;$("#authError").hidden=true}
function setMode(mode){state.authMode=mode;$$("[data-mode]").forEach(b=>b.classList.toggle("selected",b.dataset.mode===mode));$("#nameField").hidden=mode!=="register";$("#usernameField").hidden=mode!=="register";$("#authTitle").textContent=mode==="login"?"Welcome to your corner":"Join the community";$("#authSub").textContent=mode==="login"?"Sign in to share your moments.":"Create an account and find your people.";$("#authSubmit").textContent=mode==="login"?"Sign in ↗":"Create account ↗";$("#password").autocomplete=mode==="login"?"current-password":"new-password";$("#authError").hidden=true}


function renderAccount() {
  const u = state.user;

  $("#topAvatar").textContent = u ? getAvatarLetter(u) : "?";
  $("#composerAvatar").textContent = u ? getAvatarLetter(u) : "S";

  $("#sideAccount").innerHTML = u
    ? `${avatar(u)}
       <div class="side-user">
         <b>${esc(u.name)}</b>
         <small>@${esc(u.username)}</small>
       </div>
       <button class="logout" id="logout">Sign out</button>`
    : `<button class="nav" id="sideAuth">↗ <span>Sign in</span></button>`;

  $("#sideAuth")?.addEventListener("click", () => openAuth());
  $("#logout")?.addEventListener("click", logout);
}


function logout(){state.token="";state.user=null;localStorage.removeItem("socially_token");renderAccount();toast("You've signed out.");renderFeed();loadSuggestions()}
async function boot(){if(state.token){try{state.user=(await api("/auth/me")).user}catch{state.token="";localStorage.removeItem("socially_token")}}renderAccount();await renderFeed();loadSuggestions()}
function nav(view){state.view=view;$$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$$(".mobile-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$("#composer").hidden=view!=="feed"||!state.user;$("#eyebrow").textContent=view==="feed"?"YOUR COMMUNITY":view==="discover"?"FIND YOUR PEOPLE":"YOUR LITTLE CORNER";$("#pageTitle").innerHTML=view==="feed"?'Hello....<span>✦</span>':view==="discover"?'People worth knowing <span>✦</span>':'Your profile <span>✦</span>';if(view==="discover")renderDiscover();else if(view==="profile")renderMyProfile();else renderFeed()}
async function renderFeed(){if(state.view!=="feed")return;$("#feedHeading").textContent=state.search?`Search results`:"Your feed";$("#feedSub").textContent=state.search?`Showing matches for “${state.search}”`:"Fresh moments from your community";$("#feedList").innerHTML='<div class="loading card">Gathering your community…</div>';try{let data=await api(`/posts?q=${encodeURIComponent(state.search)}&sort=${state.sort}`);$("#feedList").innerHTML=data.posts.map(postHTML).join("");$("#empty").hidden=!!data.posts.length;bindPosts()}catch(e){$("#feedList").innerHTML=`<div class="loading card">${esc(e.message)}</div>`}}
function postHTML(p){return `<article class="post card" data-post="${p.id}"><header class="post-head"><button class="avatar-button small" data-profile="${p.user.id}" aria-label="View ${esc(p.user.name)}">${p.user.avatar?`<img src="${esc(p.user.avatar)}" alt="">`:esc(initials(p.user))}</button><div class="author"><b data-profile="${p.user.id}">${esc(p.user.name)}</b><small>@${esc(p.user.username)} · ${time(p.createdAt)}</small></div>${state.user?.id===p.user.id?`<div class="post-menu"><button class="dots" data-delete-toggle="${p.id}" aria-label="Post options">···</button><button class="delete" data-delete="${p.id}" hidden>Delete post</button></div>`:""}</header><p class="post-text">${esc(p.content)}</p>${p.image?`<img class="post-image" src="${esc(p.image)}" alt="Post attachment" loading="lazy" onerror="this.style.display='none'">`:""}<div class="post-actions"><button class="action ${p.liked?"liked":""}" data-like="${p.id}"><span>${p.liked?"♥":"♡"}</span> ${p.likesCount} likes</button><button class="action" data-comments="${p.id}"><span>◌</span> ${p.comments.length} comments</button><small>${p.user.isFollowing?"Following":" "}</small></div><div class="comments" id="comments-${p.id}" hidden><div class="comment-list">${p.comments.map(c=>`<div class="comment">${avatar(c.user)}<div><b>${esc(c.user.name)}</b> ${esc(c.text)}<small>${time(c.createdAt)}</small></div></div>`).join("")}</div><form class="comment-form" data-comment="${p.id}"><input name="text" maxlength="400" placeholder="${state.user?"Write a kind comment…":"Sign in to comment"}" ${state.user?"":"disabled"} required><button ${state.user?"":"disabled"}>Send</button></form></div></article>`}


function bindPosts(){$$("[data-like]").forEach(b=>b.onclick=async()=>{if(!requireAuth())return;try{await api(`/posts/${b.dataset.like}/like`,{method:"POST",body:"{}"});renderFeed()}catch(e){toast(e.message,true)}});$$("[data-comments]").forEach(b=>b.onclick=()=>{let el=$("#comments-"+b.dataset.comments);el.hidden=!el.hidden;if(!el.hidden)el.querySelector("input")?.focus()});$$("[data-comment]").forEach(f=>f.onsubmit=async e=>{e.preventDefault();if(!requireAuth())return;let input=f.elements.text;try{await api(`/posts/${f.dataset.comment}/comments`,{method:"POST",body:JSON.stringify({text:input.value})});renderFeed()}catch(err){toast(err.message,true)}});$$("[data-delete-toggle]").forEach(b=>b.onclick=()=>{$(`[data-delete="${b.dataset.deleteToggle}"]`).hidden=!$(`[data-delete="${b.dataset.deleteToggle}"]`).hidden});$$("[data-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this post?"))return;try{await api(`/posts/${b.dataset.delete}`,{method:"DELETE"});toast("Post deleted.");renderFeed()}catch(e){toast(e.message,true)}});$$("[data-profile]").forEach(b=>b.onclick=()=>viewProfile(b.dataset.profile))}


async function loadSuggestions(){try{let d=await api("/users");$("#suggestions").innerHTML=d.users.slice(0,4).map(personMini).join("")||'<p class="muted">You know everyone here!</p>';bindFollows()}catch{}}
function personMini(u){return `<div class="suggestion">${avatar(u)}<div class="suggestion-info"><b>${esc(u.name)}</b><small>@${esc(u.username)}</small></div><button class="follow ${u.isFollowing?"following":""}" data-follow="${u.id}">${u.isFollowing?"Following":"+ Follow"}</button></div>`}
function bindFollows(){$$("[data-follow]").forEach(b=>b.onclick=async()=>{if(!requireAuth())return;try{let d=await api(`/users/${b.dataset.follow}/follow`,{method:"POST",body:"{}"});toast(d.following?"Following them now!":"Unfollowed.");loadSuggestions();if(state.view==="discover")renderDiscover();if(state.view==="profile"&&state.profile) viewProfile(state.profile.id)}catch(e){toast(e.message,true)}})}



async function renderDiscover(){if(state.view!=="discover")return;$("#feedHeading").textContent="Discover people";$("#feedSub").textContent="Meet someone new, one follow at a time.";$("#feedList").innerHTML='<div class="loading card">Finding your people…</div>';try{let d=await api("/users?q="+encodeURIComponent(state.search));$("#feedList").innerHTML=`<div class="people-grid">${d.users.map(u=>`<article class="person card">${avatar(u)}<h3>${esc(u.name)}</h3><small>@${esc(u.username)}</small><p>${esc(u.bio||"Still writing their story…")}</p><div class="person-stats">${u.followersCount} followers</div><button class="follow ${u.isFollowing?"following":""}" data-follow="${u.id}">${u.isFollowing?"Following":"＋ Follow"}</button></article>`).join("")}</div>`;$("#empty").hidden=!!d.users.length;bindFollows()}catch(e){toast(e.message,true)}}


async function viewProfile(id){try{let d=await api("/users/"+encodeURIComponent(id));state.profile=d.user;$("#feedHeading").textContent=d.user.isMe?"My profile":d.user.name;$("#feedSub").textContent="A little more about this person.";$("#feedList").innerHTML=`<section class="profile card"><div class="profile-cover"></div><div class="profile-head">${avatar(d.user)}<div><h2>${esc(d.user.name)}</h2><small>@${esc(d.user.username)}</small></div>${d.user.isMe?'<button class="primary" id="editProfile">Edit profile</button>':`<button class="follow ${d.user.isFollowing?"following":""}" data-follow="${d.user.id}">${d.user.isFollowing?"Following":"＋ Follow"}</button>`}</div><p class="bio">${esc(d.user.bio||"Still writing their story…")}</p><div class="stats"><span><b>${d.posts.length}</b> posts</span><span><b>${d.user.followersCount}</b> followers</span><span><b>${d.user.followingCount}</b> following</span></div></section><h3 class="profile-post-title">Posts by ${esc(d.user.name)}</h3>${d.posts.map(postHTML).join("")||'<div class="loading card">No posts yet.</div>'}`;bindPosts();bindFollows();$("#editProfile")?.addEventListener("click",openEdit)}catch(e){toast(e.message,true)}}


async function renderMyProfile(){if(!state.user){openAuth();$("#feedList").innerHTML='<div class="loading card">Sign in to view your profile.</div>';return}viewProfile(state.user.id)}
function openEdit(){$("#editName").value=state.user.name;$("#editBio").value=state.user.bio||"";$("#editAvatar").value=state.user.avatar||"";$("#editAvatarFile").value="";$("#editBackdrop").hidden=false}
let selectedPostImage=null;
$("#imageFile").addEventListener("change",()=>{const file=$("#imageFile").files[0];if(!file){selectedPostImage=null;$("#imagePreviewRow").hidden=true;return}if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)){toast("Choose a JPG, PNG, WEBP or GIF image.",true);$("#imageFile").value="";return}if(file.size>5*1024*1024){toast("Image must be 5 MB or smaller.",true);$("#imageFile").value="";return}selectedPostImage=file;$("#imagePreview").src=URL.createObjectURL(file);$("#imageFileName").textContent=file.name;$("#imagePreviewRow").hidden=false});
$("#publish").onclick=async()=>{if(!requireAuth())return;let content=$("#postText").value.trim();if(!content){toast("Write something before posting.",true);return}const btn=$("#publish");btn.disabled=true;btn.textContent="Sharing…";try{let image="";if(selectedPostImage){const fd=new FormData();fd.append("image",selectedPostImage);const uploaded=await api("/upload/image",{method:"POST",body:fd});image=uploaded.url}await api("/posts",{method:"POST",body:JSON.stringify({content,image})});$("#postText").value="";$("#imageFile").value="";selectedPostImage=null;$("#imagePreview").removeAttribute("src");$("#imagePreviewRow").hidden=true;$("#charCount").textContent="0 / 1000";toast("Your moment is out there ✨");state.view="feed";nav("feed")}catch(e){toast(e.message,true)}finally{btn.disabled=false;btn.textContent="Share post ↗"}};
$("#postText").addEventListener("input",()=>$("#charCount").textContent=$("#postText").value.length+" / 1000");$("#clearImage").onclick=()=>{$("#imageFile").value="";selectedPostImage=null;$("#imagePreview").removeAttribute("src");$("#imagePreviewRow").hidden=true};$("#emptyAction").onclick=()=>{if(!requireAuth())return;$("#postText").focus();window.scrollTo({top:0,behavior:"smooth"})};$("#explore").onclick=()=>nav("discover");
$("#search").addEventListener("input",e=>{state.search=e.target.value.trim();if(state.view==="discover")renderDiscover();else if(state.view==="feed")renderFeed()});$("#sort").onchange=()=>{state.sort=$("#sort").value;renderFeed()};
$$("[data-view]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();nav(b.dataset.view)}));$("#topAvatar").onclick=()=>state.user?nav("profile"):openAuth();$("#sideAuth").onclick=()=>openAuth();$("#closeAuth").onclick=closeAuth;$("#authBackdrop").addEventListener("click",e=>{if(e.target.id==="authBackdrop")closeAuth()});$$("[data-mode]").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$("#authForm").onsubmit=async e=>{e.preventDefault();let mode=state.authMode,body={email:$("#email").value,password:$("#password").value};if(mode==="register"){body.name=$("#name").value;body.username=$("#username").value}let btn=$("#authSubmit");btn.disabled=true;$("#authError").hidden=true;try{let d=await api("/auth/"+(mode==="login"?"login":"register"),{method:"POST",body:JSON.stringify(body)});state.token=d.token;state.user=d.user;localStorage.setItem("socially_token",d.token);closeAuth();renderAccount();toast(mode==="login"?"Welcome back!":"Welcome to Socially ✨");nav(state.view);loadSuggestions()}catch(err){$("#authError").textContent=err.message;$("#authError").hidden=false}finally{btn.disabled=false}};
$("#closeEdit").onclick=()=>$("#editBackdrop").hidden=true;$("#editBackdrop").onclick=e=>{if(e.target.id==="editBackdrop")$("#editBackdrop").hidden=true};$("#editForm").onsubmit=async e=>{e.preventDefault();$("#editError").hidden=true;try{let avatar=$("#editAvatar").value;const file=$("#editAvatarFile").files[0];if(file){if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)||file.size>5*1024*1024)throw Error("Choose a JPG, PNG, WEBP or GIF image up to 5 MB.");const fd=new FormData();fd.append("image",file);avatar=(await api("/upload/image",{method:"POST",body:fd})).url}let d=await api("/users/me",{method:"PATCH",body:JSON.stringify({name:$("#editName").value,bio:$("#editBio").value,avatar})});state.user=d.user;$("#editBackdrop").hidden=true;renderAccount();toast("Profile updated.");viewProfile(state.user.id)}catch(err){$("#editError").textContent=err.message;$("#editError").hidden=false}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAuth();$("#editBackdrop").hidden=true}});
boot();


/* ===== Story upload button fix ===== */

(() => {
  const addBtn = document.getElementById("addStoryBtn");
  const fileInput = document.getElementById("storyFileInput");
  const captionArea = document.getElementById("storyCaptionArea");
  const captionInput = document.getElementById("storyCaption");
  const imagePreview = document.getElementById("storyImagePreview");
  const videoPreview = document.getElementById("storyVideoPreview");
  const uploadBtn = document.getElementById("uploadStoryBtn");
  const cancelBtn = document.getElementById("cancelStoryBtn");
  const errorBox = document.getElementById("storyUploadError");

  if (!addBtn || !fileInput) {
    console.error("Story elements missing. Check index.html IDs.");
    return;
  }

  let selectedStoryFile = null;
  let previewUrl = null;

  function clearStoryForm() {
    selectedStoryFile = null;
    fileInput.value = "";
    captionInput.value = "";
    captionArea.hidden = true;
    imagePreview.hidden = true;
    videoPreview.hidden = true;
    imagePreview.removeAttribute("src");
    videoPreview.pause();
    videoPreview.removeAttribute("src");
    videoPreview.load();
    errorBox.hidden = true;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }

  addBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a supported image or video.");
      fileInput.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Story file must be 20 MB or smaller.");
      fileInput.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    selectedStoryFile = file;
    previewUrl = URL.createObjectURL(file);

    imagePreview.hidden = true;
    videoPreview.hidden = true;

    if (file.type.startsWith("image/")) {
      imagePreview.src = previewUrl;
      imagePreview.hidden = false;
    } else {
      videoPreview.src = previewUrl;
      videoPreview.hidden = false;
    }

    captionArea.hidden = false;
    errorBox.hidden = true;
  });

  cancelBtn?.addEventListener("click", clearStoryForm);

  uploadBtn?.addEventListener("click", async () => {
    if (!selectedStoryFile) {
      alert("Please select a photo or video first.");
      return;
    }

    const token = localStorage.getItem("socially_token");

    if (!token) {
      alert("Please sign in before uploading a story.");
      return;
    }

    const formData = new FormData();
    formData.append("media", selectedStoryFile);
    formData.append("caption", captionInput.value.trim());

    try {
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Uploading...";

            const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
        });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Story upload failed.");
      }

      clearStoryForm();
      alert("Story uploaded successfully!");

      if (typeof loadStories === "function") {
        await loadStories();
      } else {
        window.location.reload();
      }
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      console.error("Story upload error:", error);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Share story ↗";
    }
  });
})();




/* ===== Load and display uploaded stories ===== */
async function loadStories() {
  const storiesList = document.getElementById("storiesList");
  if (!storiesList) return;

  try {
    const response = await fetch("/api/stories");
    if (!response.ok) {
      throw new Error("Could not load stories");
    }

    const data = await response.json();
    const stories = data.stories || [];

    storiesList.innerHTML = "";

    if (stories.length === 0) {
      storiesList.innerHTML =
        '<p class="stories-loading">No stories yet. Add your first story!</p>';
      return;
    }

    stories.forEach((story) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "story-item";

      const name =
        story.user?.name || story.user?.username || "User";

     const avatarHTML =
  `<span>${esc(getAvatarLetter(story.user))}</span>`;

      item.innerHTML = `
        <div class="story-ring">
          <div class="story-avatar">${avatarHTML}</div>
        </div>
        <span class="story-name"></span>
      `;

      item.querySelector(".story-name").textContent = name;

      // Clicking a story opens its media
      item.addEventListener("click", () => {
        const mediaURL = story.mediaUrl.startsWith("http")
          ? story.mediaUrl
          : new URL(story.mediaUrl, window.location.origin).href;

        const viewer = document.getElementById("storyViewerBackdrop");
        const mediaContainer = document.getElementById("storyViewerMedia");
        const caption = document.getElementById("storyViewerCaption");
        const viewerName = document.getElementById("storyViewerName");
        const viewerAvatar = document.getElementById("storyViewerAvatar");
        const viewerTime = document.getElementById("storyViewerTime");

        if (!viewer || !mediaContainer) {
          window.open(mediaURL, "_blank");
          return;
        }

        mediaContainer.innerHTML = "";

        const media = document.createElement(
          story.mediaType === "video" ? "video" : "img"
        );
        media.src = mediaURL;

        if (story.mediaType === "video") {
          media.controls = true;
          media.autoplay = true;
          media.playsInline = true;
        } else {
          media.alt = "Story by " + name;
        }

        mediaContainer.appendChild(media);

        if (caption) caption.textContent = story.caption || "";
        if (viewerName) viewerName.textContent = name;
        if (viewerAvatar) {
          viewerAvatar.textContent = name.charAt(0).toUpperCase();
        if (viewerAvatar) {
  viewerAvatar.textContent = getAvatarLetter(story.user);
}
        }

        if (viewerTime) {
          const created = new Date(story.createdAt);
          viewerTime.textContent = created.toLocaleString();
        }



        
const deleteStoryBtn = document.getElementById("deleteStoryBtn");

// Show delete option only for the logged-in user's own story
const loggedInUserId = state.user?.id;

if (deleteStoryBtn) {
  deleteStoryBtn.hidden = !loggedInUserId ||
    String(story.userId) !== String(loggedInUserId);

  deleteStoryBtn.onclick = async () => {
    if (!confirm("Are you sure you want to delete this story?")) {
      return;
    }

    const token = localStorage.getItem("socially_token");
    if (!token) {
      alert("Please sign in again.");
      return;
    }

    try {
      deleteStoryBtn.disabled = true;

      const response = await fetch(
        `/api/stories/${encodeURIComponent(story.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Could not delete story"
        );
      }

      document.getElementById("storyViewerBackdrop").hidden = true;
      await loadStories();
      alert("Story deleted successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      deleteStoryBtn.disabled = false;
    }
  };
}




        viewer.hidden = false;






      });

      storiesList.appendChild(item);
    });
  } catch (error) {
    console.error("Load stories error:", error);
    storiesList.innerHTML =
      '<p class="stories-loading">Could not load stories. Please refresh.</p>';
  }
}

// Close the story viewer
document.getElementById("closeStoryViewer")?.addEventListener("click", () => {
  const viewer = document.getElementById("storyViewerBackdrop");
  const mediaContainer = document.getElementById("storyViewerMedia");

  if (mediaContainer) {
    mediaContainer.querySelectorAll("video").forEach((video) => video.pause());
    mediaContainer.innerHTML = "";
  }

  if (viewer) viewer.hidden = true;
});

// Load stories when the page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadStories);
} else {
  loadStories();
}



function renderAvatar(user, className = "avatar") {
  const letter = getAvatarLetter(user);

  return `
    <div class="${className}" aria-label="${letter} avatar">
      ${letter.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </div>
  `;
}

