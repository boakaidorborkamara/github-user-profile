let search_input = document.getElementById("search-input");
let result_container = document.getElementById("content-section");
let side_bar = document.getElementById("my-sidebar");
let repos_container = document.getElementById("repos-container");
let repos_list = document.getElementById("repos-list");
console.log(side_bar);
let timeoutId;
let isLoading = false;
let cache = {};

async function fetchData(url) {
  try {
    let result = await fetch(url);
    return result;
  } catch (err) {
    console.log(err);
  }
}

function debounce(cb) {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    cb();
  }, 2000);
}

// handles search
function handleSearch(search_term, cb) {
  let url;

  if (search_term === "") {
    url = `https://api.github.com/users/boakaidorborkamara`;
  } else {
    url = `https://api.github.com/users/${search_term}`;
  }

  isLoading = true;
  cb(isLoading, null);

  // check cache
  if (cache[search_term]) {
    console.log("loading cached user...");
    isLoading = false;

    let cached_user = cache[search_term];

    cb(isLoading, cached_user);
    return;
  } else
    debounce(() => {
      fetchData(url)
        .then((response) => response.json())
        .then((data) => {
          // cache new data
          cache[data.login] = data;
          console.log("cache", cache);

          isLoading = false;
          cb(isLoading, data);
        });
    });
}

// handles what displays when the app first loads
function handleFirstLoad(cb) {
  let url = `https://api.github.com/users/boakaidorborkamara`;

  isLoading = true;
  cb(isLoading, null);

  fetchData(url)
    .then (response => response.json())
    .then((user) => {
      return fetchData(user.repos_url)
        .then(response => response.json())
        .then((repos) => {
          return { user, repos };
        });
    })
    .then((result) => {
      isLoading = false;
      cb(isLoading, result);
      return result;
    });
}

// handles display of data to the DOM
function renderUI(isLoading, result) {
  console.log("kdkdkdrrrr");
  console.log("resulttt", result);

   // alert(`rendering...${user.name}`);
    // removeEleChildren(side_bar);
    removeEleChildren(result_container);

    if (isLoading) {
      result_container.innerHTML = `<p>Fetching Data..</p>`;
      return;
    }


  if (isLoading === false && result) {
    console.log("resu", result.user);
    let user = result.user;
    let repos = result.repos;

    // let user = result.user;

   
    // handle user not found 
    if (user.status && user.status === "404") {
      result_container.innerHTML = `<p>User not found!</p>`;
      return;
    }


    // add sidebar 
    let sidebar_content = `
          <!-- personal info  -->
          <div>
            <img src=${user.avatar_url} alt="" />
            <h2>${user.name}</h2>
            <p>${user.login}</p>
            <p>${user.bio}</p>
            <p>${user.followers} followers</p>
            <p>${user.following} follwing</p>
          </div>

          <!-- porfolio and location  -->
          <div>
            <p>Company</p>
            <p>location</p>
            <a href="">profile linke</a>
          </div>

          <!-- organization  -->
          <div>
            <p>Org 1</p>
          </div>
    `;

    side_bar.insertAdjacentHTML("beforeend", sidebar_content);

    // add repo cards 
    // let html =  `
    //   <div class="repo-card">
    //           <h5>Repo name</h5>
    //           <p>Repo name</p>
    //         </div>
    // `;

    repos.forEach((repo)=>{
      let html =  `
      <div class="repo-card">
              <h5>${repo.name}</h5>
              <p>${repo.description}</p>
            </div>
    `;

    repos_list.insertAdjacentHTML("beforeend", html)
    });

    // console.log("reeee", repoo.toString())

    // repos_list.innerHTML = repoo;

    

    result_container.insertAdjacentElement("beforeend", side_bar);
    repos_container.insertAdjacentElement("beforeend", repos_list);
    result_container.insertAdjacentElement("beforeend", repos_container);


  }
}

function removeEleChildren(eleParentNode) {
  while (eleParentNode.firstChild) {
    eleParentNode.removeChild(eleParentNode.firstChild);
  }
}

// handles first load
window.addEventListener("load", () => {
  handleFirstLoad(renderUI);
});

// handles search
search_input.addEventListener("keyup", (e) => {
  let search_term = e.target.value;
  handleSearch(search_term, renderUI);
});
