const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { start, stop, request } = require("./helper");

before(start);
after(stop);

async function signup(email) {
  const res = await request("POST", "/api/auth/signup", {
    body: { email, password: "password1", name: "Test User", department: "Eng" },
  });
  return { cookie: res.cookie, user: res.body.user };
}

test("GET /users - 401 when not authenticated", async () => {
  const res = await request("GET", "/api/users");
  assert.equal(res.status, 401);
});

test("GET /users/:id - returns member profile", async () => {
  const a = await signup("view-a@test.com");
  const b = await signup("view-b@test.com");
  const res = await request("GET", `/api/users/${b.user.id}`, { cookie: a.cookie });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.id, b.user.id);
  assert.ok(!("passwordHash" in res.body.user));
});

test("GET /users/:id - isFriend is false before adding", async () => {
  const a = await signup("isfriend-a@test.com");
  const b = await signup("isfriend-b@test.com");
  const res = await request("GET", `/api/users/${b.user.id}`, { cookie: a.cookie });
  assert.equal(res.body.user.isFriend, false);
});

test("GET /users/:id - isFriend is true after adding", async () => {
  const a = await signup("isfriend2-a@test.com");
  const b = await signup("isfriend2-b@test.com");
  await request("POST", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });
  const res = await request("GET", `/api/users/${b.user.id}`, { cookie: a.cookie });
  assert.equal(res.body.user.isFriend, true);
});

test("GET /users/:id - nonexistent user returns 404", async () => {
  const { cookie } = await signup("view404@test.com");
  const res = await request("GET", "/api/users/nonexistent-id", { cookie });
  assert.equal(res.status, 404);
});

test("PUT /users/me - missing department returns 400", async () => {
  const { cookie } = await signup("nodept@test.com");
  const res = await request("PUT", "/api/users/me", { cookie, body: { name: "No Dept" } });
  assert.equal(res.status, 400);
});

test("GET /users/me/friends - returns empty list initially", async () => {
  const { cookie } = await signup("friendslist@test.com");
  const res = await request("GET", "/api/users/me/friends", { cookie });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.users, []);
});

test("GET /users/me/friends - lists added friends", async () => {
  const a = await signup("fl-a@test.com");
  const b = await signup("fl-b@test.com");
  await request("POST", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });
  const res = await request("GET", "/api/users/me/friends", { cookie: a.cookie });
  assert.ok(res.body.users.some((u) => u.id === b.user.id));
});

test("DELETE /users/:id/friends - removing non-friend returns 404", async () => {
  const a = await signup("notfriend-a@test.com");
  const b = await signup("notfriend-b@test.com");
  const res = await request("DELETE", `/api/users/${b.user.id}/friends`, { cookie: a.cookie });
  assert.equal(res.status, 404);
});
