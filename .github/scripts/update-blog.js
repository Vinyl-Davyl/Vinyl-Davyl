const fs = require("fs");
const fetch = require("node-fetch");

const README_FILE = "README.md";
const USERNAME = "vinyldavyl"; 

// GraphQL query for v2
const query = `
query {
  publication(host: "${USERNAME}.hashnode.dev") {
    posts(first: 5) {
      edges {
        node {
          title
          slug
        }
      }
    }
  }
}
`;

async function fetchPosts() {
  const response = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (!data.data.publication) {
    throw new Error("No publication found. Check your username/host.");
  }

  return data.data.publication.posts.edges.map((edge) => edge.node);
}

function updateReadme(posts) {
  const readme = fs.readFileSync(README_FILE, "utf8");

  const start = "<!-- BLOG-POST-LIST:START -->";
  const end = "<!-- BLOG-POST-LIST:END -->";

  const newContent = posts
    .map((p) => `- [${p.title}](https://${USERNAME}.hashnode.dev/${p.slug})`)
    .join("\n");

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
    console.error("❌ Error updating README:", err.message);
    process.exit(1);
  }
})();
