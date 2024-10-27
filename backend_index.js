var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/config.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};
var headers = {
  ...corsHeaders,
  "Content-Type": "application/json;charset=UTF-8"
};
var optionsHeaders = {
  ...corsHeaders,
  "Content-Type": "text/plain;charset=UTF-8",
  "Content-Length": "0"
};

// src/handlers/login.js
async function handleLogin(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    console.log("Environment check:", {
      hasDB: !!env.DB,
      dbType: typeof env.DB
    });
    const { emailOrNickName, password } = await request.json();
    if (!emailOrNickName || !password) {
      return new Response(JSON.stringify({
        error: "\u7F3A\u5C11\u767B\u5F55\u4FE1\u606F"
      }), { status: 400, headers });
    }
    try {
      console.log("Querying database for user with email or nickName:", emailOrNickName);
      const { results } = await env.DB.prepare(
        "SELECT * FROM Users WHERE (email = ? OR nickName = ?) AND password = ?"
      ).bind(emailOrNickName, emailOrNickName, password).all();
      console.log("Database query results:", results);
      let user;
      if (results.length === 0) {
        return new Response(JSON.stringify({
          error: "\u7528\u6237\u4E0D\u5B58\u5728\u6216\u5BC6\u7801\u9519\u8BEF"
        }), { status: 401, headers });
      } else {
        user = results[0];
      }
      const safeUser = {
        id: user.id,
        nickName: user.nickName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        joinDate: user.joinDate,
        booksRead: user.booksRead,
        meetingsAttended: user.meetingsAttended
      };
      return new Response(JSON.stringify(safeUser), { headers });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({
      error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",
      details: error.message
    }), { status: 500, headers });
  }
}
__name(handleLogin, "handleLogin");

// src/handlers/getUsers.js
async function handleGetUsers(request, env) {
  try {
    console.log("Fetching all users from database");
    const { results } = await env.DB.prepare(`
      SELECT id, nickName, avatarUrl, joinDate, 
             booksRead, meetingsAttended 
      FROM Users
    `).all();
    console.log("Found users:", results.length);
    return new Response(JSON.stringify(results), {
      headers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({
      error: "\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25",
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
__name(handleGetUsers, "handleGetUsers");

// src/handlers/createBooksTableIfNotExists.js
async function createBooksTableIfNotExists(env) {
  try {
    console.log("Checking if 'Books' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        abstract TEXT,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        commentCount INTEGER DEFAULT 0,
        isPublic BOOLEAN DEFAULT 1
      )`
    ).run();
    console.log("'Books' table ensured.");
  } catch (error) {
    console.error("Error creating 'Books' table:", error.message);
  }
}
__name(createBooksTableIfNotExists, "createBooksTableIfNotExists");

// src/handlers/getBooks.js
async function handleGetBooks(request, env) {
  try {
    await createBooksTableIfNotExists(env);
    console.log("Fetching books from database");
    const { results } = await env.DB.prepare(`
      SELECT id, name, author, abstract, 
             createdBy, createdAt, 
             commentCount, isPublic 
      FROM Books 
      ORDER BY id DESC 
      LIMIT 10
    `).all();
    console.log("Found books:", results.length);
    return new Response(JSON.stringify(results), {
      headers
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return new Response(JSON.stringify({
      error: "\u83B7\u53D6\u4E66\u7C4D\u5217\u8868\u5931\u8D25",
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
__name(handleGetBooks, "handleGetBooks");

// src/handlers/createMeetingsTableIfNotExists.js
async function createMeetingsTableIfNotExists(env) {
  try {
    console.log("Checking if 'Meetings' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isPublic BOOLEAN DEFAULT 1
      )`
    ).run();
    console.log("'Meetings' table ensured.");
  } catch (error) {
    console.error("Error creating 'Meetings' table:", error.message);
  }
}
__name(createMeetingsTableIfNotExists, "createMeetingsTableIfNotExists");

// src/handlers/getMeetings.js
async function handleGetMeetings(request, env) {
  try {
    await createMeetingsTableIfNotExists(env);
    console.log("Fetching meetings from database");
    const { results } = await env.DB.prepare(`
      SELECT id, name, date, time, 
             location, createdBy, 
             createdAt, isPublic 
      FROM Meetings 
      ORDER BY id DESC 
      LIMIT 10
    `).all();
    console.log("Found meetings:", results.length);
    return new Response(JSON.stringify(results), {
      headers
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return new Response(JSON.stringify({
      error: "\u83B7\u53D6\u4F1A\u8BAE\u5217\u8868\u5931\u8D25",
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
__name(handleGetMeetings, "handleGetMeetings");

// src/handlers/createUsersTableIfNotExists.js
async function createUsersTableIfNotExists(env) {
  try {
    console.log("Checking if 'Users' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openid TEXT NOT NULL,
        nickName TEXT NOT NULL,
        avatarUrl TEXT,
        joinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        booksRead INTEGER DEFAULT 0,
        meetingsAttended INTEGER DEFAULT 0
      )`
    ).run();
    console.log("'Users' table ensured.");
  } catch (error) {
    console.error("Error creating 'Users' table:", error.message);
  }
}
__name(createUsersTableIfNotExists, "createUsersTableIfNotExists");

// src/handlers/register.js
async function addUser(request, env) {
  await createUsersTableIfNotExists(env);
  try {
    const userData = await request.json();
    console.log("Received user data:", userData);
    const { email, nickName, password } = userData;
    if (!email || !nickName || !password) {
      return new Response(JSON.stringify({
        error: "\u7F3A\u5C11\u6CE8\u518C\u4FE1\u606F"
      }), { status: 400, headers });
    }
    const { results } = await env.DB.prepare(
      "SELECT * FROM Users WHERE email = ? OR nickName = ?"
    ).bind(email, nickName).all();
    if (results.length > 0) {
      console.log("User already exists with email or nickName");
      return new Response(JSON.stringify({
        error: "\u7528\u6237\u5DF2\u5B58\u5728"
      }), { status: 409, headers });
    }
    console.log("Creating new user");
    const result = await env.DB.prepare(
      `INSERT INTO Users (email, nickName, password, avatarUrl, joinDate, booksRead, meetingsAttended, openid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      email,
      nickName,
      password,
      userData.avatarUrl || "",
      (/* @__PURE__ */ new Date()).toISOString(),
      0,
      0,
      0
      // 提供一个默认的 openid 值
    ).run();
    if (result.success) {
      const newUser = {
        id: result.lastRowId,
        email,
        nickName,
        avatarUrl: userData.avatarUrl || "",
        joinDate: (/* @__PURE__ */ new Date()).toISOString(),
        booksRead: 0,
        meetingsAttended: 0
      };
      console.log("New user created:", newUser);
      return new Response(JSON.stringify(newUser), {
        headers
      });
    } else {
      throw new Error("Failed to create new user");
    }
  } catch (error) {
    console.error("Error in addUser:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}
__name(addUser, "addUser");

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log(`Received request: ${request.method} ${url.pathname}`);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: optionsHeaders
      });
    }
    try {
      if (url.pathname === "/" || url.pathname === "") {
        return new Response(JSON.stringify({
          message: "Welcome to Adelaide Reading API",
          endpoints: {
            login: "/api/login",
            register: "/api/register",
            // 添加注册端点
            users: "/api/users",
            books: "/api/books",
            meetings: "/api/meetings"
          }
        }), { headers });
      }
      switch (url.pathname) {
        case "/api/login":
          return handleLogin(request, env);
        case "/api/register":
          return addUser(request, env);
        case "/api/users":
          return handleGetUsers(request, env);
        case "/api/books":
          return handleGetBooks(request, env);
        case "/api/meetings":
          return handleGetMeetings(request, env);
        default:
          return new Response(JSON.stringify({
            error: "Not Found",
            message: "\u8BF7\u6C42\u7684\u8DEF\u5F84\u4E0D\u5B58\u5728",
            availableEndpoints: {
              login: "/api/login",
              register: "/api/register",
              // 添加注册端点
              users: "/api/users",
              books: "/api/books",
              meetings: "/api/meetings"
            }
          }), {
            status: 404,
            headers
          });
      }
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        details: error.message
      }), {
        status: 500,
        headers
      });
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
