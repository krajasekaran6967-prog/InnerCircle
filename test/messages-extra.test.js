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

test("POST /messages/public - text over 500 chars is rejected", async () => {
  const { cookie } = await signup("toolong-pub@test.com");
  const res = await request("POST", "/api/messages/public", {
    cookie,
    body: { text: "a".repeat(501) },
  });
  assert.equal(res.status, 400);
});

test("POST /messages/public - missing text returns 400", async () => {
  const { cookie } = await signup("notext-pub@test.com");
  const res = await request("POST", "/api/messages/public", { cookie, body: {} });
  assert.equal(res.status, 400);
});

test("POST /messages/public - 401 when not authenticated", async () => {
  const res = await request("POST", "/api/messages/public", { body: { text: "hello" } });
  assert.equal(res.status, 401);
});

test("POST /messages/direct/:userId - 401 when not authenticated", async () => {
  const { user } = await signup("dm-unauth@test.com");
  const res = await request("POST", `/api/messages/direct/${user.id}`, { body: { text: "hi" } });
  assert.equal(res.status, 401);
});

test("POST /messages/direct/:userId - nonexistent user returns 404", async () => {
  const { cookie } = await signup("dm-404-send@test.com");
  const res = await request("POST", "/api/messages/direct/nonexistent-id", {
    cookie,
    body: { text: "hi" },
  });
  assert.equal(res.status, 404);
});

test("POST /messages/direct/:userId - empty text returns 400", async () => {
  const a = await signup("dm-empty-a@test.com");
  const b = await signup("dm-empty-b@test.com");
  const res = await request("POST", `/api/messages/direct/${b.user.id}`, {
    cookie: a.cookie,
    body: { text: "  " },
  });
  assert.equal(res.status, 400);
});

test("GET /messages/direct/:userId - conversation is visible from both sides", async () => {
  const a = await signup("dm-both-a@test.com");
  const b = await signup("dm-both-b@test.com");
  await request("POST", `/api/messages/direct/${b.user.id}`, {
    cookie: a.cookie,
    body: { text: "from a to b" },
  });
  const fromB = await request("GET", `/api/messages/direct/${a.user.id}`, { cookie: b.cookie });
  assert.equal(fromB.status, 200);
  assert.ok(fromB.body.messages.some((m) => m.text === "from a to b"));
});
