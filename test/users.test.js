const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { start, stop, request } = require("./helper");

before(start);
after(stop);

async function signup(email = "user@test.com") {
  const res = await request("POST", "/api/auth/signup", {
    body: { email, password: "password1", name: "Test User", department: "Eng" },
  });
  return { cookie: res.cookie, user: res.body.user };
}

test("GET /users/me - returns current user profile", async () => {
  const { cookie, user } = await signup("me@test.com");
  const res = await request("GET", "/api/users/me", { cookie });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.id, user.id);
});

test("GET /users/me - 401 when not authenticated", async () => {
  const res = await request("GET", "/api/users/me");
  assert.equal(res.status, 401);
});

test("PUT /users/me - updates name and department", async () => {
  const { cookie } = await signup("update@test.com");
  const res = await request("PUT", "/api/users/me", {
    cookie,
    body: { name: "Updated Name", department: "Design", bio: "hello" },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.name, "Updated Name");
  assert.equal(res.body.user.bio, "hello");
});

test("PUT /users/me - missing name returns 400", async () => {
  const { cookie } = await signup("update2@test.com");
  const res = await request("PUT", "/api/users/me", {
    cookie,
    body: { department: "Design" },
  });
  assert.equal(res.status, 400);
});

test("GET /users - returns member list", async () => {
  const { cookie } = await signup("list@test.com");
  const res = await request("GET", "/api/users", { cookie });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.users));
  assert.ok(res.body.users.length > 0);
});

test("GET /users?search= - filters by name", async () => {
  const { cookie } = await signup("search@test.com");
  const res = await request("GET", "/api/users?search=search", { cookie });
  assert.equal(res.status, 200);
  assert.ok(res.body.users.every((u) => JSON.stringify(u).toLowerCase().includes("search")));
});

test("POST /users/:id/friends - adds friend bidirectionally", async () => {
  const a = await signup("friend-a@test.com");
  const b = await signup("friend-b@test.com");

  await request("POST", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });

  // A views B's profile — should be a friend
  const aViewsB = await request("GET", `/api/users/${b.user.id}`, { cookie: a.cookie });
  assert.equal(aViewsB.body.user.isFriend, true);

  // B views A's profile — should also be a friend (bidirectional)
  const bViewsA = await request("GET", `/api/users/${a.user.id}`, { cookie: b.cookie });
  assert.equal(bViewsA.body.user.isFriend, true);
});

test("POST /users/:id/friends - cannot add self", async () => {
  const { cookie, user } = await signup("self@test.com");
  const res = await request("POST", `/api/users/${user.id}/friends`, { cookie });
  assert.equal(res.status, 400);
});

test("POST /users/:id/friends - nonexistent user returns 404", async () => {
  const { cookie } = await signup("addfail@test.com");
  const res = await request("POST", "/api/users/nonexistent-id/friends", { cookie });
  assert.equal(res.status, 404);
});

test("DELETE /users/:id/friends - removes friend", async () => {
  const a = await signup("del-a@test.com");
  const b = await signup("del-b@test.com");
  await request("POST", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });

  const res = await request("DELETE", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.isFriend, false);
});

test("DELETE /users/:id/friends - nonexistent user returns 404", async () => {
  const { cookie } = await signup("delfail@test.com");
  const res = await request("DELETE", "/api/users/nonexistent-id/friends", { cookie });
  assert.equal(res.status, 404);
});
