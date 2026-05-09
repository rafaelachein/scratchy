export async function onRequestPost(context) {
  const { request, env } = context;

  const { content } = await request.json();

  if (!content || typeof content !== "string") {
    return new Response("Missing content", { status: 400 });
  }

  const repo = "rafaelachein/scratchy";
  const path = "index.html";
  const branch = "main";

  const fileRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "scratchy-editor",
        Accept: "application/vnd.github+json"
      }
    }
  );

  const fileData = await fileRes.json();

  if (!fileRes.ok) {
    return new Response(JSON.stringify(fileData), {
      status: fileRes.status,
      headers: { "Content-Type": "application/json" }
    });
  }

  const encodedContent = btoa(
    unescape(encodeURIComponent(content))
  );

  const updateRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "scratchy-editor",
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update Scratchy from in-app editor",
        content: encodedContent,
        sha: fileData.sha,
        branch
      })
    }
  );

  const result = await updateRes.json();

  return new Response(JSON.stringify(result), {
    status: updateRes.status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
