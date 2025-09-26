const fs = require("fs");
const fetch = require("node-fetch");

const README_FILE = "README.md";

// hashnode username
const USERNAME = "vinyldavyl";

// GraphQL query
const query = `
{
  user(username: "${USERNAME}") {
    publication {
      posts(page: 0) {
        title
        slug
      }
    }
  }
}
`;

async function fetchPosts() {
  const response = await fetch("https://api.hashnode.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data.data.user.publication.posts.slice(0, 5); // limit to 5 posts
}

function updateReadme(posts) {
  const readme = fs.readFileSync(README_FILE, "utf8");

  const start = "<!-- BLOG-POST-LIST:START -->";
  const end = "<!-- BLOG-POST-LIST:END -->";

  const newContent =
    posts.map((p) => `- [${p.title}](https://vinyldavyl.hashnode.dev/${p.slug})`).join("\n");

  const updated = readme.replace(
    new RegExp(`${start}[\\s\\S]*${end}`, "m"),
    `${start}\n${newContent}\n${end}`
  );

  fs.writeFileSync(README_FILE, updated);
}

(async () => {
  try {
    const posts = await fetchPosts();
    updateReadme(posts);
    console.log("✅ README updated with latest blog posts");
  } catch (err) {
    console.error("❌ Error updating README:", err);
    process.exit(1);
  }
})();
