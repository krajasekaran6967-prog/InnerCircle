const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { start, stop, request } = require("./helper");

before(start);
after(stop);

async function signup(email) {
  const res = await request("POST", "/api/auth/signup", {
    body: { email, password: "password1", name: "Msg User", department: "Eng" },
  });
  return { cookie: res.cookie, user: res.body.user };
}

test("GET /messages/public - 401 when not authenticated", async () => {
  const res = await request("GET", "/api/messages/public");
  assert.equal(res.status, 401);
});

test("POST /messages/public - sends message", async () => {
  const { cookie } = await signup("pub-sender@test.com");
  const res = await request("POST", "/api/messages/public", {
    cookie,
    body: { text: "hello world" },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.message.text, "hello world");
  assert.ok(res.body.message.sender);
});

test("POST /messages/public - empty text returns 400", async () => {
  const { cookie } = await signup("pub-empty@test.com");
  const res = await request("POST", "/api/messages/public", { cookie, body: { text: "  " } });
  assert.equal(res.status, 400);
});

test("GET /messages/public - returns sent messages", async () => {
  const { cookie } = await signup("pub-list@test.com");
  await request("POST", "/api/messages/public", { cookie, body: { text: "listed message" } });
  const res = await request("GET", "/api/messages/public", { cookie });
  assert.equal(res.status, 200);
  assert.ok(res.body.messages.some((m) => m.text === "listed message"));
});

test("GET /messages/public - NaN limit falls back to default", async () => {
  const { cookie } = await signup("pub-nan@test.com");
  const res = await request("GET", "/api/messages/public?limit=abc", { cookie });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.messages));
});

test("GET /messages/public - negative limit is clamped", async () => {
  const { cookie } = await signup("pub-neg@test.com");
  const res = await request("GET", "/api/messages/public?limit=-1", { cookie });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.messages));
});

test("POST /messages/direct/:userId - sends direct message", async () => {
  const a = await signup("dm-a@test.com");
  const b = await signup("dm-b@test.com");
  const res = await request("POST", `/api/messages/direct/${b.user.id}`, {
    cookie: a.cookie,
    body: { text: "hey there" },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.message.text, "hey there");
});

test("GET /messages/direct/:userId - returns conversation", async () => {
  const a = await signup("dm-get-a@test.com");
  const b = await signup("dm-get-b@test.com");
  await request("POST", `/api/messages/direct/${b.user.id}`, {
    cookie: a.cookie,
    body: { text: "conversation message" },
  });
  const res = await request("GET", `/api/messages/direct/${b.user.id}`, { cookie: a.cookie });
  assert.equal(res.status, 200);
  assert.ok(res.body.messages.some((m) => m.text === "conversation message"));
});

test("GET /messages/direct/:userId - NaN limit falls back to default", async () => {
  const a = await signup("dm-nan-a@test.com");
  const b = await signup("dm-nan-b@test.com");
  const res = await request("GET", `/api/messages/direct/${b.user.id}?limit=xyz`, {
    cookie: a.cookie,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.messages));
});

test("GET /messages/direct/:userId - negative limit is clamped", async () => {
  const a = await signup("dm-neg-a@test.com");
  const b = await signup("dm-neg-b@test.com");
  const res = await request("GET", `/api/messages/direct/${b.user.id}?limit=-5`, {
    cookie: a.cookie,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.messages));
});

test("GET /messages/direct/:userId - nonexistent user returns 404", async () => {
  const { cookie } = await signup("dm-404@test.com");
  const res = await request("GET", "/api/messages/direct/nonexistent-id", { cookie });
  assert.equal(res.status, 404);
});
