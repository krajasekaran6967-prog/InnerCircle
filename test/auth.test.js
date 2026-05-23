const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { start, stop, request } = require("./helper");

before(start);
after(stop);

const USER = { email: "auth@test.com", password: "password1", name: "Auth User", department: "Eng" };

test("signup - creates user and returns session cookie", async () => {
  const res = await request("POST", "/api/auth/signup", { body: USER });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.email, USER.email);
  assert.ok(!("passwordHash" in res.body.user));
  assert.ok(res.cookie, "should set session cookie");
});

test("signup - duplicate email returns 409", async () => {
  const res = await request("POST", "/api/auth/signup", { body: USER });
  assert.equal(res.status, 409);
});

test("signup - missing fields returns 400", async () => {
  const res = await request("POST", "/api/auth/signup", { body: { email: "x@x.com" } });
  assert.equal(res.status, 400);
});

test("signup - short password returns 400", async () => {
  const res = await request("POST", "/api/auth/signup", {
    body: { ...USER, email: "new@test.com", password: "short" },
  });
  assert.equal(res.status, 400);
});

test("login - valid credentials return user and cookie", async () => {
  const res = await request("POST", "/api/auth/login", {
    body: { email: USER.email, password: USER.password },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, USER.email);
  assert.ok(res.cookie);
});

test("login - wrong password returns 401", async () => {
  const res = await request("POST", "/api/auth/login", {
    body: { email: USER.email, password: "wrongpass" },
  });
  assert.equal(res.status, 401);
});

test("login - unknown email returns 401", async () => {
  const res = await request("POST", "/api/auth/login", {
    body: { email: "nobody@test.com", password: "password1" },
  });
  assert.equal(res.status, 401);
});

test("/me - returns user when authenticated", async () => {
  const login = await request("POST", "/api/auth/login", {
    body: { email: USER.email, password: USER.password },
  });
  const res = await request("GET", "/api/auth/me", { cookie: login.cookie });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, USER.email);
});

test("/me - returns 401 when not authenticated", async () => {
  const res = await request("GET", "/api/auth/me");
  assert.equal(res.status, 401);
});

test("logout - destroys session", async () => {
  const login = await request("POST", "/api/auth/login", {
    body: { email: USER.email, password: USER.password },
  });
  const logout = await request("POST", "/api/auth/logout", { cookie: login.cookie });
  assert.equal(logout.status, 200);
  // Cookie from login should no longer be valid
  const me = await request("GET", "/api/auth/me", { cookie: login.cookie });
  assert.equal(me.status, 401);
});
